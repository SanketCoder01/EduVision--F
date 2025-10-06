-- Fix RLS Policies for Assignment Submissions
-- The current policies use auth.uid() but students are authenticated by email
-- This migration fixes the RLS policies to use email matching instead

-- Drop existing assignment_submissions policies
DROP POLICY IF EXISTS "Students can view own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can insert own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can update own ungraded submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can view department submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can grade department submissions" ON assignment_submissions;

-- Create new email-based RLS policies for assignment submissions
CREATE POLICY "Students can view own submissions by email" ON assignment_submissions
    FOR SELECT USING (
        student_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Students can insert own submissions by email" ON assignment_submissions
    FOR INSERT WITH CHECK (
        student_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Students can update own ungraded submissions by email" ON assignment_submissions
    FOR UPDATE USING (
        student_email = auth.jwt() ->> 'email' AND
        status = 'submitted'
    );

-- Faculty can view/grade submissions for assignments they created in their department
CREATE POLICY "Faculty can view department submissions by email" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments a 
            JOIN faculty f ON f.id = a.faculty_id
            WHERE a.id = assignment_submissions.assignment_id 
            AND f.email = auth.jwt() ->> 'email'
            AND f.department = assignment_submissions.student_department
        )
    );

CREATE POLICY "Faculty can grade department submissions by email" ON assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments a 
            JOIN faculty f ON f.id = a.faculty_id
            WHERE a.id = assignment_submissions.assignment_id 
            AND f.email = auth.jwt() ->> 'email'
            AND f.department = assignment_submissions.student_department
        )
    );

-- Add API access policy for service role
CREATE POLICY "API can access assignment submissions" ON assignment_submissions
    FOR ALL USING (current_setting('role') = 'service_role');
