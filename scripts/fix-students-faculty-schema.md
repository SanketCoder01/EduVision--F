# Fix Students and Faculty Schema

This script will add the missing `face_data` column to the students and faculty tables.

```sql
-- Fix EduVision Database Schema Issues for students and faculty tables
-- Run this in Supabase SQL Editor

-- 1. Add missing face_data column to students table if it doesn't exist
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

-- 2. Add missing face_data column to faculty table if it doesn't exist
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

-- 3. Add face_url column to students table if it doesn't exist
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

-- 4. Add face_url column to faculty table if it doesn't exist
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

-- 5. Add face_registered column to students table if it doesn't exist
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

-- 6. Add face_registered column to faculty table if it doesn't exist
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

-- 7. Add face_registered_at column to students table if it doesn't exist
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

-- 8. Add face_registered_at column to faculty table if it doesn't exist
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

-- 9. Update database types file to reflect these changes
-- Note: This needs to be done manually by updating the types/database.types.ts file