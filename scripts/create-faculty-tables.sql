-- Create faculty-specific tables and data

-- Create classes table for faculty to manage
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL CHECK (year IN ('first', 'second', 'third', 'fourth')),
    faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    semester VARCHAR(20),
    academic_year VARCHAR(20),
    max_students INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(100),
    year VARCHAR(20),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    organizer_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(100),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    UNIQUE(event_id, student_id)
);

-- Create virtual_classrooms table
CREATE TABLE IF NOT EXISTS virtual_classrooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    meeting_url TEXT,
    meeting_id VARCHAR(255),
    password VARCHAR(255),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES faculty(id),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(class_id, student_id, date)
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    grade DECIMAL(5,2) NOT NULL,
    max_grade DECIMAL(5,2) NOT NULL,
    grade_type VARCHAR(50) NOT NULL, -- 'assignment', 'quiz', 'exam', 'project'
    feedback TEXT,
    graded_by UUID REFERENCES faculty(id),
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty_notifications table
CREATE TABLE IF NOT EXISTS faculty_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'assignment_submission', 'student_query', 'system', 'reminder'
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- Can reference assignments, submissions, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_notifications table
CREATE TABLE IF NOT EXISTS student_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'assignment', 'grade', 'announcement', 'event', 'system'
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- Can reference assignments, grades, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_faculty ON classes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_classes_department_year ON classes(department, year);
CREATE INDEX IF NOT EXISTS idx_announcements_faculty ON announcements(faculty_id);
CREATE INDEX IF NOT EXISTS idx_announcements_department ON announcements(department);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_department ON events(department);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_virtual_classrooms_faculty ON virtual_classrooms(faculty_id);
CREATE INDEX IF NOT EXISTS idx_virtual_classrooms_class ON virtual_classrooms(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class ON grades(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_assignment ON grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_faculty_notifications_faculty ON faculty_notifications(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_student ON student_notifications(student_id);

-- Add triggers for updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample classes
INSERT INTO classes (name, department, year, subject, semester, academic_year) VALUES
('CSE-2A', 'cse', 'second', 'Data Structures and Algorithms', 'Fall', '2024-25'),
('CSE-2B', 'cse', 'second', 'Object Oriented Programming', 'Fall', '2024-25'),
('AIDS-1A', 'aids', 'first', 'Introduction to AI', 'Fall', '2024-25'),
('CY-3A', 'cy', 'third', 'Network Security', 'Fall', '2024-25'),
('AIML-1A', 'aiml', 'first', 'Machine Learning Basics', 'Fall', '2024-25')
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, content, department, priority, is_published, published_at) VALUES
('Welcome to New Academic Year', 'Welcome all students to the new academic year 2024-25. Please check your schedules and prepare for an exciting learning journey.', 'cse', 'high', true, NOW()),
('Assignment Submission Guidelines', 'Please follow the new assignment submission guidelines. All assignments must be submitted through the online portal.', 'aids', 'normal', true, NOW()),
('Cybersecurity Workshop', 'Join us for an exciting cybersecurity workshop next week. Registration is mandatory.', 'cy', 'high', true, NOW())
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, event_type, start_date, location, department, registration_required) VALUES
('Tech Fest 2024', 'Annual technical festival with competitions and workshops', 'Festival', NOW() + INTERVAL '30 days', 'Main Auditorium', 'cse', true),
('AI/ML Seminar', 'Latest trends in Artificial Intelligence and Machine Learning', 'Seminar', NOW() + INTERVAL '15 days', 'Conference Hall', 'aids', true),
('Cybersecurity Awareness', 'Workshop on cybersecurity best practices', 'Workshop', NOW() + INTERVAL '7 days', 'Lab 1', 'cy', true)
ON CONFLICT DO NOTHING;

COMMIT;
