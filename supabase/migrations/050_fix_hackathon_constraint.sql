-- Fix Hackathon CHECK Constraint and All Issues
-- Run in Supabase SQL Editor

-- ============================================================================
-- DROP AND RECREATE TABLE WITH PROPER CONSTRAINTS
-- ============================================================================

-- First, drop the existing check constraint if it exists
ALTER TABLE hackathons DROP CONSTRAINT IF EXISTS hackathons_status_check;

-- Add the proper check constraint
ALTER TABLE hackathons ADD CONSTRAINT hackathons_status_check 
  CHECK (status IS NULL OR status IN ('draft', 'published', 'registration_open', 'in_progress', 'completed', 'cancelled'));

-- ============================================================================
-- ENSURE ALL REQUIRED COLUMNS EXIST WITH PROPER DEFAULTS
-- ============================================================================

-- Set default values for NOT NULL columns that might be missing
ALTER TABLE hackathons ALTER COLUMN title SET DEFAULT 'Untitled Hackathon';
ALTER TABLE hackathons ALTER COLUMN description SET DEFAULT '';
ALTER TABLE hackathons ALTER COLUMN theme SET DEFAULT 'General';
ALTER TABLE hackathons ALTER COLUMN start_date SET DEFAULT NOW();
ALTER TABLE hackathons ALTER COLUMN end_date SET DEFAULT NOW();
ALTER TABLE hackathons ALTER COLUMN registration_deadline SET DEFAULT NOW();
ALTER TABLE hackathons ALTER COLUMN location SET DEFAULT 'TBA';
ALTER TABLE hackathons ALTER COLUMN department SET DEFAULT 'CSE';
ALTER TABLE hackathons ALTER COLUMN status SET DEFAULT 'published';

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-posters', 'hackathon-posters', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Faculty can upload hackathon posters" ON storage.objects;
CREATE POLICY "Faculty can upload hackathon posters"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hackathon-posters');

DROP POLICY IF EXISTS "Anyone can view hackathon posters" ON storage.objects;
CREATE POLICY "Anyone can view hackathon posters"
  ON storage.objects FOR SELECT USING (bucket_id = 'hackathon-posters');

DROP POLICY IF EXISTS "Faculty can update hackathon posters" ON storage.objects;
CREATE POLICY "Faculty can update hackathon posters"
  ON storage.objects FOR UPDATE USING (bucket_id = 'hackathon-posters');

DROP POLICY IF EXISTS "Faculty can delete hackathon posters" ON storage.objects;
CREATE POLICY "Faculty can delete hackathon posters"
  ON storage.objects FOR DELETE USING (bucket_id = 'hackathon-posters');

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_teams;

-- ============================================================================
-- VERIFY THE FIX
-- ============================================================================

SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'hackathons'::regclass;
