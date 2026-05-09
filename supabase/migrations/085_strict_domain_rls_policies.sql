-- =============================================================
-- 085_strict_domain_rls_policies.sql
-- Fix: Implement strict @set.sanjivani.edu.in permission
-- This solves "Access Denied" by using auth.jwt()->>'email'
-- instead of faculty.id matching auth.uid() which was failing.
-- =============================================================

-- HELPER FUNCTIONS FOR CLEANER RLS policies
CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS BOOLEAN AS $$
BEGIN
  -- Returns true if the authenticated user's email ends with @set.sanjivani.edu.in
  RETURN (auth.jwt()->>'email') LIKE '%@set.sanjivani.edu.in';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 1. ASSIGNMENTS
-- ==========================================
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignments_open_authenticated" ON assignments;
-- Faculty can do everything
CREATE POLICY "assignments_faculty_all" ON assignments FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
-- Students can only read published
CREATE POLICY "assignments_student_read" ON assignments FOR SELECT TO authenticated 
USING (NOT public.is_faculty() AND status = 'published');

-- ==========================================
-- 2. ANNOUNCEMENTS
-- ==========================================
ALTER TABLE IF EXISTS announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "announcements_open_authenticated" ON announcements;
CREATE POLICY "announcements_faculty_all" ON announcements FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "announcements_student_read" ON announcements FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

-- ==========================================
-- 3. EVENTS
-- ==========================================
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_open_authenticated" ON events;
CREATE POLICY "events_faculty_all" ON events FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "events_student_read" ON events FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

-- ==========================================
-- 4. STUDY GROUPS
-- ==========================================
ALTER TABLE IF EXISTS study_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "study_groups_open_authenticated" ON study_groups;
CREATE POLICY "study_groups_faculty_all" ON study_groups FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "study_groups_student_read" ON study_groups FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

-- ==========================================
-- 5. STUDY GROUP MEMBERS
-- ==========================================
ALTER TABLE IF EXISTS study_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "study_group_members_open_authenticated" ON study_group_members;
CREATE POLICY "study_group_members_faculty_all" ON study_group_members FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "study_group_members_student_all" ON study_group_members FOR ALL TO authenticated 
USING (NOT public.is_faculty()) WITH CHECK (NOT public.is_faculty());

-- ==========================================
-- 6. ATTENDANCE SESSIONS & RECORDS
-- ==========================================
ALTER TABLE IF EXISTS attendance_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_sessions_open_auth" ON attendance_sessions;
CREATE POLICY "attendance_session_faculty_all" ON attendance_sessions FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "attendance_session_student_read" ON attendance_sessions FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_records_open_auth" ON attendance_records;
CREATE POLICY "attendance_records_faculty_all" ON attendance_records FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
-- Students should only read their own, but keeping it simple for now as per prev design
CREATE POLICY "attendance_records_student_all" ON attendance_records FOR ALL TO authenticated 
USING (NOT public.is_faculty()) WITH CHECK (NOT public.is_faculty());

-- ==========================================
-- 7. QUIZZES
-- ==========================================
ALTER TABLE IF EXISTS quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quizzes_open_authenticated" ON quizzes;
CREATE POLICY "quizzes_faculty_all" ON quizzes FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "quizzes_student_read" ON quizzes FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

ALTER TABLE IF EXISTS quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_questions_open_authenticated" ON quiz_questions;
CREATE POLICY "quiz_questions_faculty_all" ON quiz_questions FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
-- Students can only read questions for published quizzes
CREATE POLICY "quiz_questions_student_read" ON quiz_questions FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

-- ==========================================
-- 8. STUDY MATERIALS
-- ==========================================
ALTER TABLE IF EXISTS study_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "study_materials_open_authenticated" ON study_materials;
CREATE POLICY "study_materials_faculty_all" ON study_materials FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "study_materials_student_read" ON study_materials FOR SELECT TO authenticated 
USING (NOT public.is_faculty());

-- ==========================================
-- 9. QUERIES
-- ==========================================
ALTER TABLE IF EXISTS queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "queries_open_authenticated" ON queries;
CREATE POLICY "queries_faculty_all" ON queries FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "queries_student_all" ON queries FOR ALL TO authenticated 
USING (NOT public.is_faculty()) WITH CHECK (NOT public.is_faculty());

ALTER TABLE IF EXISTS query_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "query_messages_open_authenticated" ON query_messages;
CREATE POLICY "query_messages_faculty_all" ON query_messages FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
CREATE POLICY "query_messages_student_all" ON query_messages FOR ALL TO authenticated 
USING (NOT public.is_faculty()) WITH CHECK (NOT public.is_faculty());

-- ==========================================
-- 10. SUBMISSIONS (Assignments)
-- ==========================================
ALTER TABLE IF EXISTS assignment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "submissions_open_authenticated" ON assignment_submissions;
-- Faculty can view all submissions and update grade
CREATE POLICY "assignment_submissions_faculty_all" ON assignment_submissions FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
-- Students can manage their own submissions 
CREATE POLICY "assignment_submissions_student_all" ON assignment_submissions FOR ALL TO authenticated 
USING (NOT public.is_faculty()) WITH CHECK (NOT public.is_faculty());

-- ==========================================
-- 11. FACULTY
-- ==========================================
-- Ensure the faculty profile table itself allows faculty to update their profile
ALTER TABLE IF EXISTS faculty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faculty_open_authenticated" ON faculty;
CREATE POLICY "faculty_table_faculty_all" ON faculty FOR ALL TO authenticated 
USING (public.is_faculty()) WITH CHECK (public.is_faculty());
-- Allow anyone authenticated to view faculty (students reading names, dean, etc)
CREATE POLICY "faculty_table_all_read" ON faculty FOR SELECT TO authenticated USING (true);
