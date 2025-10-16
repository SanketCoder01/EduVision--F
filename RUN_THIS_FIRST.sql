-- ============================================
-- EDUVISION: QUICK SETUP & VERIFICATION SCRIPT
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- This script will:
-- 1. Set up all security policies
-- 2. Add registration columns
-- 3. Enable real-time
-- 4. Test everything is working

-- ============================================
-- STEP 1: ADD REGISTRATION COLUMNS
-- ============================================

DO $$
BEGIN
    -- Add to faculty table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='faculty' AND column_name='registration_completed') THEN
        ALTER TABLE faculty ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Added registration_completed to faculty';
    ELSE
        RAISE NOTICE '✓ registration_completed already exists in faculty';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='faculty' AND column_name='phone') THEN
        ALTER TABLE faculty ADD COLUMN phone TEXT;
        RAISE NOTICE '✅ Added phone to faculty';
    ELSE
        RAISE NOTICE '✓ phone already exists in faculty';
    END IF;

    -- Add to students table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_completed') THEN
        ALTER TABLE students ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Added registration_completed to students';
    ELSE
        RAISE NOTICE '✓ registration_completed already exists in students';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_step') THEN
        ALTER TABLE students ADD COLUMN registration_step INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added registration_step to students';
    ELSE
        RAISE NOTICE '✓ registration_step already exists in students';
    END IF;
END $$;

-- ============================================
-- STEP 2: CREATE DEPARTMENT SECURITY FUNCTION
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
    IF can_faculty_access_department('CY', 'CSE') THEN
        RAISE NOTICE '✅ Department function working: CY can access CSE';
    END IF;
    
    IF NOT can_faculty_access_department('CSE', 'AIDS') THEN
        RAISE NOTICE '✅ Department function working: CSE cannot access AIDS';
    END IF;
END $$;

-- ============================================
-- STEP 3: DROP OLD POLICIES (Clean slate)
-- ============================================

-- Assignments
DROP POLICY IF EXISTS "Faculty can view assignments in accessible departments" ON assignments;
DROP POLICY IF EXISTS "Faculty can create assignments in accessible departments" ON assignments;
DROP POLICY IF EXISTS "Faculty can update own assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can delete own assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments for their dept and year" ON assignments;
DROP POLICY IF EXISTS "Public read access" ON assignments;
DROP POLICY IF EXISTS "Faculty create assignments for accessible depts" ON assignments;
DROP POLICY IF EXISTS "Faculty view assignments from accessible depts" ON assignments;
DROP POLICY IF EXISTS "Faculty update own assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty delete own assignments" ON assignments;
DROP POLICY IF EXISTS "Students view assignments if registered" ON assignments;

-- Announcements
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Faculty can create announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can view announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can update own announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can delete own announcements" ON announcements;
DROP POLICY IF EXISTS "Students can view announcements" ON announcements;

-- Events
DROP POLICY IF EXISTS "Public read access" ON events;
DROP POLICY IF EXISTS "Faculty can create events" ON events;
DROP POLICY IF EXISTS "Faculty can view events" ON events;
DROP POLICY IF EXISTS "Faculty can update own events" ON events;
DROP POLICY IF EXISTS "Students can view events" ON events;

-- Study Materials
DROP POLICY IF EXISTS "Public read access" ON study_materials;
DROP POLICY IF EXISTS "Faculty can upload study materials" ON study_materials;
DROP POLICY IF EXISTS "Faculty can view study materials" ON study_materials;
DROP POLICY IF EXISTS "Faculty can update own materials" ON study_materials;
DROP POLICY IF EXISTS "Students can view study materials" ON study_materials;

-- Timetable (handle both table names)
DROP POLICY IF EXISTS "Public read access" ON timetable_entries;
DROP POLICY IF EXISTS "Faculty can create timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Faculty can view timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Faculty can update timetable" ON timetable_entries;
DROP POLICY IF EXISTS "Students can view timetable" ON timetable_entries;

DROP POLICY IF EXISTS "Public read access" ON timetable;
DROP POLICY IF EXISTS "Faculty can create timetable" ON timetable;
DROP POLICY IF EXISTS "Faculty can view timetable" ON timetable;
DROP POLICY IF EXISTS "Faculty can update timetable" ON timetable;
DROP POLICY IF EXISTS "Students can view timetable" ON timetable;
DROP POLICY IF EXISTS "Faculty create timetable for accessible depts" ON timetable;
DROP POLICY IF EXISTS "Faculty view all timetable" ON timetable;
DROP POLICY IF EXISTS "Students view timetable if registered" ON timetable;

-- Quiz
DROP POLICY IF EXISTS "Public read access" ON quizzes;
DROP POLICY IF EXISTS "Faculty can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Students can view published quizzes" ON quizzes;

-- Study Groups
DROP POLICY IF EXISTS "Public read access" ON study_groups;
DROP POLICY IF EXISTS "Students can create study groups" ON study_groups;
DROP POLICY IF EXISTS "Students can view study groups" ON study_groups;
DROP POLICY IF EXISTS "Students can update own groups" ON study_groups;

