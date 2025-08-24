-- Add field and course columns to faculty table

-- Add columns to faculty table
ALTER TABLE faculty 
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;

-- Update comments for documentation
COMMENT ON COLUMN faculty.field IS 'Field of study/expertise (B.E/B.Tech, BCA, MCA, etc.)';
COMMENT ON COLUMN faculty.course IS 'Specific course/specialization within the field';

-- Add check constraints for valid fields (optional, for data integrity)
ALTER TABLE faculty 
ADD CONSTRAINT check_faculty_valid_field 
CHECK (field IN ('B.E/B.Tech', 'Pharmacy', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'B.Com', 'M.Com', 'BBA', 'MBA', 'BCS', 'MCS'));
