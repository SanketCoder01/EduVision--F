-- Migration: Fix ALL Missing Hackathon Columns and Storage
-- Run this in Supabase SQL Editor to fix all issues at once

-- ============================================================================
-- ADD ALL MISSING COLUMNS TO HACKATHONS TABLE
-- ============================================================================

-- Add faculty_id
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE;

-- Add category
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS category TEXT;

-- Add location
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS location TEXT;

-- Add title
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS title TEXT;

-- Add description
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS description TEXT;

-- Add theme
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS theme TEXT;

-- Add start_date
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

-- Add end_date
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Add registration_deadline
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;

-- Add max_teams
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS max_teams INTEGER DEFAULT 50;

-- Add team_size_min
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS team_size_min INTEGER DEFAULT 2;

-- Add team_size_max
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS team_size_max INTEGER DEFAULT 5;

-- Add department
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS department TEXT;

-- Add target_years
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT ARRAY['1st', '2nd', '3rd', '4th'];

-- Add registration_link
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registration_link TEXT;

-- Add website_link
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS website_link TEXT;

-- Add poster_url
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS poster_url TEXT;

-- Add poster_file_name
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS poster_file_name TEXT;

-- Add prizes
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prizes JSONB DEFAULT '[]'::jsonb;

-- Add resources
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

-- Add timeline
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;

-- Add status
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Add registered_teams_count
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registered_teams_count INTEGER DEFAULT 0;

-- Add created_at
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add published_at
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- ============================================================================
-- CREATE HACKATHON-POSTERS STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-posters', 'hackathon-posters', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Faculty can upload hackathon posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hackathon posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can update hackathon posters" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can delete hackathon posters" ON storage.objects;

CREATE POLICY "Faculty can upload hackathon posters"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hackathon-posters');

CREATE POLICY "Anyone can view hackathon posters"
  ON storage.objects FOR SELECT USING (bucket_id = 'hackathon-posters');

CREATE POLICY "Faculty can update hackathon posters"
  ON storage.objects FOR UPDATE USING (bucket_id = 'hackathon-posters');

CREATE POLICY "Faculty can delete hackathon posters"
  ON storage.objects FOR DELETE USING (bucket_id = 'hackathon-posters');

-- ============================================================================
-- ENABLE REALTIME FOR HACKATHONS
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_teams;

-- ============================================================================
-- VERIFY ALL COLUMNS EXIST
-- ============================================================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hackathons' 
ORDER BY ordinal_position;
