-- Update announcements table to support more granular targeting
ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS target_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS target_class VARCHAR(50);

-- Add comments for clarity
COMMENT ON COLUMN public.announcements.department IS 'Target department. NULL or ''all'' for university-wide.';
COMMENT ON COLUMN public.announcements.target_year IS 'Target year (e.g., first, second). NULL or ''all'' for all years in a department.';
COMMENT ON COLUMN public.announcements.target_class IS 'Target specific class/division. NULL or ''all'' for all classes in a year.';

-- Update RLS policy for announcements to allow students to see relevant posts
DROP POLICY IF EXISTS "Students can view published assignments in their department" ON announcements;

CREATE POLICY "Students can view relevant announcements" ON announcements
FOR SELECT
TO authenticated
USING (
  (
    -- University-wide announcements
    department IS NULL OR department = 'all'
  ) OR (
    -- Department-wide announcements (matches student's department, targets all years)
    department = (SELECT department FROM students WHERE id = auth.uid()) AND (target_year IS NULL OR target_year = 'all')
  ) OR (
    -- Year-specific announcements (matches student's department and year)
    department = (SELECT department FROM students WHERE id = auth.uid()) AND target_year = (SELECT year FROM students WHERE id = auth.uid())
  )
  -- Note: Class-level filtering would require an additional sub-query if a 'class' column is added to the students table.
);
