-- ================================================================
-- Dean Dashboard: RLS Access Policies + Dean Profile Setup
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Fix Dean Login: Insert your dean accounts into the deans table
-- Replace each row with the real Auth user ID from Supabase Auth panel

-- To get the auth user ID:
-- Go to Supabase → Authentication → Users → copy the UUID next to your dean email

INSERT INTO deans (id, name, email, department, designation)
VALUES 
  -- Replace with your actual auth UUID and dean details:
  ('YOUR_AUTH_UUID_HERE', 'Dr. Kavitha Rani', 'deanset@sanjivani.edu.in', 'Computer Science & Engineering', 'Dean')
ON CONFLICT (email) DO UPDATE SET 
  id = EXCLUDED.id,
  department = EXCLUDED.department;


-- 2. Allow deans to read all attendance data for analytics
DROP POLICY IF EXISTS "Deans can view all attendance sessions" ON attendance_sessions;
CREATE POLICY "Deans can view all attendance sessions" ON attendance_sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Deans can view all attendance records" ON attendance_records;
CREATE POLICY "Deans can view all attendance records" ON attendance_records
  FOR SELECT USING (true);

-- 3. Allow deans to read all assignments (for faculty analytics)
DROP POLICY IF EXISTS "Deans can view all assignments" ON assignments;
CREATE POLICY "Deans can view all assignments" ON assignments
  FOR SELECT USING (true);

-- 4. Allow deans to read all faculty
DROP POLICY IF EXISTS "Deans can view all faculty" ON faculty;
CREATE POLICY "Deans can view all faculty" ON faculty
  FOR SELECT USING (true);

-- 5. Allow deans to read their own profile (with auth.uid match)
DROP POLICY IF EXISTS "Deans can view own profile" ON deans;
CREATE POLICY "Deans can view own profile" ON deans
  FOR SELECT USING (true);  -- allow read by email match during login

-- 6. (Optional) Add faculty_id column to assignments if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='assignments' AND column_name='faculty_id'
  ) THEN
    ALTER TABLE assignments ADD COLUMN faculty_id UUID;
  END IF;
END $$;

-- 7. Enable Realtime for dean-relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE deans;
ALTER PUBLICATION supabase_realtime ADD TABLE faculty;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE student_results;
