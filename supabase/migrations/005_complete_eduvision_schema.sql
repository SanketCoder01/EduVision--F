-- Complete EduVision Platform Schema
-- Drop and recreate all tables with proper dependencies

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all tables in correct order (reverse dependency)
DROP TABLE IF EXISTS cafeteria_orders CASCADE;
DROP TABLE IF EXISTS ai_tutor_sessions CASCADE;
DROP TABLE IF EXISTS hackathon_registrations CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS student_queries CASCADE;
DROP TABLE IF EXISTS cafeteria_menu CASCADE;
DROP TABLE IF EXISTS hackathons CASCADE;
DROP TABLE IF EXISTS lost_found CASCADE;
DROP TABLE IF EXISTS grievances CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS queries CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;

-- Create faculty table
CREATE TABLE faculty (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    employee_id VARCHAR(50) UNIQUE,
    face_url TEXT,
    photo TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL CHECK (year IN ('first', 'second', 'third', 'fourth')),
    phone VARCHAR(20),
    address TEXT,
    face_url TEXT,
    photo TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    target_years TEXT[] DEFAULT '{}',
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('file_upload', 'text_based', 'quiz', 'coding')),
    max_marks INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    department VARCHAR(100),
    target_years TEXT[] DEFAULT '{}',
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    target_audience VARCHAR(20) CHECK (target_audience IN ('all', 'students', 'faculty')) DEFAULT 'students',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    department VARCHAR(100),
    target_years TEXT[] DEFAULT '{}',
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_groups table
CREATE TABLE study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_years TEXT[] DEFAULT '{}',
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 20,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grievances table
CREATE TABLE grievances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('academic', 'administrative', 'infrastructure', 'harassment', 'other')) DEFAULT 'other',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(30) CHECK (status IN ('submitted', 'under_review', 'resolved', 'closed')) DEFAULT 'submitted',
    department VARCHAR(100),
    assigned_to UUID REFERENCES faculty(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lost_found table
CREATE TABLE lost_found (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('lost', 'found')) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    contact_info VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'resolved', 'expired')) DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathons table
CREATE TABLE hackathons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    prize_pool VARCHAR(100),
    requirements TEXT,
    status VARCHAR(30) CHECK (status IN ('upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    department VARCHAR(100),
    target_years TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cafeteria_menu table
CREATE TABLE cafeteria_menu (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')) NOT NULL,
    items TEXT[] NOT NULL DEFAULT '{}',
    prices DECIMAL[] NOT NULL DEFAULT '{}',
    special_offers TEXT,
    availability BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_queries table
CREATE TABLE student_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id),
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    category VARCHAR(30) CHECK (category IN ('academic', 'assignment', 'exam', 'general')) DEFAULT 'general',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('open', 'answered', 'closed')) DEFAULT 'open',
    answer TEXT,
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timetable table
CREATE TABLE timetable (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    room_number VARCHAR(50),
    type VARCHAR(20) CHECK (type IN ('lecture', 'practical', 'tutorial')) DEFAULT 'lecture',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_materials table
CREATE TABLE study_materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_years TEXT[] NOT NULL DEFAULT '{}',
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'doc', 'ppt', 'video', 'other')) DEFAULT 'pdf',
    file_size BIGINT DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active', 'archived')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_tutor_sessions table
CREATE TABLE ai_tutor_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    ai_response TEXT,
    session_type VARCHAR(30) CHECK (session_type IN ('homework_help', 'concept_explanation', 'exam_prep', 'general')) DEFAULT 'general',
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_years TEXT[] NOT NULL DEFAULT '{}',
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    location VARCHAR(255),
    total_students INTEGER DEFAULT 0,
    present_students INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO faculty (name, full_name, email, department, designation, face_url) VALUES
