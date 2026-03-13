-- Fix RLS Policies for Assignments Table
-- Run this in Supabase SQL Editor to fix the RLS policy error

-- First, drop all existing policies
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

-- Create new simplified RLS policies

-- 1. Allow all authenticated users to read assignments
CREATE POLICY "Authenticated users can read assignments" ON assignments
    FOR SELECT 
    TO authenticated
    USING (true);

-- 2. Allow faculty to create assignments (simplified - just check faculty_id matches)
CREATE POLICY "Faculty can create assignments" ON assignments
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = faculty_id
    );

-- 3. Allow faculty to update their own assignments
CREATE POLICY "Faculty can update own assignments" ON assignments
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = faculty_id)
    WITH CHECK (auth.uid() = faculty_id);

-- 4. Allow faculty to delete their own assignments
CREATE POLICY "Faculty can delete own assignments" ON assignments
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = faculty_id);

-- 5. Allow anonymous access for development (remove in production)
CREATE POLICY "Anonymous read access" ON assignments
    FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Anonymous insert access" ON assignments
    FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anonymous update access" ON assignments
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anonymous delete access" ON assignments
    FOR DELETE 
    TO anon
    USING (true);

-- Grant permissions
GRANT ALL ON assignments TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Also fix assignment_submissions table if it exists
DROP POLICY IF EXISTS "Students can submit assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can view submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can grade submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Anonymous submissions access" ON assignment_submissions;

-- Allow authenticated users to read submissions
CREATE POLICY "Authenticated users can read submissions" ON assignment_submissions
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow students to insert their own submissions
CREATE POLICY "Students can submit assignments" ON assignment_submissions
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

-- Allow students to update their own submissions
CREATE POLICY "Students can update own submissions" ON assignment_submissions
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Allow anonymous access for development
CREATE POLICY "Anonymous submissions access" ON assignment_submissions
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

GRANT ALL ON assignment_submissions TO anon, authenticated;
