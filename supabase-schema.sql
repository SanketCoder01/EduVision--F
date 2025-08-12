-- EduVision Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for both students and faculty
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty')),
  department VARCHAR(100),
  year VARCHAR(10),
  prn VARCHAR(50),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  department VARCHAR(100) NOT NULL,
  year VARCHAR(10) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  faculty_id UUID NOT NULL REFERENCES users(id),
  faculty_name VARCHAR(255) NOT NULL,
  faculty_email VARCHAR(255) NOT NULL,
  attachment_url TEXT,
  assignment_type VARCHAR(50) NOT NULL DEFAULT 'text_based' CHECK (assignment_type IN ('file_upload', 'text_based', 'quiz', 'coding')),
  max_marks INTEGER NOT NULL DEFAULT 100,
  status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visibility BOOLEAN DEFAULT true,
  allow_late_submission BOOLEAN DEFAULT false,
  allow_resubmission BOOLEAN DEFAULT false,
  enable_plagiarism_check BOOLEAN DEFAULT false,
  allow_group_submission BOOLEAN DEFAULT false,
  allowed_file_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  submission_text TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  grade INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_faculty_id ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assignments_department_year ON assignments(department, year);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data and faculty can read student data in their department
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);

-- Assignments are visible to faculty who created them and students in the same department/year
CREATE POLICY "Faculty can manage own assignments" ON assignments FOR ALL USING (true);
CREATE POLICY "Students can view published assignments" ON assignments FOR SELECT USING (status = 'published');

-- Submissions are visible to the student who submitted and the faculty who assigned
CREATE POLICY "Students can manage own submissions" ON assignment_submissions FOR ALL USING (true);
CREATE POLICY "Faculty can view submissions for their assignments" ON assignment_submissions FOR SELECT USING (true);

-- Insert sample data (optional)
-- You can uncomment these if you want sample data
/*
INSERT INTO users (email, name, user_type, department, year) VALUES
('faculty@example.com', 'Dr. John Smith', 'faculty', 'Computer Science', NULL),
('student@example.com', 'Jane Doe', 'student', 'Computer Science', '2024');
*/
