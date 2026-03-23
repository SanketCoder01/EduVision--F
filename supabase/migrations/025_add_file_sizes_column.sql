-- Add file_sizes column to assignment_submissions if it doesn't exist
-- Run this in Supabase SQL Editor

-- Add file_sizes column for storing file sizes
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS file_sizes BIGINT[];

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assignment_submissions' 
AND column_name IN ('file_urls', 'file_names', 'file_sizes', 'submission_text');

-- Check if there are any submissions with files
SELECT id, student_email, file_urls, file_names, submission_text 
FROM assignment_submissions 
WHERE array_length(file_urls, 1) > 0 OR submission_text IS NOT NULL
LIMIT 5;
