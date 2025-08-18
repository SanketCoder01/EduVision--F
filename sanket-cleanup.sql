-- Complete cleanup for sanket.gaikwad_24uce@sanjivani.edu.in
-- Run these commands in Supabase SQL Editor in order

-- Step 1: Get your user_id
SELECT id, email FROM auth.users WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

-- Step 2: Clean up all registration data
-- Remove from pending registrations
DELETE FROM pending_registrations WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

-- Remove from all 16 student department-year tables
DELETE FROM students_cse_1st_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cse_2nd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cse_3rd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cse_4th_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

DELETE FROM students_aids_1st_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aids_2nd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aids_3rd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aids_4th_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

DELETE FROM students_aiml_1st_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aiml_2nd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aiml_3rd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aiml_4th_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

DELETE FROM students_cy_1st_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cy_2nd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cy_3rd_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cy_4th_year WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

-- Remove from general department tables
DELETE FROM students_cse WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aids WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_aiml WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM students_cy WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

-- Remove from faculty tables
DELETE FROM faculty_cse WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM faculty_aids WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM faculty_aiml WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM faculty_cy WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
DELETE FROM faculty WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';

-- Remove face encodings (run after getting user_id from step 1)
DELETE FROM student_faces WHERE student_id IN (
    SELECT id FROM students_cse WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in'
    UNION ALL SELECT id FROM students_aids WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in'
    UNION ALL SELECT id FROM students_aiml WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in'
    UNION ALL SELECT id FROM students_cy WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in'
);

DELETE FROM faculty_faces WHERE faculty_id IN (
    SELECT id FROM faculty WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in'
);

-- Step 3: NUCLEAR OPTION - Remove user completely from auth.users
-- Only run this if you want to start completely fresh
DELETE FROM auth.users WHERE email = 'sanket.gaikwad_24uce@sanjivani.edu.in';
