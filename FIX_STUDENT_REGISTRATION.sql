-- ============================================
-- FIX STUDENT REGISTRATION COMPLETE FORM
-- This ensures all required columns exist in students table
-- ============================================

-- Add missing columns to students table (if not exists)
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_step INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Indian';
ALTER TABLE students ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS sub_caste TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS domicile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_country TEXT DEFAULT 'India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS alternate_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhar_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_issue_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_expiry_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_issue_place TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_city TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_state TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_pincode TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_country TEXT DEFAULT 'India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_city TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_state TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_pincode TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_country TEXT DEFAULT 'India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_occupation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_annual_income NUMERIC;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_occupation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_annual_income NUMERIC;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_relation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_ifsc_code TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_branch TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS physically_handicapped TEXT DEFAULT 'No';
ALTER TABLE students ADD COLUMN IF NOT EXISTS minority_status TEXT DEFAULT 'No';
ALTER TABLE students ADD COLUMN IF NOT EXISTS gap_year TEXT DEFAULT 'No';
ALTER TABLE students ADD COLUMN IF NOT EXISTS gap_reason TEXT;

-- Also add these columns to all department-specific student tables
DO $$
DECLARE
    dept TEXT;
    yr TEXT;
    table_name TEXT;
BEGIN
    FOR dept IN SELECT unnest(ARRAY['cse', 'cyber', 'aids', 'aiml'])
    LOOP
        FOR yr IN SELECT unnest(ARRAY['1st', '2nd', '3rd', '4th'])
        LOOP
            table_name := 'students_' || dept || '_' || yr || '_year';
            
            -- Check if table exists
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) THEN
                -- Add all columns to department-specific tables
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS first_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS middle_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS last_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS registration_step INTEGER DEFAULT 0', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS date_of_birth DATE', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS gender TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS blood_group TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT ''Indian''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS religion TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS caste TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS sub_caste TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS domicile TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS birth_place TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS birth_country TEXT DEFAULT ''India''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS mobile_number TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS alternate_mobile TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS aadhar_number TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pan_number TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS passport_number TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS passport_issue_date DATE', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS passport_expiry_date DATE', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS passport_issue_place TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS permanent_address TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS permanent_city TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS permanent_state TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS permanent_pincode TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS permanent_country TEXT DEFAULT ''India''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS current_address TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS current_city TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS current_state TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS current_pincode TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS current_country TEXT DEFAULT ''India''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS father_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS father_occupation TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS father_mobile TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS father_email TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS father_annual_income NUMERIC', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS mother_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS mother_occupation TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS mother_mobile TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS mother_email TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS mother_annual_income NUMERIC', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS guardian_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS guardian_relation TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS guardian_mobile TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS guardian_email TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS emergency_contact_mobile TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS emergency_contact_address TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS bank_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS bank_account_number TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS bank_ifsc_code TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS bank_branch TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS physically_handicapped TEXT DEFAULT ''No''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS minority_status TEXT DEFAULT ''No''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS gap_year TEXT DEFAULT ''No''', table_name);
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS gap_reason TEXT', table_name);
                
                RAISE NOTICE 'Updated table: %', table_name;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Create student_education_details table if not exists
CREATE TABLE IF NOT EXISTS student_education_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    education_level TEXT NOT NULL, -- 'SSC', 'HSC', 'Diploma', 'Graduation', 'Post Graduation'
    board_university TEXT,
    school_college_name TEXT,
    passing_year INTEGER,
    seat_number TEXT,
    total_marks INTEGER,
    marks_obtained INTEGER,
    percentage NUMERIC(5,2),
    cgpa NUMERIC(4,2),
    sgpa NUMERIC(4,2),
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_documents table if not exists
CREATE TABLE IF NOT EXISTS student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'Photo', 'Aadhar Card', 'PAN Card', '10th Certificate', etc.
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for student documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for student documents
ALTER TABLE student_education_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own education details" ON student_education_details;
DROP POLICY IF EXISTS "Students can insert own education details" ON student_education_details;
DROP POLICY IF EXISTS "Students can view own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can insert own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Students can view own documents" ON storage.objects;

-- Students can view and manage their own education details
CREATE POLICY "Students can view own education details"
    ON student_education_details FOR SELECT
    USING (student_id IN (SELECT id FROM students WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Students can insert own education details"
    ON student_education_details FOR INSERT
    WITH CHECK (student_id IN (SELECT id FROM students WHERE email = auth.jwt() ->> 'email'));

-- Students can view and manage their own documents
CREATE POLICY "Students can view own documents"
    ON student_documents FOR SELECT
    USING (student_id IN (SELECT id FROM students WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Students can insert own documents"
    ON student_documents FOR INSERT
    WITH CHECK (student_id IN (SELECT id FROM students WHERE email = auth.jwt() ->> 'email'));

-- Storage policies for student-documents bucket
CREATE POLICY "Students can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'student-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Students can view own documents storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'student-documents');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Student registration schema fixed successfully!';
    RAISE NOTICE '✅ All required columns added to students table and department-specific tables';
    RAISE NOTICE '✅ Education details and documents tables created';
    RAISE NOTICE '✅ Storage bucket and RLS policies configured';
END $$;
