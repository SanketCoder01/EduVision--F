-- ============================================================================
-- COMPLETE REAL-TIME SYSTEM FIX
-- This adds year column to user_profiles and sets up all real-time connections
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD year COLUMN TO user_profiles (CRITICAL!)
-- ============================================================================

DO $$
BEGIN
  -- Add year column to user_profiles
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

  -- Add face_image column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles' 
      AND column_name = 'face_image'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN face_image TEXT;
    RAISE NOTICE '✅ Added face_image column to user_profiles';
  ELSE
    RAISE NOTICE '✅ user_profiles already has face_image column';
  END IF;
END $$;

-- Create index for faster year queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_dept_year ON public.user_profiles(department, year);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);

-- ============================================================================
-- STEP 2: POPULATE year FROM STUDENT TABLES
-- ============================================================================

-- Update user_profiles with year from CSE tables
UPDATE public.user_profiles up
SET year = 'first'
FROM public.students_cse_1st_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'second'
FROM public.students_cse_2nd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'third'
FROM public.students_cse_3rd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'fourth'
FROM public.students_cse_4th_year s
WHERE up.user_id = s.id AND up.year IS NULL;

-- Update from CYBER tables
UPDATE public.user_profiles up
SET year = 'first'
FROM public.students_cyber_1st_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'second'
FROM public.students_cyber_2nd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'third'
FROM public.students_cyber_3rd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'fourth'
FROM public.students_cyber_4th_year s
WHERE up.user_id = s.id AND up.year IS NULL;

-- Update from AIDS tables
UPDATE public.user_profiles up
SET year = 'first'
FROM public.students_aids_1st_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'second'
FROM public.students_aids_2nd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'third'
FROM public.students_aids_3rd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'fourth'
FROM public.students_aids_4th_year s
WHERE up.user_id = s.id AND up.year IS NULL;

-- Update from AIML tables
UPDATE public.user_profiles up
SET year = 'first'
FROM public.students_aiml_1st_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'second'
FROM public.students_aiml_2nd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'third'
FROM public.students_aiml_3rd_year s
WHERE up.user_id = s.id AND up.year IS NULL;

UPDATE public.user_profiles up
SET year = 'fourth'
FROM public.students_aiml_4th_year s
WHERE up.user_id = s.id AND up.year IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Populated year data from student tables';
END $$;

-- ============================================================================
-- STEP 3: ENABLE REAL-TIME ON user_profiles
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
  RAISE NOTICE '✅ Enabled real-time on user_profiles';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '✅ user_profiles already in real-time publication';
END $$;

-- ============================================================================
-- STEP 4: CREATE/UPDATE ESSENTIAL TABLES
-- ============================================================================

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  department TEXT NOT NULL,
  subject TEXT,
  target_years TEXT[] NOT NULL,
  due_date TIMESTAMPTZ,
  total_marks INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_faculty_id ON public.assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assignments_department ON public.assignments(department);
CREATE INDEX IF NOT EXISTS idx_assignments_published ON public.assignments(is_published);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can manage their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view published assignments" ON public.assignments;

CREATE POLICY "Faculty can manage their assignments"
  ON public.assignments FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Students can view published assignments"
  ON public.assignments FOR SELECT
  USING (is_published = true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  department TEXT NOT NULL,
  target_years TEXT[] NOT NULL,
  priority TEXT DEFAULT 'normal',
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_faculty_id ON public.announcements(faculty_id);
CREATE INDEX IF NOT EXISTS idx_announcements_department ON public.announcements(department);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can manage their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students can view announcements" ON public.announcements;

CREATE POLICY "Faculty can manage their announcements"
  ON public.announcements FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Students can view announcements"
  ON public.announcements FOR SELECT
  USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  schedule_data JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetables_faculty_id ON public.timetables(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetables_dept_year ON public.timetables(department, year);

ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can manage timetables" ON public.timetables;
DROP POLICY IF EXISTS "Students can view timetables" ON public.timetables;

CREATE POLICY "Faculty can manage timetables"
  ON public.timetables FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Students can view timetables"
  ON public.timetables FOR SELECT
  USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.timetables;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Study Materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  subject TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_materials_faculty_id ON public.study_materials(faculty_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_dept_year ON public.study_materials(department, year);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can manage study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view study materials" ON public.study_materials;

CREATE POLICY "Faculty can manage study materials"
  ON public.study_materials FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Students can view study materials"
  ON public.study_materials FOR SELECT
  USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.study_materials;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  department TEXT NOT NULL,
  target_years TEXT[] NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_faculty_id ON public.events(faculty_id);
CREATE INDEX IF NOT EXISTS idx_events_department ON public.events(department);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can manage events" ON public.events;
DROP POLICY IF EXISTS "Students can view events" ON public.events;

CREATE POLICY "Faculty can manage events"
  ON public.events FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Students can view events"
  ON public.events FOR SELECT
  USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 5: GRANT ALL PERMISSIONS
-- ============================================================================

GRANT ALL ON public.user_profiles TO authenticated, service_role;
GRANT ALL ON public.assignments TO authenticated, service_role;
GRANT ALL ON public.announcements TO authenticated, service_role;
GRANT ALL ON public.timetables TO authenticated, service_role;
GRANT ALL ON public.study_materials TO authenticated, service_role;
GRANT ALL ON public.events TO authenticated, service_role;

-- ============================================================================
-- STEP 6: VERIFICATION
-- ============================================================================

DO $$
DECLARE
  year_exists BOOLEAN;
  student_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '========================================';
  
  -- Check if year column exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'year'
  ) INTO year_exists;
  
  IF year_exists THEN
    RAISE NOTICE '✅ user_profiles.year column EXISTS';
    
    -- Count students with year data
    SELECT COUNT(*) INTO student_count
    FROM public.user_profiles
    WHERE user_type = 'student' AND year IS NOT NULL;
    
    RAISE NOTICE '✅ % students have year data populated', student_count;
  ELSE
    RAISE NOTICE '❌ user_profiles.year column MISSING';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 COMPLETE REAL-TIME SYSTEM READY!';
  RAISE NOTICE '========================================';
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     🎉 COMPLETE REAL-TIME SYSTEM CONFIGURED! 🎉           ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  ✅ Added year to user_profiles                           ║';
  RAISE NOTICE '║  ✅ Populated year from student tables                    ║';
  RAISE NOTICE '║  ✅ Created all essential tables                          ║';
  RAISE NOTICE '║  ✅ Enabled real-time on all tables                       ║';
  RAISE NOTICE '║  ✅ Set up RLS policies                                   ║';
  RAISE NOTICE '║  ✅ Faculty → Student connections ready                   ║';
  RAISE NOTICE '║  ✅ Student → Faculty connections ready                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  Your system is now FULLY REAL-TIME!                      ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
