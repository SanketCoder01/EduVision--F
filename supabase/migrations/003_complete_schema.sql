-- Complete Supabase Schema for EduVision Platform
-- This migration creates all necessary tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE academic_year AS ENUM ('first', 'second', 'third', 'fourth');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE submission_status AS ENUM ('submitted', 'late', 'graded', 'overdue');

-- University Admins table
CREATE TABLE IF NOT EXISTS university_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(50) NOT NULL,
    year academic_year NOT NULL,
    date_of_birth DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    face_registered BOOLEAN DEFAULT FALSE,
    face_registered_at TIMESTAMP WITH TIME ZONE,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    password_hash VARCHAR(255) NOT NULL,
    face_registered BOOLEAN DEFAULT FALSE,
    face_registered_at TIMESTAMP WITH TIME ZONE,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(50) NOT NULL,
    year academic_year NOT NULL,
    assignment_type VARCHAR(100) NOT NULL,
    allowed_file_types TEXT[] DEFAULT '{}',
    max_marks INTEGER NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visibility BOOLEAN DEFAULT TRUE,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    allow_resubmission BOOLEAN DEFAULT FALSE,
    enable_plagiarism_check BOOLEAN DEFAULT TRUE,
    allow_group_submission BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT,
    difficulty VARCHAR(20),
    estimated_time INTEGER,
    status assignment_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_year CHECK (year IN ('first', 'second', 'third', 'fourth')),
    CONSTRAINT valid_marks CHECK (max_marks > 0)
);

-- Assignment Resources table
CREATE TABLE IF NOT EXISTS assignment_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    submitted_files TEXT[] DEFAULT '{}',
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status submission_status DEFAULT 'submitted',
    marks_obtained INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES faculty(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Student Faces table for face recognition
CREATE TABLE IF NOT EXISTS student_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Faculty Faces table for face recognition
CREATE TABLE IF NOT EXISTS faculty_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(faculty_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIMESTAMP WITH TIME ZONE,
    time_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_department_year ON students(department, year);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_assignments_department_year ON assignments(department, year);
CREATE INDEX IF NOT EXISTS idx_assignments_faculty ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE university_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for University Admins
CREATE POLICY "Admins can view all admins" ON university_admins
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert admins" ON university_admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update admins" ON university_admins
    FOR UPDATE USING (true);

-- RLS Policies for Students
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Faculty can view students in their department" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id::text = auth.uid()::text 
            AND faculty.department = students.department
        )
    );

CREATE POLICY "Admins can view all students" ON students
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert students" ON students
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update students" ON students
    FOR UPDATE USING (true);

-- RLS Policies for Faculty
CREATE POLICY "Faculty can view their own data" ON faculty
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Faculty can view other faculty in same department" ON faculty
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty f
            WHERE f.id::text = auth.uid()::text 
            AND f.department = faculty.department
        )
    );

CREATE POLICY "Admins can view all faculty" ON faculty
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert faculty" ON faculty
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update faculty" ON faculty
    FOR UPDATE USING (true);

-- RLS Policies for Assignments
CREATE POLICY "Students can view assignments for their department and year" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id::text = auth.uid()::text 
            AND students.department = assignments.department 
            AND students.year = assignments.year
            AND assignments.status = 'published'
            AND assignments.visibility = true
        )
    );

CREATE POLICY "Faculty can view assignments they created" ON assignments
    FOR SELECT USING (faculty_id::text = auth.uid()::text);

CREATE POLICY "Faculty can view assignments in their department" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id::text = auth.uid()::text 
            AND faculty.department = assignments.department
        )
    );

CREATE POLICY "Faculty can insert assignments" ON assignments
    FOR INSERT WITH CHECK (faculty_id::text = auth.uid()::text);

CREATE POLICY "Faculty can update their own assignments" ON assignments
    FOR UPDATE USING (faculty_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all assignments" ON assignments
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert assignments" ON assignments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update assignments" ON assignments
    FOR UPDATE USING (true);

-- RLS Policies for Assignment Resources
CREATE POLICY "Anyone can view assignment resources" ON assignment_resources
    FOR SELECT USING (true);

CREATE POLICY "Faculty can insert assignment resources" ON assignment_resources
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_resources.assignment_id 
            AND assignments.faculty_id::text = auth.uid()::text
        )
    );

-- RLS Policies for Assignment Submissions
CREATE POLICY "Students can view their own submissions" ON assignment_submissions
    FOR SELECT USING (student_id::text = auth.uid()::text);

CREATE POLICY "Students can insert their own submissions" ON assignment_submissions
    FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

CREATE POLICY "Faculty can view submissions for their assignments" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_submissions.assignment_id 
            AND assignments.faculty_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Faculty can update submissions for their assignments" ON assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_submissions.assignment_id 
            AND assignments.faculty_id::text = auth.uid()::text
        )
    );

-- RLS Policies for Face Recognition
CREATE POLICY "Students can view their own face data" ON student_faces
    FOR SELECT USING (student_id::text = auth.uid()::text);

CREATE POLICY "Students can insert their own face data" ON student_faces
    FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

CREATE POLICY "Faculty can view their own face data" ON faculty_faces
    FOR SELECT USING (faculty_id::text = auth.uid()::text);

CREATE POLICY "Faculty can insert their own face data" ON faculty_faces
    FOR INSERT WITH CHECK (faculty_id::text = auth.uid()::text);

-- RLS Policies for Attendance
CREATE POLICY "Students can view their own attendance" ON attendance
    FOR SELECT USING (student_id::text = auth.uid()::text);

CREATE POLICY "Faculty can view attendance for their department" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id::text = auth.uid()::text 
            AND faculty.department = (
                SELECT department FROM students WHERE students.id = attendance.student_id
            )
        )
    );

CREATE POLICY "Faculty can insert attendance" ON attendance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id::text = auth.uid()::text 
            AND faculty.department = (
                SELECT department FROM students WHERE students.id = attendance.student_id
            )
        )
    );

-- Insert default admin user
INSERT INTO university_admins (name, email, password_hash, status)
VALUES (
    'University Administrator',
    'sanketg367@gmail.com',
    '$2b$10$default_hash_for_sanku99', -- This will be replaced with proper hash
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON assignment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