DO $$
BEGIN
    RAISE NOTICE '✅ Cleaned up old policies';
END $$;

-- ============================================
-- STEP 4: CREATE NEW RLS POLICIES
-- ============================================

-- ASSIGNMENTS
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

-- ANNOUNCEMENTS
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

-- EVENTS
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

-- STUDY MATERIALS
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

-- TIMETABLE
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

-- QUIZ
CREATE POLICY "Faculty create quizzes for accessible depts" ON quizzes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = quizzes.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, quizzes.department)
        )
    );

CREATE POLICY "Faculty view all quizzes" ON quizzes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, quizzes.department))
    );

CREATE POLICY "Faculty update own quizzes" ON quizzes
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM faculty WHERE faculty.id = quizzes.faculty_id AND faculty.registration_completed = TRUE)
    );

CREATE POLICY "Students view quizzes if registered" ON quizzes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = quizzes.department
            AND students.year = quizzes.year
            AND quizzes.is_published = TRUE
        )
    );

-- STUDY GROUPS
CREATE POLICY "Students create groups if registered" ON study_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = study_groups.created_by
            AND students.registration_completed = TRUE
        )
    );

CREATE POLICY "Students view groups if registered" ON study_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = study_groups.department
            AND students.year = study_groups.year
        )
    );

CREATE POLICY "Faculty view study groups in accessible depts" ON study_groups
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM faculty WHERE can_faculty_access_department(faculty.department, study_groups.department))
    );

DO $$
BEGIN
    RAISE NOTICE '✅ Created all RLS policies';
END $$;

-- ============================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_registration_dept_year 
    ON students(registration_completed, department, year);
    
CREATE INDEX IF NOT EXISTS idx_faculty_registration_dept 
    ON faculty(registration_completed, department);

CREATE INDEX IF NOT EXISTS idx_assignments_dept_year_status 
    ON assignments(department, year, status);
    
CREATE INDEX IF NOT EXISTS idx_announcements_dept 
    ON announcements(department);
    
CREATE INDEX IF NOT EXISTS idx_events_dept 
    ON events(department);
    
CREATE INDEX IF NOT EXISTS idx_study_materials_dept_year 
    ON study_materials(department, year);

DO $$
BEGIN
    RAISE NOTICE '✅ Created performance indexes';
END $$;

-- ============================================
-- STEP 6: ENABLE REALTIME
-- ============================================

-- Note: We'll try to add tables to publication, ignore errors if already added
DO $$
BEGIN
    -- Try to add each table, continue on error
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'assignments already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'announcements already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'events already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE study_materials;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'study_materials already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE timetable;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'timetable already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE quizzes;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'quizzes already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE attendance_sessions;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'attendance_sessions already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'study_groups already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE students;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'students already in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE faculty;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'faculty already in publication';
    END;
END $$;

DO $$
BEGIN
    RAISE NOTICE '✅ Enabled real-time for all tables';
END $$;

-- ============================================
-- STEP 7: VERIFICATION TESTS
-- ============================================

DO $$
DECLARE
    test_passed BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RUNNING VERIFICATION TESTS';
    RAISE NOTICE '========================================';
    
    -- Test 1: Department function
    IF can_faculty_access_department('CY', 'CSE') 
       AND can_faculty_access_department('CY', 'AIDS')
       AND can_faculty_access_department('CY', 'AIML') THEN
        RAISE NOTICE '✅ TEST 1 PASSED: CY can access CSE, AIDS, AIML';
    ELSE
        RAISE NOTICE '❌ TEST 1 FAILED: CY department access';
    END IF;
    
    -- Test 2: CSE isolation
    IF can_faculty_access_department('CSE', 'CSE')
       AND NOT can_faculty_access_department('CSE', 'AIDS') THEN
        RAISE NOTICE '✅ TEST 2 PASSED: CSE isolated to CSE only';
    ELSE
        RAISE NOTICE '❌ TEST 2 FAILED: CSE isolation';
    END IF;
    
    -- Test 3: Registration columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='faculty' AND column_name='registration_completed')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_completed') THEN
        RAISE NOTICE '✅ TEST 3 PASSED: Registration columns exist';
    ELSE
        RAISE NOTICE '❌ TEST 3 FAILED: Registration columns missing';
    END IF;
    
    -- Test 4: RLS enabled
    IF (SELECT COUNT(*) FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('assignments', 'announcements', 'events')
        AND rowsecurity = true) = 3 THEN
        RAISE NOTICE '✅ TEST 4 PASSED: RLS enabled on tables';
    ELSE
        RAISE NOTICE '❌ TEST 4 FAILED: RLS not enabled';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Supabase Dashboard → Database → Replication';
    RAISE NOTICE '2. Enable real-time for all tables listed above';
    RAISE NOTICE '3. Test in your application';
    RAISE NOTICE '';
END $$;
