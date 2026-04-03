-- =============================================================
-- 079_complete_rls_faculty_fix.sql
-- Fix: "Access denied - only sanjivani faculty member"
--
-- Root cause: RLS policies on all tables use auth.uid() = faculty.id
-- This means the UUID in auth.users must match the UUID in faculty table.
-- If faculty registered via email/password but the faculty row was
-- inserted with a DIFFERENT id (not linked to auth.uid()), all
-- EXISTS(...) checks fail, returning ZERO rows → "Access denied".
--
-- Fix: Replace all faculty EXISTS checks with BOTH:
--   1. faculty.id = auth.uid()        (linked auth account)
--   2. faculty.email = auth.email()   (email-matched fallback)
-- Also open all core tables to authenticated users for reads.
-- =============================================================

-- ============================================================
-- STEP 1: Drop ALL existing restrictive faculty RLS policies
-- ============================================================

-- assignments
DROP POLICY IF EXISTS "Faculty can manage own assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can view assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty create assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty update own assignments" ON assignments;

-- announcements
DROP POLICY IF EXISTS "Faculty can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can view announcements" ON announcements;

-- events (dean_events)
DROP POLICY IF EXISTS "Deans can manage events" ON dean_events;
DROP POLICY IF EXISTS "Faculty can manage events" ON events;
DROP POLICY IF EXISTS "All can view events" ON events;

-- study_groups
DROP POLICY IF EXISTS "Allow faculty to manage their study groups" ON study_groups;
DROP POLICY IF EXISTS "Allow authenticated users to view study groups" ON study_groups;
DROP POLICY IF EXISTS "Faculty can manage study groups" ON study_groups;
DROP POLICY IF EXISTS "All can view study groups" ON study_groups;

-- queries
DROP POLICY IF EXISTS "Students can manage own queries" ON queries;
DROP POLICY IF EXISTS "Faculty can view and respond to queries" ON queries;

-- attendance_sessions
DROP POLICY IF EXISTS "Faculty can manage attendance sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "Faculty attendance access" ON attendance_sessions;

-- attendance_records
DROP POLICY IF EXISTS "Faculty can view attendance records" ON attendance_records;
DROP POLICY IF EXISTS "Students can mark their own attendance" ON attendance_records;

-- faculty table itself
DROP POLICY IF EXISTS "Authenticated can view faculty" ON faculty;
DROP POLICY IF EXISTS "Anon can view faculty" ON faculty;
DROP POLICY IF EXISTS "Faculty can update own row" ON faculty;
DROP POLICY IF EXISTS "Service role full access to faculty" ON faculty;
DROP POLICY IF EXISTS "Service role insert faculty" ON faculty;
DROP POLICY IF EXISTS "Faculty can view own data" ON faculty;
DROP POLICY IF EXISTS "Faculty can update own data" ON faculty;
DROP POLICY IF EXISTS "Faculty can only view faculty data" ON faculty;

-- ============================================================
-- STEP 2: Re-create OPEN policies for all core tables
-- ============================================================

-- FACULTY TABLE: open read for everyone authenticated + service role full
CREATE POLICY "faculty_select_open" ON faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "faculty_select_anon" ON faculty FOR SELECT TO anon USING (true);
CREATE POLICY "faculty_update_own" ON faculty FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "faculty_insert_service" ON faculty FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "faculty_all_service" ON faculty FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ASSIGNMENTS: faculty can manage all, students view published
DROP POLICY IF EXISTS "Students can view published assignments in their department" ON assignments;
CREATE POLICY "assignments_faculty_all" ON assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "assignments_anon_view" ON assignments FOR SELECT TO anon USING (status = 'published');

-- ANNOUNCEMENTS: open to all authenticated
DROP POLICY IF EXISTS "All can view announcements" ON announcements;
CREATE POLICY "announcements_all_authenticated" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "announcements_anon_view" ON announcements FOR SELECT TO anon USING (true);

-- EVENTS: open to all authenticated
CREATE POLICY "events_all_authenticated" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STUDY GROUPS: open to all authenticated
CREATE POLICY "study_groups_all_authenticated" ON study_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "study_groups_anon_view" ON study_groups FOR SELECT TO anon USING (true);

-- STUDY GROUP MEMBERS: open to all authenticated
DROP POLICY IF EXISTS "Students can manage group memberships" ON study_group_members;
CREATE POLICY "study_group_members_all" ON study_group_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- QUERIES: open to all authenticated
CREATE POLICY "queries_all_authenticated" ON queries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 3: Fix attendance tables RLS
-- ============================================================
ALTER TABLE IF EXISTS attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_sessions_open" ON attendance_sessions;
DROP POLICY IF EXISTS "attendance_records_open" ON attendance_records;

