-- Comprehensive EduVision Real-time Schema Migration
-- This replaces all localStorage usage with Supabase tables

-- Enable RLS and real-time
ALTER DATABASE postgres SET "app.settings.enable_rls" = 'on';

-- Notifications table for real-time communication
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('student', 'faculty', 'admin')),
  sender_id UUID,
  sender_type VARCHAR(20) CHECK (sender_type IN ('student', 'faculty', 'admin', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- assignment, announcement, study_group, exam, etc.
  reference_id UUID, -- ID of the related item (assignment_id, announcement_id, etc.)
  reference_table VARCHAR(100), -- table name of the related item
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Assignments table (enhanced)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  total_marks INTEGER DEFAULT 100,
  department VARCHAR(100) NOT NULL,
  target_years TEXT[] NOT NULL, -- ['first', 'second', 'third', 'fourth']
  subject VARCHAR(100),
  assignment_type VARCHAR(50) DEFAULT 'general', -- general, coding, project, quiz
  files JSONB DEFAULT '[]'::jsonb, -- file attachments
  rubric JSONB, -- grading rubric
  allow_late_submission BOOLEAN DEFAULT TRUE,
  late_penalty_per_day INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  submission_text TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  attempt_number INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  grade INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID,
  UNIQUE(assignment_id, student_id, attempt_number)
);

-- Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  faculty_id UUID, -- NULL if student-created
  department VARCHAR(100) NOT NULL,
  target_years TEXT[],
  subject VARCHAR(100),
  max_members INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  allow_student_posts BOOLEAN DEFAULT TRUE,
  created_by_type VARCHAR(20) NOT NULL CHECK (created_by_type IN ('student', 'faculty')),
  created_by_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Group Members
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(group_id, student_id)
);

-- Study Group Tasks
CREATE TABLE IF NOT EXISTS study_group_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_by UUID NOT NULL,
  assigned_to UUID[], -- array of student IDs
  due_date TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Group Task Submissions
CREATE TABLE IF NOT EXISTS study_group_task_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES study_group_tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  submission_text TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'needs_revision')),
  feedback TEXT,
  UNIQUE(task_id, student_id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  department VARCHAR(100) NOT NULL,
  target_years TEXT[] NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  announcement_type VARCHAR(50) DEFAULT 'general', -- general, exam, event, deadline
  files JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  subject VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  target_years TEXT[] NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location VARCHAR(255),
  session_type VARCHAR(50) DEFAULT 'lecture' CHECK (session_type IN ('lecture', 'practical', 'tutorial', 'exam')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marked_by UUID, -- faculty who marked attendance
  face_verification_data JSONB, -- face recognition data
  location_data JSONB, -- GPS coordinates
  notes TEXT,
  UNIQUE(session_id, student_id)
);

-- Timetables
CREATE TABLE IF NOT EXISTS timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Materials
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20) NOT NULL,
  material_type VARCHAR(50) DEFAULT 'document', -- document, video, audio, link
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  external_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coding Exams
CREATE TABLE IF NOT EXISTS coding_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(100) NOT NULL,
  target_years TEXT[] NOT NULL,
  subject VARCHAR(100),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER DEFAULT 100,
  programming_language VARCHAR(50) NOT NULL,
  questions JSONB NOT NULL, -- array of questions
  is_published BOOLEAN DEFAULT FALSE,
  allow_late_submission BOOLEAN DEFAULT FALSE,
  randomize_questions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coding Exam Submissions
CREATE TABLE IF NOT EXISTS coding_exam_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES coding_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  answers JSONB NOT NULL, -- student's answers
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submit_time TIMESTAMP WITH TIME ZONE,
  time_taken_minutes INTEGER,
  score INTEGER,
  total_score INTEGER,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'timeout')),
  monitoring_data JSONB, -- tab switches, camera violations, etc.
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(exam_id, student_id)
);

-- Queries/Grievances
CREATE TABLE IF NOT EXISTS student_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  faculty_id UUID, -- assigned faculty
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- academic, technical, administrative, etc.
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Query Responses
CREATE TABLE IF NOT EXISTS query_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_id UUID NOT NULL REFERENCES student_queries(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  responder_type VARCHAR(20) NOT NULL CHECK (responder_type IN ('student', 'faculty', 'admin')),
  message TEXT NOT NULL,
  files JSONB DEFAULT '[]'::jsonb,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'general', -- general, workshop, seminar, competition
  department VARCHAR(100) NOT NULL,
  target_years TEXT[] NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  files JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  UNIQUE(event_id, student_id)
);

-- Today's Hub Feed (aggregated view)
CREATE TABLE IF NOT EXISTS todays_hub_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- assignment, announcement, event, study_group, etc.
  item_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE todays_hub_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- RLS Policies for Assignments
CREATE POLICY "Faculty can manage their assignments" ON assignments
  FOR ALL USING (faculty_id = auth.uid());

CREATE POLICY "Students can view published assignments for their department/year" ON assignments
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_type = 'student'
      AND department = assignments.department
      AND year = ANY(assignments.target_years)
    )
  );

-- RLS Policies for Assignment Submissions
CREATE POLICY "Students can manage their own submissions" ON assignment_submissions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Faculty can view submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = assignment_submissions.assignment_id 
      AND assignments.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can grade submissions for their assignments" ON assignment_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = assignment_submissions.assignment_id 
      AND assignments.faculty_id = auth.uid()
    )
  );

