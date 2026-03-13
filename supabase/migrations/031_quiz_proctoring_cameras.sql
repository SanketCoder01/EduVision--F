-- Quiz Proctoring Camera Feeds
-- Stores real-time camera frames for faculty monitoring

-- Create table for camera frames
CREATE TABLE IF NOT EXISTS quiz_camera_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  frame_data TEXT, -- Base64 encoded image
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  face_detected BOOLEAN DEFAULT true
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_camera_frames_quiz ON quiz_camera_frames(quiz_id);
CREATE INDEX IF NOT EXISTS idx_camera_frames_student ON quiz_camera_frames(student_id);
CREATE INDEX IF NOT EXISTS idx_camera_frames_timestamp ON quiz_camera_frames(timestamp DESC);

-- Enable RLS
ALTER TABLE quiz_camera_frames ENABLE ROW LEVEL SECURITY;

-- Policy: Faculty can view camera frames for their quizzes
CREATE POLICY "Faculty can view camera frames" ON quiz_camera_frames
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN faculty ON faculty.email = current_setting('request.jwt.claims', true)::json->>'email'
      WHERE quizzes.id = quiz_camera_frames.quiz_id 
      AND quizzes.faculty_id = faculty.id
    )
  );

-- Policy: Students can insert their own camera frames
CREATE POLICY "Students can insert own frames" ON quiz_camera_frames
  FOR INSERT 
  WITH CHECK (
    student_id IN (
      SELECT id FROM students 
      WHERE students.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Policy: Students can delete their own frames
CREATE POLICY "Students can delete own frames" ON quiz_camera_frames
  FOR DELETE 
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE students.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_camera_frames;

-- Create a view for latest frames per student
CREATE OR REPLACE VIEW latest_camera_frames AS
SELECT DISTINCT ON (quiz_id, student_id)
  id, quiz_id, student_id, student_name, frame_data, timestamp, face_detected
FROM quiz_camera_frames
ORDER BY quiz_id, student_id, timestamp DESC;
