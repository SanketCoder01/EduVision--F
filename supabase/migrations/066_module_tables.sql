-- ============================================================
-- EDUVISION MODULE TABLES MIGRATION (066)
-- Run AFTER 065_complete_fix.sql
-- Creates all module tables with proper RLS security
-- ============================================================

-- ============================================================
-- 1. ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department TEXT, -- NULL means all departments
  target_years TEXT[] DEFAULT '{}', -- e.g. ['first','second'] or ['first','second','third','fourth']
  target_audience TEXT DEFAULT 'students',
  priority TEXT DEFAULT 'normal', -- normal, urgent, info
  poster_url TEXT,
  date DATE,
  time TIME,
  venue TEXT,
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Faculty can manage their own; students read relevant ones
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faculty_manage_announcements" ON public.announcements;
CREATE POLICY "faculty_manage_announcements" ON public.announcements
  FOR ALL USING (auth.uid() = faculty_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 2. ASSIGNMENTS TABLE (ensure all columns exist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  target_years TEXT[] DEFAULT '{}',
  year TEXT, -- canonical year e.g. '1st', '2nd'
  subject TEXT,
  assignment_type TEXT DEFAULT 'regular',
  difficulty TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- draft, published, closed
  max_score INT DEFAULT 100,
  allow_late_submission BOOLEAN DEFAULT false,
  attachment_url TEXT,
  attachment_name TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='year') THEN
    ALTER TABLE public.assignments ADD COLUMN year TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='faculty_name') THEN
    ALTER TABLE public.assignments ADD COLUMN faculty_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='attachment_url') THEN
    ALTER TABLE public.assignments ADD COLUMN attachment_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assignments' AND column_name='attachment_name') THEN
    ALTER TABLE public.assignments ADD COLUMN attachment_name TEXT;
  END IF;
END $$;

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_assignments" ON public.assignments;
CREATE POLICY "open_assignments" ON public.assignments
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 3. ASSIGNMENT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT,
  department TEXT,
  year TEXT,
  submission_text TEXT,
  file_url TEXT,
  file_name TEXT,
  score INT,
  feedback TEXT,
  status TEXT DEFAULT 'submitted', -- submitted, graded, late
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_assignment_submissions" ON public.assignment_submissions;
CREATE POLICY "open_assignment_submissions" ON public.assignment_submissions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 4. ATTENDANCE SESSIONS TABLE (ensure all columns)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  faculty_email TEXT,
  faculty_name TEXT,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT,
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INT,
  attendance_expiry_minutes INT DEFAULT 5,
  session_title TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_sessions' AND column_name='year') THEN
    ALTER TABLE public.attendance_sessions ADD COLUMN year TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_sessions' AND column_name='attendance_expiry_minutes') THEN
    ALTER TABLE public.attendance_sessions ADD COLUMN attendance_expiry_minutes INT DEFAULT 5;
  END IF;
END $$;

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_attendance_sessions" ON public.attendance_sessions;
CREATE POLICY "open_attendance_sessions" ON public.attendance_sessions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 5. ATTENDANCE RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT,
  student_email TEXT,
  department TEXT,
  year TEXT,
  status TEXT DEFAULT 'present', -- present, absent, late
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  marked_by TEXT DEFAULT 'self',
  UNIQUE(session_id, student_id)
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_attendance_records" ON public.attendance_records;
CREATE POLICY "open_attendance_records" ON public.attendance_records
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 6. QUIZZES TABLE (ensure all columns)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  department TEXT,
  target_years TEXT[] DEFAULT '{}',
  year TEXT,
  total_marks INT DEFAULT 10,
  duration_minutes INT DEFAULT 30,
  is_published BOOLEAN DEFAULT false,
  allow_review BOOLEAN DEFAULT true,
  randomize_questions BOOLEAN DEFAULT false,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='year') THEN
    ALTER TABLE public.quizzes ADD COLUMN year TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='faculty_name') THEN
    ALTER TABLE public.quizzes ADD COLUMN faculty_name TEXT;
  END IF;
