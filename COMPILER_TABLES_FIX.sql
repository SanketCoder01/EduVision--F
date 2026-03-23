-- Migration: Fix compiler_assignments and compiler_exams tables for department/year filtering
-- Run this in Supabase SQL Editor

-- Ensure compiler_assignments table exists with correct columns
CREATE TABLE IF NOT EXISTS compiler_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  studying_year TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  due_date TIMESTAMPTZ NOT NULL,
  allow_late_submission BOOLEAN DEFAULT false,
  late_submission_penalty INTEGER DEFAULT 10,
  max_attempts INTEGER DEFAULT 3,
  time_limit INTEGER,
  enable_code_execution BOOLEAN DEFAULT true,
  enable_auto_grading BOOLEAN DEFAULT false,
  questions JSONB DEFAULT '[]',
  question_generation_method TEXT DEFAULT 'manual',
  uploaded_file_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure compiler_exams table exists
CREATE TABLE IF NOT EXISTS compiler_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  studying_year TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 120,
  auto_publish BOOLEAN DEFAULT false,
  enable_proctoring BOOLEAN DEFAULT true,
  enable_code_execution BOOLEAN DEFAULT true,
  enable_auto_grading BOOLEAN DEFAULT false,
  questions JSONB DEFAULT '[]',
  question_generation_method TEXT DEFAULT 'manual',
  uploaded_file_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure student_code_submissions table exists
CREATE TABLE IF NOT EXISTS student_code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES compiler_assignments(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES compiler_exams(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  output TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'accepted', 'rejected')),
  marks_obtained INTEGER DEFAULT 0,
  feedback TEXT,
  attempt_number INTEGER DEFAULT 1,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS compiler_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS compiler_exams;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS student_code_submissions;

-- Enable RLS
ALTER TABLE compiler_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compiler_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_code_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Faculty can view own assignments" ON compiler_assignments;
DROP POLICY IF EXISTS "Faculty can create assignments" ON compiler_assignments;
DROP POLICY IF EXISTS "Faculty can update own assignments" ON compiler_assignments;
DROP POLICY IF EXISTS "Faculty can delete own assignments" ON compiler_assignments;
DROP POLICY IF EXISTS "Students can view published assignments for their dept/year" ON compiler_assignments;

DROP POLICY IF EXISTS "Faculty can view own exams" ON compiler_exams;
DROP POLICY IF EXISTS "Faculty can create exams" ON compiler_exams;
DROP POLICY IF EXISTS "Faculty can update own exams" ON compiler_exams;
DROP POLICY IF EXISTS "Faculty can delete own exams" ON compiler_exams;
DROP POLICY IF EXISTS "Students can view published exams for their dept/year" ON compiler_exams;

-- RLS Policies for compiler_assignments
CREATE POLICY "Faculty can view own assignments"
  ON compiler_assignments FOR SELECT
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can create assignments"
  ON compiler_assignments FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own assignments"
  ON compiler_assignments FOR UPDATE
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete own assignments"
  ON compiler_assignments FOR DELETE
  USING (faculty_id = auth.uid());

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

-- RLS Policies for compiler_exams
CREATE POLICY "Faculty can view own exams"
  ON compiler_exams FOR SELECT
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can create exams"
  ON compiler_exams FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own exams"
  ON compiler_exams FOR UPDATE
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete own exams"
  ON compiler_exams FOR DELETE
  USING (faculty_id = auth.uid());

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

-- RLS Policies for student_code_submissions
DROP POLICY IF EXISTS "Students can view own submissions" ON student_code_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON student_code_submissions;
DROP POLICY IF EXISTS "Faculty can view submissions for their assignments/exams" ON student_code_submissions;
DROP POLICY IF EXISTS "Faculty can grade submissions" ON student_code_submissions;

CREATE POLICY "Students can view own submissions"
  ON student_code_submissions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create submissions"
  ON student_code_submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can view submissions for their assignments/exams"
  ON student_code_submissions FOR SELECT
  USING (
    assignment_id IN (SELECT id FROM compiler_assignments WHERE faculty_id = auth.uid())
    OR exam_id IN (SELECT id FROM compiler_exams WHERE faculty_id = auth.uid())
  );

CREATE POLICY "Faculty can grade submissions"
  ON student_code_submissions FOR UPDATE
  USING (
    assignment_id IN (SELECT id FROM compiler_assignments WHERE faculty_id = auth.uid())
    OR exam_id IN (SELECT id FROM compiler_exams WHERE faculty_id = auth.uid())
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_faculty ON compiler_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_dept_year ON compiler_assignments(department, studying_year);
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_status ON compiler_assignments(status);
CREATE INDEX IF NOT EXISTS idx_compiler_assignments_due_date ON compiler_assignments(due_date);

CREATE INDEX IF NOT EXISTS idx_compiler_exams_faculty ON compiler_exams(faculty_id);
CREATE INDEX IF NOT EXISTS idx_compiler_exams_dept_year ON compiler_exams(department, studying_year);
CREATE INDEX IF NOT EXISTS idx_compiler_exams_status ON compiler_exams(status);
CREATE INDEX IF NOT EXISTS idx_compiler_exams_start_time ON compiler_exams(start_time);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON student_code_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON student_code_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exam ON student_code_submissions(exam_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_compiler_assignments_updated_at ON compiler_assignments;
CREATE TRIGGER update_compiler_assignments_updated_at
  BEFORE UPDATE ON compiler_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compiler_exams_updated_at ON compiler_exams;
CREATE TRIGGER update_compiler_exams_updated_at
  BEFORE UPDATE ON compiler_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Compiler tables created/updated successfully!' as message;
