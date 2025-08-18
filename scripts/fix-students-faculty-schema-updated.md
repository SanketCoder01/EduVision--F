# Updated SQL Script for EduVision Database Schema Fixes

This script adds the missing `name` column to the students table, in addition to all the other columns from the original script.

```sql
-- Fix EduVision Database Schema Issues for students and faculty tables
-- Run this in Supabase SQL Editor

-- 1. Add missing name column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE students 
        ADD COLUMN name TEXT;
    END IF;
END $$;

-- 2. Add missing face_data column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'face_data'
    ) THEN
        ALTER TABLE students 
        ADD COLUMN face_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. Add missing face_data column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'face_data'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN face_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. Add face_url column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'face_url'
    ) THEN
        ALTER TABLE students 
        ADD COLUMN face_url TEXT;
    END IF;
END $$;

-- 5. Add face_url column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'face_url'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN face_url TEXT;
    END IF;
END $$;

-- 6. Add face_registered column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'face_registered'
    ) THEN
        ALTER TABLE students 
        ADD COLUMN face_registered BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 7. Add face_registered column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'face_registered'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN face_registered BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 8. Add face_registered_at column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'face_registered_at'
    ) THEN
        ALTER TABLE students 
        ADD COLUMN face_registered_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 9. Add face_registered_at column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'face_registered_at'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN face_registered_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 10. Add password_hash column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE students 
        ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- 11. Add password_hash column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- 12. Add designation column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'designation'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN designation TEXT;
    END IF;
END $$;

-- 13. Add qualification column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'qualification'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN qualification TEXT;
    END IF;
END $$;

-- 14. Add experience_years column to faculty table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'experience_years'
    ) THEN
        ALTER TABLE faculty 
        ADD COLUMN experience_years INTEGER DEFAULT 0;
    END IF;
END $$;

-- 15. Update existing records to have default values where needed
UPDATE students 
SET face_data = '{}' 
WHERE face_data IS NULL;

UPDATE faculty 
SET face_data = '{}' 
WHERE face_data IS NULL;

-- 16. Show final table structure for students
SELECT 'Students table updated successfully!' as status;

-- 17. Show final table structure for faculty
SELECT 'Faculty table updated successfully!' as status;