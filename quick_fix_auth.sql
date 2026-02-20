-- QUICK FIX FOR AUTHENTICATION ERROR
-- Run this in Supabase SQL Editor

-- 1. Make prn column nullable
ALTER TABLE students ALTER COLUMN prn DROP NOT NULL;

-- 2. Make department nullable
ALTER TABLE students ALTER COLUMN department DROP NOT NULL;

-- 3. Make year nullable  
ALTER TABLE students ALTER COLUMN year DROP NOT NULL;

-- 4. Add registration_completed if missing
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

-- 5. Disable RLS for development
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 6. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the fix
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'students'
AND column_name IN ('prn', 'department', 'year', 'registration_completed')
ORDER BY column_name;
