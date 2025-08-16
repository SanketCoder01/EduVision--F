-- Step 3: Faculty restrictions and content targeting
-- Run this after step 2

-- Faculty department immutability trigger
CREATE OR REPLACE FUNCTION enforce_faculty_department_immutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.department IS DISTINCT FROM OLD.department THEN
    RAISE EXCEPTION 'Faculty department is immutable and cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_faculty_department_change ON faculty;
CREATE TRIGGER prevent_faculty_department_change
BEFORE UPDATE ON faculty
FOR EACH ROW EXECUTE FUNCTION enforce_faculty_department_immutable();

-- Update assignments table to support department-year targeting
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS faculty_department TEXT;

-- Update faculty_department from faculty table
UPDATE assignments SET faculty_department = f.department 
FROM faculty f WHERE assignments.faculty_id = f.id AND assignments.faculty_department IS NULL;

-- Update study_groups table for department-year targeting
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- Add user_id column to faculty table if not exists
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
