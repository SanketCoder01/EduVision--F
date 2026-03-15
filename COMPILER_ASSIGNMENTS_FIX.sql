-- Migration: Ensure compiler_assignments and compiler_exams have correct columns for department/year filtering
-- Run this if tables already exist but need column updates

-- Add missing columns to compiler_assignments if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_assignments' AND column_name = 'department') THEN
    ALTER TABLE compiler_assignments ADD COLUMN department TEXT NOT NULL DEFAULT 'CSE';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_assignments' AND column_name = 'studying_year') THEN
    ALTER TABLE compiler_assignments ADD COLUMN studying_year TEXT NOT NULL DEFAULT '3rd Year';
  END IF;
END $$;

-- Add missing columns to compiler_exams if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_exams' AND column_name = 'department') THEN
    ALTER TABLE compiler_exams ADD COLUMN department TEXT NOT NULL DEFAULT 'CSE';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compiler_exams' AND column_name = 'studying_year') THEN
    ALTER TABLE compiler_exams ADD COLUMN studying_year TEXT NOT NULL DEFAULT '3rd Year';
  END IF;
END $$;

-- Create indexes for efficient department/year filtering
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_dept_year ON compiler_assignments(department, studying_year);
CREATE INDEX IF NOT EXISTS idx_compiler_exams_dept_year ON compiler_exams(department, studying_year);

-- Update RLS policy for students to see only their department/year assignments
DROP POLICY IF EXISTS "Students can view published assignments for their dept/year" ON compiler_assignments;

CREATE POLICY "Students can view published assignments for their dept/year"
  ON compiler_assignments FOR SELECT
  USING (
    status = 'published' AND
    department IN (
      SELECT department FROM students WHERE id = auth.uid()
    ) AND
    studying_year IN (
      SELECT studying_year FROM students WHERE id = auth.uid()
    )
  );

-- Update RLS policy for students to see only their department/year exams
DROP POLICY IF EXISTS "Students can view published exams for their dept/year" ON compiler_exams;

CREATE POLICY "Students can view published exams for their dept/year"
  ON compiler_exams FOR SELECT
  USING (
    status IN ('scheduled', 'ongoing') AND
    department IN (
      SELECT department FROM students WHERE id = auth.uid()
    ) AND
    studying_year IN (
      SELECT studying_year FROM students WHERE id = auth.uid()
    )
  );

-- Ensure realtime is enabled
ALTER PUBLICATION supabase_realtime ADD TABLE compiler_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE compiler_exams;

-- Verify the setup
SELECT 
  'compiler_assignments' as table_name,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'compiler_assignments' 
  AND column_name IN ('department', 'studying_year', 'status')
UNION ALL
SELECT 
  'compiler_exams' as table_name,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'compiler_exams' 
  AND column_name IN ('department', 'studying_year', 'status');
