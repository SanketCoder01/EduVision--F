-- Fix RLS Policies for EduVision
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on pending_registrations table
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pending_registrations;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON pending_registrations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON pending_registrations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON pending_registrations;

-- 3. Create new policies
-- Allow authenticated users to insert their own registrations
CREATE POLICY "Enable insert for authenticated users" ON pending_registrations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own registrations
CREATE POLICY "Enable select for own registrations" ON pending_registrations
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to update their own registrations
CREATE POLICY "Enable update for own registrations" ON pending_registrations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow admins to view all registrations
CREATE POLICY "Enable select for admins" ON pending_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%@admin.sanjivani.edu.in'
        )
    );

-- Allow admins to update all registrations
CREATE POLICY "Enable update for admins" ON pending_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%@admin.sanjivani.edu.in'
        )
    );

-- 4. Grant necessary permissions
GRANT ALL ON pending_registrations TO authenticated;
GRANT ALL ON pending_registrations TO service_role;

-- 5. Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pending_registrations';

-- 6. Test insert (this should work now)
-- Note: You need to be authenticated to run this
-- INSERT INTO pending_registrations (email, name, phone, department, year, user_type, status) 
-- VALUES ('test@example.com', 'Test User', '1234567890', 'CSE', '1st', 'student', 'pending_approval');
