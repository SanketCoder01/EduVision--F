-- Schema for the Grievance Module
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_department TEXT NOT NULL,
    student_year TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('academic', 'administrative', 'faculty', 'other')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    is_private BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Schema for the Lost & Found Module
-- Schema for the Lost & Found Module
CREATE TABLE IF NOT EXISTS lost_found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_department TEXT NOT NULL,
    reporter_phone TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    is_lost BOOLEAN NOT NULL,
    image_url TEXT,
    reported_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Schema for the Hackathon Module
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    faculty_department TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    department TEXT[] NOT NULL,
    "year" TEXT[] NOT NULL, -- "year" is a reserved keyword, so it's quoted
    attachments JSONB,
    posted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grievances
-- Students can see their own grievances.
CREATE POLICY "Students can view their own grievances" ON grievances
FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own grievances.
CREATE POLICY "Students can insert their own grievances" ON grievances
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- TODO: Add policy for faculty to view all grievances.

-- RLS Policies for lost_found_items
-- Any authenticated user can see all items.
CREATE POLICY "Authenticated users can view all lost and found items" ON lost_found_items
FOR SELECT USING (auth.role() = 'authenticated');

-- Any authenticated user can report an item.
CREATE POLICY "Authenticated users can report an item" ON lost_found_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for hackathons
-- Any authenticated user can see all hackathons.
CREATE POLICY "Authenticated users can view all hackathons" ON hackathons
FOR SELECT USING (auth.role() = 'authenticated');

-- TODO: Add policy for faculty to create hackathons.

-- Schema for Events Module
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    faculty_name TEXT NOT NULL,
    faculty_department TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'seminar', 'hackathon', 'competition', 'cultural', 'sports', 'other')),
    department TEXT[] NOT NULL,
    "year" TEXT[] NOT NULL,
    venue TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    registration_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    registration_end TIMESTAMPTZ NOT NULL,
    max_participants INTEGER,
    attachments JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Schema for Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_department TEXT NOT NULL,
    student_year TEXT NOT NULL,
    student_phone TEXT,
    registration_date TIMESTAMPTZ DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    UNIQUE(event_id, student_id)
);

-- Schema for Event Attendance
CREATE TABLE IF NOT EXISTS event_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE NOT NULL,
    marked_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    attendance_status TEXT NOT NULL CHECK (attendance_status IN ('present', 'absent', 'late')),
    marked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    notes TEXT,
    UNIQUE(event_id, student_id)
);

-- Enable Row Level Security (RLS) for event tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- Any authenticated user can view active events
CREATE POLICY "Authenticated users can view active events" ON events
FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Faculty can create events
CREATE POLICY "Faculty can create events" ON events
FOR INSERT WITH CHECK (auth.uid() = faculty_id);

-- Faculty can update their own events
CREATE POLICY "Faculty can update their own events" ON events
FOR UPDATE USING (auth.uid() = faculty_id);

-- RLS Policies for event_registrations
-- Students can view their own registrations
CREATE POLICY "Students can view their own registrations" ON event_registrations
FOR SELECT USING (auth.uid() = student_id);

-- Students can register for events
CREATE POLICY "Students can register for events" ON event_registrations
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Faculty can view registrations for their events
CREATE POLICY "Faculty can view registrations for their events" ON event_registrations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events 
        WHERE events.id = event_registrations.event_id 
        AND events.faculty_id = auth.uid()
    )
);

-- RLS Policies for event_attendance
-- Faculty can mark attendance for their events
CREATE POLICY "Faculty can mark attendance for their events" ON event_attendance
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM events 
        WHERE events.id = event_attendance.event_id 
        AND events.faculty_id = auth.uid()
    )
);

-- Students can view their own attendance
CREATE POLICY "Students can view their own attendance" ON event_attendance
FOR SELECT USING (auth.uid() = student_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_faculty_id ON events(faculty_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_registration_end ON events(registration_end);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance(event_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schema for Event Seat Assignments
CREATE TABLE IF NOT EXISTS event_seat_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    seat_number TEXT NOT NULL,
    venue_id TEXT NOT NULL, -- e.g., 'seminar-hall', 'solar-shade'
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(event_id, seat_number),
    UNIQUE(event_id, student_id)
);

-- Enable RLS for the new table
ALTER TABLE event_seat_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_seat_assignments
-- Faculty can view all seat assignments for their own events
CREATE POLICY "Faculty can view seat assignments for their events" ON event_seat_assignments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events
        WHERE events.id = event_seat_assignments.event_id
        AND events.faculty_id = auth.uid()
    )
);

-- Faculty can assign seats for their own events
CREATE POLICY "Faculty can assign seats for their events" ON event_seat_assignments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM events
        WHERE events.id = event_seat_assignments.event_id
        AND events.faculty_id = auth.uid()
    )
);

-- Students can view their own seat assignment
CREATE POLICY "Students can view their own seat assignment" ON event_seat_assignments
FOR SELECT USING (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_seat_assignments_event_id ON event_seat_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_seat_assignments_student_id ON event_seat_assignments(student_id);
