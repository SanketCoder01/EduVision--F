-- Fix students table missing columns (name, user_id)
-- Run this in Supabase SQL Editor

-- Add missing name column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'students' 
          AND column_name = 'name'
    ) THEN
        ALTER TABLE public.students 
        ADD COLUMN name TEXT;
    END IF;
END $$;

-- Add missing user_id column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'students' 
          AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.students 
        ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Optional: ensure commonly used columns exist (complements other fix scripts)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.students ADD COLUMN password_hash TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'face_registered'
    ) THEN
        ALTER TABLE public.students ADD COLUMN face_registered BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'face_registered_at'
    ) THEN
        ALTER TABLE public.students ADD COLUMN face_registered_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'face_url'
    ) THEN
        ALTER TABLE public.students ADD COLUMN face_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'face_data'
    ) THEN
        ALTER TABLE public.students ADD COLUMN face_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Show confirmation
SELECT 'students table columns ensured' AS status;


