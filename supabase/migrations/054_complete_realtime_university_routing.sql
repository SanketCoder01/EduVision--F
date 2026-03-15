-- Migration: Complete Real-time Setup + University Routing for All Services
-- Run in Supabase SQL Editor

-- ============================================================================
-- 0. FIX HACKATHON_TEAMS TABLE - ADD MISSING COLUMNS
-- ============================================================================

-- Add contact_email column if it doesn't exist
DO $$
BEGIN
  -- Ensure members column exists and is JSONB (some older schemas may not have it or may have a different type)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathon_teams' AND column_name = 'members') THEN
    ALTER TABLE hackathon_teams ADD COLUMN members JSONB NOT NULL DEFAULT '[]'::jsonb;
  ELSE
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'hackathon_teams'
        AND column_name = 'members'
        AND data_type <> 'jsonb'
    ) THEN
      ALTER TABLE hackathon_teams
        ALTER COLUMN members TYPE JSONB
        USING (
          CASE
            WHEN members IS NULL THEN '[]'::jsonb
            ELSE to_jsonb(members)
          END
        );
    END IF;
  END IF;

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

-- ============================================================================
-- 1. ENABLE REALTIME FOR ALL TABLES
-- ============================================================================

-- Core tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_team_files;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS lost_found_items;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS student_leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS grievances;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS faculty;

-- Other services tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS document_reissue_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS recommendation_requests;

-- ============================================================================
-- 2. MAINTENANCE REQUESTS TABLE (Route to University)
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_prn TEXT,
  department TEXT NOT NULL,
  year TEXT,
  
  -- Request details
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  image_url TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  submitted_to TEXT DEFAULT 'university',
  
  -- Resolution
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own maintenance requests"
  ON maintenance_requests FOR SELECT
  USING (true);

CREATE POLICY "Students can insert maintenance requests"
  ON maintenance_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "University can update maintenance requests"
  ON maintenance_requests FOR UPDATE
  USING (true);

-- ============================================================================
-- 3. SUGGESTIONS TABLE (Route to University)
-- ============================================================================

CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_prn TEXT,
  department TEXT NOT NULL,
  year TEXT,
  
  -- Suggestion details
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Status tracking
  status TEXT DEFAULT 'under_review',
  submitted_to TEXT DEFAULT 'university',
  upvotes INTEGER DEFAULT 0,
  
  -- Response
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view all suggestions"
  ON suggestions FOR SELECT
  USING (true);

CREATE POLICY "Students can insert suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "University can update suggestions"
  ON suggestions FOR UPDATE
  USING (true);

-- ============================================================================
-- 4. DOCUMENT REISSUE REQUESTS TABLE (Route to University)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_reissue_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_prn TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT,
  
  -- Request details
  document_type TEXT NOT NULL,
  academic_year TEXT,
  semester TEXT,
  reason TEXT NOT NULL,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending',
  payment_amount TEXT,
  payment_date TEXT,
  transaction_id TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  submitted_to TEXT DEFAULT 'university',
  
  -- Resolution
  document_url TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE document_reissue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own document requests"
  ON document_reissue_requests FOR SELECT
  USING (true);

CREATE POLICY "Students can insert document requests"
  ON document_reissue_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "University can update document requests"
  ON document_reissue_requests FOR UPDATE
  USING (true);

-- ============================================================================
-- 5. RECOMMENDATION LETTER REQUESTS TABLE (Route to University)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recommendation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_prn TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT,
  
  -- Request details
  purpose TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'graduate_school', 'job', 'scholarship'
  target_name TEXT NOT NULL, -- university/company name
  program_position TEXT, -- program name or job position
  deadline TEXT,
  
  -- Additional info
  additional_notes TEXT,
  achievements TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  submitted_to TEXT DEFAULT 'university',
  
  -- Resolution
  document_url TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE recommendation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own recommendation requests"
  ON recommendation_requests FOR SELECT
  USING (true);

CREATE POLICY "Students can insert recommendation requests"
  ON recommendation_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "University can update recommendation requests"
  ON recommendation_requests FOR UPDATE
  USING (true);

-- ============================================================================
-- 6. FIX HACKATHONS - ENSURE PROPER DATA
-- ============================================================================

-- Update existing hackathons to have correct target_years format
UPDATE hackathons 
SET target_years = ARRAY['1st', '2nd', '3rd', '4th']
WHERE target_years IS NULL 
   OR array_length(target_years, 1) IS NULL
   OR target_years = '{}';

-- Ensure status is correct
UPDATE hackathons SET status = 'published' WHERE status IS NULL;

-- Ensure department is set
UPDATE hackathons SET department = 'CSE' WHERE department IS NULL OR department = '';

-- ============================================================================
-- 7. FIX LOST_FOUND_ITEMS
-- ============================================================================

UPDATE lost_found_items 
SET target_years = ARRAY['1st', '2nd', '3rd', '4th']
WHERE target_years IS NULL OR array_length(target_years, 1) IS NULL;

-- ============================================================================
-- 8. FIX STUDENT_LEAVE_REQUESTS
-- ============================================================================

-- Add missing columns
ALTER TABLE student_leave_requests ADD COLUMN IF NOT EXISTS student_prn TEXT;
ALTER TABLE student_leave_requests ADD COLUMN IF NOT EXISTS faculty_id TEXT;
ALTER TABLE student_leave_requests ADD COLUMN IF NOT EXISTS faculty_name TEXT;

-- Set defaults
UPDATE student_leave_requests SET status = 'pending' WHERE status IS NULL;

-- ============================================================================
-- 9. VERIFY REALTIME IS ENABLED
-- ============================================================================

SELECT 'Realtime tables:' as info;
SELECT schemaname, tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'hackathons', 'hackathon_teams', 'lost_found_items', 
  'student_leave_requests', 'grievances', 'faculty',
  'maintenance_requests', 'suggestions', 'document_reissue_requests', 
  'recommendation_requests'
);

-- ============================================================================
-- 10. SAMPLE DATA VERIFICATION
-- ============================================================================

SELECT 'Hackathons:' as info, COUNT(*) as count FROM hackathons;
SELECT 'Lost & Found:' as info, COUNT(*) as count FROM lost_found_items;
SELECT 'Leave Requests:' as info, COUNT(*) as count FROM student_leave_requests;
SELECT 'Faculty:' as info, COUNT(*) as count FROM faculty;
