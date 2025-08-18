-- Fix EduVision Database Schema Issues
-- Run this in Supabase SQL Editor

-- 1. Add missing additional_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_registrations' 
        AND column_name = 'additional_data'
    ) THEN
        ALTER TABLE pending_registrations 
        ADD COLUMN additional_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Add missing face_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_registrations' 
        AND column_name = 'face_data'
    ) THEN
        ALTER TABLE pending_registrations 
        ADD COLUMN face_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. Add missing face_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_registrations' 
        AND column_name = 'face_url'
    ) THEN
        ALTER TABLE pending_registrations 
        ADD COLUMN face_url TEXT;
    END IF;
END $$;

-- 4. Add missing status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_registrations' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE pending_registrations 
        ADD COLUMN status TEXT DEFAULT 'pending_approval';
    END IF;
END $$;

-- 5. Update existing records to have default values
UPDATE pending_registrations 
SET additional_data = '{}' 
WHERE additional_data IS NULL;

UPDATE pending_registrations 
SET face_data = '{}' 
WHERE face_data IS NULL;

UPDATE pending_registrations 
SET status = 'pending_approval' 
WHERE status IS NULL;

-- 6. Verify the fix - show all columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
ORDER BY ordinal_position;

-- 7. Test insert to verify everything works
INSERT INTO pending_registrations (
    email, 
    name, 
    phone, 
    department, 
    year, 
    user_type, 
    status,
    face_url,
    face_data,
    additional_data
) VALUES (
    'test@example.com',
    'Test User',
    '1234567890',
    'CSE',
    '1st',
    'student',
    'pending_approval',
    NULL,
    '{}',
    '{}'
) ON CONFLICT (email) DO NOTHING;

-- 8. Clean up test data
DELETE FROM pending_registrations WHERE email = 'test@example.com';

-- 9. Show final table structure
SELECT 'Database schema fix completed successfully! All required columns added.' as status;
