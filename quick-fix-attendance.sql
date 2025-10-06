-- Quick fix for attendance system
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;

-- Create attendance_sessions table
CREATE TABLE public.attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id TEXT NOT NULL,
    faculty_email TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    subject TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    attendance_expiry_minutes INTEGER NOT NULL DEFAULT 5,
    session_title TEXT NOT NULL,
    class_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    student_id TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_department TEXT NOT NULL,
    student_year TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    marked_at TIMESTAMP WITH TIME ZONE,
    absence_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_attendance_session 
        FOREIGN KEY (session_id) 
        REFERENCES public.attendance_sessions(id) 
        ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to manage sessions" 
ON public.attendance_sessions FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage records" 
ON public.attendance_records FOR ALL 
USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.attendance_sessions TO authenticated;
GRANT ALL ON public.attendance_records TO authenticated;

-- Insert test sessions for CSE 3rd year
INSERT INTO public.attendance_sessions (
    faculty_id, faculty_email, faculty_name, department, year, 
    class_name, subject, session_date, start_time, end_time, 
    duration_minutes, attendance_expiry_minutes, session_title, 
    is_active, expires_at
) VALUES 
(
    'faculty-001',
    'amruta.pankade@sanjivani.edu.in',
    'Amruta Pankade',
    'CSE',
    'third',
    'Computer Science Engineering - 3rd Year',
    'Database Management',
    CURRENT_DATE,
    '10:00',
    '10:50',
    50,
    15,
    'DBMS - Normalization and ACID Properties',
    true,
    NOW() + INTERVAL '15 minutes'
),
(
    'faculty-002',
    'rajesh.kumar@sanjivani.edu.in',
    'Rajesh Kumar',
    'CSE',
    'third',
    'Computer Science Engineering - 3rd Year',
    'Operating Systems',
    CURRENT_DATE,
    '11:00',
    '11:50',
    50,
    10,
    'OS - Process Scheduling Algorithms',
    true,
    NOW() + INTERVAL '20 minutes'
),
(
    'faculty-003',
    'priya.sharma@sanjivani.edu.in',
    'Priya Sharma',
    'CSE',
    'third',
    'Computer Science Engineering - 3rd Year',
    'Computer Networks',
    CURRENT_DATE,
    '14:00',
    '14:50',
    50,
    12,
    'CN - TCP/IP Protocol Stack',
    true,
    NOW() + INTERVAL '25 minutes'
),
(
    'faculty-004',
    'suresh.patil@sanjivani.edu.in',
    'Suresh Patil',
    'CSE',
    'third',
    'Computer Science Engineering - 3rd Year',
    'Software Engineering',
    CURRENT_DATE,
    '15:00',
    '15:50',
    50,
    8,
    'SE - Software Testing Methodologies',
    true,
    NOW() + INTERVAL '30 minutes'
);

-- Verify the data
SELECT 
    id,
    faculty_name,
    subject,
    session_title,
    is_active,
    expires_at
FROM public.attendance_sessions 
WHERE department = 'CSE' AND year = 'third' AND is_active = true
ORDER BY created_at DESC;
