-- Migration: Other Services Tables (Hackathons, Lost & Found, Grievance, Student Leave)
-- Created: 2025-01-14
-- Purpose: Create tables for other services with department isolation and real-time support

-- ============================================================================
-- HACKATHONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  category TEXT,
  
  -- Event Details
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_teams INTEGER DEFAULT 50,
  team_size_min INTEGER DEFAULT 2,
  team_size_max INTEGER DEFAULT 5,
  
  -- Targeting (department locked to faculty's department)
  department TEXT NOT NULL, -- Locked to faculty's department
  target_years TEXT[] NOT NULL DEFAULT ARRAY['1st', '2nd', '3rd', '4th'], -- Can select specific years or all
  
  -- Links and Media
  registration_link TEXT,
  website_link TEXT,
  poster_url TEXT,
  poster_file_name TEXT,
  
  -- Prizes and Resources
  prizes JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  
  -- Stats
  registered_teams_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Hackathon Teams Registration
CREATE TABLE IF NOT EXISTS hackathon_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  
  -- Team Info
  team_name TEXT NOT NULL,
  team_leader_id TEXT NOT NULL, -- Student PRN or ID
  
  -- Team Members (array of objects with name, email, prn)
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  member_count INTEGER DEFAULT 1,
  
  -- Contact
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'waitlisted', 'withdrawn', 'disqualified')),
  
  -- Project (optional, for submission)
  project_name TEXT,
  project_description TEXT,
  project_link TEXT,
  project_submitted_at TIMESTAMPTZ,
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LOST & FOUND TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  
  -- Item Details
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK (item_category IN ('electronics', 'documents', 'accessories', 'books', 'clothing', 'id_cards', 'keys', 'others')),
  description TEXT NOT NULL,
  
  -- Location
  location_found TEXT NOT NULL,
  location_details TEXT,
  
  -- Status
  status TEXT DEFAULT 'found' CHECK (status IN ('found', 'claimed', 'returned', 'disposed')),
  
  -- Targeting (department locked to faculty's department)
  department TEXT NOT NULL,
  target_years TEXT[] DEFAULT ARRAY['1st', '2nd', '3rd', '4th'],
  
  -- Image
  image_url TEXT,
  image_file_name TEXT,
  
  -- Claim Info
  claimed_by TEXT, -- Student PRN
  claimed_at TIMESTAMPTZ,
  return_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GRIEVANCE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student Info (from student table based on PRN)
  student_prn TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  
  -- Grievance Details
  category TEXT NOT NULL CHECK (category IN ('academic', 'infrastructure', 'faculty', 'administration', 'hostel', 'canteen', 'library', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected', 'escalated')),
  
  -- Assignment
  assigned_to UUID REFERENCES faculty(id), -- Faculty assigned to resolve
  assigned_at TIMESTAMPTZ,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_by UUID REFERENCES faculty(id),
  resolved_at TIMESTAMPTZ,
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grievance Messages (conversation between student and faculty)
CREATE TABLE IF NOT EXISTS grievance_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'faculty')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDENT LEAVE APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student Info
  student_prn TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  
  -- Leave Details
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'emergency', 'medical', 'other')),
  subject TEXT NOT NULL,
  reason TEXT NOT NULL,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  
  -- Review
  reviewed_by UUID REFERENCES faculty(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Attachments (medical certificates, etc.)
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_hackathons_department ON hackathons(department);
CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathons_faculty ON hackathons(faculty_id);
CREATE INDEX idx_hackathon_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE INDEX idx_hackathon_teams_leader ON hackathon_teams(team_leader_id);

CREATE INDEX idx_lost_found_department ON lost_found_items(department);
CREATE INDEX idx_lost_found_status ON lost_found_items(status);
CREATE INDEX idx_lost_found_reporter ON lost_found_items(reporter_id);

CREATE INDEX idx_grievances_department ON grievances(department);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_student ON grievances(student_prn);
CREATE INDEX idx_grievance_messages_grievance ON grievance_messages(grievance_id);

CREATE INDEX idx_leave_applications_department ON leave_applications(department);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_student ON leave_applications(student_prn);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;

-- Hackathons: Faculty can manage their own, students can view published in their dept/year
CREATE POLICY "Faculty can create hackathons in their department"
  ON hackathons FOR INSERT
  WITH CHECK (department = (SELECT department FROM faculty WHERE id = faculty_id));

CREATE POLICY "Faculty can update their own hackathons"
  ON hackathons FOR UPDATE
  USING (faculty_id = auth.uid()::uuid);

CREATE POLICY "Faculty can delete their own hackathons"
  ON hackathons FOR DELETE
  USING (faculty_id = auth.uid()::uuid);

CREATE POLICY "Faculty can view their own hackathons"
  ON hackathons FOR SELECT
  USING (faculty_id = auth.uid()::uuid);

CREATE POLICY "Students can view published hackathons for their department and year"
  ON hackathons FOR SELECT
  USING (
    status = 'published' 
    AND department = current_user_department()
    AND (target_years = ARRAY['1st', '2nd', '3rd', '4th'] OR current_user_year() = ANY(target_years))
  );

-- Hackathon Teams: Students can register, faculty can view teams for their hackathons
CREATE POLICY "Students can register teams for hackathons"
  ON hackathon_teams FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM hackathons WHERE id = hackathon_id AND status IN ('published', 'registration_open')
  ));

