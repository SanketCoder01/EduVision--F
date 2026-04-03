-- Add face_image, photo, and avatar columns to all 16 student department-year tables
-- Run this in Supabase SQL Editor

-- CSE Tables
ALTER TABLE students_cse_1st_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_cse_2nd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_cse_3rd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_cse_4th_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

-- Cyber Tables
ALTER TABLE students_cyber_1st_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_cyber_2nd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_cyber_3rd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_cyber_4th_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

-- AIDS Tables
ALTER TABLE students_aids_1st_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_aids_2nd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_aids_3rd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_aids_4th_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

-- AIML Tables
ALTER TABLE students_aiml_1st_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_aiml_2nd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_aiml_3rd_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

ALTER TABLE students_aiml_4th_year 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT;

-- Also ensure faculty table has all image columns
ALTER TABLE faculty 
ADD COLUMN IF NOT EXISTS face_image TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS face_url TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for avatars if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public access to avatars bucket
CREATE POLICY IF NOT EXISTS "Public Access Avatar Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update own avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Done! All tables now have face_image columns
