-- Quick Fix for Hackathon Teams Members Column
-- Run this in Supabase SQL Editor IMMEDIATELY

-- Drop the members column if it exists with wrong type, then recreate as JSONB
ALTER TABLE hackathon_teams DROP COLUMN IF EXISTS members;
ALTER TABLE hackathon_teams ADD COLUMN members JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Ensure other required columns exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathon_teams' AND column_name = 'contact_email') THEN
    ALTER TABLE hackathon_teams ADD COLUMN contact_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathon_teams' AND column_name = 'contact_phone') THEN
    ALTER TABLE hackathon_teams ADD COLUMN contact_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathon_teams' AND column_name = 'member_count') THEN
    ALTER TABLE hackathon_teams ADD COLUMN member_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hackathon_teams' 
ORDER BY ordinal_position;
