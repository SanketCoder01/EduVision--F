-- Fix Assignment Constraints to Prevent Duplicates
-- This migration adds proper constraints and indexes to prevent duplicate assignments

-- Add unique constraint on title + faculty_id to prevent duplicate assignments by same faculty
ALTER TABLE assignments 
ADD CONSTRAINT unique_assignment_title_per_faculty 
UNIQUE (title, faculty_id);

-- Add constraint to ensure status is valid
ALTER TABLE assignments 
ADD CONSTRAINT valid_assignment_status 
CHECK (status IN ('draft', 'published', 'closed', 'archived'));

-- Add constraint to ensure assignment_type is valid
ALTER TABLE assignments 
ADD CONSTRAINT valid_assignment_type 
CHECK (assignment_type IN ('file_upload', 'text_based', 'quiz', 'coding', 'normal', 'ai'));

-- Add constraint to ensure due_date is in the future for new assignments
ALTER TABLE assignments 
ADD CONSTRAINT future_due_date 
CHECK (due_date > created_at);

-- Add constraint to ensure max_marks is positive
ALTER TABLE assignments 
ADD CONSTRAINT positive_max_marks 
CHECK (max_marks > 0);

-- Add constraint to ensure target_years is not empty
ALTER TABLE assignments 
ADD CONSTRAINT non_empty_target_years 
CHECK (array_length(target_years, 1) > 0);

-- Create function to prevent duplicate assignment creation
CREATE OR REPLACE FUNCTION prevent_duplicate_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if assignment with same title exists for this faculty
  IF EXISTS (
    SELECT 1 FROM assignments 
    WHERE title = NEW.title 
    AND faculty_id = NEW.faculty_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Assignment with title "%" already exists for this faculty', NEW.title;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicates
DROP TRIGGER IF EXISTS prevent_duplicate_assignments_trigger ON assignments;
CREATE TRIGGER prevent_duplicate_assignments_trigger
  BEFORE INSERT OR UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_assignments();

-- Create function to handle assignment publishing securely
CREATE OR REPLACE FUNCTION publish_assignment_securely(p_assignment_id UUID)
RETURNS JSON AS $$
DECLARE
  assignment_record assignments%ROWTYPE;
  result JSON;
BEGIN
  -- Get the assignment
  SELECT * INTO assignment_record FROM assignments WHERE id = p_assignment_id;
  
  if assignment_record.id IS NULL THEN
    RAISE EXCEPTION 'Assignment not found';
  END IF;
  
  -- Check if already published
  IF assignment_record.status = 'published' THEN
    RAISE EXCEPTION 'Assignment is already published';
  END IF;
  
  -- Update status to published
  UPDATE assignments 
  SET status = 'published'
  WHERE id = p_assignment_id;
  
  -- Create notifications for targeted students
  INSERT INTO notifications (
    recipient_id,
    type,
    title,
    message,
    assignment_id,
    department,
    created_at,
    read
  )
  SELECT 
    s.id,
    'assignment',
    'New Assignment: ' || assignment_record.title,
    'A new assignment "' || assignment_record.title || '" has been published for ' || assignment_record.department || ' department.',
    assignment_record.id,
    assignment_record.department,
    NOW(),
    false
  FROM (
    SELECT id FROM students_cse_1st_year WHERE 'first' = ANY(assignment_record.target_years) AND assignment_record.department = 'CSE'
    UNION ALL
    SELECT id FROM students_cse_2nd_year WHERE 'second' = ANY(assignment_record.target_years) AND assignment_record.department = 'CSE'
    UNION ALL
    SELECT id FROM students_cse_3rd_year WHERE 'third' = ANY(assignment_record.target_years) AND assignment_record.department = 'CSE'
    UNION ALL
    SELECT id FROM students_cse_4th_year WHERE 'fourth' = ANY(assignment_record.target_years) AND assignment_record.department = 'CSE'
    UNION ALL
    SELECT id FROM students_cyber_1st_year WHERE 'first' = ANY(assignment_record.target_years) AND assignment_record.department = 'CYBER'
    UNION ALL
    SELECT id FROM students_cyber_2nd_year WHERE 'second' = ANY(assignment_record.target_years) AND assignment_record.department = 'CYBER'
    UNION ALL
    SELECT id FROM students_cyber_3rd_year WHERE 'third' = ANY(assignment_record.target_years) AND assignment_record.department = 'CYBER'
    UNION ALL
    SELECT id FROM students_cyber_4th_year WHERE 'fourth' = ANY(assignment_record.target_years) AND assignment_record.department = 'CYBER'
    UNION ALL
    SELECT id FROM students_aids_1st_year WHERE 'first' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIDS'
    UNION ALL
    SELECT id FROM students_aids_2nd_year WHERE 'second' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIDS'
    UNION ALL
    SELECT id FROM students_aids_3rd_year WHERE 'third' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIDS'
    UNION ALL
    SELECT id FROM students_aids_4th_year WHERE 'fourth' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIDS'
    UNION ALL
    SELECT id FROM students_aiml_1st_year WHERE 'first' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIML'
    UNION ALL
    SELECT id FROM students_aiml_2nd_year WHERE 'second' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIML'
    UNION ALL
    SELECT id FROM students_aiml_3rd_year WHERE 'third' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIML'
    UNION ALL
    SELECT id FROM students_aiml_4th_year WHERE 'fourth' = ANY(assignment_record.target_years) AND assignment_record.department = 'AIML'
  ) s;
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'assignment_id', p_assignment_id,
    'status', 'published',
    'message', 'Assignment published successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_faculty_title ON assignments(faculty_id, title);
CREATE INDEX IF NOT EXISTS idx_assignments_status_dept_year ON assignments(status, department, target_years) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date) WHERE status = 'published';

-- Add comment explaining the constraints
COMMENT ON CONSTRAINT unique_assignment_title_per_faculty ON assignments IS 'Prevents faculty from creating multiple assignments with the same title';
COMMENT ON FUNCTION publish_assignment_securely(UUID) IS 'Securely publishes an assignment and creates notifications for targeted students';
COMMENT ON FUNCTION prevent_duplicate_assignments() IS 'Prevents creation of duplicate assignments with same title by same faculty';
