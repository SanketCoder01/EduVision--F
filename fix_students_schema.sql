-- ============================================
-- FIX STUDENTS TABLE SCHEMA ISSUE
-- Ensures prn column exists and schema cache is refreshed
-- ============================================

-- First, check if students table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
        RAISE NOTICE 'Creating students table...';
        
        CREATE TABLE students (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255),
            prn VARCHAR(50) UNIQUE,
            department VARCHAR(100),
            year VARCHAR(20) CHECK (year IN ('first', 'second', 'third', 'fourth')),
            phone VARCHAR(20),
            address TEXT,
            face_url TEXT,
            photo TEXT,
            avatar TEXT,
            registration_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Students table created';
    ELSE
        RAISE NOTICE 'Students table already exists';
    END IF;
END $$;

-- Ensure prn column exists (make it nullable for authentication flow)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'prn'
    ) THEN
        RAISE NOTICE 'Adding prn column...';
        ALTER TABLE students ADD COLUMN prn VARCHAR(50) UNIQUE;
        RAISE NOTICE '✅ PRN column added';
    ELSE
        RAISE NOTICE 'PRN column already exists';
        
        -- Make prn nullable if it's currently NOT NULL
        ALTER TABLE students ALTER COLUMN prn DROP NOT NULL;
        RAISE NOTICE '✅ PRN column set to nullable';
    END IF;
END $$;

-- Ensure registration_completed column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'registration_completed'
    ) THEN
        RAISE NOTICE 'Adding registration_completed column...';
        ALTER TABLE students ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ registration_completed column added';
    ELSE
        RAISE NOTICE 'registration_completed column already exists';
    END IF;
END $$;

-- Make department and year nullable for initial authentication
ALTER TABLE students ALTER COLUMN department DROP NOT NULL;
ALTER TABLE students ALTER COLUMN year DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_prn ON students(prn);
CREATE INDEX IF NOT EXISTS idx_students_dept_year ON students(department, year);

-- Disable RLS temporarily for development (enable later for production)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ STUDENTS TABLE SCHEMA FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '  ✓ PRN column is now nullable';
    RAISE NOTICE '  ✓ Department is now nullable';
    RAISE NOTICE '  ✓ Year is now nullable';
    RAISE NOTICE '  ✓ registration_completed column added';
    RAISE NOTICE '  ✓ Indexes created for performance';
    RAISE NOTICE '  ✓ RLS disabled for development';
    RAISE NOTICE '  ✓ Schema cache refreshed';
    RAISE NOTICE '';
    RAISE NOTICE 'Authentication flow will now work:';
    RAISE NOTICE '  1. User logs in with email/password';
    RAISE NOTICE '  2. Student record created with temp PRN';
    RAISE NOTICE '  3. User completes registration later';
    RAISE NOTICE '========================================';
END $$;
