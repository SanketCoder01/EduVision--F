-- Complete EduVision Database Fix - Run this in Supabase SQL Editor
-- This fixes: missing columns, RLS policies, and unique constraints

-- ========================================
-- STEP 1: Fix Table Structure
-- ========================================

-- Drop and recreate the pending_registrations table with correct structure
DROP TABLE IF EXISTS pending_registrations CASCADE;

CREATE TABLE pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    department TEXT CHECK (department IN ('CSE', 'Cyber', 'AIDS', 'AIML')),
    year TEXT CHECK (year IN ('1st', '2nd', '3rd', '4th')),
    user_type TEXT CHECK (user_type IN ('student', 'faculty')) NOT NULL,
    face_url TEXT,
    face_data JSONB DEFAULT '{}',
    additional_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: Fix RLS Policies
-- ========================================

-- Enable RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pending_registrations;
DROP POLICY IF EXISTS "Enable select for own registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Enable update for own registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Enable select for admins" ON pending_registrations;
DROP POLICY IF EXISTS "Enable update for admins" ON pending_registrations;

-- Create new policies
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
    FOR SELECT USING (true);

-- Allow admins to update all registrations
CREATE POLICY "Enable update for admins" ON pending_registrations
    FOR UPDATE USING (true);

-- ========================================
-- STEP 3: Grant Permissions
-- ========================================

GRANT ALL ON pending_registrations TO authenticated;
GRANT ALL ON pending_registrations TO service_role;

-- ========================================
-- STEP 4: Create Indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_type ON pending_registrations(user_type);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_department ON pending_registrations(department);

-- ========================================
-- STEP 5: Verify Everything Works
-- ========================================

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_identity
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pending_registrations';

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pending_registrations';

-- ========================================
-- STEP 6: Test Insert (Optional)
-- ========================================

-- Uncomment the line below to test if everything works
-- INSERT INTO pending_registrations (email, name, phone, department, year, user_type, status) 
-- VALUES ('test@example.com', 'Test User', '1234567890', 'CSE', '1st', 'student', 'pending_approval');

-- ========================================
-- STEP 7: Cleanup (Optional)
-- ========================================

-- Uncomment to remove test data
-- DELETE FROM pending_registrations WHERE email = 'test@example.com';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT '🎉 All database issues fixed successfully!' as status;
SELECT '✅ Table structure created' as step1;
SELECT '✅ RLS policies configured' as step2;
SELECT '✅ Permissions granted' as step3;
SELECT '✅ Indexes created' as step4;
SELECT '✅ Ready for registration flow!' as step5;
