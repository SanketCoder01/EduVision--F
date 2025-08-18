-- Fix Missing Columns in pending_registrations
-- Run this in Supabase SQL Editor

-- Add missing submitted_at column
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add any other missing columns that might be needed
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have submitted_at
UPDATE pending_registrations 
SET submitted_at = created_at 
WHERE submitted_at IS NULL;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
ORDER BY ordinal_position;
