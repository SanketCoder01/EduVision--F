-- Create study_materials table for EduVision
-- This table stores metadata for uploaded study materials

CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_study_materials_dept_year ON study_materials(department, year);
CREATE INDEX IF NOT EXISTS idx_study_materials_faculty ON study_materials(faculty_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_uploaded_at ON study_materials(uploaded_at DESC);

-- Enable Row Level Security (optional - since we removed auth)
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since auth is removed)
CREATE POLICY "Allow all operations on study_materials" ON study_materials
    FOR ALL USING (true) WITH CHECK (true);
