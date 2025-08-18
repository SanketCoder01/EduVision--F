-- Complete cleanup script for user registration data
-- Replace 'your-email@sanjivani.edu.in' with your actual email address

-- Step 1: Get your user_id first (run this to find your user_id)
SELECT id, email FROM auth.users WHERE email = 'your-email@sanjivani.edu.in';

-- Step 2: Clean up all registration data (replace USER_ID_HERE with the id from step 1)

-- Remove from pending registrations
DELETE FROM pending_registrations WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM pending_registrations WHERE user_id = 'USER_ID_HERE';

-- Remove from all 16 student department-year tables
DELETE FROM students_cse_1st_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cse_2nd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cse_3rd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cse_4th_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';

DELETE FROM students_aids_1st_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aids_2nd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aids_3rd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aids_4th_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';

DELETE FROM students_aiml_1st_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aiml_2nd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aiml_3rd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aiml_4th_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';

DELETE FROM students_cy_1st_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cy_2nd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cy_3rd_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cy_4th_year WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';

-- Remove from general department tables
DELETE FROM students_cse WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aids WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_aiml WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM students_cy WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';

-- Remove from faculty tables
DELETE FROM faculty_cse WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM faculty_aids WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM faculty_aiml WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM faculty_cy WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';
DELETE FROM faculty WHERE email = 'your-email@sanjivani.edu.in' OR user_id = 'USER_ID_HERE';

-- Remove face encodings
DELETE FROM student_faces WHERE student_id IN (
    SELECT id FROM students_cse WHERE email = 'your-email@sanjivani.edu.in'
    UNION SELECT id FROM students_aids WHERE email = 'your-email@sanjivani.edu.in'
    UNION SELECT id FROM students_aiml WHERE email = 'your-email@sanjivani.edu.in'
    UNION SELECT id FROM students_cy WHERE email = 'your-email@sanjivani.edu.in'
);

DELETE FROM faculty_faces WHERE faculty_id IN (
    SELECT id FROM faculty WHERE email = 'your-email@sanjivani.edu.in'
);

-- Step 3: Reset password in auth.users (IMPORTANT: This requires service role access)
-- You may need to do this through Supabase dashboard > Authentication > Users
-- Or use the password reset email feature

-- Step 4: Completely remove user from auth.users (NUCLEAR OPTION - only if needed)
-- DELETE FROM auth.users WHERE email = 'your-email@sanjivani.edu.in';
