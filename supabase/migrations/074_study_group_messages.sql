-- Migration: Add study_group_messages table
CREATE TABLE IF NOT EXISTS public.study_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  text TEXT NOT NULL,
  file_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT DEFAULT 'text'
);

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS study_group_messages;

ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all users to access messages" ON study_group_messages;
CREATE POLICY "Allow all users to access messages" ON study_group_messages FOR ALL USING (auth.uid() IS NOT NULL);
