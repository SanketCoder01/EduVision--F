-- Create student_lists table
CREATE TABLE IF NOT EXISTS student_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    faculty_email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(50),
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_list_entries table
CREATE TABLE IF NOT EXISTS student_list_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID REFERENCES student_lists(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    prn VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    year VARCHAR(50),
    faculty_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_sessions table (enhanced)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    student_list_id UUID REFERENCES student_lists(id),
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table (enhanced)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_prn VARCHAR(100) NOT NULL,
    student_department VARCHAR(100) NOT NULL,
    student_year VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent')),
    marked_at TIMESTAMP WITH TIME ZONE,
    face_confidence DECIMAL(5,2),
    location_verified BOOLEAN DEFAULT false,
    absence_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real-time attendance tracking table
CREATE TABLE IF NOT EXISTS real_time_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_email VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_prn VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'present', 'absent')),
    marked_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_lists_faculty ON student_lists(faculty_email);
CREATE INDEX IF NOT EXISTS idx_student_list_entries_list_id ON student_list_entries(list_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty ON attendance_sessions(faculty_email);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_real_time_attendance_session ON real_time_attendance(session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE student_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_lists
CREATE POLICY "Faculty can manage their own student lists" ON student_lists
    FOR ALL USING (faculty_email = auth.jwt() ->> 'email');

-- RLS Policies for student_list_entries
CREATE POLICY "Faculty can manage their own student list entries" ON student_list_entries
    FOR ALL USING (faculty_email = auth.jwt() ->> 'email');

-- RLS Policies for attendance_sessions
CREATE POLICY "Faculty can manage their own attendance sessions" ON attendance_sessions
    FOR ALL USING (faculty_email = auth.jwt() ->> 'email');

-- RLS Policies for attendance_records
CREATE POLICY "Faculty can view attendance records for their sessions" ON attendance_records
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM attendance_sessions WHERE faculty_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Students can view their own attendance records" ON attendance_records
    FOR SELECT USING (student_email = auth.jwt() ->> 'email');

CREATE POLICY "Students can update their own attendance" ON attendance_records
    FOR UPDATE USING (student_email = auth.jwt() ->> 'email');

-- RLS Policies for real_time_attendance
CREATE POLICY "Faculty can manage real-time attendance for their sessions" ON real_time_attendance
    FOR ALL USING (
        session_id IN (
            SELECT id FROM attendance_sessions WHERE faculty_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Students can view their own real-time attendance" ON real_time_attendance
    FOR SELECT USING (student_email = auth.jwt() ->> 'email');

-- Enable realtime for real-time attendance tracking
ALTER PUBLICATION supabase_realtime ADD TABLE real_time_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_sessions;
