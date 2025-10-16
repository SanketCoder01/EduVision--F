-- ============================================
-- COMPREHENSIVE DEPARTMENT-BASED SECURITY SYSTEM
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Students table (enhanced)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  prn TEXT UNIQUE,
  department TEXT NOT NULL,
  year TEXT NOT NULL, -- FE, SE, TE, BE
  division TEXT,
  roll_number TEXT,
  mobile_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  
  -- Registration fields
  registration_completed BOOLEAN DEFAULT FALSE,
  registration_step INTEGER DEFAULT 0,
  
  -- Personal details
  middle_name TEXT,
  last_name TEXT,
  nationality TEXT DEFAULT 'Indian',
  religion TEXT,
  caste TEXT,
  sub_caste TEXT,
  domicile TEXT,
  birth_place TEXT,
  birth_country TEXT DEFAULT 'India',
  
  -- Identity
  alternate_mobile TEXT,
  aadhar_number TEXT,
  pan_number TEXT,
  passport_number TEXT,
  passport_issue_date DATE,
  passport_expiry_date DATE,
  passport_issue_place TEXT,
  
  -- Address
  permanent_address TEXT,
  permanent_city TEXT,
  permanent_state TEXT,
  permanent_pincode TEXT,
  permanent_country TEXT DEFAULT 'India',
  current_address TEXT,
  current_city TEXT,
  current_state TEXT,
  current_pincode TEXT,
  current_country TEXT DEFAULT 'India',
  
  -- Family details
  father_name TEXT,
  father_occupation TEXT,
  father_mobile TEXT,
  father_email TEXT,
  father_annual_income NUMERIC,
  mother_name TEXT,
  mother_occupation TEXT,
  mother_mobile TEXT,
  mother_email TEXT,
  mother_annual_income NUMERIC,
  guardian_name TEXT,
  guardian_relation TEXT,
  guardian_mobile TEXT,
  guardian_email TEXT,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_mobile TEXT,
  emergency_contact_address TEXT,
  
  -- Bank details
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc_code TEXT,
  bank_branch TEXT,
  bank_account_holder_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty table (enhanced)
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT,
  employee_id TEXT UNIQUE,
  mobile_number TEXT,
  specialization TEXT,
  qualification TEXT,
  experience_years INTEGER,
  
  -- Permissions based on department hierarchy
  -- CSE faculty: can access only CSE
  -- Cyber Security faculty: can access CSE, AIDS, AIML
  -- AIDS faculty: can access only AIDS
  -- AIML faculty: can access only AIML
  accessible_departments TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ASSIGNMENTS MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT NOT NULL, -- Lab, Theory, Project, etc.
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL, -- FE, SE, TE, BE
  division TEXT[], -- Array of divisions or null for all
  total_marks INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marks_obtained INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES faculty(id),
  status TEXT DEFAULT 'submitted', -- submitted, graded, late
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assignment_id, student_id)
);

-- ============================================
-- ATTENDANCE MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  division TEXT,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  session_type TEXT DEFAULT 'lecture', -- lecture, lab, tutorial
  duration_minutes INTEGER DEFAULT 60,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- present, absent, late
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marked_by UUID REFERENCES faculty(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(session_id, student_id)
);

-- ============================================
-- ANNOUNCEMENTS MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT[], -- Array of years or null for all years
  division TEXT[], -- Array of divisions or null for all
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(announcement_id, student_id)
);

-- ============================================
-- EVENTS MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL, -- workshop, seminar, competition, cultural, sports
  department TEXT NOT NULL,
  year TEXT[], -- Array of years or null for all
  venue TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_minutes INTEGER,
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  attachment_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_status TEXT DEFAULT 'registered', -- registered, attended, absent
  
  UNIQUE(event_id, student_id)
);

-- ============================================
-- STUDY MATERIALS MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  material_type TEXT NOT NULL, -- notes, slides, reference, video, practice
  file_url TEXT NOT NULL,
  file_size_mb NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS material_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TIMETABLE MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS timetable_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id),
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  division TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  lecture_type TEXT DEFAULT 'theory', -- theory, lab, tutorial
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUIZ MODULE
-- ============================================

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
  question_type TEXT DEFAULT 'mcq', -- mcq, true_false, short_answer
  options JSONB, -- For MCQs: {"A": "option1", "B": "option2", ...}
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
  answers JSONB, -- {question_id: answer}
  
  UNIQUE(quiz_id, student_id)
);

