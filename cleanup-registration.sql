-- SQL commands to remove registration details for testing
-- Replace 'your-email@sanjivani.edu.in' with your actual email address

-- 1. Remove from pending_registrations table
DELETE FROM pending_registrations 
WHERE email = 'your-email@sanjivani.edu.in';

-- 2. Remove from all student department-year tables (if exists)
DELETE FROM students_cse_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cse_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cse_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cse_4th_year WHERE email = 'your-email@sanjivani.edu.in';

DELETE FROM students_aids_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids_4th_year WHERE email = 'your-email@sanjivani.edu.in';

DELETE FROM students_aiml_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml_4th_year WHERE email = 'your-email@sanjivani.edu.in';

DELETE FROM students_cy_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cy_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cy_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cy_4th_year WHERE email = 'your-email@sanjivani.edu.in';

-- 3. Remove from general department tables
DELETE FROM students_cse WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cy WHERE email = 'your-email@sanjivani.edu.in';

-- 4. Remove from faculty tables (if you registered as faculty)
DELETE FROM faculty_cse WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM faculty_aids WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM faculty_aiml WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM faculty_cy WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM faculty WHERE email = 'your-email@sanjivani.edu.in';

-- 5. Remove face encodings
DELETE FROM student_faces 
WHERE student_id IN (
    SELECT id FROM students_cse WHERE email = 'your-email@sanjivani.edu.in'
    UNION SELECT id FROM students_aids WHERE email = 'your-email@sanjivani.edu.in'
    UNION SELECT id FROM students_aiml WHERE email = 'your-email@sanjivani.edu.in'
    UNION SELECT id FROM students_cy WHERE email = 'your-email@sanjivani.edu.in'
);

DELETE FROM faculty_faces 
WHERE faculty_id IN (
    SELECT id FROM faculty WHERE email = 'your-email@sanjivani.edu.in'
);

-- 6. Remove from auth.users (Supabase Auth table)
-- Note: This might need to be done through Supabase dashboard or auth admin API
-- DELETE FROM auth.users WHERE email = 'your-email@sanjivani.edu.in';
