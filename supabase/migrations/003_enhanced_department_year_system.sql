-- Enhanced Department-Year System Migration
-- This migration adds proper department-year filtering and target_years support

-- Add target_years column to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- Add target_years column to announcements table  
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- Add target_years column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- Add target_years column to study_groups table
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_years TEXT[] NOT NULL DEFAULT '{}',
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    location VARCHAR(255),
    total_students INTEGER DEFAULT 0,
    present_students INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table for individual student attendance
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late')),
    marked_at TIMESTAMP WITH TIME ZONE,
    face_confidence DECIMAL(5,2),
    location_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendance_id, student_id)
);

-- Update RLS policies for assignments with target_years support
DROP POLICY IF EXISTS "Students can view published assignments for their department/year" ON assignments;
CREATE POLICY "Students can view published assignments for their department/year" ON assignments
    FOR SELECT USING (
        status = 'published' 
        AND visibility = true 
        AND EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.department = assignments.department 
            AND (
                array_length(assignments.target_years, 1) IS NULL 
                OR students.year = ANY(assignments.target_years)
            )
        )
    );

-- Update RLS policies for announcements with target_years support
DROP POLICY IF EXISTS "All can view announcements" ON announcements;
CREATE POLICY "Students can view targeted announcements" ON announcements
    FOR SELECT USING (
        target_audience IN ('all', 'students')
        AND (
            department IS NULL 
            OR EXISTS (
                SELECT 1 FROM students 
                WHERE students.id = auth.uid() 
                AND students.department = announcements.department
                AND (
                    array_length(announcements.target_years, 1) IS NULL 
                    OR students.year = ANY(announcements.target_years)
                )
            )
        )
    );

CREATE POLICY "Faculty can view all announcements" ON announcements
    FOR SELECT USING (
        target_audience IN ('all', 'faculty')
        AND (
            department IS NULL 
            OR EXISTS (
                SELECT 1 FROM faculty 
                WHERE faculty.id = auth.uid() 
                AND faculty.department = announcements.department
            )
        )
    );

-- Update RLS policies for events with target_years support
DROP POLICY IF EXISTS "All can view events" ON events;
CREATE POLICY "Students can view targeted events" ON events
    FOR SELECT USING (
        department IS NULL 
        OR EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.department = events.department
            AND (
                array_length(events.target_years, 1) IS NULL 
                OR students.year = ANY(events.target_years)
            )
        )
    );

CREATE POLICY "Faculty can view departmental events" ON events
    FOR SELECT USING (
        department IS NULL 
        OR EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = auth.uid() 
            AND faculty.department = events.department
        )
    );

-- Update RLS policies for study_groups with target_years support
DROP POLICY IF EXISTS "All can view study groups" ON study_groups;
CREATE POLICY "Students can view targeted study groups" ON study_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.department = study_groups.department
            AND (
                array_length(study_groups.target_years, 1) IS NULL 
                OR students.year = ANY(study_groups.target_years)
            )
        )
    );

CREATE POLICY "Faculty can view departmental study groups" ON study_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = auth.uid() 
            AND faculty.department = study_groups.department
        )
    );

-- RLS policies for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can manage their attendance sessions" ON attendance
    FOR ALL USING (faculty_id = auth.uid());

CREATE POLICY "Students can view attendance for their department/year" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.department = attendance.department
            AND students.year = ANY(attendance.target_years)
        )
    );

CREATE POLICY "Students can manage their attendance records" ON attendance_records
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Faculty can view attendance records for their sessions" ON attendance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM attendance 
            WHERE attendance.id = attendance_records.attendance_id 
            AND attendance.faculty_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_target_years ON assignments USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_announcements_target_years ON announcements USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_events_target_years ON events USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_study_groups_target_years ON study_groups USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_attendance_department_years ON attendance(department) INCLUDE (target_years);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_attendance ON attendance_records(attendance_id);

-- Add triggers for updated_at
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
