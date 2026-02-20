-- ============================================
-- EMERGENCY FIX - Add registration_completed column
-- Run this FIRST, then wait 30 seconds
-- ============================================
+
-- Add registration_completed to all 16 tables
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

-- Make prn nullable
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

-- Disable RLS
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

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

SELECT 'SUCCESS! Wait 30 seconds, then try login again.' as status;