('Dr. John Smith', 'Dr. John Michael Smith', 'john.smith@eduvision.edu', 'CSE', 'Professor', '/images/faculty/john-smith.jpg'),
('Dr. Sarah Johnson', 'Dr. Sarah Elizabeth Johnson', 'sarah.johnson@eduvision.edu', 'AIDS', 'Associate Professor', '/images/faculty/sarah-johnson.jpg'),
('Prof. Mike Wilson', 'Professor Michael Wilson', 'mike.wilson@eduvision.edu', 'CY', 'Assistant Professor', '/images/faculty/mike-wilson.jpg'),
('Dr. Lisa Brown', 'Dr. Lisa Marie Brown', 'lisa.brown@eduvision.edu', 'AIML', 'Professor', '/images/faculty/lisa-brown.jpg');

INSERT INTO students (name, full_name, email, prn, department, year, face_url) VALUES
('Rahul Sharma', 'Rahul Kumar Sharma', 'rahul.sharma@student.edu', '2024CSE001', 'CSE', 'second', '/images/students/rahul-sharma.jpg'),
('Priya Patel', 'Priya Rajesh Patel', 'priya.patel@student.edu', '2024CSE002', 'CSE', 'second', '/images/students/priya-patel.jpg'),
('Amit Singh', 'Amit Kumar Singh', 'amit.singh@student.edu', '2024AIDS001', 'AIDS', 'third', '/images/students/amit-singh.jpg'),
('Sneha Gupta', 'Sneha Anil Gupta', 'sneha.gupta@student.edu', '2024CY001', 'CY', 'first', '/images/students/sneha-gupta.jpg');

INSERT INTO assignments (title, description, faculty_id, department, target_years, assignment_type, max_marks, due_date, status) 
SELECT 
    'Data Structures Assignment 1',
    'Implement basic data structures including arrays, linked lists, and stacks',
    f.id,
    'CSE',
    ARRAY['second'],
    'coding',
    100,
    NOW() + INTERVAL '7 days',
    'published'
FROM faculty f WHERE f.department = 'CSE' LIMIT 1;

INSERT INTO announcements (title, content, department, target_years, faculty_id, priority)
SELECT 
    'Mid-term Exam Schedule',
    'Mid-term examinations will be conducted from next week. Please check the detailed schedule on the notice board.',
    'CSE',
    ARRAY['second', 'third'],
    f.id,
    'high'
FROM faculty f WHERE f.department = 'CSE' LIMIT 1;

INSERT INTO hackathons (title, description, organizer_id, start_date, end_date, registration_deadline, prize_pool, status, target_years)
SELECT 
    'AI Innovation Challenge 2024',
    'A 48-hour hackathon focused on developing innovative AI solutions for real-world problems.',
    f.id,
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '32 days',
    NOW() + INTERVAL '25 days',
    '₹1,00,000',
    'registration_open',
    ARRAY['second', 'third', 'fourth']
FROM faculty f WHERE f.department = 'CSE' LIMIT 1;

INSERT INTO cafeteria_menu (date, meal_type, items, prices, special_offers, availability) VALUES
(CURRENT_DATE, 'breakfast', ARRAY['Idli Sambar', 'Dosa', 'Upma', 'Tea', 'Coffee'], ARRAY[25, 30, 20, 10, 15], 'Buy 2 get 1 free on Tea/Coffee', true),
(CURRENT_DATE, 'lunch', ARRAY['Rice', 'Dal', 'Sabji', 'Roti', 'Curd'], ARRAY[40, 25, 30, 15, 20], 'Complete meal for ₹80', true),
(CURRENT_DATE, 'dinner', ARRAY['Fried Rice', 'Noodles', 'Manchurian', 'Soup'], ARRAY[50, 45, 35, 25], 'Combo meal for ₹90', true);

-- Enable RLS
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeteria_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public read access" ON faculty FOR SELECT USING (true);
CREATE POLICY "Public read access" ON students FOR SELECT USING (true);
CREATE POLICY "Public read access" ON assignments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Public read access" ON grievances FOR SELECT USING (true);
CREATE POLICY "Public read access" ON lost_found FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cafeteria_menu FOR SELECT USING (true);
CREATE POLICY "Public read access" ON student_queries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON timetable FOR SELECT USING (true);
CREATE POLICY "Public read access" ON study_materials FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ai_tutor_sessions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON attendance FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
