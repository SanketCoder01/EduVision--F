-- Create attendance system tables with proper structure
-- This migration creates attendance_sessions and attendance_records tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;

-- Create attendance_sessions table
CREATE TABLE public.attendance_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID NOT NULL,
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL,
    student_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    face_confidence DECIMAL(5,2),
    location_verified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_attendance_session 
        FOREIGN KEY (session_id) 
        REFERENCES public.attendance_sessions(id) 
        ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies for attendance_sessions
CREATE POLICY "Allow authenticated users to manage sessions" ON public.attendance_sessions
    FOR ALL USING (auth.role() = 'authenticated');

-- Create simple RLS policies for attendance_records  
CREATE POLICY "Allow authenticated users to manage records" ON public.attendance_records
    FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_attendance_sessions_faculty_email ON public.attendance_sessions(faculty_email);
CREATE INDEX idx_attendance_sessions_active ON public.attendance_sessions(is_active);
CREATE INDEX idx_attendance_sessions_expires_at ON public.attendance_sessions(expires_at);
CREATE INDEX idx_attendance_sessions_department_year ON public.attendance_sessions(department, year);
CREATE INDEX idx_attendance_records_session_id ON public.attendance_records(session_id);
CREATE INDEX idx_attendance_records_email ON public.attendance_records(email);
CREATE INDEX idx_attendance_records_status ON public.attendance_records(status);

-- Create function to automatically expire sessions
CREATE OR REPLACE FUNCTION expire_attendance_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.attendance_sessions 
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get attendance statistics for a session
CREATE OR REPLACE FUNCTION get_attendance_stats(session_uuid UUID)
RETURNS TABLE(
    total_students INTEGER,
    present_count INTEGER,
    absent_count INTEGER,
    attendance_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_students,
        COUNT(CASE WHEN status = 'present' THEN 1 END)::INTEGER as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END)::INTEGER as absent_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
            ELSE 0
        END as attendance_rate
    FROM public.attendance_records
    WHERE session_id = session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically mark students as absent after expiry
CREATE OR REPLACE FUNCTION mark_absent_after_expiry()
RETURNS void AS $$
BEGIN
    -- Mark sessions as inactive if expired
    UPDATE public.attendance_sessions 
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true 
    AND expires_at < NOW();
    
    -- This function can be extended to automatically mark students as absent
    -- based on class enrollment data when available
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.attendance_sessions TO authenticated;
GRANT ALL ON public.attendance_records TO authenticated;
GRANT EXECUTE ON FUNCTION expire_attendance_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION get_attendance_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_absent_after_expiry() TO authenticated;
