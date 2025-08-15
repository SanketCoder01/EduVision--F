-- 004_late_submission_plagiarism.sql
-- Adds late submission control and plagiarism fields

-- 1) Assignments: allow closing late window explicitly
ALTER TABLE IF EXISTS assignments
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- 2) Submissions: store plagiarism results and processing state
ALTER TABLE IF EXISTS submissions
  ADD COLUMN IF NOT EXISTS plagiarism_score integer,
  ADD COLUMN IF NOT EXISTS plagiarism_report_url text,
  ADD COLUMN IF NOT EXISTS plagiarism_status text,
  ADD COLUMN IF NOT EXISTS ocr_used boolean,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz;

-- 3) Optional job table for async processing of non-text files
CREATE TABLE IF NOT EXISTS plagiarism_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  vendor text NOT NULL DEFAULT 'mock',
  status text NOT NULL DEFAULT 'pending',
  input_type text NOT NULL, -- text | file
  file_url text,
  ocr_used boolean,
  similarity_overall numeric,
  report_url text,
  breakdown_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Trigger to keep updated_at fresh on jobs
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_plagiarism_jobs_updated_at ON plagiarism_jobs;
CREATE TRIGGER trg_plagiarism_jobs_updated_at
BEFORE UPDATE ON plagiarism_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
