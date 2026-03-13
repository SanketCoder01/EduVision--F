-- Create submission_files table for storing student submission files
-- Run this in Supabase SQL Editor

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

-- Create RLS policies
-- Allow faculty to view submission files for their assignments
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

-- Allow students to view their own submission files
CREATE POLICY "Students can view their own submission files"
ON submission_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

-- Allow students to insert their own submission files
CREATE POLICY "Students can insert their own submission files"
ON submission_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assignment_submissions
    WHERE assignment_submissions.id = submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submission_files';
