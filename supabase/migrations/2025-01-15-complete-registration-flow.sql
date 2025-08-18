-- Complete Registration Flow Migration
-- Run this in Supabase SQL Editor

-- 1. Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS student_faces CASCADE;
DROP TABLE IF EXISTS faculty_faces CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS pending_registrations CASCADE;

-- 2. Create pending_registrations table
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL CHECK (department IN ('CSE', 'Cyber', 'AIDS', 'AIML')),
    year VARCHAR(20), -- Only for students
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty')),
    status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    face_url TEXT,
    face_data JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255), -- Admin email
    rejection_reason TEXT,
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    prn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(50) NOT NULL CHECK (department IN ('CSE', 'Cyber', 'AIDS', 'AIML')),
    year VARCHAR(20) NOT NULL CHECK (year IN ('1st', '2nd', '3rd', '4th')),
    date_of_birth DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    password_hash VARCHAR(255),
    face_registered BOOLEAN DEFAULT FALSE,
    face_registered_at TIMESTAMP WITH TIME ZONE,
    face_url TEXT,
    face_data JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(50) NOT NULL CHECK (department IN ('CSE', 'Cyber', 'AIDS', 'AIML')),
    designation VARCHAR(100),
    qualification VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    password_hash VARCHAR(255),
    face_registered BOOLEAN DEFAULT FALSE,
    face_registered_at TIMESTAMP WITH TIME ZONE,
    face_url TEXT,
    face_data JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create face data tables for attendance
CREATE TABLE IF NOT EXISTS student_faces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    face_encoding JSONB NOT NULL,
    face_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_faces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    face_encoding JSONB NOT NULL,
    face_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_faces ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
-- Pending Registrations Policies
CREATE POLICY "Users can view their own pending registration" ON pending_registrations
    FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own pending registration" ON pending_registrations
    FOR INSERT WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own pending registration" ON pending_registrations
    FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all pending registrations" ON pending_registrations
    FOR ALL USING (true); -- Simplified for demo

-- Students Policies
CREATE POLICY "Students can view their own data" ON students
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update their own data" ON students
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Faculty can view students in their department" ON students
    FOR SELECT USING (true); -- Simplified for demo

-- Faculty Policies
CREATE POLICY "Faculty can view their own data" ON faculty
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Faculty can update their own data" ON faculty
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all faculty" ON faculty
    FOR ALL USING (true); -- Simplified for demo

-- Face Data Policies
CREATE POLICY "Users can view their own face data" ON student_faces
    FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Users can insert their own face data" ON student_faces
    FOR INSERT WITH CHECK (true); -- Simplified for demo

CREATE POLICY "Users can view their own face data" ON faculty_faces
    FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Users can insert their own face data" ON faculty_faces
    FOR INSERT WITH CHECK (true); -- Simplified for demo

-- 8. Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_registrations_updated_at 
    BEFORE UPDATE ON pending_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at 
    BEFORE UPDATE ON faculty 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_type ON pending_registrations(user_type);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_department ON pending_registrations(department);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_prn ON students(prn);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_department_year ON students(department, year);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_id ON faculty(employee_id);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);

-- 10. Insert sample departments for validation
INSERT INTO information_schema.table_constraints 
SELECT * FROM (
    VALUES 
        ('CSE', 'Computer Science Engineering'),
        ('Cyber', 'Cyber Security'),
        ('AIDS', 'Artificial Intelligence & Data Science'),
        ('AIML', 'Artificial Intelligence & Machine Learning')
) AS dept_data(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'dept_data'
);

-- 11. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
