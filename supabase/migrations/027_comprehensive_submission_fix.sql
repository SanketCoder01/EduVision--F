-- COMPREHENSIVE FIX FOR SUBMISSION FILES
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Add missing columns to assignment_submissions
-- ============================================

-- Add plagiarism_score if missing
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS plagiarism_score INTEGER;

-- Add plagiarism_report if missing  
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS plagiarism_report JSONB;

-- Add auto_graded if missing
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS auto_graded BOOLEAN DEFAULT false;

-- ============================================
-- STEP 2: Create submission_files table
-- ============================================

-- Create submission_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS submission_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);

-- Enable RLS
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Faculty can view submission files" ON submission_files;
DROP POLICY IF EXISTS "Students can view own submission files" ON submission_files;
DROP POLICY IF EXISTS "Students can insert own submission files" ON submission_files;

-- Create RLS policies
CREATE POLICY "Faculty can view submission files"
ON submission_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    JOIN assignments ON assignment_submissions.assignment_id = assignments.id
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignments.faculty_id = auth.uid()
  )
);

CREATE POLICY "Students can view own submission files"
ON submission_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

CREATE POLICY "Students can insert own submission files"
ON submission_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

-- ============================================
-- STEP 3: Create storage bucket for files
-- ============================================

-- Create assignment-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access assignment-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload assignment-files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public Access assignment-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'assignment-files');

CREATE POLICY "Authenticated upload assignment-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');

-- ============================================
-- STEP 4: Verify everything
-- ============================================

-- Check assignment_submissions columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assignment_submissions'
ORDER BY ordinal_position;

-- Check submission_files table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'submission_files';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'assignment-files';

-- Check if any submissions exist
SELECT id, student_email, submission_text, file_urls, file_names, status
FROM assignment_submissions
LIMIT 5;
