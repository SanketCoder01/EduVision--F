-- ================================================================
-- Migration 073: Fix study_materials + notifications columns
-- Run in Supabase SQL Editor
-- ================================================================

-- 1. Add missing columns to study_materials that page.tsx tries to INSERT
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='batch_id') THEN
    ALTER TABLE public.study_materials ADD COLUMN batch_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='faculty_name') THEN
    ALTER TABLE public.study_materials ADD COLUMN faculty_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='faculty_email') THEN
    ALTER TABLE public.study_materials ADD COLUMN faculty_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='has_summary') THEN
    ALTER TABLE public.study_materials ADD COLUMN has_summary BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='summary_url') THEN
    ALTER TABLE public.study_materials ADD COLUMN summary_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='summary_file_name') THEN
    ALTER TABLE public.study_materials ADD COLUMN summary_file_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_materials' AND column_name='summary') THEN
    ALTER TABLE public.study_materials ADD COLUMN summary TEXT;
  END IF;
END $$;

-- 2. Fix RLS on study_materials so authenticated users can INSERT
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Faculty can insert own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Faculty can view own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view materials" ON public.study_materials;
DROP POLICY IF EXISTS "Faculty can update own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Faculty can delete own materials" ON public.study_materials;
DROP POLICY IF EXISTS "open_study_materials" ON public.study_materials;

CREATE POLICY "open_study_materials" ON public.study_materials
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Add missing columns to notifications that page.tsx tries to INSERT
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_type') THEN
    ALTER TABLE public.notifications ADD COLUMN user_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='content_type') THEN
    ALTER TABLE public.notifications ADD COLUMN content_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='content_id') THEN
    ALTER TABLE public.notifications ADD COLUMN content_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='target_years') THEN
    ALTER TABLE public.notifications ADD COLUMN target_years TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='created_by') THEN
    ALTER TABLE public.notifications ADD COLUMN created_by UUID;
  END IF;
  -- Also add user_id alias for the actions.ts which uses user_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
    ALTER TABLE public.notifications ADD COLUMN user_id UUID;
  END IF;
  -- read column used in actions.ts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read') THEN
    ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 4. Fix RLS on notifications - allow authenticated to insert
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open_notifications" ON public.notifications;
CREATE POLICY "open_notifications" ON public.notifications
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Make sure storage bucket for study-materials exists and has full open policies
INSERT INTO storage.buckets (id, name, public) VALUES ('study-materials', 'study-materials', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view study materials" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can upload study materials" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can delete own study materials" ON storage.objects;
DROP POLICY IF EXISTS "open_study-materials_storage" ON storage.objects;

CREATE POLICY "open_study-materials_storage" ON storage.objects
  FOR ALL USING (bucket_id = 'study-materials' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'study-materials' AND auth.uid() IS NOT NULL);

-- Also allow public read on study-materials
DROP POLICY IF EXISTS "public_read_study_materials" ON storage.objects;
CREATE POLICY "public_read_study_materials" ON storage.objects
  FOR SELECT USING (bucket_id = 'study-materials');

-- 6. Enable realtime on both tables (idempotent)
DO $$
BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.study_materials'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications'; EXCEPTION WHEN others THEN NULL; END;
END $$;

SELECT 'study_materials columns:' AS info, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'study_materials' AND table_schema = 'public'
ORDER BY ordinal_position;
