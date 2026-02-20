-- ============================================================================
-- CHECK STUDENT TABLE COLUMNS
-- Run this in Supabase to see what columns actually exist
-- ============================================================================

-- Check students_cse_1st_year columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students_cse_1st_year' 
ORDER BY ordinal_position;

-- Check students_cyber_1st_year columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students_cyber_1st_year' 
ORDER BY ordinal_position;

-- Check students_aids_1st_year columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students_aids_1st_year' 
ORDER BY ordinal_position;

-- Check students_aiml_1st_year columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students_aiml_1st_year' 
ORDER BY ordinal_position;
