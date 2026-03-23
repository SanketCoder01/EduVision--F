-- Exam Violations Tracking Table
-- Tracks all student violations during exams for faculty review

CREATE TABLE IF NOT EXISTS exam_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES compiler_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL, -- References student in department-specific tables
  violation_type TEXT NOT NULL, -- 'tab_switch', 'dev_tools', 'right_click', 'window_blur', 'browser_switch', 'copy_paste'
  violation_details TEXT, -- Additional details about the violation
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  warning_count INTEGER DEFAULT 1, -- Which warning this was (1, 2, or 3)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exam_violations_exam_id ON exam_violations(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_violations_student_id ON exam_violations(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_violations_type ON exam_violations(violation_type);

-- RLS Policies
ALTER TABLE exam_violations ENABLE ROW LEVEL SECURITY;

-- Faculty can view violations for their exams
CREATE POLICY "Faculty can view violations for their exams"
  ON exam_violations FOR SELECT
  USING (
    exam_id IN (
      SELECT id FROM compiler_exams WHERE faculty_id = auth.uid()
    )
  );

-- Students can insert their own violations
CREATE POLICY "Students can insert their own violations"
  ON exam_violations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can view their own violations
CREATE POLICY "Students can view their own violations"
  ON exam_violations FOR SELECT
  USING (auth.uid() = student_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE exam_violations;

-- Add violation_summary column to student_code_submissions
ALTER TABLE student_code_submissions 
ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;

ALTER TABLE student_code_submissions 
ADD COLUMN IF NOT EXISTS violation_types TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON TABLE exam_violations IS 'Tracks student violations during proctored exams';
COMMENT ON COLUMN exam_violations.violation_type IS 'Type of violation: tab_switch, dev_tools, right_click, window_blur, browser_switch, copy_paste';
COMMENT ON COLUMN exam_violations.warning_count IS 'Which warning number this was (1, 2, or 3 - 3 triggers auto-submit)';
