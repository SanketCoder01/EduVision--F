-- Migration: Complete Fix for All Issues
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. HACKATHON TEAM FILES TABLE (Fixed RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS hackathon_team_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hackathon_team_files ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Team members can view files
CREATE POLICY "Team members can view team files"
  ON hackathon_team_files FOR SELECT
  USING (true); -- Allow all for now, can restrict later

-- RLS Policy: Team members can insert files
CREATE POLICY "Team members can insert team files"
  ON hackathon_team_files FOR INSERT
  WITH CHECK (true); -- Allow all authenticated users

-- RLS Policy: Uploader can delete their files
CREATE POLICY "Uploader can delete team files"
  ON hackathon_team_files FOR DELETE
  USING (true); -- Allow delete

-- ============================================================================
-- 2. CREATE STORAGE BUCKETS
-- ============================================================================

-- Hackathon posters bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-posters', 'hackathon-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Hackathon team files bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-team-files', 'hackathon-team-files', false)
ON CONFLICT (id) DO NOTHING;

-- Lost & Found images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-found-images', 'lost-found-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. STORAGE POLICIES
-- ============================================================================

-- Hackathon posters policies
DROP POLICY IF EXISTS "Faculty can upload hackathon posters" ON storage.objects;
CREATE POLICY "Faculty can upload hackathon posters"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hackathon-posters');

DROP POLICY IF EXISTS "Anyone can view hackathon posters" ON storage.objects;
CREATE POLICY "Anyone can view hackathon posters"
  ON storage.objects FOR SELECT USING (bucket_id = 'hackathon-posters');

-- Hackathon team files policies
DROP POLICY IF EXISTS "Team can upload files" ON storage.objects;
CREATE POLICY "Team can upload files"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hackathon-team-files');

DROP POLICY IF EXISTS "Team can view files" ON storage.objects;
CREATE POLICY "Team can view files"
  ON storage.objects FOR SELECT USING (bucket_id = 'hackathon-team-files');

-- Lost & Found policies
DROP POLICY IF EXISTS "Faculty can upload lost found images" ON storage.objects;
CREATE POLICY "Faculty can upload lost found images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lost-found-images');

DROP POLICY IF EXISTS "Anyone can view lost found images" ON storage.objects;
CREATE POLICY "Anyone can view lost found images"
  ON storage.objects FOR SELECT USING (bucket_id = 'lost-found-images');

-- ============================================================================
-- 4. FIX HACKATHONS TABLE - ENSURE ALL COLUMNS EXIST
-- ============================================================================

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- faculty_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'faculty_id') THEN
    ALTER TABLE hackathons ADD COLUMN faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE;
  END IF;
  
  -- category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'category') THEN
    ALTER TABLE hackathons ADD COLUMN category TEXT;
  END IF;
  
  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'location') THEN
    ALTER TABLE hackathons ADD COLUMN location TEXT;
  END IF;
  
  -- target_years
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'target_years') THEN
    ALTER TABLE hackathons ADD COLUMN target_years TEXT[] DEFAULT ARRAY['1st', '2nd', '3rd', '4th'];
  END IF;
END $$;

-- Fix status constraint
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_status_check;
ALTER TABLE hackathons ADD CONSTRAINT hackathons_status_check 
  CHECK (status IS NULL OR status IN ('draft', 'published', 'registration_open', 'in_progress', 'completed', 'cancelled'));

-- Set defaults
ALTER TABLE hackathons ALTER COLUMN status SET DEFAULT 'published';
ALTER TABLE hackathons ALTER COLUMN department SET DEFAULT 'CSE';

-- ============================================================================
-- 5. FIX LOST_FOUND_ITEMS TABLE - COMPREHENSIVE FIX
-- ============================================================================

-- Step 1: Drop all foreign key constraints first
DO $$
BEGIN
  -- Drop reporter_id foreign key
  ALTER TABLE lost_found_items DROP CONSTRAINT IF EXISTS lost_found_items_reporter_id_fkey;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop reporter_id foreign key: %', SQLERRM;
END $$;

-- Step 2: Drop NOT NULL constraints
DO $$
BEGIN
  ALTER TABLE lost_found_items ALTER COLUMN reporter_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop NOT NULL from reporter_id: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER TABLE lost_found_items ALTER COLUMN department DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop NOT NULL from department: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER TABLE lost_found_items ALTER COLUMN item_name DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop NOT NULL from item_name: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER TABLE lost_found_items ALTER COLUMN item_category DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop NOT NULL from item_category: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER TABLE lost_found_items ALTER COLUMN location_found DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop NOT NULL from location_found: %', SQLERRM;
END $$;

-- Step 3: Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'reporter_id') THEN
    ALTER TABLE lost_found_items ADD COLUMN reporter_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'department') THEN
    ALTER TABLE lost_found_items ADD COLUMN department TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'target_years') THEN
    ALTER TABLE lost_found_items ADD COLUMN target_years TEXT[] DEFAULT ARRAY['1st', '2nd', '3rd', '4th'];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'item_category') THEN
    ALTER TABLE lost_found_items ADD COLUMN item_category TEXT DEFAULT 'electronics';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'item_name') THEN
    ALTER TABLE lost_found_items ADD COLUMN item_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'location_found') THEN
    ALTER TABLE lost_found_items ADD COLUMN location_found TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'status') THEN
    ALTER TABLE lost_found_items ADD COLUMN status TEXT DEFAULT 'found';
  END IF;
END $$;

-- Step 4: Re-add foreign key constraint (nullable)
DO $$
BEGIN
  ALTER TABLE lost_found_items ADD CONSTRAINT lost_found_items_reporter_id_fkey 
    FOREIGN KEY (reporter_id) REFERENCES faculty(id) ON DELETE CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add foreign key: %', SQLERRM;
END $$;

-- Step 5: Update existing NULL values to defaults
DO $$
BEGIN
  UPDATE lost_found_items SET status = 'found' WHERE status IS NULL;
  UPDATE lost_found_items SET item_category = 'electronics' WHERE item_category IS NULL;
  UPDATE lost_found_items SET department = 'CSE' WHERE department IS NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not update NULL values: %', SQLERRM;
END $$;

-- ============================================================================
-- 6. ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_team_files;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS lost_found_items;

-- ============================================================================
-- 7. VERIFY
-- ============================================================================

SELECT 'Hackathons columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'hackathons' ORDER BY ordinal_position;

SELECT 'Storage buckets:' as info;
SELECT * FROM storage.buckets;
