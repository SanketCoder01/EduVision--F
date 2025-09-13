-- Comprehensive EduVision Features Schema
-- This migration adds all missing tables for the complete EduVision platform

-- Ensure students and faculty tables exist with proper columns
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS lost_found (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS cafeteria_menu (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS student_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS timetable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create hackathon_registrations table
CREATE TABLE IF NOT EXISTS hackathon_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    team_name VARCHAR(255),
    team_members TEXT[] DEFAULT '{}',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) CHECK (status IN ('registered', 'confirmed', 'cancelled')) DEFAULT 'registered',
    UNIQUE(hackathon_id, student_id)
);

-- Create ai_tutor_sessions table
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    ai_response TEXT,
    session_type VARCHAR(30) CHECK (session_type IN ('homework_help', 'concept_explanation', 'exam_prep', 'general')) DEFAULT 'general',
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cafeteria_orders table
CREATE TABLE IF NOT EXISTS cafeteria_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES cafeteria_menu(id) ON DELETE CASCADE,
    items TEXT[] NOT NULL DEFAULT '{}',
    quantities INTEGER[] NOT NULL DEFAULT '{}',
    total_amount DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(20) CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
    order_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pickup_time TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grievances_student_id ON grievances(student_id);
CREATE INDEX IF NOT EXISTS idx_grievances_department ON grievances(department);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at);

CREATE INDEX IF NOT EXISTS idx_lost_found_student_id ON lost_found(student_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_type ON lost_found(type);
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON lost_found(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_created_at ON lost_found(created_at);

CREATE INDEX IF NOT EXISTS idx_hackathons_organizer_id ON hackathons(organizer_id);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_department ON hackathons(department);
CREATE INDEX IF NOT EXISTS idx_hackathons_start_date ON hackathons(start_date);

CREATE INDEX IF NOT EXISTS idx_cafeteria_menu_date ON cafeteria_menu(date);
CREATE INDEX IF NOT EXISTS idx_cafeteria_menu_meal_type ON cafeteria_menu(meal_type);
CREATE INDEX IF NOT EXISTS idx_cafeteria_menu_availability ON cafeteria_menu(availability);

CREATE INDEX IF NOT EXISTS idx_student_queries_student_id ON student_queries(student_id);
CREATE INDEX IF NOT EXISTS idx_student_queries_faculty_id ON student_queries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_queries_status ON student_queries(status);
CREATE INDEX IF NOT EXISTS idx_student_queries_created_at ON student_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_timetable_department_year ON timetable(department, year);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty_id ON timetable(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day_time ON timetable(day_of_week, start_time);

CREATE INDEX IF NOT EXISTS idx_study_materials_department ON study_materials(department);
CREATE INDEX IF NOT EXISTS idx_study_materials_faculty_id ON study_materials(faculty_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_status ON study_materials(status);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON study_materials(created_at);

CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_hackathon_id ON hackathon_registrations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_student_id ON hackathon_registrations(student_id);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_student_id ON ai_tutor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_created_at ON ai_tutor_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_student_id ON cafeteria_orders(student_id);
CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_status ON cafeteria_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_cafeteria_orders_order_time ON cafeteria_orders(order_time);

-- Enable Row Level Security on all tables
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeteria_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeteria_orders ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Grievances policies
CREATE POLICY "Students can view their own grievances" ON grievances
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create grievances" ON grievances
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Faculty can view grievances in their department" ON grievances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = auth.uid() 
            AND (faculty.department = grievances.department OR grievances.department IS NULL)
        )
    );

CREATE POLICY "Faculty can update assigned grievances" ON grievances
    FOR UPDATE USING (auth.uid() = assigned_to);

-- Lost and Found policies
CREATE POLICY "Students can view all lost and found items" ON lost_found
    FOR SELECT USING (true);

CREATE POLICY "Students can create lost and found items" ON lost_found
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own lost and found items" ON lost_found
    FOR UPDATE USING (auth.uid() = student_id);

-- Hackathons policies
CREATE POLICY "Everyone can view active hackathons" ON hackathons
    FOR SELECT USING (status IN ('upcoming', 'registration_open', 'ongoing'));

CREATE POLICY "Faculty can create hackathons" ON hackathons
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Faculty can update their own hackathons" ON hackathons
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Cafeteria menu policies
CREATE POLICY "Everyone can view cafeteria menu" ON cafeteria_menu
    FOR SELECT USING (availability = true);

CREATE POLICY "Admin can manage cafeteria menu" ON cafeteria_menu
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = auth.uid() 
            AND faculty.designation = 'Admin'
        )
    );

-- Student queries policies
CREATE POLICY "Students can view their own queries" ON student_queries
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create queries" ON student_queries
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Faculty can view queries assigned to them or in their department" ON student_queries
    FOR SELECT USING (
        auth.uid() = faculty_id OR
        EXISTS (
            SELECT 1 FROM faculty f, students s
            WHERE f.id = auth.uid() 
            AND s.id = student_queries.student_id
            AND f.department = s.department
        )
    );

CREATE POLICY "Faculty can update queries assigned to them" ON student_queries
    FOR UPDATE USING (auth.uid() = faculty_id);

-- Timetable policies
CREATE POLICY "Students can view timetable for their department and year" ON timetable
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.department = timetable.department 
            AND students.year = timetable.year
        )
    );

CREATE POLICY "Faculty can view their own timetable" ON timetable
    FOR SELECT USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can manage their own timetable" ON timetable
    FOR ALL USING (auth.uid() = faculty_id);

-- Study materials policies
CREATE POLICY "Students can view study materials for their department and year" ON study_materials
    FOR SELECT USING (
        status = 'active' AND
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.department = study_materials.department 
            AND students.year = ANY(study_materials.target_years)
        )
    );

