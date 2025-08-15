-- Updated assignments table schema for department-based access control
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    faculty_id UUID NOT NULL REFERENCES faculty(id),
    faculty_department TEXT NOT NULL,
    target_years TEXT[] DEFAULT '{}', -- Array of years like ['1st Year', '2nd Year']
    assignment_type TEXT DEFAULT 'assignment',
    allowed_file_types TEXT[] DEFAULT '{}',
    word_limit INTEGER,
    max_marks INTEGER DEFAULT 100,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    visibility BOOLEAN DEFAULT false,
    allow_late_submission BOOLEAN DEFAULT false,
    allow_resubmission BOOLEAN DEFAULT false,
    enable_plagiarism_check BOOLEAN DEFAULT false,
    allow_group_submission BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update other services tables for department filtering
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    faculty_id UUID REFERENCES faculty(id),
    department TEXT NOT NULL,
    target_years TEXT[] DEFAULT '{}',
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update announcements for department targeting
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- Update timetables for department filtering
ALTER TABLE timetables 
ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS year TEXT NOT NULL DEFAULT '';

-- Update study_materials for department filtering
ALTER TABLE study_materials 
ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS year TEXT NOT NULL DEFAULT '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_faculty_dept ON assignments(faculty_id, faculty_department);
CREATE INDEX IF NOT EXISTS idx_assignments_target_years ON assignments USING GIN(target_years);
CREATE INDEX IF NOT EXISTS idx_announcements_dept_years ON announcements(department) WHERE department IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_study_groups_dept_years ON study_groups(department);
