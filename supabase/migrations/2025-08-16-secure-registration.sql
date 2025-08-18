-- Secure Registration System Migration
-- Created: 2025-08-16

-- 1. Create pending_registrations table for admin approval workflow
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty')),
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20), -- Only for students
  status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create approved_emails table for pre-approved email addresses
CREATE TABLE approved_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'faculty')),
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20), -- Only for students
  prn VARCHAR(50), -- For students
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add immutable department constraints to existing tables
-- Prevent department changes after initial registration

-- For faculty table (already has trigger from previous migration)
-- Add additional constraint for year changes in student tables

CREATE OR REPLACE FUNCTION enforce_student_dept_year_immutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Prevent changes to department and year after initial registration
  IF OLD.department IS DISTINCT FROM NEW.department THEN
    RAISE EXCEPTION 'Student department is immutable and cannot be changed after registration.';
  END IF;
  
  IF OLD.year IS DISTINCT FROM NEW.year THEN
    RAISE EXCEPTION 'Student year is immutable and cannot be changed after registration.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply immutable constraints to all 16 student tables
CREATE TRIGGER prevent_cse_1st_year_dept_year_change
BEFORE UPDATE ON students_cse_1st_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cse_2nd_year_dept_year_change
BEFORE UPDATE ON students_cse_2nd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cse_3rd_year_dept_year_change
BEFORE UPDATE ON students_cse_3rd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cse_4th_year_dept_year_change
BEFORE UPDATE ON students_cse_4th_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cyber_1st_year_dept_year_change
BEFORE UPDATE ON students_cyber_1st_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cyber_2nd_year_dept_year_change
BEFORE UPDATE ON students_cyber_2nd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cyber_3rd_year_dept_year_change
BEFORE UPDATE ON students_cyber_3rd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_cyber_4th_year_dept_year_change
BEFORE UPDATE ON students_cyber_4th_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aids_1st_year_dept_year_change
BEFORE UPDATE ON students_aids_1st_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aids_2nd_year_dept_year_change
BEFORE UPDATE ON students_aids_2nd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aids_3rd_year_dept_year_change
BEFORE UPDATE ON students_aids_3rd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aids_4th_year_dept_year_change
BEFORE UPDATE ON students_aids_4th_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aiml_1st_year_dept_year_change
BEFORE UPDATE ON students_aiml_1st_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aiml_2nd_year_dept_year_change
BEFORE UPDATE ON students_aiml_2nd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aiml_3rd_year_dept_year_change
BEFORE UPDATE ON students_aiml_3rd_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

CREATE TRIGGER prevent_aiml_4th_year_dept_year_change
BEFORE UPDATE ON students_aiml_4th_year
FOR EACH ROW EXECUTE FUNCTION enforce_student_dept_year_immutable();

-- 4. Enable RLS on new tables
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Only admins can view/manage pending registrations
CREATE POLICY "Admins can manage pending registrations" ON pending_registrations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@admin.sanjivani.edu.in'
  )
);

-- Only admins can manage approved emails
CREATE POLICY "Admins can manage approved emails" ON approved_emails
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@admin.sanjivani.edu.in'
  )
);

-- 6. Create indexes for performance
CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX idx_pending_registrations_status ON pending_registrations(status);
CREATE INDEX idx_approved_emails_email ON approved_emails(email);

-- 7. Create updated_at trigger for new tables
CREATE TRIGGER update_pending_registrations_updated_at 
BEFORE UPDATE ON pending_registrations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- End of migration
