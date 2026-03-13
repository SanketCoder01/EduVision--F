-- Add registration_completed column to all student department/year tables
-- students is a VIEW, so we need to add the column to the base tables

-- CSE Department Tables
ALTER TABLE IF EXISTS students_cse_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_cse_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_cse_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_cse_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;

-- Cyber Security Department Tables
ALTER TABLE IF EXISTS students_cyber_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_cyber_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_cyber_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_cyber_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;

-- AIDS Department Tables
ALTER TABLE IF EXISTS students_aids_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_aids_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_aids_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_aids_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;

-- AIML Department Tables
ALTER TABLE IF EXISTS students_aiml_1st_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_aiml_2nd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_aiml_3rd_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS students_aiml_4th_year ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;

-- Also add to faculty table
ALTER TABLE IF EXISTS faculty ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT true;
