-- Create Python Attendance System Tables
-- This schema is optimized for the Python Flask backend

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create attendance tables procedure
CREATE OR REPLACE FUNCTION create_python_attendance_tables()
RETURNS void AS $$
BEGIN
  -- Student faces table
  CREATE TABLE IF NOT EXISTS public.student_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(255) NOT NULL UNIQUE,
    face_encoding TEXT NOT NULL, -- Base64 encoded face data
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Faculty faces table
  CREATE TABLE IF NOT EXISTS public.faculty_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id VARCHAR(255) NOT NULL UNIQUE,
    face_encoding TEXT NOT NULL, -- Base64 encoded face data
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Student attendance table
  CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    subject_id VARCHAR(255),
    time_slot VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    face_confidence DECIMAL(3, 2),
    geo_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Faculty attendance table
  CREATE TABLE IF NOT EXISTS public.faculty_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    face_confidence DECIMAL(3, 2),
    geo_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Subjects table (for student attendance)
  CREATE TABLE IF NOT EXISTS public.subjects (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Time slots table
  CREATE TABLE IF NOT EXISTS public.time_slots (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Insert default subjects
  INSERT INTO public.subjects (id, name, code) VALUES
    ('sub_001', 'Computer Science', 'CS101'),
    ('sub_002', 'Mathematics', 'MATH101'),
    ('sub_003', 'Physics', 'PHY101'),
    ('sub_004', 'English', 'ENG101')
  ON CONFLICT (id) DO NOTHING;

  -- Insert default time slots
  INSERT INTO public.time_slots (id, name, start_time, end_time) VALUES
    ('slot_1', '8:00 AM - 9:00 AM', '08:00', '09:00'),
    ('slot_2', '9:00 AM - 10:00 AM', '09:00', '10:00'),
    ('slot_3', '10:00 AM - 11:00 AM', '10:00', '11:00'),
    ('slot_4', '11:00 AM - 12:00 PM', '11:00', '12:00'),
    ('slot_5', '2:00 PM - 3:00 PM', '14:00', '15:00'),
    ('slot_6', '3:00 PM - 4:00 PM', '15:00', '16:00')
  ON CONFLICT (id) DO NOTHING;

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_student_faces_student_id ON public.student_faces(student_id);
  CREATE INDEX IF NOT EXISTS idx_faculty_faces_faculty_id ON public.faculty_faces(faculty_id);
  CREATE INDEX IF NOT EXISTS idx_student_attendance_student_date ON public.student_attendance(student_id, date);
  CREATE INDEX IF NOT EXISTS idx_faculty_attendance_faculty_date ON public.faculty_attendance(faculty_id, date);
  CREATE INDEX IF NOT EXISTS idx_student_attendance_subject ON public.student_attendance(subject_id);
  CREATE INDEX IF NOT EXISTS idx_student_attendance_time_slot ON public.student_attendance(time_slot);

  -- Create unique constraint to prevent duplicate attendance on same day
  CREATE UNIQUE INDEX IF NOT EXISTS idx_student_attendance_unique 
    ON public.student_attendance(student_id, date, subject_id);
  
  CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_attendance_unique 
    ON public.faculty_attendance(faculty_id, date);

END;
$$ LANGUAGE plpgsql;

-- Execute the function to create tables
SELECT create_python_attendance_tables(); 