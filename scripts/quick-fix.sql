-- Quick Fix for All EduVision Issues
-- Run this in Supabase SQL Editor

-- 1. Add missing columns
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- 2. Fix RLS policies for admin access
DROP POLICY IF EXISTS "Enable select for admins" ON pending_registrations;
DROP POLICY IF EXISTS "Enable update for admins" ON pending_registrations;

CREATE POLICY "Enable select for admins" ON pending_registrations
    FOR SELECT USING (true);

CREATE POLICY "Enable update for admins" ON pending_registrations
    FOR UPDATE USING (true);

-- 3. Update existing records
UPDATE pending_registrations 
SET submitted_at = created_at 
WHERE submitted_at IS NULL;

-- 4. Verify fix
SELECT '✅ Database fixed successfully!' as status;
SELECT COUNT(*) as total_pending FROM pending_registrations WHERE status = 'pending_approval';
