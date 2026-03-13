-- Migration: Add college_name column to all student and faculty tables
-- This replaces cld_id with college_name (fixed to Sanjivani University)

-- Add college_name column to faculty table
ALTER TABLE IF EXISTS public.faculty 
ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';

-- Update existing faculty records
UPDATE public.faculty 
SET college_name = 'Sanjivani University' 
WHERE college_name IS NULL;

-- Add college_name column to all student tables
-- CSE students
ALTER TABLE IF EXISTS public.students_cse_1st_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_cse_2nd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_cse_3rd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_cse_4th_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';

-- Cyber Security students
ALTER TABLE IF EXISTS public.students_cyber_1st_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_cyber_2nd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_cyber_3rd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_cyber_4th_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';

-- AIDS students
ALTER TABLE IF EXISTS public.students_aids_1st_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_aids_2nd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_aids_3rd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_aids_4th_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';

-- AIML students
ALTER TABLE IF EXISTS public.students_aiml_1st_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_aiml_2nd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_aiml_3rd_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';
ALTER TABLE IF EXISTS public.students_aiml_4th_year ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT 'Sanjivani University';

-- Update all existing student records
UPDATE public.students_cse_1st_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_cse_2nd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_cse_3rd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_cse_4th_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;

UPDATE public.students_cyber_1st_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_cyber_2nd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_cyber_3rd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_cyber_4th_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;

UPDATE public.students_aids_1st_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_aids_2nd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_aids_3rd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_aids_4th_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;

UPDATE public.students_aiml_1st_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_aiml_2nd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_aiml_3rd_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;
UPDATE public.students_aiml_4th_year SET college_name = 'Sanjivani University' WHERE college_name IS NULL;

-- Optional: Remove old cld_id column if it exists (uncomment if desired)
-- ALTER TABLE IF EXISTS public.faculty DROP COLUMN IF EXISTS cld_id;
-- ALTER TABLE IF EXISTS public.students_cse_1st_year DROP COLUMN IF EXISTS cld_id;
-- (repeat for other student tables if needed)
