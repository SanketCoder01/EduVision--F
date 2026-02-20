-- =====================================================
-- DEAN AUTHENTICATION FIX
-- Run this AFTER creating the dean user in Supabase Authentication
-- =====================================================

-- Step 1: Drop old RLS policies that might cause issues
DROP POLICY IF EXISTS "Deans can view their own profile" ON deans;
DROP POLICY IF EXISTS "Deans can update their own profile" ON deans;
DROP POLICY IF EXISTS "Deans can insert their profile" ON deans;

-- Step 2: Create new RLS policies that work with email-based authentication
CREATE POLICY "Authenticated users can view deans"
    ON deans FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Deans can update their own profile"
    ON deans FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email');

CREATE POLICY "Deans can insert their profile"
    ON deans FOR INSERT
    TO authenticated
    WITH CHECK (email = auth.jwt()->>'email');

-- Step 3: Insert/Update dean profile in database
-- IMPORTANT: Replace 'YOUR_AUTH_UUID_HERE' with the actual UUID from Supabase Authentication
-- Get the UUID from: Supabase Dashboard → Authentication → Users → Copy the user's ID

INSERT INTO deans (
    id,
    name,
    email,
    department,
    designation,
    phone
) VALUES (
    '116c5539-34ef-47ef-bec6-95887e1d5add'::uuid,  -- ⚠️ REPLACE THIS with actual UUID
    'Dr. Dean Admin',
    'dean123@sanjivani.edu.in',
    'Computer Science & Engineering',
    'Dean of Engineering',
    '+91 9876543210'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    phone = EXCLUDED.phone;

-- Step 4: Verify the setup
SELECT 
    id,
    name,
    email,
    department,
    designation
FROM deans
WHERE email = 'dean123@sanjivani.edu.in';

-- =====================================================
-- MANUAL STEPS REQUIRED:
-- =====================================================
-- 
-- 1. GO TO: https://supabase.com/dashboard
-- 2. SELECT: Your project (jtguryzyprgqraimyimt)
-- 3. NAVIGATE: Authentication → Users
-- 4. CLICK: "Add user" → "Create new user"
-- 5. ENTER:
--    - Email: dean123@sanjivani.edu.in
--    - Password: dean@123
--    - Auto Confirm User: ✅ ENABLE
-- 6. CLICK: "Create user"
-- 7. COPY: The generated UUID (it looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
-- 8. PASTE: The UUID in line 32 above (replace 'YOUR_AUTH_UUID_HERE')
-- 9. RUN: This SQL script
-- 10. TEST: Login at http://localhost:3000/deanlogin
-- =====================================================
