-- Migration: Student Code Sessions for Auto-save
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS student_code_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student Info
  student_id TEXT NOT NULL,
  
  -- Session Context
  session_type TEXT DEFAULT 'free_coding' CHECK (session_type IN ('assignment', 'exam', 'free_coding')),
  assignment_id TEXT,
  exam_id TEXT,
  course_id TEXT,
  
  -- Code Data
  language TEXT DEFAULT 'python3',
  code TEXT DEFAULT '',
  
  -- Auto-save tracking
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  auto_save_enabled BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_code_sessions_student ON student_code_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_code_sessions_assignment ON student_code_sessions(assignment_id) WHERE assignment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_code_sessions_exam ON student_code_sessions(exam_id) WHERE exam_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_code_sessions_type ON student_code_sessions(session_type);

-- Enable RLS
ALTER TABLE student_code_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all for now (adjust based on auth)
CREATE POLICY "Allow all access to student_code_sessions"
  ON student_code_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_code_sessions_updated_at
  BEFORE UPDATE ON student_code_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
