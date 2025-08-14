-- Schema for the Grievance Module
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
