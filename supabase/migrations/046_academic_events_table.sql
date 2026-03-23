-- Create academic_events table for storing academic calendar events
CREATE TABLE IF NOT EXISTS public.academic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL,
  year TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- exam, holiday, event, deadline, etc.
  date DATE NOT NULL,
  time TEXT,
  description TEXT,
  importance TEXT DEFAULT 'normal', -- low, normal, high
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_academic_events_department ON public.academic_events(department);
CREATE INDEX IF NOT EXISTS idx_academic_events_date ON public.academic_events(date);
CREATE INDEX IF NOT EXISTS idx_academic_events_department_year ON public.academic_events(department, year);

-- Enable Row Level Security
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Faculty can view events for their department
CREATE POLICY "Faculty can view department events"
  ON public.academic_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.faculty WHERE id = auth.uid() AND department = academic_events.department
    )
    OR department = 'All'
  );

-- Faculty can insert events for their department
CREATE POLICY "Faculty can insert department events"
  ON public.academic_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.faculty WHERE id = auth.uid() AND department = academic_events.department
    )
    OR department = 'All'
  );

-- Faculty can update their own events
CREATE POLICY "Faculty can update own events"
  ON public.academic_events
  FOR UPDATE
  USING (created_by = auth.uid());

-- Faculty can delete their own events
CREATE POLICY "Faculty can delete own events"
  ON public.academic_events
  FOR DELETE
  USING (created_by = auth.uid());

-- Students can view events for their department and year
CREATE POLICY "Students can view department year events"
  ON public.academic_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students_cse_1st_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cse_1st_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cse_1st_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cse_2nd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cse_2nd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cse_2nd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cse_3rd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cse_3rd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cse_3rd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cse_4th_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cse_4th_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cse_4th_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cyber_1st_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cyber_1st_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cyber_1st_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cyber_2nd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cyber_2nd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cyber_2nd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cyber_3rd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cyber_3rd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cyber_3rd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_cyber_4th_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_cyber_4th_year.department OR academic_events.department = 'All') AND (academic_events.year = students_cyber_4th_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aids_1st_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aids_1st_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aids_1st_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aids_2nd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aids_2nd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aids_2nd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aids_3rd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aids_3rd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aids_3rd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aids_4th_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aids_4th_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aids_4th_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aiml_1st_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aiml_1st_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aiml_1st_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aiml_2nd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aiml_2nd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aiml_2nd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aiml_3rd_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aiml_3rd_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aiml_3rd_year.year OR academic_events.year IS NULL)
      UNION ALL
      SELECT 1 FROM public.students_aiml_4th_year WHERE email = auth.jwt() ->> 'email' AND (academic_events.department = students_aiml_4th_year.department OR academic_events.department = 'All') AND (academic_events.year = students_aiml_4th_year.year OR academic_events.year IS NULL)
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academic_events_updated_at
  BEFORE UPDATE ON public.academic_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.academic_events IS 'Stores academic calendar events like exams, holidays, deadlines filtered by department and year';
