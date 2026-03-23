-- Fix study_groups table to include all required columns
-- First check and add missing columns

-- Add year column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'year') THEN
    ALTER TABLE study_groups ADD COLUMN year TEXT;
  END IF;
END $$;

-- Add faculty column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'faculty') THEN
    ALTER TABLE study_groups ADD COLUMN faculty TEXT;
  END IF;
END $$;

-- Add objectives column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'objectives') THEN
    ALTER TABLE study_groups ADD COLUMN objectives TEXT;
  END IF;
END $$;

-- Add group_purpose column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'group_purpose') THEN
    ALTER TABLE study_groups ADD COLUMN group_purpose TEXT;
  END IF;
END $$;

-- Add learning_goals column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'learning_goals') THEN
    ALTER TABLE study_groups ADD COLUMN learning_goals TEXT;
  END IF;
END $$;

-- Add expected_outcomes column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'expected_outcomes') THEN
    ALTER TABLE study_groups ADD COLUMN expected_outcomes TEXT;
  END IF;
END $$;

-- Add enable_task_scheduling column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'enable_task_scheduling') THEN
    ALTER TABLE study_groups ADD COLUMN enable_task_scheduling BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add task_frequency column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'task_frequency') THEN
    ALTER TABLE study_groups ADD COLUMN task_frequency TEXT;
  END IF;
END $$;

-- Add daily_task_description column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'daily_task_description') THEN
    ALTER TABLE study_groups ADD COLUMN daily_task_description TEXT;
  END IF;
END $$;

-- Add weekly_task_description column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'weekly_task_description') THEN
    ALTER TABLE study_groups ADD COLUMN weekly_task_description TEXT;
  END IF;
END $$;

-- Add monthly_task_description column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'monthly_task_description') THEN
    ALTER TABLE study_groups ADD COLUMN monthly_task_description TEXT;
  END IF;
END $$;

-- Add require_submissions column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'require_submissions') THEN
    ALTER TABLE study_groups ADD COLUMN require_submissions BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add allow_materials column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'allow_materials') THEN
    ALTER TABLE study_groups ADD COLUMN allow_materials BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add enable_file_uploads column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'enable_file_uploads') THEN
    ALTER TABLE study_groups ADD COLUMN enable_file_uploads BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add enable_messaging column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'enable_messaging') THEN
    ALTER TABLE study_groups ADD COLUMN enable_messaging BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add auto_notifications column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'auto_notifications') THEN
    ALTER TABLE study_groups ADD COLUMN auto_notifications BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add let_students_decide column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_groups' AND column_name = 'let_students_decide') THEN
    ALTER TABLE study_groups ADD COLUMN let_students_decide BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_groups_department_year ON study_groups(department, year);
CREATE INDEX IF NOT EXISTS idx_study_groups_faculty_id ON study_groups(faculty_id);

-- Enable real-time for study_groups
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Create subjects table for dean-provided subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  semester INTEGER,
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES faculty(id),
  created_at TIMESTAMPT DEFAULT now(),
  updated_at TIMESTAMPT DEFAULT now(),
  UNIQUE(name, department, year)
);

-- Create indexes for subjects
CREATE INDEX IF NOT EXISTS idx_subjects_department_year ON subjects(department, year);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active);

-- Enable RLS for subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Faculty can view subjects for their department" ON subjects;
DROP POLICY IF EXISTS "Faculty can create subjects" ON subjects;
DROP POLICY IF EXISTS "Students can view active subjects" ON subjects;

-- RLS Policies for subjects
CREATE POLICY "Faculty can view subjects for their department"
  ON subjects FOR SELECT
  USING (department IN (SELECT department FROM faculty WHERE id = auth.uid()));

CREATE POLICY "Faculty can create subjects"
  ON subjects FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Students can view active subjects"
  ON subjects FOR SELECT
  USING (is_active = true);

-- Enable real-time for subjects
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE subjects;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Grant permissions
GRANT ALL ON study_groups TO authenticated;
GRANT ALL ON subjects TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: study_groups columns added and subjects table created';
END $$;
