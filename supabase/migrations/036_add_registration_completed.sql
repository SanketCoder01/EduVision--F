-- Check if registration_completed column exists in students table
-- If not, add it (it's used by some views/policies)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'registration_completed'
    ) THEN
        ALTER TABLE students ADD COLUMN registration_completed BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Also check if it exists in faculty table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' AND column_name = 'registration_completed'
    ) THEN
        ALTER TABLE faculty ADD COLUMN registration_completed BOOLEAN DEFAULT true;
    END IF;
END $$;