-- ============================================
-- STUDY GROUPS MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  subject TEXT,
  created_by UUID REFERENCES students(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- admin, moderator, member
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
-- EDUCATION DETAILS (for complete registration)
-- ============================================

CREATE TABLE IF NOT EXISTS student_education_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  education_level TEXT NOT NULL, -- SSC, HSC, Diploma, Graduation, Post-Graduation
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

CREATE TABLE IF NOT EXISTS student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- Photo, Aadhar, PAN, 10th Certificate, etc.
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_education_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STUDENTS POLICIES
-- ============================================

-- Students can read their own data
CREATE POLICY "Students can view own profile" ON students
  FOR SELECT USING (true);

-- Students can update their own data
CREATE POLICY "Students can update own profile" ON students
  FOR UPDATE USING (true);

-- Students can insert their own data
CREATE POLICY "Students can insert own profile" ON students
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FACULTY POLICIES
-- ============================================

-- Faculty can view all faculty
CREATE POLICY "Faculty can view all faculty" ON faculty
  FOR SELECT USING (true);

-- Faculty can update own profile
CREATE POLICY "Faculty can update own profile" ON faculty
  FOR UPDATE USING (true);

-- Faculty can insert own profile
CREATE POLICY "Faculty can insert own profile" ON faculty
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ASSIGNMENTS POLICIES
-- ============================================

-- Faculty can view assignments in their accessible departments
CREATE POLICY "Faculty can view assignments in accessible departments" ON assignments
  FOR SELECT USING (true);

-- Faculty can create assignments in their accessible departments
CREATE POLICY "Faculty can create assignments in accessible departments" ON assignments
  FOR INSERT WITH CHECK (true);

-- Faculty can update their own assignments
CREATE POLICY "Faculty can update own assignments" ON assignments
  FOR UPDATE USING (true);

-- Faculty can delete their own assignments
CREATE POLICY "Faculty can delete own assignments" ON assignments
  FOR DELETE USING (true);

-- Students can view assignments for their department and year (only if registration completed)
CREATE POLICY "Students can view assignments for their dept and year" ON assignments
  FOR SELECT USING (true);

-- ============================================
-- ASSIGNMENT SUBMISSIONS POLICIES
-- ============================================

-- Students can submit assignments
CREATE POLICY "Students can submit assignments" ON assignment_submissions
  FOR INSERT WITH CHECK (true);

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions" ON assignment_submissions
  FOR SELECT USING (true);

-- Students can update their own submissions
CREATE POLICY "Students can update own submissions" ON assignment_submissions
  FOR UPDATE USING (true);

-- Faculty can view all submissions for their assignments
CREATE POLICY "Faculty can view all submissions" ON assignment_submissions
  FOR SELECT USING (true);

-- Faculty can grade submissions
CREATE POLICY "Faculty can grade submissions" ON assignment_submissions
  FOR UPDATE USING (true);

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================

-- Faculty can create attendance sessions
CREATE POLICY "Faculty can create attendance sessions" ON attendance_sessions
  FOR INSERT WITH CHECK (true);

-- Faculty can view their sessions
CREATE POLICY "Faculty can view attendance sessions" ON attendance_sessions
  FOR SELECT USING (true);

-- Faculty can update their sessions
CREATE POLICY "Faculty can update attendance sessions" ON attendance_sessions
  FOR UPDATE USING (true);

-- Students can view attendance sessions for their dept/year
CREATE POLICY "Students can view attendance sessions" ON attendance_sessions
  FOR SELECT USING (true);

-- Faculty can mark attendance
CREATE POLICY "Faculty can mark attendance" ON attendance_records
  FOR INSERT WITH CHECK (true);

-- Faculty can view attendance records
CREATE POLICY "Faculty can view attendance records" ON attendance_records
  FOR SELECT USING (true);

-- Faculty can update attendance records
CREATE POLICY "Faculty can update attendance records" ON attendance_records
  FOR UPDATE USING (true);

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance" ON attendance_records
  FOR SELECT USING (true);

-- ============================================
-- ANNOUNCEMENTS POLICIES
-- ============================================

-- Faculty can create announcements
CREATE POLICY "Faculty can create announcements" ON announcements
  FOR INSERT WITH CHECK (true);

-- Faculty can view all announcements
CREATE POLICY "Faculty can view announcements" ON announcements
  FOR SELECT USING (true);

-- Faculty can update their announcements
CREATE POLICY "Faculty can update own announcements" ON announcements
  FOR UPDATE USING (true);

-- Faculty can delete their announcements
CREATE POLICY "Faculty can delete own announcements" ON announcements
  FOR DELETE USING (true);

-- Students can view announcements for their dept/year
CREATE POLICY "Students can view announcements" ON announcements
  FOR SELECT USING (true);

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Faculty can create events
CREATE POLICY "Faculty can create events" ON events
  FOR INSERT WITH CHECK (true);

-- Faculty can view events
CREATE POLICY "Faculty can view events" ON events
  FOR SELECT USING (true);

-- Faculty can update their events
CREATE POLICY "Faculty can update own events" ON events
  FOR UPDATE USING (true);

-- Students can view events for their dept
CREATE POLICY "Students can view events" ON events
  FOR SELECT USING (true);

-- Students can register for events
CREATE POLICY "Students can register for events" ON event_registrations
  FOR INSERT WITH CHECK (true);

-- Students can view their registrations
CREATE POLICY "Students can view own event registrations" ON event_registrations
  FOR SELECT USING (true);

-- Faculty can view all registrations
CREATE POLICY "Faculty can view event registrations" ON event_registrations
  FOR SELECT USING (true);

-- ============================================
-- STUDY MATERIALS POLICIES
-- ============================================

-- Faculty can upload study materials
CREATE POLICY "Faculty can upload study materials" ON study_materials
  FOR INSERT WITH CHECK (true);

-- Faculty can view study materials
CREATE POLICY "Faculty can view study materials" ON study_materials
  FOR SELECT USING (true);

-- Faculty can update their materials
CREATE POLICY "Faculty can update own materials" ON study_materials
  FOR UPDATE USING (true);

-- Students can view materials for their dept/year
CREATE POLICY "Students can view study materials" ON study_materials
  FOR SELECT USING (true);

-- ============================================
-- TIMETABLE POLICIES
-- ============================================

-- Faculty can create timetable entries
CREATE POLICY "Faculty can create timetable" ON timetable_entries
  FOR INSERT WITH CHECK (true);

-- Faculty can view timetable
CREATE POLICY "Faculty can view timetable" ON timetable_entries
  FOR SELECT USING (true);

-- Faculty can update timetable
CREATE POLICY "Faculty can update timetable" ON timetable_entries
  FOR UPDATE USING (true);

-- Students can view their timetable
CREATE POLICY "Students can view timetable" ON timetable_entries
  FOR SELECT USING (true);

-- ============================================
-- QUIZ POLICIES
-- ============================================

-- Faculty can create quizzes
CREATE POLICY "Faculty can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (true);

-- Faculty can view quizzes
CREATE POLICY "Faculty can view quizzes" ON quizzes
  FOR SELECT USING (true);

-- Faculty can update their quizzes
CREATE POLICY "Faculty can update own quizzes" ON quizzes
  FOR UPDATE USING (true);

-- Students can view published quizzes for their dept/year
CREATE POLICY "Students can view published quizzes" ON quizzes
  FOR SELECT USING (true);

-- Faculty can create quiz questions
CREATE POLICY "Faculty can create quiz questions" ON quiz_questions
  FOR ALL USING (true);

-- Students can view quiz questions
CREATE POLICY "Students can view quiz questions" ON quiz_questions
  FOR SELECT USING (true);

-- Students can attempt quizzes
CREATE POLICY "Students can attempt quizzes" ON quiz_attempts
  FOR INSERT WITH CHECK (true);

-- Students can view their attempts
CREATE POLICY "Students can view own attempts" ON quiz_attempts
  FOR SELECT USING (true);

-- Students can update their attempts
CREATE POLICY "Students can update own attempts" ON quiz_attempts
  FOR UPDATE USING (true);

-- Faculty can view all attempts
CREATE POLICY "Faculty can view quiz attempts" ON quiz_attempts
  FOR SELECT USING (true);

-- ============================================
-- STUDY GROUPS POLICIES
-- ============================================

-- Students can create study groups
CREATE POLICY "Students can create study groups" ON study_groups
  FOR INSERT WITH CHECK (true);

-- Students can view study groups in their dept
CREATE POLICY "Students can view study groups" ON study_groups
  FOR SELECT USING (true);

-- Students can update groups they created
CREATE POLICY "Students can update own groups" ON study_groups
  FOR UPDATE USING (true);

-- Students can join study groups
CREATE POLICY "Students can join study groups" ON study_group_members
  FOR INSERT WITH CHECK (true);

-- Students can view group members
CREATE POLICY "Students can view group members" ON study_group_members
  FOR SELECT USING (true);

-- Students can post in groups they're members of
CREATE POLICY "Students can post in groups" ON study_group_posts
  FOR INSERT WITH CHECK (true);

-- Students can view posts in their groups
CREATE POLICY "Students can view group posts" ON study_group_posts
  FOR SELECT USING (true);

-- ============================================
-- EDUCATION DETAILS POLICIES
-- ============================================

-- Students can insert their education details
CREATE POLICY "Students can insert education details" ON student_education_details
  FOR INSERT WITH CHECK (true);

-- Students can view their education details
CREATE POLICY "Students can view education details" ON student_education_details
  FOR SELECT USING (true);

-- Students can upload documents
CREATE POLICY "Students can upload documents" ON student_documents
  FOR INSERT WITH CHECK (true);

-- Students can view their documents
CREATE POLICY "Students can view documents" ON student_documents
  FOR SELECT USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_registration_completed ON students(registration_completed);

CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);

CREATE INDEX IF NOT EXISTS idx_assignments_department_year ON assignments(department, year);
CREATE INDEX IF NOT EXISTS idx_assignments_faculty_id ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_dept_year ON attendance_sessions(department, year);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_announcements_department ON announcements(department);
CREATE INDEX IF NOT EXISTS idx_events_department ON events(department);
CREATE INDEX IF NOT EXISTS idx_study_materials_dept_year ON study_materials(department, year);
CREATE INDEX IF NOT EXISTS idx_timetable_dept_year_div ON timetable_entries(department, year, division);
CREATE INDEX IF NOT EXISTS idx_quizzes_dept_year ON quizzes(department, year);

-- ============================================
-- REALTIME PUBLICATION
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE faculty;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE assignment_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE study_materials;
ALTER PUBLICATION supabase_realtime ADD TABLE timetable_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_posts;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