CREATE POLICY "Faculty can manage their own study materials" ON study_materials
    FOR ALL USING (auth.uid() = faculty_id);

-- Hackathon registrations policies
CREATE POLICY "Students can view their own registrations" ON hackathon_registrations
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create registrations" ON hackathon_registrations
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own registrations" ON hackathon_registrations
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Faculty can view registrations for their hackathons" ON hackathon_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hackathons 
            WHERE hackathons.id = hackathon_registrations.hackathon_id 
            AND hackathons.organizer_id = auth.uid()
        )
    );

-- AI tutor sessions policies
CREATE POLICY "Students can view their own AI tutor sessions" ON ai_tutor_sessions
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create AI tutor sessions" ON ai_tutor_sessions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own AI tutor sessions" ON ai_tutor_sessions
    FOR UPDATE USING (auth.uid() = student_id);

-- Cafeteria orders policies
CREATE POLICY "Students can view their own orders" ON cafeteria_orders
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create orders" ON cafeteria_orders
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own orders" ON cafeteria_orders
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Cafeteria staff can view and update all orders" ON cafeteria_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = auth.uid() 
            AND faculty.designation IN ('Admin', 'Cafeteria Manager')
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON grievances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafeteria_menu_updated_at BEFORE UPDATE ON cafeteria_menu
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing

-- Sample grievances (only if students exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM students WHERE department = 'CSE' LIMIT 1) THEN
        INSERT INTO grievances (student_id, title, description, category, priority, department) 
        SELECT 
            s.id,
            'Laboratory Equipment Issue',
            'The computers in Lab 301 are not working properly and need immediate attention.',
            'infrastructure',
            'high',
            s.department
        FROM students s 
        WHERE s.department = 'CSE' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Sample hackathons (only if faculty exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM faculty WHERE department = 'CSE' LIMIT 1) THEN
        INSERT INTO hackathons (title, description, organizer_id, start_date, end_date, registration_deadline, prize_pool, status, department, target_years)
        SELECT 
            'AI Innovation Challenge 2024',
            'A 48-hour hackathon focused on developing innovative AI solutions for real-world problems.',
            f.id,
            NOW() + INTERVAL '30 days',
            NOW() + INTERVAL '32 days',
            NOW() + INTERVAL '25 days',
            '₹1,00,000',
            'registration_open',
            f.department,
            ARRAY['second', 'third', 'fourth']
        FROM faculty f 
        WHERE f.department = 'CSE' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Sample cafeteria menu
INSERT INTO cafeteria_menu (date, meal_type, items, prices, special_offers, availability)
VALUES 
    (CURRENT_DATE, 'breakfast', ARRAY['Idli Sambar', 'Dosa', 'Upma', 'Tea', 'Coffee'], ARRAY[25, 30, 20, 10, 15], 'Buy 2 get 1 free on Tea/Coffee', true),
    (CURRENT_DATE, 'lunch', ARRAY['Rice', 'Dal', 'Sabji', 'Roti', 'Curd'], ARRAY[40, 25, 30, 15, 20], 'Complete meal for ₹80', true),
    (CURRENT_DATE, 'dinner', ARRAY['Fried Rice', 'Noodles', 'Manchurian', 'Soup'], ARRAY[50, 45, 35, 25], 'Combo meal for ₹90', true),
    (CURRENT_DATE, 'snacks', ARRAY['Samosa', 'Pakoda', 'Sandwich', 'Cold Drink'], ARRAY[15, 20, 35, 25], '20% off on snacks after 4 PM', true)
ON CONFLICT DO NOTHING;

-- Sample student queries (only if students exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM students WHERE department = 'CSE' LIMIT 1) THEN
        INSERT INTO student_queries (student_id, subject, question, category, priority)
        SELECT 
            s.id,
            'Data Structures',
            'Can you explain the difference between Stack and Queue data structures with examples?',
            'academic',
            'medium'
        FROM students s 
        WHERE s.department = 'CSE' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Sample timetable (only if faculty exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM faculty WHERE department = 'CSE' LIMIT 1) THEN
        INSERT INTO timetable (department, year, day_of_week, start_time, end_time, subject, faculty_id, room_number, type)
        SELECT 
            'CSE',
            'second',
            1, -- Monday
            '09:00:00',
            '10:00:00',
            'Data Structures',
            f.id,
            '301',
            'lecture'
        FROM faculty f 
        WHERE f.department = 'CSE' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Sample study materials (only if faculty exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM faculty WHERE department = 'CSE' LIMIT 1) THEN
        INSERT INTO study_materials (title, description, subject, department, target_years, faculty_id, file_url, file_type)
        SELECT 
            'Data Structures Notes - Chapter 1',
            'Comprehensive notes covering basic data structures including arrays, linked lists, and stacks.',
            'Data Structures',
            f.department,
            ARRAY['second'],
            f.id,
            '/study-materials/ds-chapter1.pdf',
            'pdf'
        FROM faculty f 
        WHERE f.department = 'CSE' 
        LIMIT 1
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE grievances;
ALTER PUBLICATION supabase_realtime ADD TABLE lost_found;
ALTER PUBLICATION supabase_realtime ADD TABLE hackathons;
ALTER PUBLICATION supabase_realtime ADD TABLE cafeteria_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE student_queries;
ALTER PUBLICATION supabase_realtime ADD TABLE timetable;
ALTER PUBLICATION supabase_realtime ADD TABLE study_materials;
ALTER PUBLICATION supabase_realtime ADD TABLE hackathon_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_tutor_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE cafeteria_orders;
