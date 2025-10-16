-- ============================================
-- FIX DEAN LOGIN - Run this in Supabase SQL Editor
-- ============================================
-- This script fixes the RLS policies to allow dean login

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Deans can view their own profile" ON deans;
DROP POLICY IF EXISTS "Deans can update their own profile" ON deans;

-- Step 2: Create new policies that allow login verification
-- Allow any authenticated user to view deans table (needed for login verification)
CREATE POLICY "Authenticated users can view deans for verification"
    ON deans FOR SELECT
    TO authenticated
    USING (true);

-- Allow deans to update their own profile by matching email
CREATE POLICY "Deans can update their own profile by email"
    ON deans FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- Step 3: Ensure the deans table exists and has a dean account
-- First, let's check if the table exists and create it if needed
CREATE TABLE IF NOT EXISTS deans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    designation VARCHAR(100) DEFAULT 'Dean',
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on deans table
ALTER TABLE deans ENABLE ROW LEVEL SECURITY;

-- Step 4: Insert a test dean account (update with your actual email)
INSERT INTO deans (name, email, department, designation) 
VALUES (
    'Dr. Admin Dean',
    'dean@sanjivani.edu.in',
    'Computer Science & Engineering',
    'Dean of Engineering'
) ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation;

-- ============================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Create a "New Query"
-- 4. Paste this entire script
-- 5. Click "Run" to execute
-- 6. Then go to Authentication > Users
-- 7. Add a new user with email: dean@sanjivani.edu.in and set a password
-- 8. Now you can login at /deanlogin
-- ============================================
