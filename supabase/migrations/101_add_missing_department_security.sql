-- ============================================
-- ADD MISSING FEATURES FOR DEPARTMENT SECURITY
-- Only NEW tables and columns not already in database
-- ============================================

-- Add registration fields to students table (if not exists)
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_step INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Indian';
ALTER TABLE students ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS sub_caste TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS domicile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_country TEXT DEFAULT 'India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS alternate_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhar_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_issue_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_expiry_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_issue_place TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_city TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_state TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_pincode TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_country TEXT DEFAULT 'India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_city TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_state TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_pincode TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_country TEXT DEFAULT 'India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_occupation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_annual_income NUMERIC;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_occupation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_annual_income NUMERIC;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_relation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_ifsc_code TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_branch TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS division TEXT;

-- Add department security to faculty
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS accessible_departments TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS experience_years INTEGER;

-- Add division and subject to assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS division TEXT[];
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 100;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Update assignments to use target_years as array if not already
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'target_years'
  ) THEN
    ALTER TABLE assignments ADD COLUMN target_years TEXT[];
  END IF;
END $$;

-- Update assignment_submissions
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS submission_text TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS marks_obtained INTEGER;

-- Add subject to announcements and events
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'seminar';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_required BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- ============================================
-- NEW TABLES (Only if not exists)
-- ============================================

-- Quiz tables
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  division TEXT[],
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  passing_marks INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  show_results BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq',
  options JSONB,
  correct_answer TEXT NOT NULL,
  marks INTEGER DEFAULT 1,
  order_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  marks_obtained INTEGER,
  total_marks INTEGER,
  answers JSONB,
  UNIQUE(quiz_id, student_id)
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_status TEXT DEFAULT 'registered',
  UNIQUE(event_id, student_id)
);

-- Announcement reads tracking
CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, student_id)
);

-- Material downloads tracking
CREATE TABLE IF NOT EXISTS material_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetable entries (enhanced)
CREATE TABLE IF NOT EXISTS timetable_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id),
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  division TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  lecture_type TEXT DEFAULT 'theory',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student education details
CREATE TABLE IF NOT EXISTS student_education_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  education_level TEXT NOT NULL,
  board_university TEXT NOT NULL,
  school_college_name TEXT,
  passing_year INTEGER,
  seat_number TEXT,
  total_marks INTEGER,
  marks_obtained INTEGER,
  percentage NUMERIC,
  cgpa NUMERIC,
  sgpa NUMERIC,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student documents
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study group enhancements
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

CREATE TABLE IF NOT EXISTS study_group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_education_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Simple - Allow all for development)
-- ============================================

-- Quizzes
CREATE POLICY "Allow all quiz operations" ON quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all quiz question operations" ON quiz_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all quiz attempt operations" ON quiz_attempts FOR ALL USING (true) WITH CHECK (true);

-- Events
CREATE POLICY "Allow all event registration operations" ON event_registrations FOR ALL USING (true) WITH CHECK (true);

-- Announcements
CREATE POLICY "Allow all announcement read operations" ON announcement_reads FOR ALL USING (true) WITH CHECK (true);

-- Materials
CREATE POLICY "Allow all material download operations" ON material_downloads FOR ALL USING (true) WITH CHECK (true);

-- Timetable
CREATE POLICY "Allow all timetable operations" ON timetable_entries FOR ALL USING (true) WITH CHECK (true);

-- Education
CREATE POLICY "Allow all education details operations" ON student_education_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all document operations" ON student_documents FOR ALL USING (true) WITH CHECK (true);

-- Study groups
CREATE POLICY "Allow all study group member operations" ON study_group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all study group post operations" ON study_group_posts FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_registration_completed ON students(registration_completed);
CREATE INDEX IF NOT EXISTS idx_quizzes_dept_year ON quizzes(department, year);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_student ON announcement_reads(student_id);
CREATE INDEX IF NOT EXISTS idx_timetable_dept_year_div ON timetable_entries(department, year, division);

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_posts;

