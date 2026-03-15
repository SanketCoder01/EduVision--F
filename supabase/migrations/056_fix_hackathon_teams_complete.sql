-- COMPLETE FIX for hackathon_teams table
-- Run this ENTIRE script in Supabase SQL Editor

-- First, check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hackathon_teams';

-- Drop and recreate the table with correct schema
DROP TABLE IF EXISTS hackathon_teams CASCADE;

CREATE TABLE hackathon_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  
  -- Team Info
  team_name TEXT NOT NULL,
  team_leader_id TEXT NOT NULL,
  
  -- Team Members as JSONB array
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  member_count INTEGER DEFAULT 1,
  
  -- Contact Info
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Status (TEXT, not INTEGER!)
  status TEXT DEFAULT 'registered',
  
  -- Project submission fields
  project_name TEXT,
  project_description TEXT,
  project_link TEXT,
  project_submitted_at TIMESTAMPTZ,
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_hackathon_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE INDEX idx_hackathon_teams_leader ON hackathon_teams(team_leader_id);

-- Enable RLS
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust as needed)
CREATE POLICY "Allow all access to hackathon_teams"
  ON hackathon_teams FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the fix
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hackathon_teams'
ORDER BY ordinal_position;
