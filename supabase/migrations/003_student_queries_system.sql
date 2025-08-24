-- Student Queries System
-- Table for student queries and faculty replies

CREATE TABLE IF NOT EXISTS student_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  faculty_id UUID,
  query_text TEXT NOT NULL,
  reply_text TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'academic', 'technical', 'event', 'assignment')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  replied_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_queries_student_id ON student_queries(student_id);
CREATE INDEX IF NOT EXISTS idx_student_queries_faculty_id ON student_queries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_queries_status ON student_queries(status);
CREATE INDEX IF NOT EXISTS idx_student_queries_created_at ON student_queries(created_at DESC);

-- Enable RLS
ALTER TABLE student_queries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Students can view their own queries" ON student_queries
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create queries" ON student_queries
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can view all queries" ON student_queries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM faculty 
      WHERE faculty.user_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can update queries (reply)" ON student_queries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM faculty 
      WHERE faculty.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_queries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.reply_text IS NOT NULL AND OLD.reply_text IS NULL THEN
    NEW.replied_at = NOW();
    NEW.status = 'replied';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_student_queries_updated_at
  BEFORE UPDATE ON student_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_student_queries_updated_at();
