-- =====================================================
-- QUERIES/MESSAGING SYSTEM
-- =====================================================

-- 1. Create queries table for student-faculty messaging
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID,
    faculty_id UUID,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 2. Create query_messages table
CREATE TABLE IF NOT EXISTS query_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'faculty')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_queries_student_id ON queries(student_id);
CREATE INDEX IF NOT EXISTS idx_queries_faculty_id ON queries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_query_messages_query_id ON query_messages(query_id);
CREATE INDEX IF NOT EXISTS idx_query_messages_created_at ON query_messages(created_at);

-- 4. Enable RLS
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for queries
CREATE POLICY "Students can view own queries"
ON queries FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Faculty can view queries assigned to them"
ON queries FOR SELECT
USING (faculty_id = auth.uid());

CREATE POLICY "Students can create queries"
ON queries FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own queries"
ON queries FOR UPDATE
USING (student_id = auth.uid());

CREATE POLICY "Faculty can update queries"
ON queries FOR UPDATE
USING (faculty_id = auth.uid());

-- 6. RLS Policies for query_messages
CREATE POLICY "Can view messages for accessible queries"
ON query_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM queries 
        WHERE queries.id = query_messages.query_id 
        AND (queries.student_id = auth.uid() OR queries.faculty_id = auth.uid())
    )
);

CREATE POLICY "Students can insert messages"
ON query_messages FOR INSERT
WITH CHECK (sender_type = 'student' AND sender_id = auth.uid());

CREATE POLICY "Faculty can insert messages"
ON query_messages FOR INSERT
WITH CHECK (sender_type = 'faculty' AND sender_id = auth.uid());

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE queries;
ALTER PUBLICATION supabase_realtime ADD TABLE query_messages;

-- 8. Trigger to update updated_at on new message
CREATE OR REPLACE FUNCTION update_query_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE queries SET updated_at = NOW() WHERE id = NEW.query_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_query_timestamp
AFTER INSERT ON query_messages
FOR EACH ROW
EXECUTE FUNCTION update_query_timestamp();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Queries/Messaging system created successfully!';
END $$;
