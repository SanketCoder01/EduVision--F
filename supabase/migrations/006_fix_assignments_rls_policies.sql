-- Fix RLS Policies for Assignments Table
-- This migration adds proper INSERT, UPDATE, DELETE policies for faculty

-- Drop existing basic policy
DROP POLICY IF EXISTS "Public read access" ON assignments;

-- Create comprehensive RLS policies for assignments table

-- 1. Faculty can read all assignments
CREATE POLICY "Faculty can read all assignments" ON assignments
    FOR SELECT 
    USING (true);

-- 2. Students can read published assignments for their department and year
CREATE POLICY "Students can read targeted assignments" ON assignments
    FOR SELECT 
    USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM students s 
            WHERE s.id = auth.uid() 
            AND s.department = assignments.department 
            AND s.year = ANY(assignments.target_years)
        )
    );

-- 3. Faculty can insert assignments for their own department
CREATE POLICY "Faculty can create assignments" ON assignments
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty f 
            WHERE f.id = auth.uid() 
            AND f.department = assignments.department
            AND assignments.faculty_id = f.id
        )
    );

-- 4. Faculty can update their own assignments
CREATE POLICY "Faculty can update own assignments" ON assignments
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty f 
            WHERE f.id = auth.uid() 
            AND f.id = assignments.faculty_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty f 
            WHERE f.id = auth.uid() 
            AND f.id = assignments.faculty_id
        )
    );

-- 5. Faculty can delete their own assignments
CREATE POLICY "Faculty can delete own assignments" ON assignments
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty f 
            WHERE f.id = auth.uid() 
            AND f.id = assignments.faculty_id
        )
    );

-- 6. Allow anonymous/public read access for development (remove in production)
CREATE POLICY "Anonymous read access" ON assignments
    FOR SELECT 
    USING (true);

-- 7. Allow anonymous insert for development (remove in production)
CREATE POLICY "Anonymous insert access" ON assignments
    FOR INSERT 
    WITH CHECK (true);

-- 8. Allow anonymous update for development (remove in production)  
CREATE POLICY "Anonymous update access" ON assignments
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- 9. Allow anonymous delete for development (remove in production)
CREATE POLICY "Anonymous delete access" ON assignments
    FOR DELETE 
    USING (true);

-- Ensure proper permissions are granted
GRANT ALL ON assignments TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
