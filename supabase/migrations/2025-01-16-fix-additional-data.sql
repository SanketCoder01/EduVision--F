-- Fix missing additional_data column in pending_registrations
-- Run this in Supabase SQL Editor

-- Add missing additional_data column if it doesn't exist
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

-- Update existing records to have empty additional_data
UPDATE pending_registrations 
SET additional_data = '{}' 
WHERE additional_data IS NULL;

-- Verify the column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
AND column_name = 'additional_data';
