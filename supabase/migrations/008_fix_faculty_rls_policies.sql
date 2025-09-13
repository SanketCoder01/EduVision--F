-- Fix RLS Policies for Faculty Table
-- This migration adds proper INSERT, UPDATE, DELETE policies for faculty auto-registration

-- Drop existing basic policy for faculty
DROP POLICY IF EXISTS "Public read access" ON faculty;

-- Create comprehensive RLS policies for faculty table

-- 1. Allow public read access to faculty (for displaying faculty info)
CREATE POLICY "Public read access to faculty" ON faculty
    FOR SELECT 
    USING (true);

-- 2. Allow faculty to update their own records
CREATE POLICY "Faculty can update own record" ON faculty
    FOR UPDATE 
    USING (
        auth.jwt() ->> 'email' = email
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = email
    );

-- 3. Allow auto-registration for sanjivani.edu.in emails
CREATE POLICY "Allow sanjivani faculty registration" ON faculty
    FOR INSERT 
    WITH CHECK (
        email LIKE '%@sanjivani.edu.in'
    );

-- 4. Allow anonymous insert for development (remove in production)
CREATE POLICY "Anonymous insert access for faculty" ON faculty
    FOR INSERT 
    WITH CHECK (true);

-- 5. Allow anonymous update for development (remove in production)  
CREATE POLICY "Anonymous update access for faculty" ON faculty
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- 6. Allow anonymous delete for development (remove in production)
CREATE POLICY "Anonymous delete access for faculty" ON faculty
    FOR DELETE 
    USING (true);

-- Ensure proper permissions are granted
GRANT ALL ON faculty TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
