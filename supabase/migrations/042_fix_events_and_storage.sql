-- Fix Events Table and Storage Buckets
-- ============================================

-- Create events table if not exists
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT,
  event_time TEXT,
  venue TEXT,
  poster_url TEXT,
  max_participants INTEGER,
  target_departments TEXT[],
  enable_payment BOOLEAN DEFAULT false,
  payment_amount DECIMAL(10,2),
  allow_registration BOOLEAN DEFAULT false,
  registration_fields JSONB,
  seat_assignments JSONB,
  venue_type TEXT,
  event_type TEXT,
  faculty_id UUID REFERENCES faculty(id),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_faculty_id ON events(faculty_id);
CREATE INDEX IF NOT EXISTS idx_events_department ON events(department);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
DROP POLICY IF EXISTS "Faculty can create events" ON events;
CREATE POLICY "Faculty can create events"
ON events FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Faculty can view all events" ON events;
CREATE POLICY "Faculty can view all events"
ON events FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Faculty can update own events" ON events;
CREATE POLICY "Faculty can update own events"
ON events FOR UPDATE
USING (faculty_id = auth.uid());

-- Create event-posters storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('event-posters', 'event-posters', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- Create announcement-posters storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('announcement-posters', 'announcement-posters', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- Storage policies for event-posters
DROP POLICY IF EXISTS "Public Access to event posters" ON storage.objects;
CREATE POLICY "Public Access to event posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

DROP POLICY IF EXISTS "Authenticated users can upload event posters" ON storage.objects;
CREATE POLICY "Authenticated users can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-posters' AND auth.role() = 'authenticated');

-- Storage policies for announcement-posters
DROP POLICY IF EXISTS "Public Access to announcement posters" ON storage.objects;
CREATE POLICY "Public Access to announcement posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-posters');

DROP POLICY IF EXISTS "Authenticated users can upload announcement posters" ON storage.objects;
CREATE POLICY "Authenticated users can upload announcement posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'announcement-posters' AND auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Events table and storage buckets configured';
END $$;