-- RLS Policies for Study Groups
CREATE POLICY "Faculty can manage their study groups" ON study_groups
  FOR ALL USING (faculty_id = auth.uid() OR created_by_id = auth.uid());

CREATE POLICY "Students can view study groups for their department/year" ON study_groups
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_type = 'student'
      AND department = study_groups.department
      AND (target_years IS NULL OR year = ANY(study_groups.target_years))
    )
  );

-- RLS Policies for Announcements
CREATE POLICY "Faculty can manage their announcements" ON announcements
  FOR ALL USING (faculty_id = auth.uid());

CREATE POLICY "Students can view published announcements for their department/year" ON announcements
  FOR SELECT USING (
    is_published = true AND
    (expires_at IS NULL OR expires_at > NOW()) AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND user_type = 'student'
      AND department = announcements.department
      AND year = ANY(announcements.target_years)
    )
  );

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE assignment_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE student_queries;
ALTER PUBLICATION supabase_realtime ADD TABLE query_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE todays_hub_feed;

-- Functions for automatic notifications
CREATE OR REPLACE FUNCTION notify_students_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- When assignment is published, notify all target students
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    INSERT INTO notifications (recipient_id, recipient_type, sender_id, sender_type, title, message, type, reference_id, reference_table, priority)
    SELECT 
      up.user_id,
      'student',
      NEW.faculty_id,
      'faculty',
      'New Assignment: ' || NEW.title,
      'A new assignment has been posted for ' || NEW.subject || '. Due date: ' || COALESCE(NEW.due_date::text, 'Not specified'),
      'assignment',
      NEW.id,
      'assignments',
      CASE WHEN NEW.due_date < NOW() + INTERVAL '3 days' THEN 'high' ELSE 'normal' END
    FROM user_profiles up
    WHERE up.user_type = 'student'
    AND up.department = NEW.department
    AND up.year = ANY(NEW.target_years);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignment_notification_trigger
  AFTER INSERT OR UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_students_on_assignment();

-- Function for announcement notifications
CREATE OR REPLACE FUNCTION notify_students_on_announcement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    INSERT INTO notifications (recipient_id, recipient_type, sender_id, sender_type, title, message, type, reference_id, reference_table, priority)
    SELECT 
      up.user_id,
      'student',
      NEW.faculty_id,
      'faculty',
      'New Announcement: ' || NEW.title,
      LEFT(NEW.content, 200) || CASE WHEN LENGTH(NEW.content) > 200 THEN '...' ELSE '' END,
      'announcement',
      NEW.id,
      'announcements',
      NEW.priority
    FROM user_profiles up
    WHERE up.user_type = 'student'
    AND up.department = NEW.department
    AND up.year = ANY(NEW.target_years);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcement_notification_trigger
  AFTER INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_students_on_announcement();

-- Function for submission notifications to faculty
CREATE OR REPLACE FUNCTION notify_faculty_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO notifications (recipient_id, recipient_type, sender_id, sender_type, title, message, type, reference_id, reference_table, priority)
    SELECT 
      a.faculty_id,
      'faculty',
      NEW.student_id,
      'student',
      'New Submission: ' || a.title,
      'A student has submitted their assignment: ' || a.title,
      'submission',
      NEW.id,
      'assignment_submissions',
      'normal'
    FROM assignments a
    WHERE a.id = NEW.assignment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submission_notification_trigger
  AFTER INSERT OR UPDATE ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_faculty_on_submission();

-- Function to update Today's Hub feed
CREATE OR REPLACE FUNCTION update_todays_hub_feed()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to Today's Hub when new items are published
  IF TG_TABLE_NAME = 'assignments' AND NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    INSERT INTO todays_hub_feed (student_id, item_type, item_id, title, description, priority, due_date)
    SELECT 
      up.user_id,
      'assignment',
      NEW.id,
      NEW.title,
      NEW.description,
      CASE WHEN NEW.due_date < NOW() + INTERVAL '3 days' THEN 'high' ELSE 'normal' END,
      NEW.due_date
    FROM user_profiles up
    WHERE up.user_type = 'student'
    AND up.department = NEW.department
    AND up.year = ANY(NEW.target_years);
  END IF;
  
  IF TG_TABLE_NAME = 'announcements' AND NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    INSERT INTO todays_hub_feed (student_id, item_type, item_id, title, description, priority)
    SELECT 
      up.user_id,
      'announcement',
      NEW.id,
      NEW.title,
      LEFT(NEW.content, 200),
      NEW.priority
    FROM user_profiles up
    WHERE up.user_type = 'student'
    AND up.department = NEW.department
    AND up.year = ANY(NEW.target_years);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER todays_hub_assignment_trigger
  AFTER INSERT OR UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_todays_hub_feed();

CREATE TRIGGER todays_hub_announcement_trigger
  AFTER INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_todays_hub_feed();

-- Indexes for performance
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_assignments_faculty ON assignments(faculty_id, created_at DESC);
CREATE INDEX idx_assignments_department_year ON assignments(department, target_years, is_published);
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id, submitted_at DESC);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id, submitted_at DESC);
CREATE INDEX idx_study_groups_department ON study_groups(department, target_years, is_active);
CREATE INDEX idx_announcements_department_year ON announcements(department, target_years, is_published, expires_at);
CREATE INDEX idx_todays_hub_student ON todays_hub_feed(student_id, created_at DESC, is_read);
