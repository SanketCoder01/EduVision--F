-- QUICK FIX: Disable RLS for assignments table
-- Run this in Supabase SQL Editor

-- Disable RLS on assignments table
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on assignment_submissions table  
ALTER TABLE assignment_submissions DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON assignments TO anon, authenticated;
GRANT ALL ON assignment_submissions TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- If you want to re-enable RLS later with proper policies, run this:
/*
-- Re-enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Faculty can read all assignments" ON assignments;
DROP POLICY IF EXISTS "Students can read targeted assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can create assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can update own assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can delete own assignments" ON assignments;
DROP POLICY IF EXISTS "Anonymous read access" ON assignments;
DROP POLICY IF EXISTS "Anonymous insert access" ON assignments;
DROP POLICY IF EXISTS "Anonymous update access" ON assignments;
DROP POLICY IF EXISTS "Anonymous delete access" ON assignments;
DROP POLICY IF EXISTS "Public read access" ON assignments;
DROP POLICY IF EXISTS "Authenticated users can read assignments" ON assignments;

-- Simple permissive policies
CREATE POLICY "Allow all read" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON assignments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON assignments FOR DELETE USING (true);

CREATE POLICY "Allow all submissions read" ON assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Allow all submissions insert" ON assignment_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all submissions update" ON assignment_submissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all submissions delete" ON assignment_submissions FOR DELETE USING (true);
*/
