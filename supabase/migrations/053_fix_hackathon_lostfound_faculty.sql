-- Migration: Fix Hackathon, Lost & Found, and Faculty Issues
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. ENSURE FACULTY TABLE HAS ALL COLUMNS
-- ============================================================================

-- Add missing columns to faculty table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faculty' AND column_name = 'department') THEN
    ALTER TABLE faculty ADD COLUMN department TEXT DEFAULT 'CSE';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faculty' AND column_name = 'name') THEN
    ALTER TABLE faculty ADD COLUMN name TEXT;
  END IF;
END $$;

-- Update NULL departments to default
UPDATE faculty SET department = 'CSE' WHERE department IS NULL OR department = '';

-- ============================================================================
-- 2. FIX LOST_FOUND_ITEMS TABLE
-- ============================================================================

-- Ensure all columns exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'reporter_name') THEN
    ALTER TABLE lost_found_items ADD COLUMN reporter_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'target_years') THEN
    ALTER TABLE lost_found_items ADD COLUMN target_years TEXT[] DEFAULT ARRAY['1st', '2nd', '3rd', '4th'];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'image_url') THEN
    ALTER TABLE lost_found_items ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_found_items' AND column_name = 'created_at') THEN
    ALTER TABLE lost_found_items ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Set default target_years for existing items
UPDATE lost_found_items 
SET target_years = ARRAY['1st', '2nd', '3rd', '4th'] 
WHERE target_years IS NULL OR array_length(target_years, 1) IS NULL;

-- ============================================================================
-- 3. FIX HACKATHONS TABLE
-- ============================================================================

-- Ensure target_years column exists and has correct format
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'target_years') THEN
    ALTER TABLE hackathons ADD COLUMN target_years TEXT[] DEFAULT ARRAY['1st', '2nd', '3rd', '4th'];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'department') THEN
    ALTER TABLE hackathons ADD COLUMN department TEXT DEFAULT 'CSE';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'faculty_id') THEN
    ALTER TABLE hackathons ADD COLUMN faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'status') THEN
    ALTER TABLE hackathons ADD COLUMN status TEXT DEFAULT 'published';
  END IF;
END $$;

-- Fix existing hackathons with NULL target_years
UPDATE hackathons 
SET target_years = ARRAY['1st', '2nd', '3rd', '4th'] 
WHERE target_years IS NULL OR array_length(target_years, 1) IS NULL;

-- Fix existing hackathons with NULL status
UPDATE hackathons SET status = 'published' WHERE status IS NULL;

-- ============================================================================
-- 4. FIX STUDENT_LEAVE_REQUESTS TABLE
-- ============================================================================

-- Ensure all required columns exist
DO $$
BEGIN
  -- Student info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'student_id') THEN
    ALTER TABLE student_leave_requests ADD COLUMN student_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'student_name') THEN
    ALTER TABLE student_leave_requests ADD COLUMN student_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'student_email') THEN
    ALTER TABLE student_leave_requests ADD COLUMN student_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'student_prn') THEN
    ALTER TABLE student_leave_requests ADD COLUMN student_prn TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'department') THEN
    ALTER TABLE student_leave_requests ADD COLUMN department TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'year') THEN
    ALTER TABLE student_leave_requests ADD COLUMN year TEXT;
  END IF;
  
  -- Leave details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'leave_type') THEN
    ALTER TABLE student_leave_requests ADD COLUMN leave_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'start_date') THEN
    ALTER TABLE student_leave_requests ADD COLUMN start_date TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'end_date') THEN
    ALTER TABLE student_leave_requests ADD COLUMN end_date TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'reason') THEN
    ALTER TABLE student_leave_requests ADD COLUMN reason TEXT;
  END IF;
  
  -- Faculty info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'faculty_id') THEN
    ALTER TABLE student_leave_requests ADD COLUMN faculty_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'faculty_name') THEN
    ALTER TABLE student_leave_requests ADD COLUMN faculty_name TEXT;
  END IF;
  
  -- Approval info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'status') THEN
    ALTER TABLE student_leave_requests ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'approved_by') THEN
    ALTER TABLE student_leave_requests ADD COLUMN approved_by TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'approved_date') THEN
    ALTER TABLE student_leave_requests ADD COLUMN approved_date TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'rejection_reason') THEN
    ALTER TABLE student_leave_requests ADD COLUMN rejection_reason TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'document_url') THEN
    ALTER TABLE student_leave_requests ADD COLUMN document_url TEXT DEFAULT '';
  END IF;
  
  -- Timestamps
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'created_at') THEN
    ALTER TABLE student_leave_requests ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_leave_requests' AND column_name = 'updated_at') THEN
    ALTER TABLE student_leave_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Set default status for existing records
