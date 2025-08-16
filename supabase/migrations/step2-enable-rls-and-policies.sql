-- Step 2: Enable RLS and create policies for the 16 student tables
-- Run this after creating the tables

-- Enable RLS on all 16 student tables
ALTER TABLE students_cse_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cse_4th_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_cyber_4th_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aids_4th_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_1st_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_2nd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_3rd_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_aiml_4th_year ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student tables (students can only see their own data)
DROP POLICY IF EXISTS "Students can view own data" ON students_cse_1st_year;
CREATE POLICY "Students can view own data" ON students_cse_1st_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cse_1st_year;
CREATE POLICY "Students can update own data" ON students_cse_1st_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_cse_2nd_year;
CREATE POLICY "Students can view own data" ON students_cse_2nd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cse_2nd_year;
CREATE POLICY "Students can update own data" ON students_cse_2nd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_cse_3rd_year;
CREATE POLICY "Students can view own data" ON students_cse_3rd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cse_3rd_year;
CREATE POLICY "Students can update own data" ON students_cse_3rd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_cse_4th_year;
CREATE POLICY "Students can view own data" ON students_cse_4th_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cse_4th_year;
CREATE POLICY "Students can update own data" ON students_cse_4th_year FOR UPDATE USING (auth.uid() = user_id);

-- Cyber Security Policies
DROP POLICY IF EXISTS "Students can view own data" ON students_cyber_1st_year;
CREATE POLICY "Students can view own data" ON students_cyber_1st_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cyber_1st_year;
CREATE POLICY "Students can update own data" ON students_cyber_1st_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_cyber_2nd_year;
CREATE POLICY "Students can view own data" ON students_cyber_2nd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cyber_2nd_year;
CREATE POLICY "Students can update own data" ON students_cyber_2nd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_cyber_3rd_year;
CREATE POLICY "Students can view own data" ON students_cyber_3rd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cyber_3rd_year;
CREATE POLICY "Students can update own data" ON students_cyber_3rd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_cyber_4th_year;
CREATE POLICY "Students can view own data" ON students_cyber_4th_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_cyber_4th_year;
CREATE POLICY "Students can update own data" ON students_cyber_4th_year FOR UPDATE USING (auth.uid() = user_id);

-- AIDS Policies
DROP POLICY IF EXISTS "Students can view own data" ON students_aids_1st_year;
CREATE POLICY "Students can view own data" ON students_aids_1st_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aids_1st_year;
CREATE POLICY "Students can update own data" ON students_aids_1st_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_aids_2nd_year;
CREATE POLICY "Students can view own data" ON students_aids_2nd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aids_2nd_year;
CREATE POLICY "Students can update own data" ON students_aids_2nd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_aids_3rd_year;
CREATE POLICY "Students can view own data" ON students_aids_3rd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aids_3rd_year;
CREATE POLICY "Students can update own data" ON students_aids_3rd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_aids_4th_year;
CREATE POLICY "Students can view own data" ON students_aids_4th_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aids_4th_year;
CREATE POLICY "Students can update own data" ON students_aids_4th_year FOR UPDATE USING (auth.uid() = user_id);

-- AIML Policies
DROP POLICY IF EXISTS "Students can view own data" ON students_aiml_1st_year;
CREATE POLICY "Students can view own data" ON students_aiml_1st_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aiml_1st_year;
CREATE POLICY "Students can update own data" ON students_aiml_1st_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_aiml_2nd_year;
CREATE POLICY "Students can view own data" ON students_aiml_2nd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aiml_2nd_year;
CREATE POLICY "Students can update own data" ON students_aiml_2nd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_aiml_3rd_year;
CREATE POLICY "Students can view own data" ON students_aiml_3rd_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aiml_3rd_year;
CREATE POLICY "Students can update own data" ON students_aiml_3rd_year FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own data" ON students_aiml_4th_year;
CREATE POLICY "Students can view own data" ON students_aiml_4th_year FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own data" ON students_aiml_4th_year;
CREATE POLICY "Students can update own data" ON students_aiml_4th_year FOR UPDATE USING (auth.uid() = user_id);
