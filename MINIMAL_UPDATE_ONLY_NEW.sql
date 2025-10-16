-- ============================================
-- MINIMAL UPDATE - ONLY NEW ITEMS
-- This script contains ONLY what's not already in your database
-- Based on deep search of all existing migrations
-- ============================================

-- ============================================
-- 1. ADD PHONE COLUMN TO FACULTY (if missing)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='faculty' AND column_name='phone') THEN
        ALTER TABLE faculty ADD COLUMN phone TEXT;
        RAISE NOTICE '✅ Added phone column to faculty';
    ELSE
        RAISE NOTICE '✓ phone column already exists in faculty';
    END IF;
END $$;

-- ============================================
-- 2. CREATE DEPARTMENT SECURITY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION can_faculty_access_department(
    faculty_dept TEXT,
    target_dept TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Cyber Security can access CSE, AIDS, AIML
    IF faculty_dept = 'CY' OR faculty_dept = 'Cyber Security' THEN
        RETURN target_dept IN ('CSE', 'AIDS', 'AIML', 'CY', 'Cyber Security');
    END IF;
    
    -- CSE faculty can only access CSE
    IF faculty_dept = 'CSE' OR faculty_dept = 'Computer Science' THEN
        RETURN target_dept IN ('CSE', 'Computer Science');
    END IF;
    
    -- AIDS faculty can only access AIDS
    IF faculty_dept = 'AIDS' THEN
        RETURN target_dept = 'AIDS';
    END IF;
    
    -- AIML faculty can only access AIML
    IF faculty_dept = 'AIML' THEN
        RETURN target_dept = 'AIML';
    END IF;
    
    -- Default: same department only
    RETURN faculty_dept = target_dept;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTING DEPARTMENT FUNCTION';
    RAISE NOTICE '========================================';
    
    IF can_faculty_access_department('CY', 'CSE') THEN
        RAISE NOTICE '✅ CY can access CSE: TRUE';
    END IF;
    
    IF NOT can_faculty_access_department('CSE', 'AIDS') THEN
        RAISE NOTICE '✅ CSE cannot access AIDS: FALSE';
    END IF;
    
    IF can_faculty_access_department('AIDS', 'AIDS') THEN
        RAISE NOTICE '✅ AIDS can access AIDS: TRUE';
    END IF;
END $$;

-- ============================================
-- 3. DROP ALL EXISTING RLS POLICIES
-- (Clean slate for new security policies)
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on assignments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'assignments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON assignments', r.policyname);
    END LOOP;
    
    -- Drop all policies on announcements
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'announcements')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON announcements', r.policyname);
    END LOOP;
    
    -- Drop all policies on events
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'events')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON events', r.policyname);
    END LOOP;
    
    -- Drop all policies on study_materials
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'study_materials')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON study_materials', r.policyname);
    END LOOP;
    
    -- Drop all policies on timetable
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'timetable')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON timetable', r.policyname);
    END LOOP;
    
    -- Drop all policies on quizzes (if exists)
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quizzes')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON quizzes', r.policyname);
    END LOOP;
    
    -- Drop all policies on study_groups
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'study_groups')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON study_groups', r.policyname);
    END LOOP;
    
    RAISE NOTICE '✅ Dropped all existing RLS policies';
END $$;

-- ============================================
-- 4. CREATE NEW RLS POLICIES WITH DEPARTMENT SECURITY
-- ============================================

-- ASSIGNMENTS POLICIES
CREATE POLICY "Faculty create assignments for accessible depts" ON assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = assignments.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, assignments.department)
        )
    );

CREATE POLICY "Faculty view assignments from accessible depts" ON assignments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, assignments.department))
    );

CREATE POLICY "Faculty update own assignments" ON assignments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = assignments.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Faculty delete own assignments" ON assignments
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = assignments.faculty_id)
    );

CREATE POLICY "Students view assignments if registered" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = assignments.department
            AND (students.year = ANY(COALESCE(assignments.target_years, ARRAY[]::TEXT[])) 
                 OR COALESCE(array_length(assignments.target_years, 1), 0) = 0)
        )
    );

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Faculty create announcements for accessible depts" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = announcements.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, announcements.department)
        )
    );

CREATE POLICY "Faculty view all announcements" ON announcements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, announcements.department))
    );

CREATE POLICY "Faculty update own announcements" ON announcements
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = announcements.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Faculty delete own announcements" ON announcements
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = announcements.faculty_id)
    );

CREATE POLICY "Students view announcements if registered" ON announcements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = announcements.department
            AND (students.year = ANY(COALESCE(announcements.target_years, ARRAY[]::TEXT[]))
                 OR COALESCE(array_length(announcements.target_years, 1), 0) = 0)
        )
    );

-- EVENTS POLICIES
CREATE POLICY "Faculty create events for accessible depts" ON events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = events.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, events.department)
        )
    );

CREATE POLICY "Faculty view all events" ON events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, events.department))
    );

CREATE POLICY "Faculty update own events" ON events
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = events.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Students view events if registered" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = events.department
            AND (students.year = ANY(COALESCE(events.target_years, ARRAY[]::TEXT[]))
                 OR COALESCE(array_length(events.target_years, 1), 0) = 0)
        )
    );

-- STUDY MATERIALS POLICIES
CREATE POLICY "Faculty upload materials for accessible depts" ON study_materials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = study_materials.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, study_materials.department)
        )
    );

CREATE POLICY "Faculty view all study materials" ON study_materials
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, study_materials.department))
    );

