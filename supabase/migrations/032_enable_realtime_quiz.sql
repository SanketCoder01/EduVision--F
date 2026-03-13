-- Fix realtime for quiz_attempts and quiz_camera_frames
-- This ensures submissions appear in real-time for faculty

-- Enable realtime on quiz_attempts if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS quiz_attempts;

-- Enable realtime on quiz_camera_frames
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS quiz_camera_frames;

-- Enable realtime on quizzes
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS quizzes;

-- Add index for faster realtime queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON quiz_attempts(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_completed ON quiz_attempts(quiz_id, completed_at DESC);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON quiz_attempts TO authenticated;
GRANT ALL ON quiz_camera_frames TO authenticated;
