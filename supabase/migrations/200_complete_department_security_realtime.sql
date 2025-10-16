-- ============================================
-- COMPLETE DEPARTMENT SECURITY & REALTIME SYSTEM
-- ============================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Faculty can view assignments in accessible departments" ON assignments;
DROP POLICY IF EXISTS "Faculty can create assignments in accessible departments" ON assignments;
DROP POLICY IF EXISTS "Faculty can update own assignments" ON assignments;
DROP POLICY IF EXISTS "Faculty can delete own assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments for their dept and year" ON assignments;

DROP POLICY IF EXISTS "Faculty can create announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can view announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can update own announcements" ON announcements;
DROP POLICY IF EXISTS "Faculty can delete own announcements" ON announcements;
DROP POLICY IF EXISTS "Students can view announcements" ON announcements;

DROP POLICY IF EXISTS "Faculty can create events" ON events;
DROP POLICY IF EXISTS "Faculty can view events" ON events;
DROP POLICY IF EXISTS "Faculty can update own events" ON events;
DROP POLICY IF EXISTS "Students can view events" ON events;

DROP POLICY IF EXISTS "Faculty can upload study materials" ON study_materials;
DROP POLICY IF EXISTS "Faculty can view study materials" ON study_materials;
DROP POLICY IF EXISTS "Faculty can update own materials" ON study_materials;
DROP POLICY IF EXISTS "Students can view study materials" ON study_materials;

DROP POLICY IF EXISTS "Faculty can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Faculty can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Students can view published quizzes" ON quizzes;

-- ============================================
-- ADD REGISTRATION COMPLETED CHECK
-- ============================================

-- Add registration_completed and registration_step if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='faculty' AND column_name='registration_completed') THEN
        ALTER TABLE faculty ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='faculty' AND column_name='phone') THEN
        ALTER TABLE faculty ADD COLUMN phone TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_completed') THEN
        ALTER TABLE students ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_step') THEN
        ALTER TABLE students ADD COLUMN registration_step INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- DEPARTMENT HIERARCHY FUNCTIONS
-- ============================================

-- Function to check if faculty can access a department
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

-- ============================================
-- ASSIGNMENTS RLS POLICIES (Department Security)
-- ============================================

-- Faculty can only create assignments for their accessible departments
CREATE POLICY "Faculty create assignments for accessible depts" ON assignments
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = assignments.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, assignments.department)
        )
    );

-- Faculty can view assignments from their accessible departments
CREATE POLICY "Faculty view assignments from accessible depts" ON assignments
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, assignments.department)
        )
    );

-- Faculty can update their own assignments
CREATE POLICY "Faculty update own assignments" ON assignments
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = assignments.faculty_id
            AND faculty.registration_completed = TRUE
        )
    );

-- Faculty can delete their own assignments
CREATE POLICY "Faculty delete own assignments" ON assignments
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = assignments.faculty_id
        )
    );

-- Students can ONLY view assignments if registration completed AND dept/year matches
CREATE POLICY "Students view assignments if registered" ON assignments
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = assignments.department
            AND (
                assignments.year IS NULL 
                OR students.year = assignments.year
                OR students.year = ANY(
                    CASE 
                        WHEN assignments.target_years IS NOT NULL 
                        THEN assignments.target_years 
                        ELSE ARRAY[]::TEXT[] 
                    END
                )
            )
        )
    );

-- ============================================
-- ANNOUNCEMENTS RLS POLICIES
-- ============================================

CREATE POLICY "Faculty create announcements for accessible depts" ON announcements
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = announcements.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, announcements.department)
        )
    );

CREATE POLICY "Faculty view all announcements" ON announcements
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, announcements.department)
        )
    );

CREATE POLICY "Faculty update own announcements" ON announcements
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = announcements.faculty_id
            AND faculty.registration_completed = TRUE
        )
    );

CREATE POLICY "Faculty delete own announcements" ON announcements
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = announcements.faculty_id
        )
    );

