-- Dean Dashboard Complete Schema
-- This migration creates all tables needed for the Dean Dashboard system

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create deans table
CREATE TABLE IF NOT EXISTS deans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    department VARCHAR(100) NOT NULL CHECK (department IN (
        'Computer Science & Engineering',
        'Cyber Security',
        'AI & Data Science',
        'AI & Machine Learning'
    )),
    phone VARCHAR(20),
    designation VARCHAR(100) DEFAULT 'Dean',
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_results table for exam result management
CREATE TABLE IF NOT EXISTS student_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50) NOT NULL, -- mid-term, end-term, internal
    marks INTEGER NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 100,
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pass', 'Fail')),
    weak_topics TEXT[],
    improvement_plan TEXT,
    remarks TEXT,
    uploaded_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create improvement_plans table
CREATE TABLE IF NOT EXISTS improvement_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    result_id UUID REFERENCES student_results(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    weak_topics TEXT[] NOT NULL,
    recommended_resources TEXT,
    target_completion_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    progress INTEGER DEFAULT 0,
    created_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retests table
CREATE TABLE IF NOT EXISTS retests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    original_result_id UUID REFERENCES student_results(id),
    subject VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    new_marks INTEGER,
    created_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dean_events table
CREATE TABLE IF NOT EXISTS dean_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- seminar, workshop, conference, cultural, sports
    department VARCHAR(100),
    target_years TEXT[],
    venue VARCHAR(255),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    registered_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(255),
    department VARCHAR(100),
    target_years TEXT[],
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_teams INTEGER,
    team_size INTEGER,
    prize_pool DECIMAL(10,2),
    rules TEXT,
    status VARCHAR(50) DEFAULT 'registration_open' CHECK (status IN ('registration_open', 'registration_closed', 'ongoing', 'completed')),
    created_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathon_teams table
CREATE TABLE IF NOT EXISTS hackathon_teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id UUID REFERENCES students(id),
    team_members UUID[],
    project_title VARCHAR(255),
    project_description TEXT,
    github_url TEXT,
    demo_url TEXT,
    score INTEGER,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create curriculum_optimization table
CREATE TABLE IF NOT EXISTS curriculum_optimization (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    current_syllabus TEXT,
    proposed_changes TEXT,
    industry_requirements TEXT,
    student_feedback_score DECIMAL(3,2),
    implementation_status VARCHAR(50) DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'implemented')),
    effective_from DATE,
    created_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty_performance table
CREATE TABLE IF NOT EXISTS faculty_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    evaluation_period VARCHAR(50), -- e.g., '2024-Semester-1'
    teaching_score DECIMAL(3,2),
    student_feedback_score DECIMAL(3,2),
    research_publications INTEGER DEFAULT 0,
    workshops_conducted INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2),
    innovation_score DECIMAL(3,2),
    overall_rating DECIMAL(3,2),
    remarks TEXT,
    evaluated_by UUID REFERENCES deans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create department_analytics table
CREATE TABLE IF NOT EXISTS department_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    subject VARCHAR(255),
    metric_type VARCHAR(50) NOT NULL, -- pass_rate, attendance, assignment_completion
    metric_value DECIMAL(5,2),
    comparison_period VARCHAR(50),
    trend VARCHAR(20), -- improving, declining, stable
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    insight_type VARCHAR(50) NOT NULL, -- risk_alert, recommendation, trend_analysis
    department VARCHAR(100),
    subject VARCHAR(255),
    severity VARCHAR(20), -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    recommended_action TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_progress_tracking table
