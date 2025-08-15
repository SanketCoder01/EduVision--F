-- Create the events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    poster_url TEXT,
    max_participants INT,
    target_departments TEXT[],
    target_years TEXT[],
    enable_payment BOOLEAN DEFAULT FALSE,
    payment_amount NUMERIC(10, 2),
    allow_registration BOOLEAN DEFAULT TRUE,
    registration_start TIMESTAMPTZ DEFAULT NOW(),
    registration_end TIMESTAMPTZ NOT NULL,
    registration_fields JSONB,
    venue_type TEXT,
    created_by UUID REFERENCES faculty(id),
    faculty_name TEXT,
    faculty_department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_department TEXT,
    student_year TEXT,
    student_phone TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'registered', -- e.g., registered, attended, cancelled
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- Create the event_attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES event_registrations(id) ON DELETE SET NULL,
    attendance_status TEXT NOT NULL, -- e.g., present, absent, late
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    marked_by UUID REFERENCES faculty(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- Create the seat_assignments table
CREATE TABLE IF NOT EXISTS seat_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_type TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    gender TEXT,
    seat_numbers INT[] NOT NULL,
    row_numbers INT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow faculty to create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow creating faculty to update their events" ON events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Allow creating faculty to delete their events" ON events FOR DELETE USING (auth.uid() = created_by);

-- Policies for event_registrations
CREATE POLICY "Allow students to register for events" ON event_registrations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow students to view their own registrations" ON event_registrations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Allow faculty to view registrations for their events" ON event_registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.created_by = auth.uid())
);

-- Policies for event_attendance
CREATE POLICY "Allow faculty to manage attendance for their events" ON event_attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_attendance.event_id AND events.created_by = auth.uid())
);

-- Policies for seat_assignments
CREATE POLICY "Allow faculty to manage seat assignments for their events" ON seat_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = seat_assignments.event_id AND events.created_by = auth.uid())
);
