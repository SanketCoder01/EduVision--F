-- =============================================================
-- 084_fix_quiz_and_compiler_access.sql
-- Fix: Open access for quiz, compiler, materials, and grievances 
-- so ALL faculty can access and manage without RLS blocking them.
-- =============================================================

-- QUIZZES
ALTER TABLE IF EXISTS quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quizzes_open_authenticated" ON quizzes;
CREATE POLICY "quizzes_open_authenticated" ON quizzes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- QUIZ QUESTIONS
ALTER TABLE IF EXISTS quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_questions_open_authenticated" ON quiz_questions;
CREATE POLICY "quiz_questions_open_authenticated" ON quiz_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- QUIZ ATTEMPTS
ALTER TABLE IF EXISTS quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_attempts_open_authenticated" ON quiz_attempts;
CREATE POLICY "quiz_attempts_open_authenticated" ON quiz_attempts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- COMPILER ASSIGNMENTS
ALTER TABLE IF EXISTS compiler_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "compiler_assignments_open_authenticated" ON compiler_assignments;
CREATE POLICY "compiler_assignments_open_authenticated" ON compiler_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- COMPILER SUBMISSIONS
ALTER TABLE IF EXISTS compiler_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "compiler_submissions_open_authenticated" ON compiler_submissions;
CREATE POLICY "compiler_submissions_open_authenticated" ON compiler_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STUDY MATERIALS
ALTER TABLE IF EXISTS study_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "study_materials_open_authenticated" ON study_materials;
CREATE POLICY "study_materials_open_authenticated" ON study_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- GRIEVANCES
ALTER TABLE IF EXISTS grievances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grievances_open_authenticated" ON grievances;
CREATE POLICY "grievances_open_authenticated" ON grievances FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- GRIEVANCE MESSAGES
ALTER TABLE IF EXISTS grievance_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grievance_messages_open_authenticated" ON grievance_messages;
CREATE POLICY "grievance_messages_open_authenticated" ON grievance_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ENSURE FACULTY IS FULLY OPEN (in case previous fix was missed)
ALTER TABLE IF EXISTS faculty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faculty_open_authenticated" ON faculty;
CREATE POLICY "faculty_open_authenticated" ON faculty FOR ALL TO authenticated USING (true) WITH CHECK (true);
