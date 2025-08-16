-- Create the 16 missing department-year student tables
-- These tables are not visible in your current database

-- CSE Tables
CREATE TABLE IF NOT EXISTS students_cse_1st_year (
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

CREATE TABLE IF NOT EXISTS students_cse_2nd_year (
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

CREATE TABLE IF NOT EXISTS students_cse_3rd_year (
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

CREATE TABLE IF NOT EXISTS students_cse_4th_year (
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
CREATE TABLE IF NOT EXISTS students_cyber_1st_year (
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

CREATE TABLE IF NOT EXISTS students_cyber_2nd_year (
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

CREATE TABLE IF NOT EXISTS students_cyber_3rd_year (
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

CREATE TABLE IF NOT EXISTS students_cyber_4th_year (
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
CREATE TABLE IF NOT EXISTS students_aids_1st_year (
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

CREATE TABLE IF NOT EXISTS students_aids_2nd_year (
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

CREATE TABLE IF NOT EXISTS students_aids_3rd_year (
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

CREATE TABLE IF NOT EXISTS students_aids_4th_year (
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
CREATE TABLE IF NOT EXISTS students_aiml_1st_year (
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

CREATE TABLE IF NOT EXISTS students_aiml_2nd_year (
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

CREATE TABLE IF NOT EXISTS students_aiml_3rd_year (
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

CREATE TABLE IF NOT EXISTS students_aiml_4th_year (
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
