-- This file creates the tables for the events and seat assignment module.
-- Run this after creating the study_groups table.

-- 1) Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT NOT NULL CHECK (venue IN ('Seminar Hall', 'Solar Shade')),
    event_date TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Create seat_assignments table
CREATE TABLE IF NOT EXISTS seat_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    seat_number INTEGER NOT NULL,
    row_number INTEGER NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('Computer Science and Engineering', 'Cyber Security', 'Artificial Intelligence and Data Science', 'Artificial Intelligence and Machine Learning')),
    year TEXT NOT NULL CHECK (year IN ('1st Year', '2nd Year', '3rd Year', '4th Year')),
    gender TEXT NOT NULL CHECK (gender IN ('Boys', 'Girls')),
    assigned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, seat_number, row_number)
);

-- 3) Create student_seat_registrations table
CREATE TABLE IF NOT EXISTS student_seat_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    seat_assignment_id UUID REFERENCES seat_assignments(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- 4) Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_seat_registrations ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Faculty can create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Faculty can update their events" ON events FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view seat assignments" ON seat_assignments FOR SELECT USING (true);
CREATE POLICY "Faculty can create seat assignments" ON seat_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Faculty can update seat assignments" ON seat_assignments FOR UPDATE USING (auth.uid() = assigned_by);

CREATE POLICY "Students can view their registrations" ON student_seat_registrations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can register for seats" ON student_seat_registrations FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 6) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seat_assignments_event ON seat_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_assignments_dept_year ON seat_assignments(department, year, gender);
CREATE INDEX IF NOT EXISTS idx_student_registrations_event ON student_seat_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_student ON student_seat_registrations(student_id);
