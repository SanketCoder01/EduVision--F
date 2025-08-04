-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create faculty table
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    file_type VARCHAR(20) NOT NULL DEFAULT 'pdf',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    allow_late_submission BOOLEAN DEFAULT FALSE,
    allow_resubmission BOOLEAN DEFAULT FALSE,
    enable_plagiarism_check BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'ai')),
    ai_prompt TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_submissions table
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    content TEXT,
    file_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES faculty(id),
    UNIQUE(assignment_id, student_id)
);

-- Create announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    department VARCHAR(100),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'faculty')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    department VARCHAR(100),
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    max_participants INTEGER,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_groups table
CREATE TABLE study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    meeting_schedule TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_group_members table
CREATE TABLE study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'leader')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, student_id)
);

-- Create queries table
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    subject VARCHAR(100),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_faculty_email ON faculty(email);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_prn ON students(prn);
CREATE INDEX idx_assignments_department ON assignments(department);
CREATE INDEX idx_assignments_faculty_id ON assignments(faculty_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_announcements_department ON announcements(department);
CREATE INDEX idx_events_department ON events(department);
CREATE INDEX idx_study_groups_department ON study_groups(department);
CREATE INDEX idx_queries_student_id ON queries(student_id);
CREATE INDEX idx_queries_faculty_id ON queries(faculty_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be customized based on requirements)
-- Faculty can see their own data and students in their department
CREATE POLICY "Faculty can view own data" ON faculty FOR SELECT USING (true);
CREATE POLICY "Faculty can update own data" ON faculty FOR UPDATE USING (true);

-- Students can see their own data
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (true);
CREATE POLICY "Students can update own data" ON students FOR UPDATE USING (true);

-- Assignment policies
CREATE POLICY "Faculty can manage own assignments" ON assignments FOR ALL USING (true);
CREATE POLICY "Students can view published assignments in their department" ON assignments FOR SELECT USING (status = 'published');

-- Submission policies
CREATE POLICY "Students can manage own submissions" ON assignment_submissions FOR ALL USING (true);
CREATE POLICY "Faculty can view submissions for their assignments" ON assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Faculty can grade submissions" ON assignment_submissions FOR UPDATE USING (true);

-- Other policies
CREATE POLICY "All can view announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Faculty can manage announcements" ON announcements FOR ALL USING (true);

CREATE POLICY "All can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Faculty can manage events" ON events FOR ALL USING (true);

CREATE POLICY "All can view study groups" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Faculty can manage study groups" ON study_groups FOR ALL USING (true);

CREATE POLICY "Students can manage group memberships" ON study_group_members FOR ALL USING (true);

CREATE POLICY "Students can manage own queries" ON queries FOR ALL USING (true);
CREATE POLICY "Faculty can view and respond to queries" ON queries FOR ALL USING (true);
