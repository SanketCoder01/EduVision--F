-- Setup Test Users for EduVision
-- Run this in Supabase SQL Editor

-- IMPORTANT: You need to create users in Supabase Auth Dashboard first
-- Go to Authentication > Users > Add User
-- Then run this script to link them to your database

-- For testing, you can temporarily bypass Supabase Auth
-- We'll create a simpler login that checks database directly

-- Example: If you have a student with email student@sanjivani.edu.in
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter email: student@sanjivani.edu.in
-- 4. Enter password: password123 (or your choice)
-- 5. Enable "Auto Confirm User"
-- 6. Click "Create User"

-- The student should already exist in your students table
-- If not, insert like this:

-- INSERT INTO students (
--   name, email, department, year, prn, registration_completed
-- ) VALUES (
--   'Test Student', 
--   'student@sanjivani.edu.in', 
--   'CSE', 
--   'third', 
--   'PRN001', 
--   false
-- );

-- For Faculty:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter email: faculty@sanjivani.edu.in
-- 4. Enter password: password123 (or your choice)
-- 5. Enable "Auto Confirm User"
-- 6. Click "Create User"

-- INSERT INTO faculty (
--   name, email, department, designation, registration_completed
-- ) VALUES (
--   'Test Faculty', 
--   'faculty@sanjivani.edu.in', 
--   'Computer Science', 
--   'Professor',
--   false
-- );

-- Check existing students
SELECT id, name, email, department, year, registration_completed FROM students;

-- Check existing faculty
SELECT id, name, email, department, registration_completed FROM faculty;
