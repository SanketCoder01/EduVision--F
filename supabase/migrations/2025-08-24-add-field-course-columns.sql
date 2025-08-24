-- Add field and course columns to all student tables and pending registrations

-- Add columns to pending_registrations table
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

-- Add columns to all student tables
ALTER TABLE students_cse_1st_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cse_2nd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cse_3rd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cse_4th_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cyber_1st_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cyber_2nd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cyber_3rd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_cyber_4th_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aids_1st_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aids_2nd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aids_3rd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aids_4th_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aiml_1st_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aiml_2nd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aiml_3rd_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE students_aiml_4th_year 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

-- Update comments for documentation
COMMENT ON COLUMN pending_registrations.field IS 'Field of study (B.E/B.Tech, BCA, MCA, etc.)';
COMMENT ON COLUMN pending_registrations.course IS 'Specific course within the field (CSE, IT, etc.)';

-- Add check constraints for valid fields (optional, for data integrity)
ALTER TABLE pending_registrations 
ADD CONSTRAINT check_valid_field 
CHECK (field IN ('B.E/B.Tech', 'Pharmacy', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'B.Com', 'M.Com', 'BBA', 'MBA', 'BCS', 'MCS'));
