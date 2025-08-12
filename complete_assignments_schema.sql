-- Complete Assignments Schema Setup for Supabase
-- This script safely creates all required tables, policies, and storage components
-- Uses IF NOT EXISTS to avoid conflicts with existing components

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    employee_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL CHECK (year IN ('first', 'second', 'third', 'fourth')),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table (CRITICAL - this is likely missing)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL CHECK (year IN ('first', 'second', 'third', 'fourth')),
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('file_upload', 'text_based', 'quiz', 'coding')),
    allowed_file_types TEXT[] DEFAULT '{}',
    max_marks INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visibility BOOLEAN DEFAULT TRUE,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    allow_resubmission BOOLEAN DEFAULT FALSE,
    enable_plagiarism_check BOOLEAN DEFAULT TRUE,
    allow_group_submission BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment resources table
CREATE TABLE IF NOT EXISTS assignment_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    content TEXT,
    file_urls TEXT[] DEFAULT '{}',
    file_names TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES faculty(id),
    UNIQUE(assignment_id, student_id)
);

-- ============================================================================
-- INDEXES (for better performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_prn ON students(prn);
CREATE INDEX IF NOT EXISTS idx_students_department_year ON students(department, year);
CREATE INDEX IF NOT EXISTS idx_assignments_faculty ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assignments_department_year ON assignments(department, year);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignment_resources_assignment ON assignment_resources(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLEAN UP OLD POLICIES (to avoid conflicts)
-- ============================================================================

-- Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Faculty can view their own data" ON faculty;
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Faculty can manage their assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view published assignments for their department/year" ON assignments;
DROP POLICY IF EXISTS "Faculty can manage resources for their assignments" ON assignment_resources;
DROP POLICY IF EXISTS "Students can view resources for accessible assignments" ON assignment_resources;
DROP POLICY IF EXISTS "Students can manage their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can update grades for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view submissions for their department/year" ON assignment_submissions;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Faculty policies
CREATE POLICY "Faculty can view their own data" 
ON faculty FOR ALL
USING (auth.uid()::text = faculty.id::text);

-- Students policies
CREATE POLICY "Students can view their own data" 
ON students FOR ALL
USING (auth.uid()::text = students.id::text);

-- Assignments policies
CREATE POLICY "Faculty can manage their assignments" 
ON assignments FOR ALL
USING (assignments.faculty_id = auth.uid());

CREATE POLICY "Students can view published assignments for their department/year" 
ON assignments FOR SELECT
USING (
    assignments.status = 'published'
    AND assignments.visibility = true
    AND EXISTS (
        SELECT 1 
        FROM students AS s
        WHERE s.id = auth.uid()
          AND s.department = assignments.department
          AND s.year = assignments.year
    )
);

-- Assignment resources policies
CREATE POLICY "Faculty can manage resources for their assignments" 
ON assignment_resources FOR ALL
USING (
    EXISTS (
        SELECT 1 
        FROM assignments AS a
        WHERE a.id = assignment_resources.assignment_id
          AND a.faculty_id = auth.uid()
    )
);

CREATE POLICY "Students can view resources for accessible assignments" 
ON assignment_resources FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM assignments AS a
        JOIN students AS s
          ON s.id = auth.uid()
         AND s.department = a.department
         AND s.year = a.year
        WHERE a.id = assignment_resources.assignment_id
          AND a.status = 'published'
          AND a.visibility = true
    )
);

-- Assignment submissions policies
CREATE POLICY "Students can manage their own submissions" 
ON assignment_submissions FOR ALL
USING (assignment_submissions.student_id = auth.uid());

CREATE POLICY "Faculty can view submissions for their assignments" 
ON assignment_submissions FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM assignments AS a
        WHERE a.id = assignment_submissions.assignment_id
          AND a.faculty_id = auth.uid()
    )
);

CREATE POLICY "Faculty can update grades for their assignments" 
ON assignment_submissions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 
        FROM assignments AS a
        WHERE a.id = assignment_submissions.assignment_id
          AND a.faculty_id = auth.uid()
    )
);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('assignment-resources', 'assignment-resources', true),
    ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Clean up old storage policies
DROP POLICY IF EXISTS "Faculty can upload assignment resources" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view assignment resources" ON storage.objects;
DROP POLICY IF EXISTS "Students can upload submissions" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can view submissions for their assignments (files)" ON storage.objects;

-- Storage policies for assignment resources
CREATE POLICY "Faculty can upload assignment resources" 
ON storage.objects FOR INSERT
WITH CHECK (
    storage.objects.bucket_id = 'assignment-resources'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view assignment resources" 
ON storage.objects FOR SELECT
USING (
    storage.objects.bucket_id = 'assignment-resources'
);

-- Storage policies for assignment submissions
CREATE POLICY "Students can upload submissions" 
ON storage.objects FOR INSERT
WITH CHECK (
    storage.objects.bucket_id = 'assignment-submissions'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Students can view their own submissions" 
ON storage.objects FOR SELECT
USING (
    storage.objects.bucket_id = 'assignment-submissions'
    AND auth.uid()::text = (storage.foldername(storage.objects.name))[2]
);

CREATE POLICY "Faculty can view submissions for their assignments (files)" 
ON storage.objects FOR SELECT
USING (
    storage.objects.bucket_id = 'assignment-submissions'
    AND EXISTS (
        SELECT 1 
        FROM assignments AS a
        WHERE a.id::text = (storage.foldername(storage.objects.name))[1]
          AND a.faculty_id = auth.uid()
    )
);

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to check if everything exists)
-- ============================================================================

-- Uncomment these to verify your setup after running the above script:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('faculty', 'students', 'assignments', 'assignment_resources', 'assignment_submissions');

-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('faculty', 'students', 'assignments', 'assignment_resources', 'assignment_submissions');

-- SELECT name FROM storage.buckets WHERE name IN ('assignment-resources', 'assignment-submissions');
