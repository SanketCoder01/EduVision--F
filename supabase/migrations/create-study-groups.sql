-- This file creates the get_student_info function and the study_groups table.

-- 1) Create helper function to get student department and year
CREATE OR REPLACE FUNCTION get_student_info(p_user_id UUID)
RETURNS TABLE(department TEXT, year TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT s.department, s.year FROM students_cse_1st_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cse_2nd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cse_3rd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cse_4th_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cyber_1st_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cyber_2nd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cyber_3rd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_cyber_4th_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aids_1st_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aids_2nd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aids_3rd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aids_4th_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aiml_1st_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aiml_2nd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aiml_3rd_year s WHERE s.user_id = p_user_id UNION ALL
    SELECT s.department, s.year FROM students_aiml_4th_year s WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run this file to set up the study groups module.

-- 1) Create study_groups table
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    faculty_id UUID REFERENCES faculty(id),
    department TEXT NOT NULL,
    target_years TEXT[] DEFAULT '{}',
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Enable Row Level Security
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- 3) Add user_id to faculty table for RLS policies
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4) RLS Policies for study_groups

-- Policy for faculty to manage study groups in their own department
CREATE POLICY "Faculty can manage study groups for their department" ON study_groups
FOR ALL USING (
  (SELECT department FROM faculty WHERE user_id = auth.uid()) = department
);

-- Policy for students to view study groups targeted to their department and year
-- This policy depends on the get_student_info() function being present.
CREATE POLICY "Students can view study groups for their department and year" ON study_groups
FOR SELECT USING (
  (SELECT department FROM get_student_info(auth.uid())) = department AND
  (SELECT year FROM get_student_info(auth.uid())) = ANY(target_years)
);

-- 4) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_groups_dept_years ON study_groups(department);
CREATE INDEX IF NOT EXISTS idx_study_groups_target_years ON study_groups USING GIN(target_years);
