-- Department-Year isolation setup: 16 separate physical tables
-- Created at: 2025-08-16

-- 1) Create base student table structure function
CREATE OR REPLACE FUNCTION create_student_table_structure()
RETURNS text LANGUAGE sql AS $$
  SELECT '
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(50) UNIQUE,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    photo VARCHAR(500),
    face_url VARCHAR(500),
    face_registered BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT ''active'' CHECK (status IN (''active'', ''inactive'', ''suspended'')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  '
$$;

-- 2) Create 16 separate physical student tables

-- CSE Tables
DROP TABLE IF EXISTS students_cse_1st_year CASCADE;
CREATE TABLE students_cse_1st_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Computer Science and Engineering',
  year VARCHAR(20) NOT NULL DEFAULT '1st Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_cse_2nd_year CASCADE;
CREATE TABLE students_cse_2nd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Computer Science and Engineering',
  year VARCHAR(20) NOT NULL DEFAULT '2nd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_cse_3rd_year CASCADE;
CREATE TABLE students_cse_3rd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Computer Science and Engineering',
  year VARCHAR(20) NOT NULL DEFAULT '3rd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_cse_4th_year CASCADE;
CREATE TABLE students_cse_4th_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Computer Science and Engineering',
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cyber Security Tables
DROP TABLE IF EXISTS students_cyber_1st_year CASCADE;
CREATE TABLE students_cyber_1st_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Cyber Security',
  year VARCHAR(20) NOT NULL DEFAULT '1st Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_cyber_2nd_year CASCADE;
CREATE TABLE students_cyber_2nd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Cyber Security',
  year VARCHAR(20) NOT NULL DEFAULT '2nd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_cyber_3rd_year CASCADE;
CREATE TABLE students_cyber_3rd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Cyber Security',
  year VARCHAR(20) NOT NULL DEFAULT '3rd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_cyber_4th_year CASCADE;
CREATE TABLE students_cyber_4th_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Cyber Security',
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIDS Tables
DROP TABLE IF EXISTS students_aids_1st_year CASCADE;
CREATE TABLE students_aids_1st_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Data Science',
  year VARCHAR(20) NOT NULL DEFAULT '1st Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_aids_2nd_year CASCADE;
CREATE TABLE students_aids_2nd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Data Science',
  year VARCHAR(20) NOT NULL DEFAULT '2nd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_aids_3rd_year CASCADE;
CREATE TABLE students_aids_3rd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Data Science',
  year VARCHAR(20) NOT NULL DEFAULT '3rd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_aids_4th_year CASCADE;
CREATE TABLE students_aids_4th_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Data Science',
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIML Tables
DROP TABLE IF EXISTS students_aiml_1st_year CASCADE;
CREATE TABLE students_aiml_1st_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Machine Learning',
  year VARCHAR(20) NOT NULL DEFAULT '1st Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_aiml_2nd_year CASCADE;
CREATE TABLE students_aiml_2nd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Machine Learning',
  year VARCHAR(20) NOT NULL DEFAULT '2nd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_aiml_3rd_year CASCADE;
CREATE TABLE students_aiml_3rd_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Machine Learning',
  year VARCHAR(20) NOT NULL DEFAULT '3rd Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS students_aiml_4th_year CASCADE;
CREATE TABLE students_aiml_4th_year (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  prn VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL DEFAULT 'Artificial Intelligence and Machine Learning',
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  photo VARCHAR(500),
  face_url VARCHAR(500),
  face_registered BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Enable RLS on all 16 student tables
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

-- 4) Create RLS policies for student tables (students can only see their own data)
CREATE POLICY "Students can view own data" ON students_cse_1st_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cse_1st_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_cse_2nd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cse_2nd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_cse_3rd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cse_3rd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_cse_4th_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cse_4th_year FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can view own data" ON students_cyber_1st_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cyber_1st_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_cyber_2nd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cyber_2nd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_cyber_3rd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cyber_3rd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_cyber_4th_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_cyber_4th_year FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can view own data" ON students_aids_1st_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aids_1st_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_aids_2nd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aids_2nd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_aids_3rd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aids_3rd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_aids_4th_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aids_4th_year FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can view own data" ON students_aiml_1st_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aiml_1st_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_aiml_2nd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aiml_2nd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_aiml_3rd_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aiml_3rd_year FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can view own data" ON students_aiml_4th_year FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students_aiml_4th_year FOR UPDATE USING (auth.uid() = user_id);

-- 5) Faculty department immutability: prevent updates changing department
CREATE OR REPLACE FUNCTION enforce_faculty_department_immutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.department IS DISTINCT FROM OLD.department THEN
    RAISE EXCEPTION 'Faculty department is immutable and cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_faculty_department_change ON faculty;
CREATE TRIGGER prevent_faculty_department_change
BEFORE UPDATE ON faculty
FOR EACH ROW EXECUTE FUNCTION enforce_faculty_department_immutable();

-- 6) Update assignments table to support department-year targeting
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS faculty_department TEXT;

