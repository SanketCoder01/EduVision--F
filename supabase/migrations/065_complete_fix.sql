-- ============================================================
-- EDUVISION FINAL COMPLETE FIX  
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. CREATE CORE TABLES
-- ============================================================

-- DM Thread table (one row per student-faculty pair)
CREATE TABLE IF NOT EXISTS public.queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  faculty_id UUID NOT NULL,
  student_name TEXT,
  faculty_name TEXT,
  student_department TEXT,
  student_year TEXT,
  subject TEXT DEFAULT 'Direct Message',
  title TEXT DEFAULT 'Direct Chat',
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS queries_student_faculty_unique ON public.queries(student_id, faculty_id);

-- Messages inside each DM thread
CREATE TABLE IF NOT EXISTS public.query_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.queries(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'faculty')),
  sender_name TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_messages_query_id ON public.query_messages(query_id);
CREATE INDEX IF NOT EXISTS idx_query_messages_sender ON public.query_messages(sender_id);

-- ============================================================
-- 2. STUDY GROUPS TABLE WITH ALL COLUMNS  
-- ============================================================

CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  faculty_id UUID NOT NULL,
  faculty TEXT,
  description TEXT,
  max_members INT DEFAULT 5,
  members_count INT DEFAULT 0,
  department TEXT,
  year TEXT,
  objectives TEXT,
  group_purpose TEXT,
  learning_goals TEXT,
  expected_outcomes TEXT,
  enable_task_scheduling BOOLEAN DEFAULT false,
  task_frequency TEXT DEFAULT 'weekly',
  daily_task_description TEXT,
  weekly_task_description TEXT,
  monthly_task_description TEXT,
  require_submissions BOOLEAN DEFAULT false,
  allow_materials BOOLEAN DEFAULT false,
  enable_file_uploads BOOLEAN DEFAULT true,
  enable_messaging BOOLEAN DEFAULT true,
  auto_notifications BOOLEAN DEFAULT true,
  let_students_decide BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns safely
DO $$
DECLARE cols TEXT[] := ARRAY[
  'max_members INT DEFAULT 5',
  'members_count INT DEFAULT 0',
  'department TEXT',
  'year TEXT',
  'objectives TEXT',
  'group_purpose TEXT',
  'learning_goals TEXT',
  'expected_outcomes TEXT',
  'enable_task_scheduling BOOLEAN DEFAULT false',
  'task_frequency TEXT DEFAULT ''weekly''',
  'daily_task_description TEXT',
  'weekly_task_description TEXT',
  'monthly_task_description TEXT',
  'require_submissions BOOLEAN DEFAULT false',
  'allow_materials BOOLEAN DEFAULT false',
  'enable_file_uploads BOOLEAN DEFAULT true',
  'enable_messaging BOOLEAN DEFAULT true',
  'auto_notifications BOOLEAN DEFAULT true',
  'let_students_decide BOOLEAN DEFAULT false'
];
col_def TEXT;
col_name TEXT;
BEGIN
  FOREACH col_def IN ARRAY cols LOOP
    col_name := split_part(col_def, ' ', 1);
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'study_groups' AND column_name = col_name
    ) THEN
      EXECUTE format('ALTER TABLE public.study_groups ADD COLUMN %s', col_def);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 3. ROW LEVEL SECURITY - OPEN FOR ALL AUTHENTICATED USERS
-- ============================================================

-- queries table
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_queries" ON public.queries;
CREATE POLICY "open_queries" ON public.queries
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- query_messages table  
ALTER TABLE public.query_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_query_messages" ON public.query_messages;
CREATE POLICY "open_query_messages" ON public.query_messages
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- study_groups table
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_study_groups" ON public.study_groups;
CREATE POLICY "open_study_groups" ON public.study_groups
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- faculty table - all authenticated can read, own row can update
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faculty_read" ON public.faculty;
CREATE POLICY "faculty_read" ON public.faculty
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "faculty_update_own" ON public.faculty;
CREATE POLICY "faculty_update_own" ON public.faculty
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- 4. OPEN ALL 16 STUDENT SHARDED TABLES
-- ============================================================

DO $$
DECLARE
  depts TEXT[] := ARRAY['cse','cyber','aids','aiml'];
  yrs TEXT[] := ARRAY['1st','2nd','3rd','4th'];
  d TEXT; y TEXT; tbl TEXT;
BEGIN
  FOREACH d IN ARRAY depts LOOP
    FOREACH y IN ARRAY yrs LOOP
      tbl := 'students_' || d || '_' || y || '_year';
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "open_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "open_%s" ON public.%I FOR SELECT USING (auth.uid() IS NOT NULL)', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "self_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "self_%s" ON public.%I FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)', tbl, tbl);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 5. ENABLE SUPABASE REALTIME ON ALL TABLES
-- ============================================================

DO $$
DECLARE
  depts TEXT[] := ARRAY['cse','cyber','aids','aiml'];
  yrs TEXT[] := ARRAY['1st','2nd','3rd','4th'];
  d TEXT; y TEXT; tbl TEXT;
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.queries; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.query_messages; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.study_groups; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.faculty; EXCEPTION WHEN others THEN NULL; END;
  FOREACH d IN ARRAY depts LOOP
    FOREACH y IN ARRAY yrs LOOP
      tbl := 'students_' || d || '_' || y || '_year';
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
        BEGIN EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl); EXCEPTION WHEN others THEN NULL; END;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 6. STORAGE BUCKET FOR CHAT ATTACHMENTS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('query_attachments', 'query_attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_query_attachments" ON storage.objects;
CREATE POLICY "public_query_attachments" ON storage.objects
  FOR ALL USING (bucket_id = 'query_attachments' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'query_attachments' AND auth.uid() IS NOT NULL);

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_avatars" ON storage.objects;
CREATE POLICY "public_avatars" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
