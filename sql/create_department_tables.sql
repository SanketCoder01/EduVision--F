-- Create department-specific student tables
CREATE TABLE IF NOT EXISTS students_cse (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'CSE',
    year INTEGER CHECK (year >= 1 AND year <= 4),
    prn VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_cyber (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'Cyber Security',
    year INTEGER CHECK (year >= 1 AND year <= 4),
    prn VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'AIDS',
    year INTEGER CHECK (year >= 1 AND year <= 4),
    prn VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_aiml (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'AIML',
    year INTEGER CHECK (year >= 1 AND year <= 4),
    prn VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create department-specific faculty tables
CREATE TABLE IF NOT EXISTS faculty_cse (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'CSE',
    employee_id VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_cyber (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'Cyber Security',
    employee_id VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_aids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'AIDS',
    employee_id VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_aiml (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) DEFAULT 'AIML',
    employee_id VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    face_url TEXT,
    face_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create face encoding tables for each department
CREATE TABLE IF NOT EXISTS student_faces_cse (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students_cse(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_faces_cyber (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students_cyber(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_faces_aids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students_aids(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_faces_aiml (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students_aiml(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_faces_cse (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty_cse(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_faces_cyber (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty_cyber(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_faces_aids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty_aids(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty_faces_aiml (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty_aiml(id) ON DELETE CASCADE,
    face_encoding BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_cse_email ON students_cse(email);
CREATE INDEX IF NOT EXISTS idx_students_cyber_email ON students_cyber(email);
CREATE INDEX IF NOT EXISTS idx_students_aids_email ON students_aids(email);
CREATE INDEX IF NOT EXISTS idx_students_aiml_email ON students_aiml(email);

CREATE INDEX IF NOT EXISTS idx_faculty_cse_email ON faculty_cse(email);
CREATE INDEX IF NOT EXISTS idx_faculty_cyber_email ON faculty_cyber(email);
CREATE INDEX IF NOT EXISTS idx_faculty_aids_email ON faculty_aids(email);
CREATE INDEX IF NOT EXISTS idx_faculty_aiml_email ON faculty_aiml(email);
