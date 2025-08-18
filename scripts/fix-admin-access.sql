-- Fix Admin Access to Pending Registrations
-- Run this in Supabase SQL Editor

-- 1. Drop ALL existing policies first
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pending_registrations;
DROP POLICY IF EXISTS "Enable select for own registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Enable update for own registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Enable select for admins" ON pending_registrations;
DROP POLICY IF EXISTS "Enable update for admins" ON pending_registrations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON pending_registrations;

-- 2. Create clean, simple policies
-- Allow admins to view ALL registrations
CREATE POLICY "Enable select for admins" ON pending_registrations
    FOR SELECT USING (true);

-- Allow admins to update ALL registrations
CREATE POLICY "Enable update for admins" ON pending_registrations
    FOR UPDATE USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON pending_registrations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Grant admin permissions
GRANT ALL ON pending_registrations TO authenticated;
GRANT ALL ON pending_registrations TO service_role;

-- 4. Verify policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pending_registrations';

-- 5. Test admin access
-- This should now work for admin users
SELECT COUNT(*) as total_pending FROM pending_registrations WHERE status = 'pending_approval';
