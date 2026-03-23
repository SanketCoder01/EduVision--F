-- Add results_published column to quizzes table
-- This allows faculty to control when students can see their results

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT false;

-- Add explanation column to quiz_questions if not exists
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quizzes_results_published ON quizzes(results_published);
