-- Migration: Queries System with Real-time Chat
-- Run in Supabase SQL Editor

-- ============================================================================
-- QUERIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student Info
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_department TEXT,
  student_year TEXT,
  
  -- Faculty Info
  faculty_id TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  
  -- Query Details
  subject TEXT,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- QUERY MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS query_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  
  -- Sender Info
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'faculty')),
  sender_name TEXT NOT NULL,
  
  -- Message
  message TEXT NOT NULL,
  
  -- Read Status
  is_read BOOLEAN DEFAULT FALSE,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_queries_student ON queries(student_id);
CREATE INDEX IF NOT EXISTS idx_queries_faculty ON queries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_query_messages_query ON query_messages(query_id);

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS queries;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS query_messages;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_messages ENABLE ROW LEVEL SECURITY;

-- Queries: Allow all for now (adjust based on auth)
CREATE POLICY "Allow all access to queries"
  ON queries FOR ALL
  USING (true)
  WITH CHECK (true);

-- Query Messages: Allow all for now
CREATE POLICY "Allow all access to query_messages"
  ON query_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
