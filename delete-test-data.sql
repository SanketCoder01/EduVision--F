-- Delete test user data from all tables
-- Replace 'your-email@sanjivani.edu.in' with your actual email

-- Delete from auth.users (this will cascade to other tables)
DELETE FROM auth.users WHERE email = 'your-email@sanjivani.edu.in';

-- Delete from pending registrations
DELETE FROM pending_registrations WHERE email = 'your-email@sanjivani.edu.in';

-- Delete from faculty table
DELETE FROM faculty WHERE email = 'your-email@sanjivani.edu.in';

-- Delete from all student tables
DELETE FROM students_cse_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cse_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cse_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cse_4th_year WHERE email = 'your-email@sanjivani.edu.in';

DELETE FROM students_cyber_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cyber_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cyber_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_cyber_4th_year WHERE email = 'your-email@sanjivani.edu.in';

DELETE FROM students_aids_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aids_4th_year WHERE email = 'your-email@sanjivani.edu.in';

DELETE FROM students_aiml_1st_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml_2nd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml_3rd_year WHERE email = 'your-email@sanjivani.edu.in';
DELETE FROM students_aiml_4th_year WHERE email = 'your-email@sanjivani.edu.in';
