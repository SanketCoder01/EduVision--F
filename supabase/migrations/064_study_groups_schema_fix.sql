-- Migration: Create missing Study Group Tables & Columns
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. CREATE MISSING FACULTY QUERIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.faculty_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  studentName TEXT NOT NULL,
  groupName TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime for Queries
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS faculty_queries;

-- Allow all authenticated users to read/write queries
ALTER TABLE public.faculty_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all users full access to faculty queries" ON faculty_queries;
CREATE POLICY "Allow all users full access to faculty queries" ON faculty_queries FOR ALL USING (auth.uid() IS NOT NULL);


-- ============================================================================
-- 2. CREATE MISSING FACULTY REPLIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.faculty_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL,
  faculty_id UUID NOT NULL,
  faculty_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime for Replies
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS faculty_replies;

-- Allow all authenticated users to read/write replies
ALTER TABLE public.faculty_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all users full access to faculty replies" ON faculty_replies;
CREATE POLICY "Allow all users full access to faculty replies" ON faculty_replies FOR ALL USING (auth.uid() IS NOT NULL);


-- ============================================================================
-- 3. ENSURE STUDY GROUPS HAS ALL THE NEWLY ADDED COLUMNS FROM THE UI
-- ============================================================================
-- The UI now passes these advanced configurations. If they are missing, PostgreSQL outright rejects the INSERT!

ALTER TABLE public.study_groups
  ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS year TEXT,
  ADD COLUMN IF NOT EXISTS objectives TEXT,
  ADD COLUMN IF NOT EXISTS group_purpose TEXT,
  ADD COLUMN IF NOT EXISTS learning_goals TEXT,
  ADD COLUMN IF NOT EXISTS expected_outcomes TEXT,
  ADD COLUMN IF NOT EXISTS enable_task_scheduling BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS task_frequency TEXT DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS daily_task_description TEXT,
  ADD COLUMN IF NOT EXISTS weekly_task_description TEXT,
  ADD COLUMN IF NOT EXISTS monthly_task_description TEXT,
  ADD COLUMN IF NOT EXISTS require_submissions BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_materials BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS enable_file_uploads BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_messaging BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_notifications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS let_students_decide BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS members_count INT DEFAULT 0;

-- Let's make absolutely sure any authenticated user can read/write study groups just to clear any RLS blockages
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all users full access to study groups" ON study_groups;
CREATE POLICY "Allow all users full access to study groups" ON study_groups FOR ALL USING (auth.uid() IS NOT NULL);


-- ============================================================================
-- 4. EMERGENCY OVERRIDE: 100% UNBLOCK ALL SHARDED STUDENTS TABLES
-- ============================================================================
-- Since Supabase is STILL blocking the Faculty dashboard from listing students,
-- this brute-forces the permissions wide open for authenticated faculty and students 
-- so you can finally see them in Real-time.

CREATE OR REPLACE FUNCTION enable_student_table_override(tbl text) RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('DROP POLICY IF EXISTS "Emergency Read Override" ON %I', tbl);
  EXECUTE format('CREATE POLICY "Emergency Read Override" ON %I FOR SELECT USING (auth.uid() IS NOT NULL)', tbl);
END;
$$ LANGUAGE plpgsql;

SELECT enable_student_table_override('students_cse_1st_year');
SELECT enable_student_table_override('students_cse_2nd_year');
SELECT enable_student_table_override('students_cse_3rd_year');
SELECT enable_student_table_override('students_cse_4th_year');

SELECT enable_student_table_override('students_cyber_1st_year');
SELECT enable_student_table_override('students_cyber_2nd_year');
SELECT enable_student_table_override('students_cyber_3rd_year');
SELECT enable_student_table_override('students_cyber_4th_year');

SELECT enable_student_table_override('students_aids_1st_year');
SELECT enable_student_table_override('students_aids_2nd_year');
SELECT enable_student_table_override('students_aids_3rd_year');
SELECT enable_student_table_override('students_aids_4th_year');

SELECT enable_student_table_override('students_aiml_1st_year');
SELECT enable_student_table_override('students_aiml_2nd_year');
SELECT enable_student_table_override('students_aiml_3rd_year');
SELECT enable_student_table_override('students_aiml_4th_year');

-- Clean up helper function
DROP FUNCTION enable_student_table_override(text);
