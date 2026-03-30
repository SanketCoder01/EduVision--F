-- Migration: Ultimate Robust Faculty RLS & Study Groups Policies
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. DROP PREVIOUS RIGID STUDENT SELECTION POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 1st)" ON students_cse_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 2nd)" ON students_cse_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 3rd)" ON students_cse_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 4th)" ON students_cse_4th_year;

DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 1st)" ON students_cyber_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 2nd)" ON students_cyber_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 3rd)" ON students_cyber_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 4th)" ON students_cyber_4th_year;

DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 1st)" ON students_aids_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 2nd)" ON students_aids_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 3rd)" ON students_aids_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 4th)" ON students_aids_4th_year;

DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 1st)" ON students_aiml_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 2nd)" ON students_aiml_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 3rd)" ON students_aiml_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 4th)" ON students_aiml_4th_year;


-- ============================================================================
-- 2. CREATE ULTRA ROBUST STUDENT POLICIES (Matches Any Faculty Input Strings)
-- ============================================================================

-- CSE (Matches 'cse', 'computer science', 'cs')
CREATE POLICY "Faculty can view CSE students" ON students_cse_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cse%' OR faculty.department ILIKE '%computer science%' OR faculty.department ILIKE '%cs%')));
CREATE POLICY "Faculty can view CSE students" ON students_cse_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cse%' OR faculty.department ILIKE '%computer science%' OR faculty.department ILIKE '%cs%')));
CREATE POLICY "Faculty can view CSE students" ON students_cse_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cse%' OR faculty.department ILIKE '%computer science%' OR faculty.department ILIKE '%cs%')));
CREATE POLICY "Faculty can view CSE students" ON students_cse_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cse%' OR faculty.department ILIKE '%computer science%' OR faculty.department ILIKE '%cs%')));

-- CYBER (Matches 'cyber', 'cybersecurity', 'security')
CREATE POLICY "Faculty can view CYBER students" ON students_cyber_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cyber%' OR faculty.department ILIKE '%security%')));
CREATE POLICY "Faculty can view CYBER students" ON students_cyber_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cyber%' OR faculty.department ILIKE '%security%')));
CREATE POLICY "Faculty can view CYBER students" ON students_cyber_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cyber%' OR faculty.department ILIKE '%security%')));
CREATE POLICY "Faculty can view CYBER students" ON students_cyber_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%cyber%' OR faculty.department ILIKE '%security%')));

-- AIDS (Matches 'aids', 'ai ds', 'data science')
CREATE POLICY "Faculty can view AIDS students" ON students_aids_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aids%' OR faculty.department ILIKE '%data science%' OR faculty.department ILIKE '%ai ds%')));
CREATE POLICY "Faculty can view AIDS students" ON students_aids_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aids%' OR faculty.department ILIKE '%data science%' OR faculty.department ILIKE '%ai ds%')));
CREATE POLICY "Faculty can view AIDS students" ON students_aids_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aids%' OR faculty.department ILIKE '%data science%' OR faculty.department ILIKE '%ai ds%')));
CREATE POLICY "Faculty can view AIDS students" ON students_aids_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aids%' OR faculty.department ILIKE '%data science%' OR faculty.department ILIKE '%ai ds%')));

-- AIML (Matches 'aiml', 'ai ml', 'artificial intelligence')
CREATE POLICY "Faculty can view AIML students" ON students_aiml_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aiml%' OR faculty.department ILIKE '%artificial intelligence%' OR faculty.department ILIKE '%ai ml%')));
CREATE POLICY "Faculty can view AIML students" ON students_aiml_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aiml%' OR faculty.department ILIKE '%artificial intelligence%' OR faculty.department ILIKE '%ai ml%')));
CREATE POLICY "Faculty can view AIML students" ON students_aiml_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aiml%' OR faculty.department ILIKE '%artificial intelligence%' OR faculty.department ILIKE '%ai ml%')));
CREATE POLICY "Faculty can view AIML students" ON students_aiml_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND (faculty.department ILIKE '%aiml%' OR faculty.department ILIKE '%artificial intelligence%' OR faculty.department ILIKE '%ai ml%')));


-- ============================================================================
-- 3. FIX STUDY GROUPS SECURIY & REALTIME (Fixes missing posts)
-- ============================================================================

-- Ensure study_groups has Row-Level Security enabled
ALTER TABLE IF EXISTS study_groups ENABLE ROW LEVEL SECURITY;

-- Allow ANY authenticated user to VIEW study groups
DROP POLICY IF EXISTS "Allow authenticated users to view study groups" ON study_groups;
CREATE POLICY "Allow authenticated users to view study groups" ON study_groups
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow ANY authenticated faculty to CREATE and DELETE their own study groups
DROP POLICY IF EXISTS "Allow faculty to manage their study groups" ON study_groups;
CREATE POLICY "Allow faculty to manage their study groups" ON study_groups
FOR ALL USING (auth.uid() = faculty_id OR EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid()));

-- Guarantee it's actively publishing live to Supabase Sockets
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS study_groups;
