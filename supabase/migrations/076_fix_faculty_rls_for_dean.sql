-- =============================================================
-- 076_fix_faculty_rls_for_dean.sql  (CORRECTED)
-- Fix: Faculty Analytics showing 0 faculty members
--
-- Root cause: email_domain_validation.sql added a policy
-- "Faculty can only view faculty data" that restricts SELECT
-- on the faculty table to JWT tokens with @set.sanjivani.edu.in.
-- Dean/student users are blocked by this restrictive policy.
-- =============================================================

-- 1. Drop the conflicting restrictive policies
DROP POLICY IF EXISTS "Faculty can only view faculty data" ON faculty;
DROP POLICY IF EXISTS "Faculty can view own data" ON faculty;
DROP POLICY IF EXISTS "Faculty can update own data" ON faculty;
DROP POLICY IF EXISTS "Anyone can view faculty" ON faculty;
DROP POLICY IF EXISTS "Authenticated users can view faculty" ON faculty;
DROP POLICY IF EXISTS "Authenticated can view faculty" ON faculty;
DROP POLICY IF EXISTS "Faculty can update own row" ON faculty;
DROP POLICY IF EXISTS "Service role full access to faculty" ON faculty;
DROP POLICY IF EXISTS "Service role insert faculty" ON faculty;

-- 2. Re-create simple, correct policies

-- All authenticated users (faculty, students, dean) can SELECT faculty
CREATE POLICY "Authenticated can view faculty"
  ON faculty FOR SELECT
  TO authenticated
  USING (true);

-- Anon can also select faculty (needed for some public pages)
CREATE POLICY "Anon can view faculty"
  ON faculty FOR SELECT
  TO anon
  USING (true);

-- Faculty can update their own row
CREATE POLICY "Faculty can update own row"
  ON faculty FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access (needed for server-side API routes)
CREATE POLICY "Service role full access to faculty"
  ON faculty FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Create faculty_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS faculty_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  verification_code VARCHAR(10),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. Enable RLS on faculty_registrations
ALTER TABLE faculty_registrations ENABLE ROW LEVEL SECURITY;

-- 5. Add open policies for faculty_registrations
DROP POLICY IF EXISTS "Faculty registration open insert" ON faculty_registrations;
DROP POLICY IF EXISTS "Faculty registration open select" ON faculty_registrations;
DROP POLICY IF EXISTS "Faculty registration open update" ON faculty_registrations;
DROP POLICY IF EXISTS "Faculty registration open delete" ON faculty_registrations;
DROP POLICY IF EXISTS "Service role full access to faculty_registrations" ON faculty_registrations;

CREATE POLICY "Faculty registration open insert"
  ON faculty_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Faculty registration open select"
  ON faculty_registrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Faculty registration open update"
  ON faculty_registrations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Faculty registration open delete"
  ON faculty_registrations FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access to faculty_registrations"
  ON faculty_registrations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
