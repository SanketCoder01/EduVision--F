-- Add missing columns to quiz_attempts table
-- These columns are needed for storing student info during quiz submission

-- Add department column
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS department TEXT;

-- Add year column
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS year TEXT;

-- Add student_email column if missing
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Add student_name column if missing
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS student_name TEXT;

-- Add answers column if missing (for storing question responses)
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS answers JSONB;

-- Add violations and tab_switches columns if missing
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS violations INTEGER DEFAULT 0;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0;

-- Add time_taken column (duration in seconds)
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS time_taken INTEGER DEFAULT 0;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_department ON quiz_attempts(department);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_year ON quiz_attempts(year);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_email ON quiz_attempts(student_email);