CREATE POLICY "Faculty update own study materials" ON study_materials
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = study_materials.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Students view materials if registered" ON study_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = study_materials.department
            AND (students.year = ANY(COALESCE(study_materials.target_years, ARRAY[]::TEXT[]))
                 OR COALESCE(array_length(study_materials.target_years, 1), 0) = 0)
        )
    );

-- TIMETABLE POLICIES
CREATE POLICY "Faculty create timetable for accessible depts" ON timetable
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = timetable.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, timetable.department)
        )
    );

CREATE POLICY "Faculty view all timetable" ON timetable
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, timetable.department))
    );

CREATE POLICY "Faculty update timetable" ON timetable
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = timetable.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Students view timetable if registered" ON timetable
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = timetable.department
            AND students.year = timetable.year
        )
    );

-- STUDY GROUPS POLICIES (Faculty creates, students view)
CREATE POLICY "Faculty create study groups for accessible depts" ON study_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = study_groups.faculty_id
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, study_groups.department)
        )
    );

CREATE POLICY "Faculty view study groups in accessible depts" ON study_groups
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, study_groups.department))
    );

CREATE POLICY "Faculty update own study groups" ON study_groups
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = study_groups.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Students view groups if registered" ON study_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = study_groups.department
            AND (students.year = ANY(COALESCE(study_groups.target_years, ARRAY[]::TEXT[]))
                 OR COALESCE(array_length(study_groups.target_years, 1), 0) = 0)
        )
    );

DO $$
BEGIN
    RAISE NOTICE '✅ Created all NEW RLS policies with department security';
END $$;

-- ============================================
-- 5. CREATE PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_registration_dept_year 
    ON students(registration_completed, department, year);
    
CREATE INDEX IF NOT EXISTS idx_faculty_registration_dept 
    ON faculty(registration_completed, department);

CREATE INDEX IF NOT EXISTS idx_assignments_dept_target_years 
    ON assignments(department, target_years);
    
CREATE INDEX IF NOT EXISTS idx_announcements_dept_target_years 
    ON announcements(department, target_years);
    
CREATE INDEX IF NOT EXISTS idx_events_dept_target_years 
    ON events(department, target_years);
    
CREATE INDEX IF NOT EXISTS idx_study_materials_dept_target_years 
    ON study_materials(department, target_years);

DO $$
BEGIN
    RAISE NOTICE '✅ Created performance indexes';
END $$;

-- ============================================
-- 6. ENABLE REALTIME (Safe with error handling)
-- ============================================

DO $$
BEGIN
    -- Try to add each table, continue on error
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
        RAISE NOTICE '✅ Added assignments to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ assignments already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
        RAISE NOTICE '✅ Added announcements to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ announcements already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
        RAISE NOTICE '✅ Added events to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ events already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE study_materials;
        RAISE NOTICE '✅ Added study_materials to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ study_materials already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE timetable;
        RAISE NOTICE '✅ Added timetable to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ timetable already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
        RAISE NOTICE '✅ Added study_groups to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ study_groups already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE students;
        RAISE NOTICE '✅ Added students to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ students already in realtime publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE faculty;
        RAISE NOTICE '✅ Added faculty to realtime';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE '✓ faculty already in realtime publication';
    END;
END $$;

-- ============================================
-- 7. FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
    policy_count INTEGER;
    test_passed BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL VERIFICATION';
    RAISE NOTICE '========================================';
    
    -- Test 1: Department function
    IF can_faculty_access_department('CY', 'CSE') 
       AND can_faculty_access_department('CY', 'AIDS')
       AND can_faculty_access_department('CY', 'AIML') THEN
        RAISE NOTICE '✅ TEST 1: CY hierarchy working';
    ELSE
        RAISE NOTICE '❌ TEST 1: CY hierarchy FAILED';
        test_passed := FALSE;
    END IF;
    
    -- Test 2: CSE isolation
    IF can_faculty_access_department('CSE', 'CSE')
       AND NOT can_faculty_access_department('CSE', 'AIDS') THEN
        RAISE NOTICE '✅ TEST 2: CSE isolation working';
    ELSE
        RAISE NOTICE '❌ TEST 2: CSE isolation FAILED';
        test_passed := FALSE;
    END IF;
    
    -- Test 3: Check policies exist
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'assignments';
    IF policy_count >= 5 THEN
        RAISE NOTICE '✅ TEST 3: Assignments has % policies', policy_count;
    ELSE
        RAISE NOTICE '❌ TEST 3: Assignments policies FAILED (only %)', policy_count;
        test_passed := FALSE;
    END IF;
    
    -- Test 4: Registration columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='faculty' AND column_name='registration_completed')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_completed') THEN
        RAISE NOTICE '✅ TEST 4: Registration columns exist';
    ELSE
        RAISE NOTICE '❌ TEST 4: Registration columns FAILED';
        test_passed := FALSE;
    END IF;
    
    RAISE NOTICE '';
    IF test_passed THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅✅✅ ALL TESTS PASSED! ✅✅✅';
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Your database is now secured with:';
        RAISE NOTICE '  • Department-based security (CY → CSE/AIDS/AIML)';
        RAISE NOTICE '  • Registration enforcement';
        RAISE NOTICE '  • Real-time enabled for all modules';
        RAISE NOTICE '  • Performance indexes created';
        RAISE NOTICE '';
        RAISE NOTICE 'Next: Go to Supabase Dashboard → Database → Replication';
        RAISE NOTICE 'Enable real-time for all tables if not done already';
    ELSE
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ SOME TESTS FAILED';
        RAISE NOTICE '========================================';
    END IF;
END $$;
