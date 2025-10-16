-- Fix Dean RLS Policies to allow login verification
-- This migration fixes the chicken-and-egg problem where users can't verify they're deans during login

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Deans can view their own profile" ON deans;
DROP POLICY IF EXISTS "Deans can update their own profile" ON deans;

-- Create new policies that allow authenticated users to view deans by email (for login)
-- and deans to manage their own profiles

-- Allow any authenticated user to read from deans table (needed for login verification)
CREATE POLICY "Authenticated users can view deans for verification"
    ON deans FOR SELECT
    TO authenticated
    USING (true);

-- Allow deans to update their own profile by matching email
CREATE POLICY "Deans can update their own profile by email"
    ON deans FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- Allow service role to insert deans (for admin operations)
CREATE POLICY "Service role can insert deans"
    ON deans FOR INSERT
    TO service_role
    WITH CHECK (true);
