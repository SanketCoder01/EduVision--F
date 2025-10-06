-- Apply the publish_assignment_securely function to Supabase database
-- Run this in Supabase SQL Editor

-- Drop existing function first (if it exists)
DROP FUNCTION IF EXISTS publish_assignment_securely(uuid);

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
