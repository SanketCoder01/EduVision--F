-- Add missing columns to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'students';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_years TEXT[];
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_department ON announcements(department);
CREATE INDEX IF NOT EXISTS idx_announcements_faculty_id ON announcements(faculty_id);
CREATE INDEX IF NOT EXISTS idx_announcements_target_years ON announcements USING GIN(target_years);
