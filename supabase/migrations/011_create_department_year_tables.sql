-- Create separate physical tables for each department-year combination
-- This ensures complete isolation between departments and years

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CREATE DEPARTMENT-YEAR SPECIFIC STUDENT TABLES
-- ========================================

-- CSE Department Tables
CREATE TABLE IF NOT EXISTS students_cse_1st_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CSE' CHECK (department = 'CSE'),
    year VARCHAR(10) DEFAULT 'first' CHECK (year = 'first'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cse_2nd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CSE' CHECK (department = 'CSE'),
    year VARCHAR(10) DEFAULT 'second' CHECK (year = 'second'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cse_3rd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CSE' CHECK (department = 'CSE'),
    year VARCHAR(10) DEFAULT 'third' CHECK (year = 'third'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cse_4th_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CSE' CHECK (department = 'CSE'),
    year VARCHAR(10) DEFAULT 'fourth' CHECK (year = 'fourth'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CYBER Department Tables
CREATE TABLE IF NOT EXISTS students_cyber_1st_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CYBER' CHECK (department = 'CYBER'),
    year VARCHAR(10) DEFAULT 'first' CHECK (year = 'first'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cyber_2nd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CYBER' CHECK (department = 'CYBER'),
    year VARCHAR(10) DEFAULT 'second' CHECK (year = 'second'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cyber_3rd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CYBER' CHECK (department = 'CYBER'),
    year VARCHAR(10) DEFAULT 'third' CHECK (year = 'third'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cyber_4th_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'CYBER' CHECK (department = 'CYBER'),
    year VARCHAR(10) DEFAULT 'fourth' CHECK (year = 'fourth'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIDS Department Tables
CREATE TABLE IF NOT EXISTS students_aids_1st_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIDS' CHECK (department = 'AIDS'),
    year VARCHAR(10) DEFAULT 'first' CHECK (year = 'first'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aids_2nd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIDS' CHECK (department = 'AIDS'),
    year VARCHAR(10) DEFAULT 'second' CHECK (year = 'second'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aids_3rd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIDS' CHECK (department = 'AIDS'),
    year VARCHAR(10) DEFAULT 'third' CHECK (year = 'third'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aids_4th_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIDS' CHECK (department = 'AIDS'),
    year VARCHAR(10) DEFAULT 'fourth' CHECK (year = 'fourth'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIML Department Tables
CREATE TABLE IF NOT EXISTS students_aiml_1st_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIML' CHECK (department = 'AIML'),
    year VARCHAR(10) DEFAULT 'first' CHECK (year = 'first'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aiml_2nd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIML' CHECK (department = 'AIML'),
    year VARCHAR(10) DEFAULT 'second' CHECK (year = 'second'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aiml_3rd_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIML' CHECK (department = 'AIML'),
    year VARCHAR(10) DEFAULT 'third' CHECK (year = 'third'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aiml_4th_year (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(10) DEFAULT 'AIML' CHECK (department = 'AIML'),
    year VARCHAR(10) DEFAULT 'fourth' CHECK (year = 'fourth'),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    admission_year INTEGER,
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ========================================

-- Enable RLS on all student tables
ALTER TABLE students_cse_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_4th_year ENABLE ROW LEVEL SECURITY;

ALTER TABLE students_cyber_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_4th_year ENABLE ROW LEVEL SECURITY;

ALTER TABLE students_aids_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_4th_year ENABLE ROW LEVEL SECURITY;

ALTER TABLE students_aiml_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_4th_year ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE RLS POLICIES FOR EACH TABLE
-- ========================================

-- CSE Department RLS Policies
CREATE POLICY "Students can only access their own record" ON students_cse_1st_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_cse_2nd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_cse_3rd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_cse_4th_year
    FOR ALL USING (id = auth.uid());

-- CYBER Department RLS Policies
CREATE POLICY "Students can only access their own record" ON students_cyber_1st_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_cyber_2nd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_cyber_3rd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_cyber_4th_year
    FOR ALL USING (id = auth.uid());

-- AIDS Department RLS Policies
CREATE POLICY "Students can only access their own record" ON students_aids_1st_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_aids_2nd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_aids_3rd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_aids_4th_year
    FOR ALL USING (id = auth.uid());

-- AIML Department RLS Policies
CREATE POLICY "Students can only access their own record" ON students_aiml_1st_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_aiml_2nd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_aiml_3rd_year
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Students can only access their own record" ON students_aiml_4th_year
    FOR ALL USING (id = auth.uid());

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Create indexes on email and prn for all tables
CREATE INDEX IF NOT EXISTS idx_students_cse_1st_year_email ON students_cse_1st_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cse_1st_year_prn ON students_cse_1st_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cse_2nd_year_email ON students_cse_2nd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cse_2nd_year_prn ON students_cse_2nd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cse_3rd_year_email ON students_cse_3rd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cse_3rd_year_prn ON students_cse_3rd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cse_4th_year_email ON students_cse_4th_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cse_4th_year_prn ON students_cse_4th_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cyber_1st_year_email ON students_cyber_1st_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cyber_1st_year_prn ON students_cyber_1st_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cyber_2nd_year_email ON students_cyber_2nd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cyber_2nd_year_prn ON students_cyber_2nd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cyber_3rd_year_email ON students_cyber_3rd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cyber_3rd_year_prn ON students_cyber_3rd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_cyber_4th_year_email ON students_cyber_4th_year(email);
CREATE INDEX IF NOT EXISTS idx_students_cyber_4th_year_prn ON students_cyber_4th_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aids_1st_year_email ON students_aids_1st_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aids_1st_year_prn ON students_aids_1st_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aids_2nd_year_email ON students_aids_2nd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aids_2nd_year_prn ON students_aids_2nd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aids_3rd_year_email ON students_aids_3rd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aids_3rd_year_prn ON students_aids_3rd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aids_4th_year_email ON students_aids_4th_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aids_4th_year_prn ON students_aids_4th_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aiml_1st_year_email ON students_aiml_1st_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aiml_1st_year_prn ON students_aiml_1st_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aiml_2nd_year_email ON students_aiml_2nd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aiml_2nd_year_prn ON students_aiml_2nd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aiml_3rd_year_email ON students_aiml_3rd_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aiml_3rd_year_prn ON students_aiml_3rd_year(prn);

CREATE INDEX IF NOT EXISTS idx_students_aiml_4th_year_email ON students_aiml_4th_year(email);
CREATE INDEX IF NOT EXISTS idx_students_aiml_4th_year_prn ON students_aiml_4th_year(prn);

-- ========================================
-- ADD MISSING COLUMNS IF NOT EXISTS
-- ========================================

-- Add admission_year column to all tables if it doesn't exist
ALTER TABLE students_cse_1st_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cse_2nd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cse_3rd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cse_4th_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cyber_1st_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cyber_2nd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cyber_3rd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_cyber_4th_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aids_1st_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aids_2nd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aids_3rd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aids_4th_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aiml_1st_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aiml_2nd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aiml_3rd_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;
ALTER TABLE students_aiml_4th_year ADD COLUMN IF NOT EXISTS admission_year INTEGER;

-- ========================================
-- INSERT SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample students for testing
INSERT INTO students_cse_2nd_year (name, email, prn, admission_year) VALUES
('Sanket Gaikwad', 'sanket.gaikwad_24uce@sanjivani.edu.in', 'CSE2024001', 2024),
('Test Student CSE 2nd', 'test.cse.2nd@sanjivani.edu.in', 'CSE2024002', 2024)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students_cse_3rd_year (name, email, prn, phone, address, date_of_birth, blood_group, emergency_contact, parent_name, parent_phone, admission_year) VALUES
('Sanket Gaikwad', 'sanket.gaikwad@sanjivani.edu.in', 'CSE2023001', '+91-9876543210', 'Ahmednagar, Maharashtra', '2002-05-15', 'O+', '+91-9876543211', 'Mr. Gaikwad', '+91-9876543211', 2023),
('Test Student CSE 3rd', 'test.cse.3rd@sanjivani.edu.in', 'CSE2023002', 2023)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students_aids_2nd_year (name, email, prn, admission_year) VALUES
('Test Student AIDS 2nd', 'test.aids.2nd@sanjivani.edu.in', 'AIDS2024001', 2024)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students_aids_3rd_year (name, email, prn, admission_year) VALUES
('Test Student AIDS 3rd', 'test.aids.3rd@sanjivani.edu.in', 'AIDS2023001', 2023)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students_aiml_2nd_year (name, email, prn, admission_year) VALUES
('Test Student AIML 2nd', 'test.aiml.2nd@sanjivani.edu.in', 'AIML2024001', 2024)
ON CONFLICT (email) DO NOTHING;

INSERT INTO students_cyber_2nd_year (name, email, prn, admission_year) VALUES
('Test Student CYBER 2nd', 'test.cyber.2nd@sanjivani.edu.in', 'CYBER2024001', 2024)
ON CONFLICT (email) DO NOTHING;
