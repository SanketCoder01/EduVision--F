-- ============================================
-- COMPREHENSIVE REAL DATA SYSTEM
-- Make EduVision fully dynamic with real student data
-- ============================================

-- Ensure registration_completed column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='students' AND column_name='registration_completed') THEN
        ALTER TABLE students ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='faculty' AND column_name='registration_completed') THEN
        ALTER TABLE faculty ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Enable realtime for students and faculty tables
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE students;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE faculty;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Create indexes for better performance on student queries
CREATE INDEX IF NOT EXISTS idx_students_dept_year_reg 
    ON students(department, year, registration_completed);

CREATE INDEX IF NOT EXISTS idx_students_prn 
    ON students(prn);

CREATE INDEX IF NOT EXISTS idx_students_email 
    ON students(email);

CREATE INDEX IF NOT EXISTS idx_faculty_dept_reg 
    ON faculty(department, registration_completed);

-- Create a view for easily accessible student data (for faculty/dean)
CREATE OR REPLACE VIEW student_directory AS
SELECT 
    id,
    name,
    full_name,
    email,
    prn,
    department,
    year,
    phone,
    face_url,
    photo,
    avatar,
    registration_completed,
    created_at
FROM students
WHERE registration_completed = TRUE
ORDER BY department, year, name;

-- Create a function to get students by department and year
CREATE OR REPLACE FUNCTION get_students_by_dept_year(
    p_department TEXT,
    p_years TEXT[] DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    name TEXT,
    full_name TEXT,
    email TEXT,
    prn TEXT,
    department TEXT,
    year TEXT,
    phone TEXT,
    face_url TEXT,
    registration_completed BOOLEAN
) AS $$
BEGIN
    IF p_years IS NULL OR array_length(p_years, 1) = 0 THEN
        -- Return all years for the department
        RETURN QUERY
        SELECT 
            s.id, s.name, s.full_name, s.email, s.prn,
            s.department, s.year, s.phone, s.face_url,
            s.registration_completed
        FROM students s
        WHERE s.department = p_department 
        AND s.registration_completed = TRUE
        ORDER BY s.year, s.name;
    ELSE
        -- Return specific years
        RETURN QUERY
        SELECT 
            s.id, s.name, s.full_name, s.email, s.prn,
            s.department, s.year, s.phone, s.face_url,
            s.registration_completed
        FROM students s
        WHERE s.department = p_department 
        AND s.year = ANY(p_years)
        AND s.registration_completed = TRUE
        ORDER BY s.year, s.name;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get department statistics
CREATE OR REPLACE FUNCTION get_department_stats(p_department TEXT DEFAULT NULL)
RETURNS TABLE (
    department TEXT,
    total_students BIGINT,
    first_year BIGINT,
    second_year BIGINT,
    third_year BIGINT,
    fourth_year BIGINT
) AS $$
BEGIN
    IF p_department IS NULL THEN
        -- Return stats for all departments
        RETURN QUERY
        SELECT 
            s.department,
            COUNT(*) as total_students,
            COUNT(*) FILTER (WHERE s.year = 'first') as first_year,
            COUNT(*) FILTER (WHERE s.year = 'second') as second_year,
            COUNT(*) FILTER (WHERE s.year = 'third') as third_year,
            COUNT(*) FILTER (WHERE s.year = 'fourth') as fourth_year
        FROM students s
        WHERE s.registration_completed = TRUE
        GROUP BY s.department
        ORDER BY s.department;
    ELSE
        -- Return stats for specific department
        RETURN QUERY
        SELECT 
            s.department,
            COUNT(*) as total_students,
            COUNT(*) FILTER (WHERE s.year = 'first') as first_year,
            COUNT(*) FILTER (WHERE s.year = 'second') as second_year,
            COUNT(*) FILTER (WHERE s.year = 'third') as third_year,
            COUNT(*) FILTER (WHERE s.year = 'fourth') as fourth_year
        FROM students s
        WHERE s.department = p_department
        AND s.registration_completed = TRUE
        GROUP BY s.department;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification triggers for real-time updates
CREATE OR REPLACE FUNCTION notify_new_content()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSON;
BEGIN
    notification_payload = json_build_object(
        'table', TG_TABLE_NAME,
        'type', TG_OP,
        'id', NEW.id,
        'department', NEW.department,
        'target_years', COALESCE(NEW.target_years, ARRAY[]::TEXT[]),
        'title', CASE 
            WHEN TG_TABLE_NAME = 'assignments' THEN NEW.title
            WHEN TG_TABLE_NAME = 'announcements' THEN NEW.title
            WHEN TG_TABLE_NAME = 'events' THEN NEW.title
            WHEN TG_TABLE_NAME = 'quizzes' THEN NEW.title
            ELSE NULL
        END,
        'created_at', NEW.created_at
    );
    
    PERFORM pg_notify('new_content', notification_payload::TEXT);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS notify_new_assignment ON assignments;
DROP TRIGGER IF EXISTS notify_new_announcement ON announcements;
DROP TRIGGER IF EXISTS notify_new_event ON events;

-- Create triggers for real-time notifications
CREATE TRIGGER notify_new_assignment
    AFTER INSERT ON assignments
    FOR EACH ROW
    WHEN (NEW.status = 'published')
    EXECUTE FUNCTION notify_new_content();

