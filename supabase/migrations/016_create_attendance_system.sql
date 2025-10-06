-- Create comprehensive attendance system for EduVision
-- This includes attendance sessions, records, and student responses

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;

-- Create attendance_sessions table for faculty to create attendance sessions
CREATE TABLE attendance_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    faculty_email TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL, -- How long the session stays open for attendance
    session_title TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table for individual student attendance
CREATE TABLE attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_department TEXT NOT NULL,
    student_year TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
    marked_at TIMESTAMP WITH TIME ZONE,
    absence_note TEXT, -- Note for absent students
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate attendance records
ALTER TABLE attendance_records 
ADD CONSTRAINT unique_student_session_attendance 
UNIQUE (session_id, student_id);

-- Enable RLS
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance_sessions
CREATE POLICY "Faculty can manage their own attendance sessions" ON attendance_sessions
    FOR ALL USING (faculty_email = auth.jwt() ->> 'email');

CREATE POLICY "Students can view active sessions for their department/year" ON attendance_sessions
    FOR SELECT USING (
        is_active = true AND
        expires_at > NOW() AND
        EXISTS (
            SELECT 1 FROM students_cse_1st_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cse_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cse_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cse_4th_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cyber_1st_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cyber_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cyber_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_cyber_4th_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aids_1st_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aids_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aids_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aids_4th_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aiml_1st_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aiml_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aiml_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
            UNION ALL
            SELECT 1 FROM students_aiml_4th_year WHERE email = auth.jwt() ->> 'email' AND department = attendance_sessions.department AND year = attendance_sessions.year
        )
    );

-- RLS Policies for attendance_records
CREATE POLICY "Faculty can view records for their sessions" ON attendance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM attendance_sessions 
            WHERE id = attendance_records.session_id 
            AND faculty_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Students can view their own attendance records" ON attendance_records
    FOR SELECT USING (student_email = auth.jwt() ->> 'email');

CREATE POLICY "Students can mark their own attendance" ON attendance_records
    FOR INSERT WITH CHECK (student_email = auth.jwt() ->> 'email');

CREATE POLICY "Students can update their own attendance notes" ON attendance_records
    FOR UPDATE USING (student_email = auth.jwt() ->> 'email');

-- API access policies
CREATE POLICY "API can access attendance sessions" ON attendance_sessions
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "API can access attendance records" ON attendance_records
    FOR ALL USING (current_setting('role') = 'service_role');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty_id ON attendance_sessions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_department_year ON attendance_sessions(department, year);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON attendance_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

-- Create triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION update_attendance_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_attendance_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendance_sessions_updated_at
    BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_sessions_updated_at();

CREATE TRIGGER attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_records_updated_at();

-- Grant permissions
GRANT ALL ON attendance_sessions TO anon, authenticated;
GRANT ALL ON attendance_records TO anon, authenticated;