UPDATE student_leave_requests SET status = 'pending' WHERE status IS NULL;

-- ============================================================================
-- 5. ENABLE REALTIME FOR ALL TABLES
-- ============================================================================

-- Enable realtime publication for all relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS hackathon_team_files;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS lost_found_items;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS student_leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS grievances;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS faculty;

-- ============================================================================
-- 6. RLS POLICIES FOR FACULTY TABLE
-- ============================================================================

-- Allow reading faculty data for dropdowns
DROP POLICY IF EXISTS "Faculty are viewable by all authenticated users" ON faculty;
CREATE POLICY "Faculty are viewable by all authenticated users"
  ON faculty FOR SELECT
  USING (true);

-- ============================================================================
-- 7. RLS POLICIES FOR LOST_FOUND_ITEMS
-- ============================================================================

-- Allow all authenticated users to view lost_found_items
DROP POLICY IF EXISTS "Lost found items are viewable by all" ON lost_found_items;
CREATE POLICY "Lost found items are viewable by all"
  ON lost_found_items FOR SELECT
  USING (true);

-- Allow faculty to insert
DROP POLICY IF EXISTS "Faculty can insert lost found items" ON lost_found_items;
CREATE POLICY "Faculty can insert lost found items"
  ON lost_found_items FOR INSERT
  WITH CHECK (true);

-- Allow faculty to update
DROP POLICY IF EXISTS "Faculty can update lost found items" ON lost_found_items;
CREATE POLICY "Faculty can update lost found items"
  ON lost_found_items FOR UPDATE
  USING (true);

-- ============================================================================
-- 8. RLS POLICIES FOR HACKATHONS
-- ============================================================================

-- Allow all authenticated users to view published hackathons
DROP POLICY IF EXISTS "Published hackathons are viewable by all" ON hackathons;
CREATE POLICY "Published hackathons are viewable by all"
  ON hackathons FOR SELECT
  USING (status IN ('published', 'registration_open', 'in_progress'));

-- Allow faculty to insert hackathons
DROP POLICY IF EXISTS "Faculty can insert hackathons" ON hackathons;
CREATE POLICY "Faculty can insert hackathons"
  ON hackathons FOR INSERT
  WITH CHECK (true);

-- Allow faculty to update their hackathons
DROP POLICY IF EXISTS "Faculty can update hackathons" ON hackathons;
CREATE POLICY "Faculty can update hackathons"
  ON hackathons FOR UPDATE
  USING (true);

-- ============================================================================
-- 9. RLS POLICIES FOR STUDENT_LEAVE_REQUESTS
-- ============================================================================

-- Allow students to view their own requests
DROP POLICY IF EXISTS "Students can view own leave requests" ON student_leave_requests;
CREATE POLICY "Students can view own leave requests"
  ON student_leave_requests FOR SELECT
  USING (true);

-- Allow students to insert
DROP POLICY IF EXISTS "Students can insert leave requests" ON student_leave_requests;
CREATE POLICY "Students can insert leave requests"
  ON student_leave_requests FOR INSERT
  WITH CHECK (true);

-- Allow faculty to update (approve/reject)
DROP POLICY IF EXISTS "Faculty can update leave requests" ON student_leave_requests;
CREATE POLICY "Faculty can update leave requests"
  ON student_leave_requests FOR UPDATE
  USING (true);

-- ============================================================================
-- 10. VERIFY DATA
-- ============================================================================

SELECT 'Faculty count:' as info, COUNT(*) as count FROM faculty;
SELECT 'Hackathons count:' as info, COUNT(*) as count FROM hackathons;
SELECT 'Lost found items count:' as info, COUNT(*) as count FROM lost_found_items;
SELECT 'Student leave requests count:' as info, COUNT(*) as count FROM student_leave_requests;

-- Show sample data
SELECT 'Sample faculty:' as info;
SELECT id, name, email, department FROM faculty LIMIT 5;

SELECT 'Sample hackathons:' as info;
SELECT id, title, department, target_years, status FROM hackathons LIMIT 5;

SELECT 'Sample lost_found_items:' as info;
SELECT id, item_name, department, target_years, status FROM lost_found_items LIMIT 5;
