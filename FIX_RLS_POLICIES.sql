-- ============================================================================
-- FIX RLS POLICIES FOR ASSIGNMENTS
-- This fixes the "violates row-level security policy" error
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- FIX ASSIGNMENTS TABLE RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Faculty can manage their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can update their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can delete their assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view published assignments" ON public.assignments;

-- Create new policies with proper checks
CREATE POLICY "Faculty can insert assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    auth.uid() = faculty_id
  );

CREATE POLICY "Faculty can view their assignments"
  ON public.assignments FOR SELECT
  USING (
    auth.uid() = faculty_id
  );

CREATE POLICY "Faculty can update their assignments"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can delete their assignments"
  ON public.assignments FOR DELETE
  USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view published assignments"
  ON public.assignments FOR SELECT
  USING (is_published = true);

-- ============================================================================
-- FIX ANNOUNCEMENTS TABLE RLS
-- ============================================================================

DROP POLICY IF EXISTS "Faculty can manage their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Faculty can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Faculty can update their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Faculty can delete their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Students can view announcements" ON public.announcements;

CREATE POLICY "Faculty can insert announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can view their announcements"
  ON public.announcements FOR SELECT
  USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update their announcements"
  ON public.announcements FOR UPDATE
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can delete their announcements"
  ON public.announcements FOR DELETE
  USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view all announcements"
  ON public.announcements FOR SELECT
  USING (true);

-- ============================================================================
-- FIX STUDY_MATERIALS TABLE RLS
-- ============================================================================

DROP POLICY IF EXISTS "Faculty can manage study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Faculty can create study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Faculty can update study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Faculty can delete study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view study materials" ON public.study_materials;

CREATE POLICY "Faculty can insert study materials"
  ON public.study_materials FOR INSERT
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can view their study materials"
  ON public.study_materials FOR SELECT
  USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update their study materials"
  ON public.study_materials FOR UPDATE
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can delete their study materials"
  ON public.study_materials FOR DELETE
  USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view all study materials"
  ON public.study_materials FOR SELECT
  USING (true);

-- ============================================================================
-- FIX TIMETABLES TABLE RLS
-- ============================================================================

DROP POLICY IF EXISTS "Faculty can manage timetables" ON public.timetables;
DROP POLICY IF EXISTS "Faculty can create timetables" ON public.timetables;
DROP POLICY IF EXISTS "Faculty can update timetables" ON public.timetables;
DROP POLICY IF EXISTS "Faculty can delete timetables" ON public.timetables;
DROP POLICY IF EXISTS "Students can view timetables" ON public.timetables;

CREATE POLICY "Faculty can insert timetables"
  ON public.timetables FOR INSERT
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can view their timetables"
  ON public.timetables FOR SELECT
  USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update their timetables"
  ON public.timetables FOR UPDATE
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can delete their timetables"
  ON public.timetables FOR DELETE
  USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view all timetables"
  ON public.timetables FOR SELECT
  USING (true);

-- ============================================================================
-- FIX STUDY_GROUPS TABLE RLS
-- ============================================================================

DROP POLICY IF EXISTS "Faculty can view their own study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Faculty can create study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Faculty can update their own study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Faculty can delete their own study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Students can view study groups for their dept/year" ON public.study_groups;

CREATE POLICY "Faculty can insert study groups"
  ON public.study_groups FOR INSERT
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can view their study groups"
  ON public.study_groups FOR SELECT
  USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can update their study groups"
  ON public.study_groups FOR UPDATE
  USING (auth.uid() = faculty_id)
  WITH CHECK (auth.uid() = faculty_id);

CREATE POLICY "Faculty can delete their study groups"
  ON public.study_groups FOR DELETE
  USING (auth.uid() = faculty_id);

CREATE POLICY "Students can view all study groups"
  ON public.study_groups FOR SELECT
  USING (true);

-- ============================================================================
-- FIX EVENTS TABLE RLS (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    DROP POLICY IF EXISTS "Faculty can manage events" ON public.events;
    DROP POLICY IF EXISTS "Students can view events" ON public.events;

    CREATE POLICY "Faculty can insert events"
      ON public.events FOR INSERT
      WITH CHECK (auth.uid() = faculty_id);

    CREATE POLICY "Faculty can view their events"
      ON public.events FOR SELECT
      USING (auth.uid() = faculty_id);

    CREATE POLICY "Faculty can update their events"
      ON public.events FOR UPDATE
      USING (auth.uid() = faculty_id)
      WITH CHECK (auth.uid() = faculty_id);

    CREATE POLICY "Faculty can delete their events"
      ON public.events FOR DELETE
      USING (auth.uid() = faculty_id);

    CREATE POLICY "Students can view all events"
      ON public.events FOR SELECT
      USING (true);

    RAISE NOTICE '✅ Fixed events table RLS policies';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           🎉 RLS POLICIES FIXED! 🎉                       ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  ✅ Assignments - Faculty can INSERT                      ║';
  RAISE NOTICE '║  ✅ Announcements - Faculty can INSERT                    ║';
  RAISE NOTICE '║  ✅ Study Materials - Faculty can INSERT                  ║';
  RAISE NOTICE '║  ✅ Timetables - Faculty can INSERT                       ║';
  RAISE NOTICE '║  ✅ Study Groups - Faculty can INSERT                     ║';
  RAISE NOTICE '║  ✅ Events - Faculty can INSERT                           ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  Students can view all published content                  ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
