-- Final Assignments Schema Setup for Supabase
-- This script safely handles existing data and fixes constraint violations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: FIX EXISTING DATA BEFORE ADDING CONSTRAINTS
-- ============================================================================

-- Check if assignments table exists and fix any invalid data
DO $$ 
BEGIN
    -- Only proceed if assignments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignments') THEN
        
        -- Fix invalid assignment_type values
        UPDATE assignments 
        SET assignment_type = 'file_upload' 
        WHERE assignment_type IS NULL 
           OR assignment_type NOT IN ('file_upload', 'text_based', 'quiz', 'coding');
        
        -- Fix invalid year values
        UPDATE assignments 
        SET year = 'first' 
        WHERE year IS NULL 
           OR year NOT IN ('first', 'second', 'third', 'fourth');
        
        -- Fix invalid status values
        UPDATE assignments 
        SET status = 'draft' 
        WHERE status IS NULL 
           OR status NOT IN ('draft', 'published', 'closed');
        
        -- Add missing required columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='assignment_type') THEN
            ALTER TABLE assignments ADD COLUMN assignment_type VARCHAR(50) DEFAULT 'file_upload';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='max_marks') THEN
            ALTER TABLE assignments ADD COLUMN max_marks INTEGER DEFAULT 100;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='status') THEN
            ALTER TABLE assignments ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='visibility') THEN
            ALTER TABLE assignments ADD COLUMN visibility BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='allow_late_submission') THEN
            ALTER TABLE assignments ADD COLUMN allow_late_submission BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='enable_plagiarism_check') THEN
            ALTER TABLE assignments ADD COLUMN enable_plagiarism_check BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='allowed_file_types') THEN
            ALTER TABLE assignments ADD COLUMN allowed_file_types TEXT[] DEFAULT '{}';
        END IF;
        
        RAISE NOTICE 'Fixed existing assignments data and added missing columns';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS TO OTHER TABLES
-- ============================================================================

-- Add missing columns to faculty table if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='faculty') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faculty' AND column_name='department') THEN
            ALTER TABLE faculty ADD COLUMN department VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faculty' AND column_name='designation') THEN
            ALTER TABLE faculty ADD COLUMN designation VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faculty' AND column_name='phone') THEN
            ALTER TABLE faculty ADD COLUMN phone VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faculty' AND column_name='address') THEN
            ALTER TABLE faculty ADD COLUMN address TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faculty' AND column_name='employee_id') THEN
            ALTER TABLE faculty ADD COLUMN employee_id VARCHAR(50);
        END IF;
    END IF;
END $$;

-- Add missing columns to students table if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='students') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='department') THEN
            ALTER TABLE students ADD COLUMN department VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='year') THEN
            ALTER TABLE students ADD COLUMN year VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='prn') THEN
            ALTER TABLE students ADD COLUMN prn VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='phone') THEN
            ALTER TABLE students ADD COLUMN phone VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='address') THEN
            ALTER TABLE students ADD COLUMN address TEXT;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE MISSING TABLES
-- ============================================================================

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    faculty_id UUID NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL DEFAULT 'first',
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'file_upload',
    allowed_file_types TEXT[] DEFAULT '{}',
    max_marks INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visibility BOOLEAN DEFAULT TRUE,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    allow_resubmission BOOLEAN DEFAULT FALSE,
    enable_plagiarism_check BOOLEAN DEFAULT TRUE,
    allow_group_submission BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other supporting tables
CREATE TABLE IF NOT EXISTS assignment_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    content TEXT,
    file_urls TEXT[] DEFAULT '{}',
    file_names TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'submitted',
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID,
    UNIQUE(assignment_id, student_id)
);

-- ============================================================================
-- STEP 4: SAFELY ADD CONSTRAINTS (after fixing data)
-- ============================================================================

DO $$ 
BEGIN
    -- Add constraints to assignments table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignments') THEN
        -- Drop existing constraints first
        ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_assignment_type_check;
        ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_year_check;
        ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_status_check;
        
        -- Add constraints (data should be clean now)
        ALTER TABLE assignments ADD CONSTRAINT assignments_assignment_type_check 
            CHECK (assignment_type IN ('file_upload', 'text_based', 'quiz', 'coding'));
        
        ALTER TABLE assignments ADD CONSTRAINT assignments_year_check 
            CHECK (year IN ('first', 'second', 'third', 'fourth'));
        
        ALTER TABLE assignments ADD CONSTRAINT assignments_status_check 
            CHECK (status IN ('draft', 'published', 'closed'));
            
        RAISE NOTICE 'Added constraints to assignments table successfully';
    END IF;
    
    -- Add constraint to assignment_submissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignment_submissions') THEN
        ALTER TABLE assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_status_check;
        ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_status_check 
            CHECK (status IN ('submitted', 'graded', 'returned'));
    END IF;
END $$;

-- ============================================================================
-- STEP 5: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

DO $$ 
BEGIN
    -- Add foreign keys only if both tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='faculty') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignments') THEN
        ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_faculty_id_fkey;
        ALTER TABLE assignments ADD CONSTRAINT assignments_faculty_id_fkey 
            FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignment_resources') THEN
        ALTER TABLE assignment_resources DROP CONSTRAINT IF EXISTS assignment_resources_assignment_id_fkey;
        ALTER TABLE assignment_resources ADD CONSTRAINT assignment_resources_assignment_id_fkey 
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignment_submissions') THEN
        ALTER TABLE assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_assignment_id_fkey;
        ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_id_fkey 
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='students') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='assignment_submissions') THEN
        ALTER TABLE assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_student_id_fkey;
        ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_student_id_fkey 
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- STEP 6: INDEXES
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
-- STEP 7: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Faculty can view their own data" ON faculty;
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Faculty can manage their assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view published assignments for their department/year" ON assignments;
DROP POLICY IF EXISTS "Faculty can manage resources for their assignments" ON assignment_resources;
DROP POLICY IF EXISTS "Students can view resources for accessible assignments" ON assignment_resources;
DROP POLICY IF EXISTS "Students can manage their own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can update grades for their assignments" ON assignment_submissions;

-- Create RLS policies
CREATE POLICY "Faculty can view their own data" 
ON faculty FOR ALL
USING (auth.uid()::text = faculty.id::text);

CREATE POLICY "Students can view their own data" 
ON students FOR ALL
USING (auth.uid()::text = students.id::text);

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
-- STEP 8: STORAGE BUCKETS AND POLICIES
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('assignment-resources', 'assignment-resources', true),
    ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Clean up old storage policies
DROP POLICY IF EXISTS "Faculty can upload assignment resources" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view assignment resources" ON storage.objects;
DROP POLICY IF EXISTS "Students can upload submissions" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their own submissions" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can view submissions for their assignments (files)" ON storage.objects;

-- Create storage policies
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
-- SUCCESS MESSAGE
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== ASSIGNMENT SCHEMA SETUP COMPLETED SUCCESSFULLY! ===';
    RAISE NOTICE 'Fixed existing data and added all required components:';
    RAISE NOTICE '✓ assignments table with proper constraints';
    RAISE NOTICE '✓ assignment_resources table';
    RAISE NOTICE '✓ assignment_submissions table';
    RAISE NOTICE '✓ All RLS policies configured';
    RAISE NOTICE '✓ Storage buckets and policies ready';
    RAISE NOTICE '✓ Your 404 error should now be resolved!';
    RAISE NOTICE '================================================';
END $$;
