-- Email Domain Validation Migration for EduVision
-- Students: @sanjivani.edu.in (without set.)
-- Faculty: @set.sanjivani.edu.in
-- Cafeteria: @cafe.in

-- 1. Add constraints to faculty table
ALTER TABLE faculty 
ADD CONSTRAINT faculty_email_domain_check 
CHECK (email LIKE '%@set.sanjivani.edu.in');

-- 2. Add constraints to students table (main table)
ALTER TABLE students 
ADD CONSTRAINT students_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

-- 3. Add constraints to department-year specific student tables
ALTER TABLE students_cse_1st_year 
ADD CONSTRAINT cse_1st_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cse_2nd_year 
ADD CONSTRAINT cse_2nd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cse_3rd_year 
ADD CONSTRAINT cse_3rd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cse_4th_year 
ADD CONSTRAINT cse_4th_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cyber_1st_year 
ADD CONSTRAINT cyber_1st_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cyber_2nd_year 
ADD CONSTRAINT cyber_2nd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cyber_3rd_year 
ADD CONSTRAINT cyber_3rd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_cyber_4th_year 
ADD CONSTRAINT cyber_4th_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aids_1st_year 
ADD CONSTRAINT aids_1st_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aids_2nd_year 
ADD CONSTRAINT aids_2nd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aids_3rd_year 
ADD CONSTRAINT aids_3rd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aids_4th_year 
ADD CONSTRAINT aids_4th_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aiml_1st_year 
ADD CONSTRAINT aiml_1st_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aiml_2nd_year 
ADD CONSTRAINT aiml_2nd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aiml_3rd_year 
ADD CONSTRAINT aiml_3rd_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

ALTER TABLE students_aiml_4th_year 
ADD CONSTRAINT aiml_4th_email_domain_check 
CHECK (email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in');

-- 4. Add constraint to cafeteria_owners table
ALTER TABLE cafeteria_owners 
ADD CONSTRAINT cafeteria_email_domain_check 
CHECK (email LIKE '%@cafe.in');

-- 5. Create function to validate email domain on auth.users
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email is for faculty (set.sanjivani.edu.in)
  IF NEW.email LIKE '%@set.sanjivani.edu.in' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"faculty"'::jsonb
    );
  -- Check if email is for student (sanjivani.edu.in but not set.)
  ELSIF NEW.email LIKE '%@sanjivani.edu.in' AND NEW.email NOT LIKE '%@set.sanjivani.edu.in' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"student"'::jsonb
    );
  -- Check if email is for cafeteria (cafe.in)
  ELSIF NEW.email LIKE '%@cafe.in' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"cafeteria"'::jsonb
    );
  ELSE
    RAISE EXCEPTION 'Invalid email domain. Allowed: @sanjivani.edu.in (students), @set.sanjivani.edu.in (faculty), @cafe.in (cafeteria)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger on auth.users table
DROP TRIGGER IF EXISTS validate_email_domain_trigger ON auth.users;
CREATE TRIGGER validate_email_domain_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_domain();

-- 7. Update existing users with correct user_type based on email
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{user_type}',
  CASE 
    WHEN email LIKE '%@set.sanjivani.edu.in' THEN '"faculty"'::jsonb
    WHEN email LIKE '%@sanjivani.edu.in' AND email NOT LIKE '%@set.sanjivani.edu.in' THEN '"student"'::jsonb
    WHEN email LIKE '%@cafe.in' THEN '"cafeteria"'::jsonb
    ELSE '"unknown"'::jsonb
  END
)
WHERE raw_user_meta_data->>'user_type' IS NULL 
   OR raw_user_meta_data->>'user_type' = 'unknown';

-- 8. Create RLS policy to prevent cross-role access
-- Students can only see student data
CREATE OR REPLACE POLICY "Students can only view student data"
ON students FOR SELECT
USING (
  auth.jwt() ->> 'email' LIKE '%@sanjivani.edu.in'
  AND auth.jwt() ->> 'email' NOT LIKE '%@set.sanjivani.edu.in'
);

-- Faculty can only see faculty data
CREATE OR REPLACE POLICY "Faculty can only view faculty data"
ON faculty FOR SELECT
USING (
  auth.jwt() ->> 'email' LIKE '%@set.sanjivani.edu.in'
);

-- 9. Create view for dean to see all faculty in their department
CREATE OR REPLACE VIEW dean_faculty_view AS
SELECT 
  f.id,
  f.name,
  f.email,
  f.department,
  f.subject,
  f.designation,
  f.phone,
  f.face_image,
  f.created_at
FROM faculty f
WHERE f.department = (
  SELECT department FROM faculty WHERE id = auth.uid()
)
ORDER BY f.name;

-- 10. Grant permissions
GRANT SELECT ON dean_faculty_view TO authenticated;

-- Done! Email domain validation is now enforced at database level.
