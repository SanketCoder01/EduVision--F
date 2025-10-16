-- Disable RLS for Development (or add permissive policies)
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS completely for development (easiest)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculty DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, add these permissive policies
-- (Comment out Option 1 and uncomment Option 2)

-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- -- Allow public read access for authentication
-- CREATE POLICY "Allow public read for students" ON students
--   FOR SELECT
--   USING (true);

-- CREATE POLICY "Allow public read for faculty" ON faculty
--   FOR SELECT
--   USING (true);

-- -- Allow students to update their own records
-- CREATE POLICY "Allow students to update own record" ON students
--   FOR UPDATE
--   USING (email = current_setting('request.jwt.claims')::json->>'email')
--   WITH CHECK (email = current_setting('request.jwt.claims')::json->>'email');

-- -- Allow faculty to update their own records
-- CREATE POLICY "Allow faculty to update own record" ON faculty
--   FOR UPDATE
--   USING (email = current_setting('request.jwt.claims')::json->>'email')
--   WITH CHECK (email = current_setting('request.jwt.claims')::json->>'email');
