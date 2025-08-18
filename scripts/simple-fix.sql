-- Complete Database Fix for EduVision
-- Run this in Supabase SQL Editor

-- Add missing columns to pending_registrations table
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS additional_data JSONB DEFAULT '{}';

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS face_data JSONB DEFAULT '{}';

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_approval';

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS year TEXT;

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS user_type TEXT;

-- Update existing records with default values
UPDATE pending_registrations 
SET additional_data = '{}' 
WHERE additional_data IS NULL;

UPDATE pending_registrations 
SET face_data = '{}' 
WHERE face_data IS NULL;

UPDATE pending_registrations 
SET status = 'pending_approval' 
WHERE status IS NULL;

UPDATE pending_registrations 
SET phone = '' 
WHERE phone IS NULL;

UPDATE pending_registrations 
SET department = 'CSE' 
WHERE department IS NULL;

UPDATE pending_registrations 
SET year = '1st' 
WHERE year IS NULL;

UPDATE pending_registrations 
SET user_type = 'student' 
WHERE user_type IS NULL;

-- Show the final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
ORDER BY ordinal_position;
