-- Fix for: could not find faculty name column of queries in schema
-- This safely adds the column if it was somehow skipped in previous migrations.
ALTER TABLE queries
ADD COLUMN IF NOT EXISTS faculty_name TEXT;

-- Just in case student_name is missing too
ALTER TABLE queries
ADD COLUMN IF NOT EXISTS student_name TEXT;

-- Just in case
ALTER TABLE query_messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT;
