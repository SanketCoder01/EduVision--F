-- Add missing columns to assignments table
-- Run this in Supabase SQL Editor

-- Add allow_late_submission column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN DEFAULT false;

-- Add allow_resubmission column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT false;

-- Add questions column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS questions TEXT;

-- Add submission_guidelines column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS submission_guidelines TEXT;

-- Add difficulty column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);

-- Add estimated_time column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Add ai_prompt column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS ai_prompt TEXT;

-- Add visibility column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS visibility BOOLEAN DEFAULT true;

-- Add allowed_file_types column if not exists
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS allowed_file_types TEXT[];

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assignments' 
AND column_name IN ('allow_late_submission', 'allow_resubmission', 'questions', 'submission_guidelines', 'difficulty', 'estimated_time', 'ai_prompt', 'visibility', 'allowed_file_types');