CREATE POLICY "Students can view their own team registrations"
  ON hackathon_teams FOR SELECT
  USING (team_leader_id = current_user_prn() OR member_prns::text[] && ARRAY[current_user_prn()]);

CREATE POLICY "Faculty can view teams for their hackathons"
  ON hackathon_teams FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM hackathons WHERE id = hackathon_id AND faculty_id = auth.uid()::uuid
  ));

-- Lost & Found: Faculty can manage, students can view for their dept/year
CREATE POLICY "Faculty can create lost found items in their department"
  ON lost_found_items FOR INSERT
  WITH CHECK (department = (SELECT department FROM faculty WHERE id = reporter_id));

CREATE POLICY "Faculty can update their own lost found items"
  ON lost_found_items FOR UPDATE
  USING (reporter_id = auth.uid()::uuid);

CREATE POLICY "Faculty can delete their own lost found items"
  ON lost_found_items FOR DELETE
  USING (reporter_id = auth.uid()::uuid);

CREATE POLICY "Faculty can view their own lost found items"
  ON lost_found_items FOR SELECT
  USING (reporter_id = auth.uid()::uuid);

CREATE POLICY "Students can view lost found items for their department and year"
  ON lost_found_items FOR SELECT
  USING (
    department = current_user_department()
    AND (target_years = ARRAY['1st', '2nd', '3rd', '4th'] OR current_user_year() = ANY(target_years))
  );

-- Grievances: Students can create and view their own, faculty can view assigned
CREATE POLICY "Students can create grievances"
  ON grievances FOR INSERT
  WITH CHECK (student_prn = current_user_prn());

CREATE POLICY "Students can view their own grievances"
  ON grievances FOR SELECT
  USING (student_prn = current_user_prn());

CREATE POLICY "Students can update their own pending grievances"
  ON grievances FOR UPDATE
  USING (student_prn = current_user_prn() AND status = 'pending');

CREATE POLICY "Faculty can view grievances assigned to them or in their department"
  ON grievances FOR SELECT
  USING (
    assigned_to = auth.uid()::uuid 
    OR department = (SELECT department FROM faculty WHERE id = auth.uid()::uuid)
  );

CREATE POLICY "Faculty can update assigned grievances"
  ON grievances FOR UPDATE
  USING (assigned_to = auth.uid()::uuid OR department = (SELECT department FROM faculty WHERE id = auth.uid()::uuid));

-- Grievance Messages
CREATE POLICY "Students can view messages for their grievances"
  ON grievance_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM grievances WHERE id = grievance_id AND student_prn = current_user_prn()));

CREATE POLICY "Students can send messages for their grievances"
  ON grievance_messages FOR INSERT
  WITH CHECK (sender_type = 'student' AND EXISTS (SELECT 1 FROM grievances WHERE id = grievance_id AND student_prn = current_user_prn()));

CREATE POLICY "Faculty can view messages for assigned grievances"
  ON grievance_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM grievances WHERE id = grievance_id AND (assigned_to = auth.uid()::uuid OR department = (SELECT department FROM faculty WHERE id = auth.uid()::uuid))));

CREATE POLICY "Faculty can send messages for assigned grievances"
  ON grievance_messages FOR INSERT
  WITH CHECK (sender_type = 'faculty' AND EXISTS (SELECT 1 FROM grievances WHERE id = grievance_id AND (assigned_to = auth.uid()::uuid OR department = (SELECT department FROM faculty WHERE id = auth.uid()::uuid))));

-- Leave Applications: Students can create and view their own, faculty can review
CREATE POLICY "Students can create leave applications"
  ON leave_applications FOR INSERT
  WITH CHECK (student_prn = current_user_prn());

CREATE POLICY "Students can view their own leave applications"
  ON leave_applications FOR SELECT
  USING (student_prn = current_user_prn());