CREATE POLICY "Students view announcements if registered" ON announcements
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = announcements.department
            AND (
                announcements.year IS NULL 
                OR students.year = ANY(announcements.year)
            )
        )
    );

-- ============================================
-- EVENTS RLS POLICIES
-- ============================================

CREATE POLICY "Faculty create events for accessible depts" ON events
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = events.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, events.department)
        )
    );

CREATE POLICY "Faculty view all events" ON events
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, events.department)
        )
    );

CREATE POLICY "Faculty update own events" ON events
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = events.faculty_id
            AND faculty.registration_completed = TRUE
        )
    );

CREATE POLICY "Students view events if registered" ON events
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = events.department
            AND (
                events.year IS NULL 
                OR students.year = ANY(events.year)
            )
        )
    );

-- ============================================
-- STUDY MATERIALS RLS POLICIES
-- ============================================

CREATE POLICY "Faculty upload materials for accessible depts" ON study_materials
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = study_materials.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, study_materials.department)
        )
    );

CREATE POLICY "Faculty view all study materials" ON study_materials
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, study_materials.department)
        )
    );

CREATE POLICY "Faculty update own study materials" ON study_materials
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = study_materials.faculty_id
            AND faculty.registration_completed = TRUE
        )
    );

CREATE POLICY "Students view materials if registered" ON study_materials
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = study_materials.department
            AND students.year = study_materials.year
        )
    );

-- ============================================
-- TIMETABLE RLS POLICIES
-- ============================================

CREATE POLICY "Faculty create timetable for accessible depts" ON timetable_entries
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = timetable_entries.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, timetable_entries.department)
        )
    );

CREATE POLICY "Faculty view all timetable" ON timetable_entries
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, timetable_entries.department)
        )
    );

CREATE POLICY "Faculty update timetable" ON timetable_entries
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = timetable_entries.faculty_id
            AND faculty.registration_completed = TRUE
        )
    );

CREATE POLICY "Students view timetable if registered" ON timetable_entries
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = timetable_entries.department
            AND students.year = timetable_entries.year
        )
    );

-- ============================================
-- QUIZ RLS POLICIES
-- ============================================

CREATE POLICY "Faculty create quizzes for accessible depts" ON quizzes
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = quizzes.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, quizzes.department)
        )
    );

CREATE POLICY "Faculty view all quizzes" ON quizzes
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, quizzes.department)
        )
    );

CREATE POLICY "Faculty update own quizzes" ON quizzes
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = quizzes.faculty_id
            AND faculty.registration_completed = TRUE
        )
    );

CREATE POLICY "Students view quizzes if registered" ON quizzes
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = quizzes.department
            AND students.year = quizzes.year
            AND quizzes.is_published = TRUE
        )
    );

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================

CREATE POLICY "Faculty create attendance for accessible depts" ON attendance_sessions
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE faculty.id = attendance_sessions.faculty_id 
            AND faculty.registration_completed = TRUE
            AND can_faculty_access_department(faculty.department, attendance_sessions.department)
        )
    );

CREATE POLICY "Faculty view attendance sessions" ON attendance_sessions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, attendance_sessions.department)
        )
    );

CREATE POLICY "Students view attendance if registered" ON attendance_sessions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = attendance_sessions.department
            AND students.year = attendance_sessions.year
        )
    );

-- ============================================
-- STUDY GROUPS POLICIES
-- ============================================

CREATE POLICY "Students create groups if registered" ON study_groups
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = study_groups.created_by
            AND students.registration_completed = TRUE
        )
    );

CREATE POLICY "Students view groups if registered" ON study_groups
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_completed = TRUE
            AND students.department = study_groups.department
            AND students.year = study_groups.year
        )
    );

CREATE POLICY "Faculty view study groups in accessible depts" ON study_groups
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM faculty 
            WHERE can_faculty_access_department(faculty.department, study_groups.department)
        )
    );

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- INDEXES FOR PERFORMANCE
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

-- ============================================
-- ENABLE REALTIME FOR ALL TABLES
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS events;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS study_materials;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS timetable_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS study_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS students;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS faculty;
