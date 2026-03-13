-- Quiz System Enhancements for Real Dynamic Data
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add target_years to quizzes table for year-based targeting
-- ============================================
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS faculty_name TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT false;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT true;

-- ============================================
-- 2. Add more fields to quiz_attempts for detailed tracking
-- ============================================
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS score_percentage DECIMAL(5,2);
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';

-- ============================================
-- 3. Create quiz_leaderboard view for real-time rankings
-- ============================================
CREATE OR REPLACE VIEW quiz_leaderboard AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  s.email as student_email,
  s.department,
  s.year,
  COUNT(DISTINCT qa.quiz_id) as total_quizzes_completed,
  SUM(qa.marks_obtained) as total_marks_obtained,
  SUM(qa.total_marks) as total_max_marks,
  CASE 
    WHEN SUM(qa.total_marks) > 0 
    THEN ROUND((SUM(qa.marks_obtained)::DECIMAL / SUM(qa.total_marks)) * 100, 2)
    ELSE 0 
  END as average_score,
  RANK() OVER (
    PARTITION BY s.department, s.year 
    ORDER BY 
      CASE WHEN SUM(qa.total_marks) > 0 
           THEN SUM(qa.marks_obtained)::DECIMAL / SUM(qa.total_marks) 
           ELSE 0 
      END DESC
  ) as department_rank
FROM students s
LEFT JOIN quiz_attempts qa ON qa.student_id = s.id
GROUP BY s.id, s.name, s.email, s.department, s.year;

-- ============================================
-- 4. Create quiz_stats view for faculty dashboard
-- ============================================
CREATE OR REPLACE VIEW quiz_stats AS
SELECT 
  q.id as quiz_id,
  q.title,
  q.department,
  q.year,
  q.target_years,
  q.faculty_name,
  q.total_marks,
  q.start_time,
  q.end_time,
  COUNT(DISTINCT qa.id) as total_attempts,
  AVG(qa.marks_obtained) as avg_score,
  MAX(qa.marks_obtained) as highest_score,
  MIN(qa.marks_obtained) as lowest_score,
  ROUND(
    (COUNT(DISTINCT qa.id)::DECIMAL / NULLIF(
      (SELECT COUNT(*) FROM students WHERE department = q.department AND year = q.year), 
      0
    )) * 100, 2
  ) as participation_rate
FROM quizzes q
LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
GROUP BY q.id, q.title, q.department, q.year, q.target_years, q.faculty_name, 
         q.total_marks, q.start_time, q.end_time;

-- ============================================
-- 5. Enable realtime for quiz tables
-- ============================================
-- Note: ALTER PUBLICATION doesn't support IF NOT EXISTS directly
-- Tables are automatically available for realtime if RLS is enabled
-- Ensure RLS policies are set correctly for realtime access

-- Verify tables exist and have RLS enabled
DO $$
BEGIN
  -- Ensure tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
    ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
    ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_attempts') THEN
    ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- 6. Create notification trigger for new quizzes
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_quiz()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notifications for all students in target department/year
  INSERT INTO notifications (type, title, message, department, year, created_at, read)
  SELECT 
    'quiz',
    'New Quiz Available',
    'Quiz "' || NEW.title || '" has been published. Start: ' || TO_CHAR(NEW.start_time, 'Mon DD, HH:MI AM'),
    NEW.department,
    y.year_val,
    NOW(),
    false
  FROM unnest(NEW.target_years) AS y(year_val)
  WHERE NEW.is_published = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS quiz_notification_trigger ON quizzes;
CREATE TRIGGER quiz_notification_trigger
  AFTER INSERT OR UPDATE ON quizzes
  WHEN (NEW.is_published = true)
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_quiz();

-- ============================================
-- 7. Verify tables
-- ============================================
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'quizzes' ORDER BY ordinal_position;

SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' ORDER BY ordinal_position;
