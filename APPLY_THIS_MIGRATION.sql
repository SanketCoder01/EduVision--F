-- COPY AND PASTE THIS ENTIRE FILE INTO YOUR SUPABASE SQL EDITOR
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- Then paste this and click "RUN"

-- Fix Announcements RLS Policies
-- ============================================

-- Drop ALL existing announcement policies (including old and new ones)
DROP POLICY IF EXISTS "Faculty create announcements for accessible depts" ON announcements;
DROP POLICY IF EXISTS "Faculty view all announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty update own announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty delete own announcements" ON announcements;
DROP POLICY IF EXISTS "Students view announcements if registered" ON announcements;
DROP POLICY IF EXISTS "Faculty can create announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can view announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can update own announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can delete own announcements" ON announcements;
DROP POLICY IF EXISTS "Students can view targeted announcements" ON announcements;
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Announcements public read" ON announcements;
DROP POLICY IF EXISTS "Faculty create announcements" ON announcements;

-- Create simplified policies that work with authenticated users
-- Faculty can create announcements
CREATE POLICY "Faculty can create announcements"
ON announcements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM faculty
    WHERE faculty.id = announcements.faculty_id
    AND faculty.registration_completed = TRUE
  )
);

-- Faculty can view all announcements
CREATE POLICY "Faculty can view announcements"
ON announcements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM faculty
    WHERE faculty.email = auth.jwt() ->> 'email'
  )
);

-- Faculty can update their own announcements
CREATE POLICY "Faculty can update own announcements"
ON announcements
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM faculty
    WHERE faculty.id = announcements.faculty_id
    AND faculty.email = auth.jwt() ->> 'email'
  )
);

-- Faculty can delete their own announcements
CREATE POLICY "Faculty can delete own announcements"
ON announcements
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM faculty
    WHERE faculty.id = announcements.faculty_id
    AND faculty.email = auth.jwt() ->> 'email'
  )
);

-- Students can view announcements targeted to them
CREATE POLICY "Students can view targeted announcements"
ON announcements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.email = auth.jwt() ->> 'email'
    AND students.registration_completed = TRUE
    AND (
      -- University-wide announcements (no department specified)
      announcements.department IS NULL
      OR
      -- Department-specific announcements
      (
        announcements.department = students.department
        AND (
          -- If no target years specified, show to all years
          announcements.target_years IS NULL
          OR
          announcements.target_years = '{}'::text[]
          OR
          -- If target years specified, check if student's year is included
          students.year = ANY(announcements.target_years)
        )
      )
    )
  )
);

-- Add poster_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' 
    AND column_name = 'poster_url'
  ) THEN
    ALTER TABLE announcements ADD COLUMN poster_url TEXT;
  END IF;
END $$;

-- Create storage bucket for announcement posters if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-posters', 'announcement-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for announcement posters
-- Drop all existing storage policies for this bucket
DROP POLICY IF EXISTS "Anyone can view announcement posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can upload announcement posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can update own announcement posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can delete own announcement posters" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to announcement-posters" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to announcement-posters" ON storage.objects;

CREATE POLICY "Anyone can view announcement posters"
ON storage.objects
FOR SELECT
USING (bucket_id = 'announcement-posters');

CREATE POLICY "Faculty can upload announcement posters"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'announcement-posters'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Faculty can update own announcement posters"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'announcement-posters'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Faculty can delete own announcement posters"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'announcement-posters'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- SUCCESS! Migration completed.
