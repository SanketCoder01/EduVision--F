-- Migration: Hackathon Team Files Storage
-- Purpose: Allow students to store files privately in their teams (not visible to faculty)

-- ============================================================================
-- TEAM FILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hackathon_team_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image', 'ppt', 'link', 'document', 'other'
  file_size BIGINT,
  
  -- Metadata
  uploaded_by TEXT NOT NULL, -- Student PRN
  description TEXT,
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Visibility (only visible to team members)
  is_private BOOLEAN DEFAULT true
);

-- Create storage bucket for team files
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-team-files', 'hackathon-team-files', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR TEAM FILES (Private - only team members can access)
-- ============================================================================

-- Students can upload files to their team
CREATE POLICY "Team members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hackathon-team-files' 
    AND auth.role() = 'authenticated'
  );

-- Team members can view their team's files
CREATE POLICY "Team members can view files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hackathon-team-files');

-- Team members can delete their own files
CREATE POLICY "Team members can delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hackathon-team-files');

-- ============================================================================
-- RLS POLICIES FOR TEAM FILES TABLE
-- ============================================================================

ALTER TABLE hackathon_team_files ENABLE ROW LEVEL SECURITY;

-- Team members can view their team's files
CREATE POLICY "Team members can view team files"
  ON hackathon_team_files FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM hackathon_teams 
      WHERE team_leader_id = auth.uid()::text 
      OR members::text LIKE '%' || auth.uid()::text || '%'
    )
  );

-- Team members can insert files
CREATE POLICY "Team members can insert team files"
  ON hackathon_team_files FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT id FROM hackathon_teams 
      WHERE team_leader_id = auth.uid()::text 
      OR members::text LIKE '%' || auth.uid()::text || '%'
    )
  );

-- File uploader can delete their files
CREATE POLICY "Uploader can delete team files"
  ON hackathon_team_files FOR DELETE
  USING (uploaded_by = auth.uid()::text);

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_team_files;
