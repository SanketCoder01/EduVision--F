-- Complete fix for assignments table - Run this in Supabase SQL Editor
-- This adds all missing columns and creates submission_files table

-- ============================================
-- PART 1: Add missing columns to assignments
-- ============================================

-- Add allow_late_submission column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN DEFAULT false;

-- Add allow_resubmission column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT false;

-- Add questions column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS questions TEXT;

-- Add submission_guidelines column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS submission_guidelines TEXT;

-- Add difficulty column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);

-- Add estimated_time column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Add ai_prompt column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS ai_prompt TEXT;

-- Add visibility column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS visibility BOOLEAN DEFAULT true;

-- Add allowed_file_types column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS allowed_file_types TEXT[];

-- Add subject column
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS subject TEXT;

-- ============================================
-- PART 2: Create submission_files table
-- ============================================

-- Create submission_files table
CREATE TABLE IF NOT EXISTS submission_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);

-- Enable RLS
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Faculty can view submission files for their assignments" ON submission_files;
DROP POLICY IF EXISTS "Students can view their own submission files" ON submission_files;
DROP POLICY IF EXISTS "Students can insert their own submission files" ON submission_files;

-- Create RLS policies
CREATE POLICY "Faculty can view submission files for their assignments"
ON submission_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    JOIN assignments ON assignment_submissions.assignment_id = assignments.id
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignments.faculty_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own submission files"
ON submission_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

CREATE POLICY "Students can insert their own submission files"
ON submission_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

-- ============================================
-- PART 3: Verify everything
-- ============================================

-- Verify assignments columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assignments' 
AND column_name IN ('allow_late_submission', 'allow_resubmission', 'questions', 'submission_guidelines', 'max_marks', 'subject');

-- Verify submission_files table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submission_files';
