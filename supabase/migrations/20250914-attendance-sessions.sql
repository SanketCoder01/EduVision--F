-- Create attendance_sessions table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create attendance_records table for student submissions
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    face_confidence DECIMAL(5,2),
    location_verified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for attendance_sessions
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view sessions (will be filtered by app logic)
CREATE POLICY "Allow authenticated users to view sessions" ON public.attendance_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to create sessions (will be filtered by app logic)
CREATE POLICY "Allow authenticated users to create sessions" ON public.attendance_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update sessions (will be filtered by app logic)
CREATE POLICY "Allow authenticated users to update sessions" ON public.attendance_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add RLS policies for attendance_records
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view records (will be filtered by app logic)
CREATE POLICY "Allow authenticated users to view records" ON public.attendance_records
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert records (will be filtered by app logic)
CREATE POLICY "Allow authenticated users to insert records" ON public.attendance_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty_email ON public.attendance_sessions(faculty_email);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON public.attendance_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires_at ON public.attendance_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_email ON public.attendance_records(email);

-- Create function to automatically mark sessions as inactive when expired
CREATE OR REPLACE FUNCTION expire_attendance_sessions()
RETURNS void AS $$
BEGIN
    UPDATE public.attendance_sessions 
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get attendance statistics
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