-- Update faculty_department from faculty table
UPDATE assignments SET faculty_department = f.department 
FROM faculty f WHERE assignments.faculty_id = f.id AND assignments.faculty_department IS NULL;

-- 7) Update study_groups table for department-year targeting
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS target_years TEXT[] DEFAULT '{}';

-- 8) Add RLS policies for content targeting
-- Faculty can only post to their own department
CREATE POLICY "Faculty can only post assignments to own department" ON assignments 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM faculty f 
    WHERE f.id = assignments.faculty_id 
    AND f.department = assignments.faculty_department
    AND auth.uid() = f.user_id
  )
);

CREATE POLICY "Faculty can only update assignments in own department" ON assignments 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM faculty f 
    WHERE f.id = assignments.faculty_id 
    AND f.department = assignments.faculty_department
    AND auth.uid() = f.user_id
  )
);

-- Students can only view assignments targeted to their department/year
CREATE POLICY "Students can view targeted assignments" ON assignments 
FOR SELECT USING (
  status = 'published' AND (
    -- CSE students
    (EXISTS (SELECT 1 FROM students_cse_1st_year WHERE user_id = auth.uid()) AND faculty_department = 'Computer Science and Engineering' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cse_2nd_year WHERE user_id = auth.uid()) AND faculty_department = 'Computer Science and Engineering' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cse_3rd_year WHERE user_id = auth.uid()) AND faculty_department = 'Computer Science and Engineering' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cse_4th_year WHERE user_id = auth.uid()) AND faculty_department = 'Computer Science and Engineering' AND '4th Year' = ANY(target_years)) OR
    -- Cyber students
    (EXISTS (SELECT 1 FROM students_cyber_1st_year WHERE user_id = auth.uid()) AND faculty_department = 'Cyber Security' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cyber_2nd_year WHERE user_id = auth.uid()) AND faculty_department = 'Cyber Security' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cyber_3rd_year WHERE user_id = auth.uid()) AND faculty_department = 'Cyber Security' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cyber_4th_year WHERE user_id = auth.uid()) AND faculty_department = 'Cyber Security' AND '4th Year' = ANY(target_years)) OR
    -- AIDS students
    (EXISTS (SELECT 1 FROM students_aids_1st_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Data Science' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aids_2nd_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Data Science' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aids_3rd_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Data Science' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aids_4th_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Data Science' AND '4th Year' = ANY(target_years)) OR
    -- AIML students
    (EXISTS (SELECT 1 FROM students_aiml_1st_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Machine Learning' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aiml_2nd_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Machine Learning' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aiml_3rd_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Machine Learning' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aiml_4th_year WHERE user_id = auth.uid()) AND faculty_department = 'Artificial Intelligence and Machine Learning' AND '4th Year' = ANY(target_years))
  )
);

-- Similar policies for study_groups
CREATE POLICY "Faculty can only post study groups to own department" ON study_groups 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM faculty f 
    WHERE f.id = study_groups.faculty_id 
    AND f.department = study_groups.department
    AND auth.uid() = f.user_id
  )
);

CREATE POLICY "Students can view targeted study groups" ON study_groups 
FOR SELECT USING (
  status = 'active' AND (
    -- CSE students
    (EXISTS (SELECT 1 FROM students_cse_1st_year WHERE user_id = auth.uid()) AND department = 'Computer Science and Engineering' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cse_2nd_year WHERE user_id = auth.uid()) AND department = 'Computer Science and Engineering' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cse_3rd_year WHERE user_id = auth.uid()) AND department = 'Computer Science and Engineering' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cse_4th_year WHERE user_id = auth.uid()) AND department = 'Computer Science and Engineering' AND '4th Year' = ANY(target_years)) OR
    -- Cyber students
    (EXISTS (SELECT 1 FROM students_cyber_1st_year WHERE user_id = auth.uid()) AND department = 'Cyber Security' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cyber_2nd_year WHERE user_id = auth.uid()) AND department = 'Cyber Security' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cyber_3rd_year WHERE user_id = auth.uid()) AND department = 'Cyber Security' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_cyber_4th_year WHERE user_id = auth.uid()) AND department = 'Cyber Security' AND '4th Year' = ANY(target_years)) OR
    -- AIDS students
    (EXISTS (SELECT 1 FROM students_aids_1st_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Data Science' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aids_2nd_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Data Science' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aids_3rd_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Data Science' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aids_4th_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Data Science' AND '4th Year' = ANY(target_years)) OR
    -- AIML students
    (EXISTS (SELECT 1 FROM students_aiml_1st_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Machine Learning' AND '1st Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aiml_2nd_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Machine Learning' AND '2nd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aiml_3rd_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Machine Learning' AND '3rd Year' = ANY(target_years)) OR
    (EXISTS (SELECT 1 FROM students_aiml_4th_year WHERE user_id = auth.uid()) AND department = 'Artificial Intelligence and Machine Learning' AND '4th Year' = ANY(target_years))
  )
);

-- End of migration
