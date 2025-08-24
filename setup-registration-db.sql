-- Setup registration database tables
-- Run this in Supabase SQL Editor

-- Create pending_registrations table with all required columns
DROP TABLE IF EXISTS pending_registrations CASCADE;

CREATE TABLE pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    department TEXT NOT NULL,
    year TEXT,
    user_type TEXT CHECK (user_type IN ('student', 'faculty')) NOT NULL,
    face_url TEXT,
    status TEXT DEFAULT 'pending_approval',
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for testing
CREATE POLICY "Allow all operations" ON pending_registrations
    FOR ALL USING (true) WITH CHECK (true);

-- Create faces storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('faces', 'faces', true) 
ON CONFLICT (id) DO NOTHING;

-- Allow public access to faces bucket
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'faces');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