END $$;

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_quizzes" ON public.quizzes;
CREATE POLICY "open_quizzes" ON public.quizzes
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 7. QUIZ QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq', -- mcq, true_false, short_answer
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  marks INT DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_quiz_questions" ON public.quiz_questions;
CREATE POLICY "open_quiz_questions" ON public.quiz_questions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 8. QUIZ ATTEMPTS TABLE (rename from quiz_submissions if needed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT,
  department TEXT,
  year TEXT,
  answers JSONB DEFAULT '{}', -- question_id -> selected_answer
  marks_obtained INT,
  total_marks INT,
  percentage NUMERIC(5,2),
  status TEXT DEFAULT 'submitted', -- submitted, graded
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_minutes INT,
  UNIQUE(quiz_id, student_id)
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "open_quiz_attempts" ON public.quiz_attempts
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 9. EXAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL,
  faculty_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  target_years TEXT[] DEFAULT '{}',
  year TEXT,
  problems JSONB DEFAULT '[]', -- array of problem objects
  language TEXT DEFAULT 'python',
  total_marks INT DEFAULT 100,
  duration_minutes INT DEFAULT 120,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  allow_copy_paste BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_exams" ON public.exams;
CREATE POLICY "open_exams" ON public.exams
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 10. EXAM SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT,
  department TEXT,
  year TEXT,
  code JSONB DEFAULT '{}', -- problem_index -> code string
  results JSONB DEFAULT '{}', -- problem_index -> {passed, output, error}
  score INT,
  max_score INT,
  status TEXT DEFAULT 'submitted',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_exam_submissions" ON public.exam_submissions;
CREATE POLICY "open_exam_submissions" ON public.exam_submissions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 11. CODE SUBMISSIONS TABLE (compiler assignments)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID,
  student_id UUID NOT NULL,
  student_name TEXT,
  department TEXT,
  year TEXT,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'python',
  output TEXT,
  test_results JSONB DEFAULT '[]',
  passed_tests INT DEFAULT 0,
  total_tests INT DEFAULT 0,
  score INT,
  status TEXT DEFAULT 'submitted', -- submitted, graded, running
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_code_submissions" ON public.code_submissions;
CREATE POLICY "open_code_submissions" ON public.code_submissions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 12. STUDY GROUP MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  group_name TEXT,
  student_id UUID NOT NULL,
  student_name TEXT,
  department TEXT,
  year TEXT,
  role TEXT DEFAULT 'member', -- leader, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_study_group_members" ON public.study_group_members;
CREATE POLICY "open_study_group_members" ON public.study_group_members
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 13. STUDY GROUP TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_group_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  group_name TEXT,
  faculty_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  frequency TEXT, -- daily, weekly, monthly
  status TEXT DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_group_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_study_group_tasks" ON public.study_group_tasks;
CREATE POLICY "open_study_group_tasks" ON public.study_group_tasks
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 14. NOTIFICATIONS TABLE (for cross-module real-time alerts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID, -- null means broadcast
  recipient_type TEXT, -- student, faculty
  department TEXT,
  year TEXT,
  type TEXT NOT NULL, -- announcement, assignment, attendance, quiz, exam
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_notifications" ON public.notifications;
CREATE POLICY "open_notifications" ON public.notifications
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 15. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('code-submissions', 'code-submissions', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
DECLARE bucket_names TEXT[] := ARRAY['assignments','announcements','submissions','code-submissions'];
  b TEXT;
BEGIN
  FOREACH b IN ARRAY bucket_names LOOP
    EXECUTE format('DROP POLICY IF EXISTS "open_%s_storage" ON storage.objects', b);
    EXECUTE format(
      'CREATE POLICY "open_%s_storage" ON storage.objects FOR ALL USING (bucket_id = %L AND auth.uid() IS NOT NULL) WITH CHECK (bucket_id = %L AND auth.uid() IS NOT NULL)',
      b, b, b
    );
  END LOOP;
END $$;

-- ============================================================
-- 16. ENABLE REALTIME ON ALL NEW TABLES
-- ============================================================
DO $$
DECLARE tbls TEXT[] := ARRAY[
  'announcements','assignments','assignment_submissions',
  'attendance_sessions','attendance_records',
  'quizzes','quiz_questions','quiz_attempts',
  'exams','exam_submissions',
  'code_submissions',
  'study_group_members','study_group_tasks',
  'notifications'
];
t TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN others THEN NULL;
    END;
  END LOOP;
END $$;

-- ============================================================
-- 17. VERIFY: Show all tables created successfully
-- ============================================================
SELECT table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'announcements','assignments','assignment_submissions',
    'attendance_sessions','attendance_records',
    'quizzes','quiz_questions','quiz_attempts',
    'exams','exam_submissions','code_submissions',
    'study_group_members','study_group_tasks','notifications',
    'queries','query_messages','study_groups','faculty'
  )
ORDER BY table_name;
