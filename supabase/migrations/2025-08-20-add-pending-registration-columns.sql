-- Add missing columns to pending_registrations table
-- Created: 2025-08-20

-- Add missing columns that the secure registration API expects
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS face_image_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_id ON pending_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_name ON pending_registrations(name);

-- Update RLS policy to allow users to insert their own registration
DROP POLICY IF EXISTS "Users can insert own registration" ON pending_registrations;
CREATE POLICY "Users can insert own registration" ON pending_registrations
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Allow users to view their own pending registration
DROP POLICY IF EXISTS "Users can view own registration" ON pending_registrations;
CREATE POLICY "Users can view own registration" ON pending_registrations
FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@admin.sanjivani.edu.in'
  )
);