CREATE TRIGGER notify_new_announcement
    AFTER INSERT ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_content();

CREATE TRIGGER notify_new_event
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_content();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_students_by_dept_year TO authenticated;
GRANT EXECUTE ON FUNCTION get_department_stats TO authenticated;

-- Grant select on view
GRANT SELECT ON student_directory TO authenticated;

-- Create RLS policies for student_directory view (if not using the base table policies)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- Faculty can view all students in accessible departments
CREATE POLICY IF NOT EXISTS "Faculty view students in accessible depts" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faculty f
            WHERE f.registration_completed = TRUE
            AND can_faculty_access_department(f.department, students.department)
        )
    );

-- Students can view their own profile
CREATE POLICY IF NOT EXISTS "Students view own profile" ON students
    FOR SELECT USING (
        id = auth.uid()
        OR email = current_setting('request.jwt.claims', true)::json->>'email'
    );

-- Students can update their own profile
CREATE POLICY IF NOT EXISTS "Students update own profile" ON students
    FOR UPDATE USING (
        id = auth.uid()
        OR email = current_setting('request.jwt.claims', true)::json->>'email'
    );

-- Create a table for tracking real-time notifications (for Today's Hub)
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    user_type TEXT CHECK (user_type IN ('student', 'faculty', 'dean')),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    department TEXT NOT NULL,
    target_years TEXT[] DEFAULT '{}',
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user 
    ON notification_log(user_id, is_read, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_dept_years 
    ON notification_log(department, target_years);

-- Enable RLS on notification_log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON notification_log
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "System insert notifications" ON notification_log
    FOR INSERT WITH CHECK (true);

-- Enable realtime for notification_log
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notification_log;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Create function to automatically create notifications when content is published
CREATE OR REPLACE FUNCTION create_notifications_for_content()
RETURNS TRIGGER AS $$
DECLARE
    student_record RECORD;
    content_title TEXT;
    notification_message TEXT;
BEGIN
    -- Determine content title
    content_title := CASE 
        WHEN TG_TABLE_NAME = 'assignments' THEN NEW.title
        WHEN TG_TABLE_NAME = 'announcements' THEN NEW.title
        WHEN TG_TABLE_NAME = 'events' THEN NEW.title
        WHEN TG_TABLE_NAME = 'quizzes' THEN NEW.title
        ELSE 'New Content'
    END;
    
    notification_message := CASE 
        WHEN TG_TABLE_NAME = 'assignments' THEN 'New assignment posted'
        WHEN TG_TABLE_NAME = 'announcements' THEN 'New announcement'
        WHEN TG_TABLE_NAME = 'events' THEN 'New event scheduled'
        WHEN TG_TABLE_NAME = 'quizzes' THEN 'New quiz available'
        ELSE 'New content available'
    END;
    
    -- Create notifications for all eligible students
    FOR student_record IN 
        SELECT id, department, year 
        FROM students 
        WHERE department = NEW.department
        AND registration_completed = TRUE
        AND (
            COALESCE(array_length(NEW.target_years, 1), 0) = 0
            OR year = ANY(NEW.target_years)
        )
    LOOP
        INSERT INTO notification_log (
            user_id,
            user_type,
            content_type,
            content_id,
            department,
            target_years,
            title,
            message
        ) VALUES (
            student_record.id,
            'student',
            TG_TABLE_NAME,
            NEW.id,
            NEW.department,
            NEW.target_years,
            content_title,
            notification_message
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic notification creation
DROP TRIGGER IF EXISTS create_assignment_notifications ON assignments;
DROP TRIGGER IF EXISTS create_announcement_notifications ON announcements;
DROP TRIGGER IF EXISTS create_event_notifications ON events;

CREATE TRIGGER create_assignment_notifications
    AFTER INSERT ON assignments
    FOR EACH ROW
    WHEN (NEW.status = 'published')
    EXECUTE FUNCTION create_notifications_for_content();

CREATE TRIGGER create_announcement_notifications
    AFTER INSERT ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION create_notifications_for_content();

CREATE TRIGGER create_event_notifications
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION create_notifications_for_content();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ COMPREHENSIVE REAL DATA SYSTEM CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Features implemented:';
    RAISE NOTICE '  ✓ Student directory view';
    RAISE NOTICE '  ✓ Department/year query functions';
    RAISE NOTICE '  ✓ Real-time notification system';
    RAISE NOTICE '  ✓ Automatic notification creation';
    RAISE NOTICE '  ✓ Performance indexes';
    RAISE NOTICE '  ✓ RLS policies for data security';
    RAISE NOTICE '';
    RAISE NOTICE 'Faculty can now:';
    RAISE NOTICE '  • Fetch real student data by department/year';
    RAISE NOTICE '  • See live statistics';
    RAISE NOTICE '  • Target content to specific students';
    RAISE NOTICE '';
    RAISE NOTICE 'Students will:';
    RAISE NOTICE '  • See real-time notifications in Todays Hub';
    RAISE NOTICE '  • Only see content for their dept/year';
    RAISE NOTICE '  • Get instant updates when faculty posts';
    RAISE NOTICE '========================================';
END $$;
