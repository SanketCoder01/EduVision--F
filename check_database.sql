-- Check Database Status
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('students', 'faculty');

-- 2. Check all students
SELECT 
  id, 
  name, 
  email, 
  department, 
  year, 
  prn,
  registration_completed,
  created_at
FROM students
ORDER BY created_at DESC;

-- 3. Check all faculty
SELECT 
  id, 
  name, 
  email, 
  department, 
  designation,
  registration_completed,
  created_at
FROM faculty
ORDER BY created_at DESC;

-- 4. Check for duplicate emails in students
SELECT 
  email, 
  COUNT(*) as count
FROM students
GROUP BY email
HAVING COUNT(*) > 1;

-- 5. Check for duplicate emails in faculty
SELECT 
  email, 
  COUNT(*) as count
FROM faculty
GROUP BY email
HAVING COUNT(*) > 1;

-- 6. DISABLE RLS (if needed)
-- Uncomment and run if you're getting 406 errors:
-- ALTER TABLE students DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE faculty DISABLE ROW LEVEL SECURITY;

-- 7. Add a test student (if none exists)
-- Uncomment and modify with your details:
-- INSERT INTO students (
--   name, 
--   email, 
--   department, 
--   year, 
--   prn, 
--   registration_completed
-- ) VALUES (
--   'Sanket Gaikwad', 
--   'sanket.gaikwad_24uce@sanjivani.edu.in', 
--   'CSE', 
--   'third', 
--   'PRN2024001', 
--   false
-- )
-- ON CONFLICT (email) DO NOTHING;

-- 8. Add a test faculty (if none exists)
-- Uncomment and modify with your details:
-- INSERT INTO faculty (
--   name, 
--   email, 
--   department, 
--   designation,
--   registration_completed
-- ) VALUES (
--   'Test Faculty', 
--   'faculty@sanjivani.edu.in', 
--   'Computer Science', 
--   'Professor',
--   false
-- )
-- ON CONFLICT (email) DO NOTHING;

-- 9. Delete duplicate students (if any)
-- BE CAREFUL: This keeps only the most recent entry
-- DELETE FROM students
-- WHERE id NOT IN (
--   SELECT MAX(id)
--   FROM students
--   GROUP BY email
-- );

-- 10. Delete duplicate faculty (if any)
-- BE CAREFUL: This keeps only the most recent entry
-- DELETE FROM faculty
-- WHERE id NOT IN (
--   SELECT MAX(id)
--   FROM faculty
--   GROUP BY email
-- );
