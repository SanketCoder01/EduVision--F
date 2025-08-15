-- Add face/profile columns to students and faculty if missing
ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS face_registered boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS face_url text,
  ADD COLUMN IF NOT EXISTS photo text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS faculty
  ADD COLUMN IF NOT EXISTS face_registered boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS face_url text,
  ADD COLUMN IF NOT EXISTS photo text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Optional: helpful index
CREATE INDEX IF NOT EXISTS idx_students_face_registered ON students(face_registered);
CREATE INDEX IF NOT EXISTS idx_faculty_face_registered ON faculty(face_registered);
