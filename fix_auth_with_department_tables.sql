-- ============================================
-- FIX AUTHENTICATION WITH DEPARTMENT-YEAR TABLES
-- The system uses 16 separate tables, not a single students table
-- ============================================

-- Drop the students view/table if it exists and is causing conflicts
DROP VIEW IF EXISTS students CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Create a UNION VIEW for backward compatibility
CREATE OR REPLACE VIEW students AS
SELECT 
    id, name, full_name, email, password, prn, 
    'CSE' as department, 'first' as year,
    phone, address, date_of_birth, blood_group, 
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cse_1st_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CSE' as department, 'second' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cse_2nd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CSE' as department, 'third' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cse_3rd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CSE' as department, 'fourth' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cse_4th_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CYBER' as department, 'first' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cyber_1st_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CYBER' as department, 'second' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cyber_2nd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CYBER' as department, 'third' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cyber_3rd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'CYBER' as department, 'fourth' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_cyber_4th_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIDS' as department, 'first' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aids_1st_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIDS' as department, 'second' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aids_2nd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIDS' as department, 'third' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aids_3rd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIDS' as department, 'fourth' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aids_4th_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIML' as department, 'first' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aiml_1st_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIML' as department, 'second' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aiml_2nd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIML' as department, 'third' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aiml_3rd_year
UNION ALL
SELECT 
    id, name, full_name, email, password, prn,
    'AIML' as department, 'fourth' as year,
    phone, address, date_of_birth, blood_group,
    emergency_contact, parent_name, parent_phone,
    face_url, photo, avatar, admission_year,
    registration_completed, face_registered,
    created_at, updated_at
FROM students_aiml_4th_year;

-- Make prn nullable in all 16 tables
ALTER TABLE students_cse_1st_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_cse_2nd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_cse_3rd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_cse_4th_year ALTER COLUMN prn DROP NOT NULL;

ALTER TABLE students_cyber_1st_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_cyber_2nd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_cyber_3rd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_cyber_4th_year ALTER COLUMN prn DROP NOT NULL;

ALTER TABLE students_aids_1st_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_aids_2nd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_aids_3rd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_aids_4th_year ALTER COLUMN prn DROP NOT NULL;

ALTER TABLE students_aiml_1st_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_aiml_2nd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_aiml_3rd_year ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students_aiml_4th_year ALTER COLUMN prn DROP NOT NULL;

-- Add registration_completed column if missing
ALTER TABLE students_cse_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_cse_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_cse_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_cse_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE students_cyber_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_cyber_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_cyber_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_cyber_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE students_aids_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_aids_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_aids_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_aids_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE students_aiml_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_aiml_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_aiml_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students_aiml_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

-- Disable RLS on all tables for development
ALTER TABLE students_cse_1st_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_2nd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_3rd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_4th_year DISABLE ROW LEVEL SECURITY;

ALTER TABLE students_cyber_1st_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_2nd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_3rd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_4th_year DISABLE ROW LEVEL SECURITY;

ALTER TABLE students_aids_1st_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_2nd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_3rd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_4th_year DISABLE ROW LEVEL SECURITY;

ALTER TABLE students_aiml_1st_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_2nd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_3rd_year DISABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_4th_year DISABLE ROW LEVEL SECURITY;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ AUTHENTICATION FIX APPLIED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Changes applied to all 16 department-year tables:';
    RAISE NOTICE '  ✓ PRN column is now nullable';
    RAISE NOTICE '  ✓ registration_completed column added';
    RAISE NOTICE '  ✓ RLS disabled for development';
    RAISE NOTICE '  ✓ UNION VIEW created for backward compatibility';
    RAISE NOTICE '  ✓ Schema cache refreshed';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTE: Authentication code needs to be updated';
    RAISE NOTICE 'to insert into specific department-year tables';
    RAISE NOTICE 'instead of the students view.';
    RAISE NOTICE '========================================';
END $$;
