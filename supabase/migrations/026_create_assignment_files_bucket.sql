-- Create assignment-files storage bucket for student submissions
-- Run this in Supabase SQL Editor

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for assignment-files bucket
-- Allow anyone to read (public bucket for submissions)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'assignment-files');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assignment-files' AND auth.uid()::text = (storage.foldername(get_path()))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'assignment-files' AND auth.uid()::text = (storage.foldername(get_path()))[1]);

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'assignment-files';
