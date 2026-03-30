-- =============================================
-- Migration 060: Department Subjects Table
-- Dean assigns subjects per department + year
-- Faculty assignment form uses these subjects
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Department Subjects Table
CREATE TABLE IF NOT EXISTS department_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20) NOT NULL CHECK (year IN ('1st', '2nd', '3rd', '4th')),
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50),
  credits INTEGER DEFAULT 3,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department, year, subject_name)
);

-- Enable RLS
ALTER TABLE department_subjects ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Dean can manage subjects" ON department_subjects;
DROP POLICY IF EXISTS "Faculty and students can view subjects" ON department_subjects;

CREATE POLICY "Dean can manage subjects" ON department_subjects
  FOR ALL USING (true);

CREATE POLICY "Faculty and students can view subjects" ON department_subjects
  FOR SELECT USING (true);

-- Index for fast queries by department + year
CREATE INDEX IF NOT EXISTS idx_dept_subjects_dept_year ON department_subjects(department, year);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_dept_subjects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_dept_subjects_updated_at ON department_subjects;
CREATE TRIGGER update_dept_subjects_updated_at
  BEFORE UPDATE ON department_subjects
  FOR EACH ROW EXECUTE FUNCTION update_dept_subjects_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE department_subjects;
