-- Create timetables table for storing faculty-uploaded timetables with OCR extracted data
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  schedule_data JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_timetables_faculty_id ON public.timetables(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetables_department_year ON public.timetables(department, year);
CREATE INDEX IF NOT EXISTS idx_timetables_uploaded_at ON public.timetables(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timetables

-- Faculty can view their own timetables
CREATE POLICY "Faculty can view own timetables"
  ON public.timetables
  FOR SELECT
  USING (
    faculty_id IN (
      SELECT id FROM public.faculty WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Faculty can insert their own timetables
CREATE POLICY "Faculty can insert own timetables"
  ON public.timetables
  FOR INSERT
  WITH CHECK (
    faculty_id IN (
      SELECT id FROM public.faculty WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Faculty can update their own timetables
CREATE POLICY "Faculty can update own timetables"
  ON public.timetables
  FOR UPDATE
  USING (
    faculty_id IN (
      SELECT id FROM public.faculty WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Faculty can delete their own timetables
CREATE POLICY "Faculty can delete own timetables"
  ON public.timetables
  FOR DELETE
  USING (
    faculty_id IN (
      SELECT id FROM public.faculty WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Students can view timetables for their department and year
CREATE POLICY "Students can view timetables for their dept and year"
  ON public.timetables
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students_cse_1st_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cse_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cse_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cse_4th_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cyber_1st_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cyber_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cyber_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_cyber_4th_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aids_1st_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aids_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aids_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aids_4th_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aiml_1st_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aiml_2nd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aiml_3rd_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
      UNION ALL
      SELECT 1 FROM public.students_aiml_4th_year WHERE email = auth.jwt() ->> 'email' AND department = timetables.department AND year = timetables.year
    )
  );

-- Create storage bucket for timetables if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('timetables', 'timetables', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for timetables bucket

-- Faculty can upload timetables
CREATE POLICY "Faculty can upload timetables"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'timetables' AND
    auth.role() = 'authenticated'
  );

-- Faculty can update their own timetables
CREATE POLICY "Faculty can update own timetable files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'timetables' AND
    auth.role() = 'authenticated'
  );

-- Faculty can delete their own timetables
CREATE POLICY "Faculty can delete own timetable files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'timetables' AND
    auth.role() = 'authenticated'
  );

-- Everyone can view timetable files (public bucket)
CREATE POLICY "Anyone can view timetable files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'timetables');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.timetables IS 'Stores faculty-uploaded timetables with OCR extracted schedule data';
