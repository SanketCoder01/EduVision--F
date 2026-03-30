-- Migration: Enable Faculty Readers and Delete permissions on Queries
-- Run in Supabase SQL Editor

-- ============================================================================
-- 1. ADD SELECT POLICIES TO SHARDED STUDENT TABLES SO FACULTY CAN SEE THEM
-- (Case-insensitive fixes using ILIKE)
-- ============================================================================

-- Drop old rigid policies just in case they were run
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 1st)" ON students_cse_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 2nd)" ON students_cse_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 3rd)" ON students_cse_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CSE 4th)" ON students_cse_4th_year;

DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 1st)" ON students_cyber_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 2nd)" ON students_cyber_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 3rd)" ON students_cyber_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (CYBER 4th)" ON students_cyber_4th_year;

DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 1st)" ON students_aids_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 2nd)" ON students_aids_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 3rd)" ON students_aids_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIDS 4th)" ON students_aids_4th_year;

DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 1st)" ON students_aiml_1st_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 2nd)" ON students_aiml_2nd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 3rd)" ON students_aiml_3rd_year;
DROP POLICY IF EXISTS "Faculty can view students in their department (AIML 4th)" ON students_aiml_4th_year;

-- CSE
CREATE POLICY "Faculty can view students in their department (CSE 1st)" ON students_cse_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cse%'));
CREATE POLICY "Faculty can view students in their department (CSE 2nd)" ON students_cse_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cse%'));
CREATE POLICY "Faculty can view students in their department (CSE 3rd)" ON students_cse_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cse%'));
CREATE POLICY "Faculty can view students in their department (CSE 4th)" ON students_cse_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cse%'));

-- CYBER
CREATE POLICY "Faculty can view students in their department (CYBER 1st)" ON students_cyber_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cyber%'));
CREATE POLICY "Faculty can view students in their department (CYBER 2nd)" ON students_cyber_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cyber%'));
CREATE POLICY "Faculty can view students in their department (CYBER 3rd)" ON students_cyber_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cyber%'));
CREATE POLICY "Faculty can view students in their department (CYBER 4th)" ON students_cyber_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%cyber%'));

-- AIDS
CREATE POLICY "Faculty can view students in their department (AIDS 1st)" ON students_aids_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aids%'));
CREATE POLICY "Faculty can view students in their department (AIDS 2nd)" ON students_aids_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aids%'));
CREATE POLICY "Faculty can view students in their department (AIDS 3rd)" ON students_aids_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aids%'));
CREATE POLICY "Faculty can view students in their department (AIDS 4th)" ON students_aids_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aids%'));

-- AIML
CREATE POLICY "Faculty can view students in their department (AIML 1st)" ON students_aiml_1st_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aiml%'));
CREATE POLICY "Faculty can view students in their department (AIML 2nd)" ON students_aiml_2nd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aiml%'));
CREATE POLICY "Faculty can view students in their department (AIML 3rd)" ON students_aiml_3rd_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aiml%'));
CREATE POLICY "Faculty can view students in their department (AIML 4th)" ON students_aiml_4th_year FOR SELECT USING (EXISTS (SELECT 1 FROM faculty WHERE faculty.id = auth.uid() AND faculty.department ILIKE '%aiml%'));


-- ============================================================================
-- 2. ENABLE REALTIME SYNC FOR FACULTY DASHBOARDS
-- ============================================================================

-- Add all 16 student tables to Supabase Realtime so Faculty UI automatically registers them
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'students_cse_1st_year',
        'students_cse_2nd_year',
        'students_cse_3rd_year',
        'students_cse_4th_year',

        'students_cyber_1st_year',
        'students_cyber_2nd_year',
        'students_cyber_3rd_year',
        'students_cyber_4th_year',

        'students_aids_1st_year',
        'students_aids_2nd_year',
        'students_aids_3rd_year',
        'students_aids_4th_year',

        'students_aiml_1st_year',
        'students_aiml_2nd_year',
        'students_aiml_3rd_year',
        'students_aiml_4th_year',

        'query_messages'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND tablename = tbl
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
        END IF;
    END LOOP;
END $$;