-- =====================================================
-- COMPILER TABLES COMPLETE FIX
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. First, check if tables exist and add missing columns
-- Add randomize_questions column to compiler_exams if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_exams' AND column_name = 'randomize_questions') THEN
    ALTER TABLE compiler_exams ADD COLUMN randomize_questions BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Ensure all required columns exist in compiler_assignments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_assignments' AND column_name = 'department') THEN
    ALTER TABLE compiler_assignments ADD COLUMN department TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_assignments' AND column_name = 'studying_year') THEN
    ALTER TABLE compiler_assignments ADD COLUMN studying_year TEXT;
  END IF;
END $$;

-- 3. Ensure all required columns exist in compiler_exams
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_exams' AND column_name = 'department') THEN
    ALTER TABLE compiler_exams ADD COLUMN department TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_exams' AND column_name = 'studying_year') THEN
    ALTER TABLE compiler_exams ADD COLUMN studying_year TEXT;
  END IF;
END $$;

-- 4. Normalize studying_year format in compiler_assignments
-- Convert various formats to "1st Year", "2nd Year", "3rd Year", "4th Year"
UPDATE compiler_assignments
SET studying_year = CASE 
  WHEN studying_year IN ('1', '1st', 'first', 'First', 'FIRST', 'First Year') THEN '1st Year'
  WHEN studying_year IN ('2', '2nd', 'second', 'Second', 'SECOND', 'Second Year') THEN '2nd Year'
  WHEN studying_year IN ('3', '3rd', 'third', 'Third', 'THIRD', 'Third Year') THEN '3rd Year'
  WHEN studying_year IN ('4', '4th', 'fourth', 'Fourth', 'FOURTH', 'Fourth Year') THEN '4th Year'
  ELSE studying_year
END
WHERE studying_year IS NOT NULL 
  AND studying_year NOT IN ('1st Year', '2nd Year', '3rd Year', '4th Year');

-- 5. Normalize studying_year format in compiler_exams
UPDATE compiler_exams
SET studying_year = CASE 
  WHEN studying_year IN ('1', '1st', 'first', 'First', 'FIRST', 'First Year') THEN '1st Year'
  WHEN studying_year IN ('2', '2nd', 'second', 'Second', 'SECOND', 'Second Year') THEN '2nd Year'
  WHEN studying_year IN ('3', '3rd', 'third', 'Third', 'THIRD', 'Third Year') THEN '3rd Year'
  WHEN studying_year IN ('4', '4th', 'fourth', 'Fourth', 'FOURTH', 'Fourth Year') THEN '4th Year'
  ELSE studying_year
END
WHERE studying_year IS NOT NULL 
  AND studying_year NOT IN ('1st Year', '2nd Year', '3rd Year', '4th Year');

-- 6. Normalize year in students table to match (column is 'year' not 'studying_year')
UPDATE students
SET year = CASE 
  WHEN year IN ('1', '1st', 'first', 'First', 'FIRST', 'First Year') THEN '1st Year'
  WHEN year IN ('2', '2nd', 'second', 'Second', 'SECOND', 'Second Year') THEN '2nd Year'
  WHEN year IN ('3', '3rd', 'third', 'Third', 'THIRD', 'Third Year') THEN '3rd Year'
  WHEN year IN ('4', '4th', 'fourth', 'Fourth', 'FOURTH', 'Fourth Year') THEN '4th Year'
  ELSE year
END
WHERE year IS NOT NULL 
  AND year NOT IN ('1st Year', '2nd Year', '3rd Year', '4th Year');

-- 7. Normalize department names (handle common variations)
UPDATE compiler_assignments
SET department = CASE 
  WHEN LOWER(department) IN ('cse', 'computer science', 'computer science engineering', 'cs') THEN 'CSE'
  WHEN LOWER(department) IN ('aids', 'ai & ds', 'ai and ds', 'artificial intelligence and data science') THEN 'AIDS'
  WHEN LOWER(department) IN ('aiml', 'ai & ml', 'ai and ml', 'artificial intelligence and machine learning') THEN 'AIML'
  WHEN LOWER(department) IN ('cyber', 'cyber security', 'cybersecurity', 'cs') THEN 'Cyber Security'
  WHEN LOWER(department) IN ('it', 'information technology') THEN 'IT'
  WHEN LOWER(department) IN ('ece', 'electronics and communication', 'electronics') THEN 'ECE'
  WHEN LOWER(department) IN ('mech', 'mechanical', 'mechanical engineering') THEN 'Mechanical'
  WHEN LOWER(department) IN ('civil', 'civil engineering') THEN 'Civil'
  ELSE department
END
WHERE department IS NOT NULL;

UPDATE compiler_exams
SET department = CASE 
  WHEN LOWER(department) IN ('cse', 'computer science', 'computer science engineering', 'cs') THEN 'CSE'
  WHEN LOWER(department) IN ('aids', 'ai & ds', 'ai and ds', 'artificial intelligence and data science') THEN 'AIDS'
  WHEN LOWER(department) IN ('aiml', 'ai & ml', 'ai and ml', 'artificial intelligence and machine learning') THEN 'AIML'
  WHEN LOWER(department) IN ('cyber', 'cyber security', 'cybersecurity', 'cs') THEN 'Cyber Security'
  WHEN LOWER(department) IN ('it', 'information technology') THEN 'IT'
  WHEN LOWER(department) IN ('ece', 'electronics and communication', 'electronics') THEN 'ECE'
  WHEN LOWER(department) IN ('mech', 'mechanical', 'mechanical engineering') THEN 'Mechanical'
  WHEN LOWER(department) IN ('civil', 'civil engineering') THEN 'Civil'
  ELSE department
END
WHERE department IS NOT NULL;

-- 8. Drop existing RLS policies and recreate
DROP POLICY IF EXISTS "Students can view published assignments for their dept/year" ON compiler_assignments;
DROP POLICY IF EXISTS "Students can view published exams for their dept/year" ON compiler_exams;

-- 9. Create new RLS policies with normalized matching
-- Note: students table uses 'year' column, compiler tables use 'studying_year'
CREATE POLICY "Students can view published assignments for their dept/year"
  ON compiler_assignments FOR SELECT
  USING (
    status = 'published' AND
    department = (SELECT department FROM students WHERE id = auth.uid()) AND
    studying_year = (SELECT year FROM students WHERE id = auth.uid())
  );

CREATE POLICY "Students can view published exams for their dept/year"
  ON compiler_exams FOR SELECT
  USING (
    status IN ('scheduled', 'ongoing') AND
    department = (SELECT department FROM students WHERE id = auth.uid()) AND
    studying_year = (SELECT year FROM students WHERE id = auth.uid())
  );

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_dept_year ON compiler_assignments(department, studying_year);
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_status ON compiler_assignments(status);
CREATE INDEX IF NOT EXISTS idx_compiler_exams_dept_year ON compiler_exams(department, studying_year);
CREATE INDEX IF NOT EXISTS idx_compiler_exams_status ON compiler_exams(status);

-- 11. Enable realtime if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS compiler_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS compiler_exams;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS student_code_submissions;

-- 12. Show results
SELECT 'compiler_assignments' as table_name, COUNT(*) as count, 
       array_agg(DISTINCT department) as departments,
       array_agg(DISTINCT studying_year) as years
FROM compiler_assignments WHERE status = 'published'
UNION ALL
SELECT 'compiler_exams' as table_name, COUNT(*) as count,
       array_agg(DISTINCT department) as departments,
       array_agg(DISTINCT studying_year) as years
FROM compiler_exams WHERE status IN ('scheduled', 'ongoing');
