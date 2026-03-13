-- Fix Quiz RLS Policies
-- This fixes the 403 Forbidden error when faculty create quizzes

-- ============================================
-- 1. Drop existing conflicting policies
-- ============================================
DROP POLICY IF EXISTS "Allow all quiz operations" ON quizzes;
DROP POLICY IF EXISTS "Faculty create quizzes for accessible depts" ON quizzes;
DROP POLICY IF EXISTS "Faculty view all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Students view quizzes if registered" ON quizzes;
DROP POLICY IF EXISTS "Faculty can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Students can view published quizzes" ON quizzes;

-- ============================================
-- 2. Create new simplified policies
-- ============================================

-- Faculty can insert quizzes (match by email since faculty.id != auth.uid())
CREATE POLICY "Faculty can create quizzes" ON quizzes
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM faculty 
      WHERE faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Faculty can view all quizzes
CREATE POLICY "Faculty can view quizzes" ON quizzes
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM faculty 
      WHERE faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
    OR is_published = true
  );

-- Faculty can update their own quizzes (match by email)
CREATE POLICY "Faculty can update own quizzes" ON quizzes
  FOR UPDATE 
  USING (
    faculty_id IN (
      SELECT id FROM faculty 
      WHERE faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Faculty can delete their own quizzes
CREATE POLICY "Faculty can delete own quizzes" ON quizzes
  FOR DELETE 
  USING (
    faculty_id IN (
      SELECT id FROM faculty 
      WHERE faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Students can view published quizzes (simplified - no complex joins)
CREATE POLICY "Students can view published quizzes" ON quizzes
  FOR SELECT 
  USING (
    is_published = true
  );

-- ============================================
-- 3. Fix quiz_questions policies
-- ============================================
DROP POLICY IF EXISTS "Allow all quiz question operations" ON quiz_questions;
DROP POLICY IF EXISTS "Faculty can create quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Faculty can view quiz questions" ON quiz_questions;

CREATE POLICY "Faculty can manage quiz questions" ON quiz_questions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN faculty ON faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND quizzes.faculty_id = faculty.id
    )
  );

CREATE POLICY "Users can view quiz questions" ON quiz_questions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND quizzes.is_published = true
    )
    OR EXISTS (
      SELECT 1 FROM quizzes 
      JOIN faculty ON faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND quizzes.faculty_id = faculty.id
    )
  );

-- ============================================
-- 4. Fix quiz_attempts policies
-- ============================================
DROP POLICY IF EXISTS "Allow all quiz attempt operations" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can attempt quizzes" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can view their attempts" ON quiz_attempts;

CREATE POLICY "Students can create attempts" ON quiz_attempts
  FOR INSERT 
  WITH CHECK (
    student_id IN (
      SELECT id FROM students 
      WHERE students.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Students can view own attempts" ON quiz_attempts
  FOR SELECT 
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE students.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
    OR EXISTS (
      SELECT 1 FROM faculty WHERE faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Students can update own attempts" ON quiz_attempts
  FOR UPDATE 
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE students.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- ============================================
-- 5. Ensure RLS is enabled
-- ============================================
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. Add proctoring_violations table for AI proctoring
-- ============================================
CREATE TABLE IF NOT EXISTS proctoring_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  student_id UUID,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB,
  action_taken TEXT DEFAULT 'warning',
  notified_faculty BOOLEAN DEFAULT false
);

-- Enable RLS on proctoring_violations
ALTER TABLE proctoring_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view violations" ON proctoring_violations
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN faculty ON faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
      WHERE quizzes.id = proctoring_violations.quiz_id 
      AND quizzes.faculty_id = faculty.id
    )
  );

CREATE POLICY "Students can insert violations" ON proctoring_violations
  FOR INSERT 
  WITH CHECK (
    student_id IN (
      SELECT id FROM students 
      WHERE students.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- ============================================
-- 7. Add proctoring columns to quizzes if not exists
-- ============================================
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS proctoring_enabled BOOLEAN DEFAULT false;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS max_violations_allowed INTEGER DEFAULT 3;

-- ============================================
-- 8. Create indexes for faster queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_quiz ON proctoring_violations(quiz_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_student ON proctoring_violations(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_faculty ON quizzes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
