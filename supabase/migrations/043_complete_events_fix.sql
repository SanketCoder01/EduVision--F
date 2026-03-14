-- =====================================================
-- COMPLETE EVENTS SYSTEM FIX
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. ADD ALL MISSING COLUMNS TO EVENTS TABLE
-- =====================================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS target_departments TEXT[],
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS enable_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS allow_registration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_fields JSONB,
ADD COLUMN IF NOT EXISTS seat_assignments JSONB,
ADD COLUMN IF NOT EXISTS venue_type TEXT,
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD COLUMN IF NOT EXISTS faculty_id UUID,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS registered_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attended_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Fix existing column names if needed
DO $$ 
BEGIN
    -- Rename 'date' to 'event_date' if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') THEN
        ALTER TABLE events RENAME COLUMN date TO event_date;
    END IF;
    
    -- Rename 'time' to 'event_time' if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'time') THEN
        ALTER TABLE events RENAME COLUMN time TO event_time;
    END IF;
END $$;

-- =====================================================
-- 2. CREATE EVENT_REGISTRATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS event_registrations CASCADE;

CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID,
    student_name TEXT NOT NULL,
    student_prn TEXT,
    student_email TEXT,
    student_class TEXT,
    paid BOOLEAN DEFAULT false,
    attended BOOLEAN DEFAULT false,
    registration_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_faculty_id ON events(faculty_id);
CREATE INDEX IF NOT EXISTS idx_events_department ON events(department);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(student_email);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES FOR EVENTS
-- =====================================================
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

DROP POLICY IF EXISTS "Faculty can delete own events" ON events;
CREATE POLICY "Faculty can delete own events"
ON events FOR DELETE
USING (faculty_id = auth.uid());

-- =====================================================
-- 6. RLS POLICIES FOR EVENT_REGISTRATIONS
-- =====================================================
DROP POLICY IF EXISTS "All can view registrations" ON event_registrations;
CREATE POLICY "All can view registrations"
ON event_registrations FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert registrations" ON event_registrations;
CREATE POLICY "Authenticated can insert registrations"
ON event_registrations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Faculty can update registrations" ON event_registrations;
CREATE POLICY "Faculty can update registrations"
ON event_registrations FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Students can update own registration" ON event_registrations;
CREATE POLICY "Students can update own registration"
ON event_registrations FOR UPDATE
USING (student_id = auth.uid());

-- =====================================================
-- 7. ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- =====================================================
-- 8. CREATE STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('event-posters', 'event-posters', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('announcement-posters', 'announcement-posters', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- =====================================================
-- 9. STORAGE POLICIES FOR EVENT-POSTERS
-- =====================================================
DROP POLICY IF EXISTS "Public Access to event posters" ON storage.objects;
CREATE POLICY "Public Access to event posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

DROP POLICY IF EXISTS "Authenticated users can upload event posters" ON storage.objects;
CREATE POLICY "Authenticated users can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-posters' AND auth.role() = 'authenticated');

-- =====================================================
-- 10. STORAGE POLICIES FOR ANNOUNCEMENT-POSTERS
-- =====================================================
DROP POLICY IF EXISTS "Public Access to announcement posters" ON storage.objects;
CREATE POLICY "Public Access to announcement posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-posters');

DROP POLICY IF EXISTS "Authenticated users can upload announcement posters" ON storage.objects;
CREATE POLICY "Authenticated users can upload announcement posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'announcement-posters' AND auth.role() = 'authenticated');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Events system migration completed successfully!';
    RAISE NOTICE '   - Added all missing columns to events table';
    RAISE NOTICE '   - Created event_registrations table';
    RAISE NOTICE '   - Created indexes for performance';
    RAISE NOTICE '   - Enabled RLS policies';
    RAISE NOTICE '   - Enabled realtime subscriptions';
    RAISE NOTICE '   - Created storage buckets';
END $$;