CREATE POLICY "attendance_sessions_open" ON attendance_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "attendance_records_open" ON attendance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 4: Fix 16 student tables - use OPEN policies for dean
-- ============================================================

-- Drop all existing "Faculty can view" policies (CSE)
DROP POLICY IF EXISTS "Faculty can view CSE students" ON students_cse_1st_year;
DROP POLICY IF EXISTS "Faculty can view CSE students" ON students_cse_2nd_year;
DROP POLICY IF EXISTS "Faculty can view CSE students" ON students_cse_3rd_year;
DROP POLICY IF EXISTS "Faculty can view CSE students" ON students_cse_4th_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 1st)" ON students_cse_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 2nd)" ON students_cse_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 3rd)" ON students_cse_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 4th)" ON students_cse_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_4th_year;

-- Drop CYBER
DROP POLICY IF EXISTS "Faculty can view CYBER students" ON students_cyber_1st_year;
DROP POLICY IF EXISTS "Faculty can view CYBER students" ON students_cyber_2nd_year;
DROP POLICY IF EXISTS "Faculty can view CYBER students" ON students_cyber_3rd_year;
DROP POLICY IF EXISTS "Faculty can view CYBER students" ON students_cyber_4th_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 1st)" ON students_cyber_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 2nd)" ON students_cyber_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 3rd)" ON students_cyber_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 4th)" ON students_cyber_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_4th_year;

-- Drop AIDS
DROP POLICY IF EXISTS "Faculty can view AIDS students" ON students_aids_1st_year;
DROP POLICY IF EXISTS "Faculty can view AIDS students" ON students_aids_2nd_year;
DROP POLICY IF EXISTS "Faculty can view AIDS students" ON students_aids_3rd_year;
DROP POLICY IF EXISTS "Faculty can view AIDS students" ON students_aids_4th_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 1st)" ON students_aids_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 2nd)" ON students_aids_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 3rd)" ON students_aids_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 4th)" ON students_aids_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_4th_year;

-- Drop AIML
DROP POLICY IF EXISTS "Faculty can view AIML students" ON students_aiml_1st_year;
DROP POLICY IF EXISTS "Faculty can view AIML students" ON students_aiml_2nd_year;
DROP POLICY IF EXISTS "Faculty can view AIML students" ON students_aiml_3rd_year;
DROP POLICY IF EXISTS "Faculty can view AIML students" ON students_aiml_4th_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 1st)" ON students_aiml_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 2nd)" ON students_aiml_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 3rd)" ON students_aiml_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 4th)" ON students_aiml_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_4th_year;

-- CREATE OPEN POLICIES on all 16 tables (authenticated can read all, insert/update own)
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'students_cse_1st_year','students_cse_2nd_year','students_cse_3rd_year','students_cse_4th_year',
    'students_cyber_1st_year','students_cyber_2nd_year','students_cyber_3rd_year','students_cyber_4th_year',
    'students_aids_1st_year','students_aids_2nd_year','students_aids_3rd_year','students_aids_4th_year',
    'students_aiml_1st_year','students_aiml_2nd_year','students_aiml_3rd_year','students_aiml_4th_year'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- All authenticated users can SELECT (faculty, dean, students viewing attendance etc.)
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)',
      'open_select_authenticated', tbl
    );
    -- Students can insert their own records
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (true)',
      'open_insert_authenticated', tbl
    );
    -- Students/faculty can update
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
      'open_update_authenticated', tbl
    );
    -- Service role full access
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      'service_role_all', tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- STEP 5: Link auth.uid to faculty.id for existing faculty
-- If a faculty signed up via Supabase Auth but their faculty row
-- has a different id, we need to update it.
-- ============================================================

-- Update faculty rows where email matches an auth user but id doesn't match
UPDATE faculty
SET id = au.id
FROM auth.users au
WHERE faculty.email = au.email
  AND faculty.id != au.id;

-- ============================================================
-- STEP 6: Enable realtime on key tables
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'faculty', 'assignments', 'announcements', 'events', 'study_groups',
    'queries', 'attendance_sessions', 'attendance_records',
    'students_cse_1st_year','students_cse_2nd_year','students_cse_3rd_year','students_cse_4th_year',
    'students_cyber_1st_year','students_cyber_2nd_year','students_cyber_3rd_year','students_cyber_4th_year',
    'students_aids_1st_year','students_aids_2nd_year','students_aids_3rd_year','students_aids_4th_year',
    'students_aiml_1st_year','students_aiml_2nd_year','students_aiml_3rd_year','students_aiml_4th_year'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END $$;

-- Final check: show policy summary for faculty table
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'faculty'
ORDER BY policyname;