CREATE TABLE IF NOT EXISTS student_progress_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    cgpa DECIMAL(4,2),
    sgpa DECIMAL(4,2),
    attendance_percentage DECIMAL(5,2),
    assignments_completed INTEGER DEFAULT 0,
    assignments_total INTEGER DEFAULT 0,
    quiz_average DECIMAL(5,2),
    behavioral_score DECIMAL(3,2),
    extracurricular_score DECIMAL(3,2),
    overall_performance VARCHAR(50), -- excellent, good, average, needs_improvement
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for dean
CREATE TABLE IF NOT EXISTS dean_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    dean_id UUID REFERENCES deans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50), -- alert, info, success, warning
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_student_results_department ON student_results(department);
CREATE INDEX idx_student_results_status ON student_results(status);
CREATE INDEX idx_student_results_student_id ON student_results(student_id);
CREATE INDEX idx_improvement_plans_student ON improvement_plans(student_id);
CREATE INDEX idx_improvement_plans_status ON improvement_plans(status);
CREATE INDEX idx_dean_events_department ON dean_events(department);
CREATE INDEX idx_dean_events_status ON dean_events(status);
CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_faculty_performance_faculty ON faculty_performance(faculty_id);
CREATE INDEX idx_department_analytics_dept ON department_analytics(department);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_student_progress_student ON student_progress_tracking(student_id);

-- Enable Row Level Security
ALTER TABLE deans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE retests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dean_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE dean_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deans
CREATE POLICY "Deans can view their own profile"
    ON deans FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Deans can update their own profile"
    ON deans FOR UPDATE
    USING (auth.uid()::text = id::text);

-- RLS Policies for student_results (Deans can view/manage all results in their department)
CREATE POLICY "Deans can view all results"
    ON student_results FOR SELECT
    USING (true);

CREATE POLICY "Deans can insert results"
    ON student_results FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Deans can update results"
    ON student_results FOR UPDATE
    USING (true);

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Deans can manage improvement plans"
    ON improvement_plans FOR ALL
    USING (true);

CREATE POLICY "Deans can manage retests"
    ON retests FOR ALL
    USING (true);

CREATE POLICY "Deans can manage events"
    ON dean_events FOR ALL
    USING (true);

CREATE POLICY "Deans can manage hackathons"
    ON hackathons FOR ALL
    USING (true);

CREATE POLICY "Students can view their own results"
    ON student_results FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can view their improvement plans"
    ON improvement_plans FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can view events"
    ON dean_events FOR SELECT
    USING (true);

CREATE POLICY "Students can view hackathons"
    ON hackathons FOR SELECT
    USING (true);

-- Insert default dean account
INSERT INTO deans (name, email, password, department, designation) 
VALUES (
    'Dr. Kavitha Rani',
    'dean@sanjivani.edu.in',
    '$2a$10$dummy.hash.for.password', -- This should be properly hashed
    'Computer Science & Engineering',
    'Dean of Engineering'
) ON CONFLICT (email) DO NOTHING;

-- Create trigger to auto-calculate percentage and grade
CREATE OR REPLACE FUNCTION calculate_result_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate percentage
    NEW.percentage := (NEW.marks::DECIMAL / NEW.total_marks) * 100;
    
    -- Determine grade
    IF NEW.percentage >= 90 THEN
        NEW.grade := 'A+';
    ELSIF NEW.percentage >= 80 THEN
        NEW.grade := 'A';
    ELSIF NEW.percentage >= 70 THEN
        NEW.grade := 'B+';
    ELSIF NEW.percentage >= 60 THEN
        NEW.grade := 'B';
    ELSIF NEW.percentage >= 50 THEN
        NEW.grade := 'C';
    ELSIF NEW.percentage >= 40 THEN
        NEW.grade := 'D';
    ELSE
        NEW.grade := 'F';
    END IF;
    
    -- Determine pass/fail
    IF NEW.marks >= (NEW.total_marks * 0.4) THEN
        NEW.status := 'Pass';
    ELSE
        NEW.status := 'Fail';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_student_result
    BEFORE INSERT ON student_results
    FOR EACH ROW
    EXECUTE FUNCTION calculate_result_metrics();

CREATE TRIGGER before_update_student_result
    BEFORE UPDATE ON student_results
    FOR EACH ROW
    EXECUTE FUNCTION calculate_result_metrics();
