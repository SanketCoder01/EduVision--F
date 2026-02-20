-- ============================================================================
-- SAFE YEAR COLUMN FIX
-- This only uses columns that definitely exist in all student tables
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD year COLUMN TO ALL 16 STUDENT TABLES
-- ============================================================================

DO $$
BEGIN
  -- CSE Tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cse_1st_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cse_1st_year ADD COLUMN year TEXT DEFAULT 'first';
    UPDATE public.students_cse_1st_year SET year = 'first' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cse_2nd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cse_2nd_year ADD COLUMN year TEXT DEFAULT 'second';
    UPDATE public.students_cse_2nd_year SET year = 'second' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cse_3rd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cse_3rd_year ADD COLUMN year TEXT DEFAULT 'third';
    UPDATE public.students_cse_3rd_year SET year = 'third' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cse_4th_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cse_4th_year ADD COLUMN year TEXT DEFAULT 'fourth';
    UPDATE public.students_cse_4th_year SET year = 'fourth' WHERE year IS NULL;
  END IF;

  -- CYBER Tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cyber_1st_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cyber_1st_year ADD COLUMN year TEXT DEFAULT 'first';
    UPDATE public.students_cyber_1st_year SET year = 'first' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cyber_2nd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cyber_2nd_year ADD COLUMN year TEXT DEFAULT 'second';
    UPDATE public.students_cyber_2nd_year SET year = 'second' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cyber_3rd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cyber_3rd_year ADD COLUMN year TEXT DEFAULT 'third';
    UPDATE public.students_cyber_3rd_year SET year = 'third' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_cyber_4th_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_cyber_4th_year ADD COLUMN year TEXT DEFAULT 'fourth';
    UPDATE public.students_cyber_4th_year SET year = 'fourth' WHERE year IS NULL;
  END IF;

  -- AIDS Tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aids_1st_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aids_1st_year ADD COLUMN year TEXT DEFAULT 'first';
    UPDATE public.students_aids_1st_year SET year = 'first' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aids_2nd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aids_2nd_year ADD COLUMN year TEXT DEFAULT 'second';
    UPDATE public.students_aids_2nd_year SET year = 'second' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aids_3rd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aids_3rd_year ADD COLUMN year TEXT DEFAULT 'third';
    UPDATE public.students_aids_3rd_year SET year = 'third' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aids_4th_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aids_4th_year ADD COLUMN year TEXT DEFAULT 'fourth';
    UPDATE public.students_aids_4th_year SET year = 'fourth' WHERE year IS NULL;
  END IF;

  -- AIML Tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aiml_1st_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aiml_1st_year ADD COLUMN year TEXT DEFAULT 'first';
    UPDATE public.students_aiml_1st_year SET year = 'first' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aiml_2nd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aiml_2nd_year ADD COLUMN year TEXT DEFAULT 'second';
    UPDATE public.students_aiml_2nd_year SET year = 'second' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aiml_3rd_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aiml_3rd_year ADD COLUMN year TEXT DEFAULT 'third';
    UPDATE public.students_aiml_3rd_year SET year = 'third' WHERE year IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students_aiml_4th_year' AND column_name = 'year') THEN
    ALTER TABLE public.students_aiml_4th_year ADD COLUMN year TEXT DEFAULT 'fourth';
    UPDATE public.students_aiml_4th_year SET year = 'fourth' WHERE year IS NULL;
  END IF;

  RAISE NOTICE '✅ Added year column to all 16 student tables';
END $$;

-- ============================================================================
-- STEP 2: CREATE UNIFIED students VIEW (SAFE - ONLY COMMON COLUMNS)
-- ============================================================================

-- Drop existing table or view if it exists
DROP TABLE IF EXISTS public.students CASCADE;
DROP VIEW IF EXISTS public.students CASCADE;

-- Create VIEW with only columns that exist in ALL tables
CREATE OR REPLACE VIEW public.students AS
SELECT 
  id,
  name,
  email,
  'CSE' as department,
  year,
  created_at
FROM public.students_cse_1st_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CSE' as department,
  year,
  created_at
FROM public.students_cse_2nd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CSE' as department,
  year,
  created_at
FROM public.students_cse_3rd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CSE' as department,
  year,
  created_at
FROM public.students_cse_4th_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CYBER' as department,
  year,
  created_at
FROM public.students_cyber_1st_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CYBER' as department,
  year,
  created_at
FROM public.students_cyber_2nd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CYBER' as department,
  year,
  created_at
FROM public.students_cyber_3rd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'CYBER' as department,
  year,
  created_at
FROM public.students_cyber_4th_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIDS' as department,
  year,
  created_at
FROM public.students_aids_1st_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIDS' as department,
  year,
  created_at
FROM public.students_aids_2nd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIDS' as department,
  year,
  created_at
FROM public.students_aids_3rd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIDS' as department,
  year,
  created_at
FROM public.students_aids_4th_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIML' as department,
  year,
  created_at
FROM public.students_aiml_1st_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIML' as department,
  year,
  created_at
FROM public.students_aiml_2nd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIML' as department,
  year,
  created_at
FROM public.students_aiml_3rd_year
UNION ALL
SELECT 
  id,
  name,
  email,
  'AIML' as department,
  year,
  created_at
FROM public.students_aiml_4th_year;

DO $$
BEGIN
  RAISE NOTICE '✅ Created unified students VIEW with safe columns';
END $$;

-- ============================================================================
-- STEP 3: ADD year TO user_profiles
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles' 
      AND column_name = 'year'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN year TEXT;
    RAISE NOTICE '✅ Added year column to user_profiles';
  ELSE
    RAISE NOTICE '✅ user_profiles already has year column';
  END IF;
END $$;

-- Populate year from students VIEW
UPDATE public.user_profiles up
SET year = s.year
FROM public.students s
WHERE up.user_id = s.id 
  AND up.user_type = 'student'
  AND up.year IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Populated year in user_profiles from students';
END $$;

-- ============================================================================
-- STEP 4: VERIFICATION
-- ============================================================================

DO $$
DECLARE
  student_count INTEGER;
  profile_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '========================================';
  
  -- Check students VIEW
  SELECT COUNT(*) INTO student_count FROM public.students WHERE year IS NOT NULL;
  RAISE NOTICE '✅ students VIEW: % records with year', student_count;
  
  -- Check user_profiles
  SELECT COUNT(*) INTO profile_count FROM public.user_profiles WHERE user_type = 'student' AND year IS NOT NULL;
  RAISE NOTICE '✅ user_profiles: % students with year', profile_count;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 SAFE YEAR FIX COMPLETE!';
  RAISE NOTICE '========================================';
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           🎉 SAFE YEAR FIX COMPLETE! 🎉                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  ✅ Added year to all 16 student tables                   ║';
  RAISE NOTICE '║  ✅ Created unified students VIEW (safe columns)          ║';
  RAISE NOTICE '║  ✅ Added year to user_profiles                           ║';
  RAISE NOTICE '║  ✅ Populated year data                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  Using only: id, name, email, department, year            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