CREATE POLICY "Students can update pending leave applications"
  ON leave_applications FOR UPDATE
  USING (student_prn = current_user_prn() AND status = 'pending');

CREATE POLICY "Students can cancel their leave applications"
  ON leave_applications FOR DELETE
  USING (student_prn = current_user_prn() AND status = 'pending');

CREATE POLICY "Faculty can view leave applications for their department"
  ON leave_applications FOR SELECT
  USING (department = (SELECT department FROM faculty WHERE id = auth.uid()::uuid));

CREATE POLICY "Faculty can review leave applications for their department"
  ON leave_applications FOR UPDATE
  USING (department = (SELECT department FROM faculty WHERE id = auth.uid()::uuid));

-- ============================================================================
-- REALTIME ENABLEMENT
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE hackathon_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE lost_found_items;
ALTER PUBLICATION supabase_realtime ADD TABLE grievances;
ALTER PUBLICATION supabase_realtime ADD TABLE grievance_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_applications;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hackathons_updated_at
  BEFORE UPDATE ON hackathons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hackathon_teams_updated_at
  BEFORE UPDATE ON hackathon_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lost_found_items_updated_at
  BEFORE UPDATE ON lost_found_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at
  BEFORE UPDATE ON grievances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at
  BEFORE UPDATE ON leave_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for hackathon posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-posters', 'hackathon-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for lost & found images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-found', 'lost-found', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hackathon posters
CREATE POLICY "Faculty can upload hackathon posters"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hackathon-posters');

CREATE POLICY "Anyone can view hackathon posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hackathon-posters');

-- Storage policies for lost & found images
CREATE POLICY "Faculty can upload lost found images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lost-found');

CREATE POLICY "Anyone can view lost found images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lost-found');

-- ============================================================================
-- HELPER FUNCTIONS (if not exist)
-- ============================================================================

CREATE OR REPLACE FUNCTION current_user_department()
RETURNS TEXT AS $$
DECLARE
  dept TEXT;
BEGIN
  -- Try to get from faculty
  SELECT department INTO dept FROM faculty WHERE id = auth.uid()::uuid;
  IF dept IS NOT NULL THEN RETURN dept; END IF;
  
  -- Try to get from student tables
  SELECT department INTO dept FROM students_cse_1st_year WHERE id = auth.uid()::uuid;
  IF dept IS NOT NULL THEN RETURN dept; END IF;
  
  SELECT department INTO dept FROM students_cse_2nd_year WHERE id = auth.uid()::uuid;
  IF dept IS NOT NULL THEN RETURN dept; END IF;
  
  SELECT department INTO dept FROM students_cse_3rd_year WHERE id = auth.uid()::uuid;
  IF dept IS NOT NULL THEN RETURN dept; END IF;
  
  SELECT department INTO dept FROM students_cse_4th_year WHERE id = auth.uid()::uuid;
  IF dept IS NOT NULL THEN RETURN dept; END IF;
  
  -- Add other department tables as needed
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_year()
RETURNS TEXT AS $$
DECLARE
  yr TEXT;
BEGIN
  SELECT year INTO yr FROM students_cse_1st_year WHERE id = auth.uid()::uuid;
  IF yr IS NOT NULL THEN RETURN yr; END IF;
  
  SELECT year INTO yr FROM students_cse_2nd_year WHERE id = auth.uid()::uuid;
  IF yr IS NOT NULL THEN RETURN yr; END IF;
  
  SELECT year INTO yr FROM students_cse_3rd_year WHERE id = auth.uid()::uuid;
  IF yr IS NOT NULL THEN RETURN yr; END IF;
  
  SELECT year INTO yr FROM students_cse_4th_year WHERE id = auth.uid()::uuid;
  IF yr IS NOT NULL THEN RETURN yr; END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_prn()
RETURNS TEXT AS $$
DECLARE
  prn_val TEXT;
BEGIN
  SELECT prn INTO prn_val FROM students_cse_1st_year WHERE id = auth.uid()::uuid;
  IF prn_val IS NOT NULL THEN RETURN prn_val; END IF;
  
  SELECT prn INTO prn_val FROM students_cse_2nd_year WHERE id = auth.uid()::uuid;
  IF prn_val IS NOT NULL THEN RETURN prn_val; END IF;
  
  SELECT prn INTO prn_val FROM students_cse_3rd_year WHERE id = auth.uid()::uuid;
  IF prn_val IS NOT NULL THEN RETURN prn_val; END IF;
  
  SELECT prn INTO prn_val FROM students_cse_4th_year WHERE id = auth.uid()::uuid;
  IF prn_val IS NOT NULL THEN RETURN prn_val; END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
