-- Fix timetables foreign key constraint to reference auth.users instead of faculty table
-- This allows faculty_id to be the auth.users id directly

-- First, drop the existing foreign key constraint
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_faculty_id_fkey;

-- Add new foreign key constraint referencing auth.users
ALTER TABLE public.timetables 
ADD CONSTRAINT timetables_faculty_id_fkey 
FOREIGN KEY (faculty_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to work with auth.users id
-- Drop existing policies
DROP POLICY IF EXISTS "Faculty can view own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Faculty can insert own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Faculty can update own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Faculty can delete own timetables" ON public.timetables;

-- Create new policies using auth.uid() directly
CREATE POLICY "Faculty can view own timetables"
  ON public.timetables
  FOR SELECT
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert own timetables"
  ON public.timetables
  FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own timetables"
  ON public.timetables
  FOR UPDATE
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete own timetables"
  ON public.timetables
  FOR DELETE
  USING (faculty_id = auth.uid());

-- Students can view timetables for their department and year (keep existing policy)
-- This policy already exists, no need to recreate
