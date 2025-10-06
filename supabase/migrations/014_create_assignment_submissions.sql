-- Create assignment_submissions table for student submissions
-- Aligned with EduVision department-year isolation system

-- Drop existing table if exists
DROP TABLE IF EXISTS assignment_submissions CASCADE;

-- Create assignment_submissions table
CREATE TABLE assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    student_email TEXT NOT NULL,
    student_department TEXT NOT NULL,
    student_year TEXT NOT NULL,
    submission_text TEXT,
    file_urls TEXT[] DEFAULT '{}',
    file_names TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
    grade INTEGER,
    max_grade INTEGER,
    feedback TEXT,
    is_late BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES faculty(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate submissions
ALTER TABLE assignment_submissions 
ADD CONSTRAINT unique_student_assignment_submission 
UNIQUE (assignment_id, student_id);

-- Enable RLS
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies aligned with department-year isolation
CREATE POLICY "Students can view own submissions" ON assignment_submissions
    FOR SELECT USING (
        student_id = auth.uid()
    );

CREATE POLICY "Students can insert own submissions" ON assignment_submissions
    FOR INSERT WITH CHECK (
        student_id = auth.uid()
    );

CREATE POLICY "Students can update own ungraded submissions" ON assignment_submissions
    FOR UPDATE USING (
        student_id = auth.uid() AND
        status = 'submitted'
    );

-- Faculty can only view/grade submissions for assignments they created in their department
CREATE POLICY "Faculty can view department submissions" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments a 
            JOIN faculty f ON f.id = a.faculty_id
            WHERE a.id = assignment_submissions.assignment_id 
            AND f.id = auth.uid()
            AND f.department = assignment_submissions.student_department
        )
    );

CREATE POLICY "Faculty can grade department submissions" ON assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments a 
            JOIN faculty f ON f.id = a.faculty_id
            WHERE a.id = assignment_submissions.assignment_id 
            AND f.id = auth.uid()
            AND f.department = assignment_submissions.student_department
        )
    );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_email ON assignment_submissions(student_email);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_department_year ON assignment_submissions(student_department, student_year);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_assignment_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignment_submissions_updated_at
    BEFORE UPDATE ON assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_assignment_submissions_updated_at();

-- Grant permissions
GRANT ALL ON assignment_submissions TO anon, authenticated;
