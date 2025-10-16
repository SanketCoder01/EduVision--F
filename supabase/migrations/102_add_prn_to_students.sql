-- Add PRN column to students table if not exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS prn TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_prn ON students(prn);

-- Update existing students with NULL prn to have a temporary value
UPDATE students SET prn = 'PRN' || LPAD(id::text, 10, '0') WHERE prn IS NULL;

