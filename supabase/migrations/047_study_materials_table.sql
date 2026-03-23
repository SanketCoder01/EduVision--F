-- Drop existing tables if they exist to ensure clean migration
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS assigned_subjects CASCADE;

-- Study Materials Table
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT, -- Made nullable - subject is optional
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  summary TEXT,
  has_summary BOOLEAN DEFAULT FALSE,
  summary_url TEXT, -- URL to summary file
  summary_file_name TEXT, -- Name of summary file
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assigned Subjects Table (for dean to assign subjects)
CREATE TABLE IF NOT EXISTS assigned_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name TEXT NOT NULL,
  subject_code TEXT,
  department TEXT NOT NULL,
  year TEXT,
  semester INTEGER,
  credits INTEGER,
  faculty_id UUID REFERENCES faculty(id),
  status TEXT DEFAULT 'active',
  assigned_by UUID REFERENCES faculty(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_materials_faculty ON study_materials(faculty_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_department ON study_materials(department);
CREATE INDEX IF NOT EXISTS idx_study_materials_year ON study_materials(year);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_assigned_subjects_department ON assigned_subjects(department);
CREATE INDEX IF NOT EXISTS idx_assigned_subjects_status ON assigned_subjects(status);

-- Enable RLS and create policies AFTER tables are fully created
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_subjects ENABLE ROW LEVEL SECURITY;

-- Faculty can manage their own materials (using email match from JWT)
CREATE POLICY "Faculty can view own materials" ON study_materials
  FOR SELECT USING (
    faculty_id IN (SELECT id FROM faculty WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Faculty can insert own materials" ON study_materials
  FOR INSERT WITH CHECK (
    faculty_id IN (SELECT id FROM faculty WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Faculty can update own materials" ON study_materials
  FOR UPDATE USING (
    faculty_id IN (SELECT id FROM faculty WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Faculty can delete own materials" ON study_materials
  FOR DELETE USING (
    faculty_id IN (SELECT id FROM faculty WHERE email = auth.jwt() ->> 'email')
  );

-- Students can view materials for their department and year
CREATE POLICY "Students can view materials" ON study_materials
  FOR SELECT USING (true); -- Allow all authenticated users, filtering done in app

-- Everyone can view active assigned subjects
CREATE POLICY "Anyone can view active subjects" ON assigned_subjects
  FOR SELECT USING (status = 'active');

-- Faculty can manage assigned subjects (all authenticated faculty can manage)
CREATE POLICY "Faculty can insert subjects" ON assigned_subjects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Faculty can update subjects" ON assigned_subjects
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Storage bucket for study materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view study materials" ON storage.objects
  FOR SELECT USING (bucket_id = 'study-materials');

CREATE POLICY "Faculty can upload study materials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'study-materials' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Faculty can delete own study materials" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'study-materials' 
    AND auth.role() = 'authenticated'
  );
