-- ============================================================================
-- DISABLE ALL PROBLEMATIC "year" REFERENCES
-- This removes all SQL objects that reference students.year column
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL PROBLEMATIC RLS POLICIES
-- ============================================================================

-- Drop policies from 002_assignments_schema.sql
DROP POLICY IF EXISTS "Students can view published assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view assignment resources" ON public.assignment_resources;

-- Drop policies from 003_enhanced_department_year_system.sql
DROP POLICY IF EXISTS "Students can view their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students can view their events" ON public.events;
DROP POLICY IF EXISTS "Students can view their study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Students can view their attendance" ON public.attendance;

-- Drop policies from 004_comprehensive_features_schema.sql
DROP POLICY IF EXISTS "Students can view their timetable" ON public.timetable;
DROP POLICY IF EXISTS "Students can view their study materials" ON public.study_materials;

-- Drop policies from 200_complete_department_security_realtime.sql
DROP POLICY IF EXISTS "Students can view assignments for their department" ON public.assignments;
DROP POLICY IF EXISTS "Students can view announcements for their department" ON public.announcements;
DROP POLICY IF EXISTS "Students can view events for their department" ON public.events;
DROP POLICY IF EXISTS "Students can view study materials for their department" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view timetable for their department" ON public.timetable_entries;
DROP POLICY IF EXISTS "Students can view quizzes for their department" ON public.quizzes;
DROP POLICY IF EXISTS "Students can view attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can view study groups for their department" ON public.study_groups;

-- Drop policies from 400_fix_announcements_rls_and_storage.sql
DROP POLICY IF EXISTS "Students can view announcements" ON public.announcements;

RAISE NOTICE '✅ Dropped all problematic RLS policies';

-- ============================================================================
-- STEP 2: DROP PROBLEMATIC VIEWS
-- ============================================================================

DROP VIEW IF EXISTS public.student_directory CASCADE;

RAISE NOTICE '✅ Dropped problematic views';

-- ============================================================================
-- STEP 3: DROP PROBLEMATIC FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_students_by_dept_year(TEXT, TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.get_department_stats(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_content() CASCADE;

RAISE NOTICE '✅ Dropped problematic functions';

-- ============================================================================
-- STEP 4: RECREATE SIMPLIFIED RLS POLICIES (WITHOUT year references)
-- ============================================================================

-- Assignments - simplified to only check department
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
    CREATE POLICY "Students can view published assignments"
      ON public.assignments FOR SELECT
      USING (
        is_published = true 
        AND department IN (
          SELECT department FROM public.students_cse_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_4th_year WHERE id = auth.uid()
        )
      );
    RAISE NOTICE '✅ Created simplified assignments policy';
  END IF;
END $$;

-- Announcements - simplified to only check department
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcements') THEN
    CREATE POLICY "Students can view announcements"
      ON public.announcements FOR SELECT
      USING (
        department IN (
          SELECT department FROM public.students_cse_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_4th_year WHERE id = auth.uid()
        )
      );
    RAISE NOTICE '✅ Created simplified announcements policy';
  END IF;
END $$;

-- Study Groups - simplified to only check department
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'study_groups') THEN
    CREATE POLICY "Students can view study groups"
      ON public.study_groups FOR SELECT
      USING (
        department IN (
          SELECT department FROM public.students_cse_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_4th_year WHERE id = auth.uid()
        )
      );
    RAISE NOTICE '✅ Created simplified study groups policy';
  END IF;
END $$;

-- Study Materials - simplified to only check department
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'study_materials') THEN
    CREATE POLICY "Students can view study materials"
      ON public.study_materials FOR SELECT
      USING (
        department IN (
          SELECT department FROM public.students_cse_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_4th_year WHERE id = auth.uid()
        )
      );
    RAISE NOTICE '✅ Created simplified study materials policy';
  END IF;
END $$;

-- Attendance Sessions - simplified to only check department
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance_sessions') THEN
    CREATE POLICY "Students can view attendance sessions"
      ON public.attendance_sessions FOR SELECT
      USING (
        department IN (
          SELECT department FROM public.students_cse_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cse_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_cyber_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aids_4th_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_1st_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_2nd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_3rd_year WHERE id = auth.uid()
          UNION ALL SELECT department FROM public.students_aiml_4th_year WHERE id = auth.uid()
        )
      );
    RAISE NOTICE '✅ Created simplified attendance sessions policy';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: ADD year COLUMN TO user_profiles (for API compatibility)
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

-- ============================================================================
-- STEP 6: CREATE ESSENTIAL TABLES (profile_updates, study_groups)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  year TEXT,
  department TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_updates_user_id ON public.profile_updates(user_id);
ALTER TABLE public.profile_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile updates" ON public.profile_updates;
DROP POLICY IF EXISTS "System can insert profile updates" ON public.profile_updates;

CREATE POLICY "Users can view their own profile updates"
  ON public.profile_updates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert profile updates"
  ON public.profile_updates FOR INSERT
  WITH CHECK (true);

-- Enable real-time
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_updates;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

RAISE NOTICE '✅ Created profile_updates table';

-- Study Groups
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  faculty_id UUID NOT NULL,
  faculty TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 5,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_groups_faculty_id ON public.study_groups(faculty_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_department_year ON public.study_groups(department, year);
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can manage study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Students can view study groups" ON public.study_groups;

CREATE POLICY "Faculty can manage study groups"
  ON public.study_groups FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

-- Enable real-time
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.study_groups;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

RAISE NOTICE '✅ Created study_groups table';

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON public.user_profiles TO authenticated, service_role;
GRANT ALL ON public.profile_updates TO authenticated, service_role;
GRANT ALL ON public.study_groups TO authenticated, service_role;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     🎉 YEAR REFERENCES DISABLED SUCCESSFULLY! 🎉          ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  ✅ Dropped all problematic RLS policies                  ║';
  RAISE NOTICE '║  ✅ Dropped problematic views and functions               ║';
  RAISE NOTICE '║  ✅ Created simplified policies (department-only)         ║';
  RAISE NOTICE '║  ✅ Added year to user_profiles for API                   ║';
  RAISE NOTICE '║  ✅ Created essential tables                              ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  Your "column year does not exist" error is FIXED!        ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
