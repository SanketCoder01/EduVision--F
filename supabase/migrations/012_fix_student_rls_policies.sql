-- Fix RLS Policies for Student Tables
-- The current policies use auth.uid() which requires the student's ID to match the auth user ID
-- But students are registered with email-based authentication, not ID-based
-- This migration fixes the RLS policies to use email matching instead

-- Drop all existing student table policies
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cse_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_cyber_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aids_4th_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_1st_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_2nd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_3rd_year;
DROP POLICY IF EXISTS "Students can only access their own record" ON students_aiml_4th_year;

-- Create new email-based RLS policies for CSE Department
CREATE POLICY "Students can access their own record by email" ON students_cse_1st_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_cse_2nd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_cse_3rd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_cse_4th_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

-- Create new email-based RLS policies for CYBER Department
CREATE POLICY "Students can access their own record by email" ON students_cyber_1st_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_cyber_2nd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_cyber_3rd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_cyber_4th_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

-- Create new email-based RLS policies for AIDS Department
CREATE POLICY "Students can access their own record by email" ON students_aids_1st_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_aids_2nd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_aids_3rd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_aids_4th_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

-- Create new email-based RLS policies for AIML Department
CREATE POLICY "Students can access their own record by email" ON students_aiml_1st_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_aiml_2nd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_aiml_3rd_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can access their own record by email" ON students_aiml_4th_year
    FOR ALL USING (email = auth.jwt() ->> 'email');

-- Also add policies for API access (service role bypass)
-- These allow the API routes to access student data when needed
CREATE POLICY "API can access student records" ON students_cse_1st_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cse_2nd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cse_3rd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cse_4th_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cyber_1st_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cyber_2nd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cyber_3rd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_cyber_4th_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aids_1st_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aids_2nd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aids_3rd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aids_4th_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aiml_1st_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aiml_2nd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aiml_3rd_year
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access student records" ON students_aiml_4th_year
    FOR ALL USING (current_setting('role') = 'service_role');
