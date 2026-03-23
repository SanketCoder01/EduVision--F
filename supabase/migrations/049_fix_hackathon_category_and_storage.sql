-- Migration: Fix Hackathon Category Column and Storage Bucket
-- Created: 2025-01-14
-- Purpose: Add missing category column and create hackathon-posters storage bucket

-- ============================================================================
-- ADD CATEGORY COLUMN TO HACKATHONS TABLE (if missing)
-- ============================================================================

DO $$ 
BEGIN
  -- Check if category column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'category'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN category TEXT;
    RAISE NOTICE 'Added category column to hackathons table';
  ELSE
    RAISE NOTICE 'Category column already exists in hackathons table';
  END IF;
END $$;

-- ============================================================================
-- ADD FACULTY_ID COLUMN TO HACKATHONS TABLE (if missing)
-- ============================================================================

DO $$ 
BEGIN
  -- Check if faculty_id column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'faculty_id'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added faculty_id column to hackathons table';
  ELSE
    RAISE NOTICE 'Faculty_id column already exists in hackathons table';
  END IF;
END $$;

-- ============================================================================
-- CREATE HACKATHON-POSTERS STORAGE BUCKET
-- ============================================================================

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-posters', 'hackathon-posters', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR HACKATHON-POSTERS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Faculty can upload hackathon posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hackathon posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can update hackathon posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can delete hackathon posters" ON storage.objects;

-- Create new policies
CREATE POLICY "Faculty can upload hackathon posters"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hackathon-posters');

CREATE POLICY "Anyone can view hackathon posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hackathon-posters');

CREATE POLICY "Faculty can update hackathon posters"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hackathon-posters');

CREATE POLICY "Faculty can delete hackathon posters"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hackathon-posters');

-- ============================================================================
-- ALSO ADD OTHER POTENTIALLY MISSING COLUMNS
-- ============================================================================

-- Add poster_file_name if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'poster_file_name'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN poster_file_name TEXT;
  END IF;
END $$;

-- Add published_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add resources if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'resources'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN resources JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add timeline if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'timeline'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================

-- Log the result
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count 
  FROM information_schema.columns 
  WHERE table_name = 'hackathons' AND column_name = 'category';
  
  IF col_count > 0 THEN
    RAISE NOTICE 'SUCCESS: category column now exists in hackathons table';
  ELSE
    RAISE NOTICE 'ERROR: category column still missing!';
  END IF;
END $$;
