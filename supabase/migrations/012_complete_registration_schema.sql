-- Complete Registration Schema for Students and Faculty
-- This migration adds comprehensive registration fields

-- Add registration completion flag to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_step INTEGER DEFAULT 0;

-- Add additional fields to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Indian';
ALTER TABLE students ADD COLUMN IF NOT EXISTS religion VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS sub_caste VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS domicile VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_country VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS alternate_mobile VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20);

-- Family Details
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_mobile VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_annual_income DECIMAL(12,2);

ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_mobile VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_annual_income DECIMAL(12,2);

ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_relation VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_mobile VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_email VARCHAR(255);

-- Address Details
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_city VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_state VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_pincode VARCHAR(10);
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_country VARCHAR(50) DEFAULT 'India';

ALTER TABLE students ADD COLUMN IF NOT EXISTS current_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_city VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_state VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_pincode VARCHAR(10);
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_country VARCHAR(50) DEFAULT 'India';

-- Emergency Contact
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_mobile VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_address TEXT;

-- Passport Details
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_issue_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_expiry_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_issue_place VARCHAR(100);

-- Bank Details
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_account_holder_name VARCHAR(255);

-- Create student_education_details table for previous education
CREATE TABLE IF NOT EXISTS student_education_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    education_level VARCHAR(50) NOT NULL, -- SSC, HSC, Diploma, etc.
    board_university VARCHAR(255),
    school_college_name VARCHAR(255),
    passing_year INTEGER,
    seat_number VARCHAR(50),
    total_marks INTEGER,
    marks_obtained INTEGER,
    percentage DECIMAL(5,2),
    grade VARCHAR(10),
    cgpa DECIMAL(4,2),
    sgpa DECIMAL(4,2),
    subjects JSONB, -- Store subject-wise marks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_documents table
CREATE TABLE IF NOT EXISTS student_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- Photo, Aadhar, PAN, 10th Certificate, etc.
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add registration fields to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS registration_step INTEGER DEFAULT 0;

-- Add additional fields to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS nationality VARCHAR(50) DEFAULT 'Indian';
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS religion VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS caste VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS alternate_mobile VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20);

-- Faculty Family Details
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(255);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS spouse_occupation VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS spouse_mobile VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0;

-- Faculty Address Details
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS permanent_city VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS permanent_state VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS permanent_pincode VARCHAR(10);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS permanent_country VARCHAR(50) DEFAULT 'India';

ALTER TABLE faculty ADD COLUMN IF NOT EXISTS current_address TEXT;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS current_city VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS current_state VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS current_pincode VARCHAR(10);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS current_country VARCHAR(50) DEFAULT 'India';

-- Faculty Emergency Contact
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS emergency_contact_mobile VARCHAR(20);

-- Faculty Passport Details
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS passport_issue_date DATE;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS passport_expiry_date DATE;

-- Faculty Bank Details
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(100);

-- Create faculty_education_details table
CREATE TABLE IF NOT EXISTS faculty_education_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    degree_type VARCHAR(100) NOT NULL, -- Bachelor's, Master's, PhD, etc.
    specialization VARCHAR(255),
    university VARCHAR(255),
    college_name VARCHAR(255),
    passing_year INTEGER,
    percentage DECIMAL(5,2),
    grade VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty_documents table
CREATE TABLE IF NOT EXISTS faculty_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty_experience table
CREATE TABLE IF NOT EXISTS faculty_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    from_date DATE,
    to_date DATE,
    is_current BOOLEAN DEFAULT false,
    responsibilities TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE student_education_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_education_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_experience ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_education_details
CREATE POLICY "Students can view their own education details"
    ON student_education_details FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own education details"
    ON student_education_details FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own education details"
    ON student_education_details FOR UPDATE
    USING (student_id = auth.uid());

-- RLS Policies for student_documents
CREATE POLICY "Students can view their own documents"
    ON student_documents FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own documents"
    ON student_documents FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- RLS Policies for faculty_education_details
CREATE POLICY "Faculty can view their own education details"
    ON faculty_education_details FOR SELECT
    USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert their own education details"
    ON faculty_education_details FOR INSERT
    WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update their own education details"
    ON faculty_education_details FOR UPDATE
    USING (faculty_id = auth.uid());

-- RLS Policies for faculty_documents
CREATE POLICY "Faculty can view their own documents"
    ON faculty_documents FOR SELECT
    USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert their own documents"
    ON faculty_documents FOR INSERT
    WITH CHECK (faculty_id = auth.uid());

-- RLS Policies for faculty_experience
CREATE POLICY "Faculty can view their own experience"
    ON faculty_experience FOR SELECT
    USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert their own experience"
    ON faculty_experience FOR INSERT
    WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update their own experience"
    ON faculty_experience FOR UPDATE
    USING (faculty_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_education_student_id ON student_education_details(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_faculty_education_faculty_id ON faculty_education_details(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_documents_faculty_id ON faculty_documents(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_experience_faculty_id ON faculty_experience(faculty_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_student_education_updated_at
    BEFORE UPDATE ON student_education_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_education_updated_at
    BEFORE UPDATE ON faculty_education_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
