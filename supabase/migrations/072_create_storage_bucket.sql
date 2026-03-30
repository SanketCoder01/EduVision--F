-- ================================================================
-- Migration 072: Storage Bucket for Cafeteria Images
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Create the "uploads" bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if any to avoid errors on rerun
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 3. Create policies for the "uploads" bucket
-- ALlow anyone to view the images
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'uploads');

-- Allow logged in users (Auth) to upload files
CREATE POLICY "Authenticated users can upload" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

-- Allow logged in users to update their files
CREATE POLICY "Authenticated users can update" 
  ON storage.objects FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'uploads');

-- Allow logged in users to delete their files
CREATE POLICY "Authenticated users can delete" 
  ON storage.objects FOR DELETE 
  TO authenticated
  USING (bucket_id = 'uploads');
