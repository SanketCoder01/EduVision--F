-- ================================================================
-- Migration 069: Student Results Grade Trigger + Dean RLS Fixes
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Add missing columns to student_results if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='percentage') THEN
    ALTER TABLE student_results ADD COLUMN percentage NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='grade') THEN
    ALTER TABLE student_results ADD COLUMN grade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='status') THEN
    ALTER TABLE student_results ADD COLUMN status TEXT DEFAULT 'Pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='improvement_plan') THEN
    ALTER TABLE student_results ADD COLUMN improvement_plan TEXT DEFAULT 'Pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='uploaded_by') THEN
    ALTER TABLE student_results ADD COLUMN uploaded_by UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_results' AND column_name='exam_type') THEN
    ALTER TABLE student_results ADD COLUMN exam_type TEXT DEFAULT 'mid-term';
  END IF;
END $$;

-- 2. Auto-calculate percentage, grade, pass/fail on insert/update
CREATE OR REPLACE FUNCTION fn_compute_student_result()
RETURNS TRIGGER AS $$
BEGIN
  -- percentage
  IF NEW.total_marks > 0 THEN
    NEW.percentage := ROUND((NEW.marks::NUMERIC / NEW.total_marks::NUMERIC) * 100, 2);
  ELSE
    NEW.percentage := 0;
  END IF;

  -- grade
  NEW.grade := CASE
    WHEN NEW.percentage >= 90 THEN 'O'
    WHEN NEW.percentage >= 80 THEN 'A+'
    WHEN NEW.percentage >= 70 THEN 'A'
    WHEN NEW.percentage >= 60 THEN 'B+'
    WHEN NEW.percentage >= 50 THEN 'B'
    WHEN NEW.percentage >= 40 THEN 'C'
    ELSE 'F'
  END;

  -- pass / fail
  NEW.status := CASE WHEN NEW.percentage >= 40 THEN 'Pass' ELSE 'Fail' END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_compute_result ON student_results;
CREATE TRIGGER trig_compute_result
  BEFORE INSERT OR UPDATE OF marks, total_marks ON student_results
  FOR EACH ROW EXECUTE FUNCTION fn_compute_student_result();

-- Re-compute existing rows that have null grades
UPDATE student_results SET marks = marks WHERE grade IS NULL OR status IS NULL;

-- 3. Enable RLS + open policy on student_results for deans
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_student_results" ON student_results;
CREATE POLICY "open_student_results" ON student_results
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable realtime on student_results
ALTER PUBLICATION supabase_realtime ADD TABLE student_results;

-- 5. RLS open on department_subjects for all authenticated
ALTER TABLE department_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_department_subjects" ON department_subjects;
CREATE POLICY "open_department_subjects" ON department_subjects
  FOR ALL USING (true) WITH CHECK (true);

-- 6. RLS open on dean_events so deans can manage all events
ALTER TABLE dean_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_dean_events" ON dean_events;
CREATE POLICY "open_dean_events" ON dean_events
  FOR ALL USING (true) WITH CHECK (true);

-- 7. RLS open on hackathons
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_hackathons" ON hackathons;
CREATE POLICY "open_hackathons" ON hackathons
  FOR ALL USING (true) WITH CHECK (true);

-- 8. RLS open on assignments for dean analytics
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_assignments_read" ON assignments;
CREATE POLICY "open_assignments_read" ON assignments
  FOR SELECT USING (true);
