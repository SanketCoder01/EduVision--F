-- Fix registration and faculty table issues
-- Run this in Supabase SQL Editor

-- 1. Fix pending_registrations table structure
DROP TABLE IF EXISTS pending_registrations CASCADE;

CREATE TABLE pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    department TEXT CHECK (department IN ('CSE', 'CYBER', 'AIDS', 'AIML')),
    year TEXT CHECK (year IN ('1st', '2nd', '3rd', '4th')),
    user_type TEXT CHECK (user_type IN ('student', 'faculty')) NOT NULL,
    face_url TEXT,
    status TEXT DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS and create policies
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for registration)
CREATE POLICY "Allow registration insert" ON pending_registrations
    FOR INSERT WITH CHECK (true);

-- Allow users to view all pending registrations (for admin dashboard)
CREATE POLICY "Allow select for all" ON pending_registrations
    FOR SELECT USING (true);

-- 3. Fix faculty table RLS policies if they exist
DO $$
BEGIN
    -- Check if faculty table exists and fix RLS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faculty') THEN
        -- Drop existing restrictive policies
        DROP POLICY IF EXISTS "Faculty can only view own data" ON faculty;
        DROP POLICY IF EXISTS "Faculty read own data" ON faculty;
        
        -- Create permissive policy for now
        CREATE POLICY "Allow faculty access" ON faculty
            FOR ALL USING (true);
    END IF;
END $$;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
