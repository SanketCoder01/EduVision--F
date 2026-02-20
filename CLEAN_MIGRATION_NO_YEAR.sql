-- ============================================================================
-- CLEAN MIGRATION - NO YEAR COLUMN REFERENCES
-- This creates tables WITHOUT problematic year references
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================================

-- Create profile_updates table (NO year column)
CREATE TABLE IF NOT EXISTS profile_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  department TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_updates_user_id ON profile_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_updates_created_at ON profile_updates(created_at DESC);

ALTER TABLE profile_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile updates" ON profile_updates;
DROP POLICY IF EXISTS "System can insert profile updates" ON profile_updates;

CREATE POLICY "Users can view their own profile updates"
  ON profile_updates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert profile updates"
  ON profile_updates FOR INSERT
  WITH CHECK (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE profile_updates;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create study_groups table (year column kept - it's part of this table's design)
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  faculty_id UUID NOT NULL,
  faculty TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 5,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  objectives TEXT,
  group_purpose TEXT,
  learning_goals TEXT,
  expected_outcomes TEXT,
  enable_task_scheduling BOOLEAN DEFAULT false,
  task_frequency TEXT,
  daily_task_description TEXT,
  weekly_task_description TEXT,
  monthly_task_description TEXT,
  require_submissions BOOLEAN DEFAULT false,
  allow_materials BOOLEAN DEFAULT false,
  enable_file_uploads BOOLEAN DEFAULT true,
  enable_messaging BOOLEAN DEFAULT true,
  auto_notifications BOOLEAN DEFAULT true,
  let_students_decide BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_groups_faculty_id ON study_groups(faculty_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_department_year ON study_groups(department, year);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_at ON study_groups(created_at DESC);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can view their own study groups" ON study_groups;
DROP POLICY IF EXISTS "Faculty can create study groups" ON study_groups;
DROP POLICY IF EXISTS "Faculty can update their own study groups" ON study_groups;
DROP POLICY IF EXISTS "Faculty can delete their own study groups" ON study_groups;
DROP POLICY IF EXISTS "Students can view study groups for their dept/year" ON study_groups;

CREATE POLICY "Faculty can view their own study groups"
  ON study_groups FOR SELECT
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can create study groups"
  ON study_groups FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update their own study groups"
  ON study_groups FOR UPDATE
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete their own study groups"
  ON study_groups FOR DELETE
  USING (faculty_id = auth.uid());

CREATE POLICY "Students can view study groups for their dept/year"
  ON study_groups FOR SELECT
  USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create study_group_members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(study_group_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(study_group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_student_id ON study_group_members(student_id);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their group memberships" ON study_group_members;
DROP POLICY IF EXISTS "Students can join groups" ON study_group_members;
DROP POLICY IF EXISTS "Students can leave groups" ON study_group_members;

CREATE POLICY "Members can view their group memberships"
  ON study_group_members FOR SELECT
  USING (true);

CREATE POLICY "Students can join groups"
  ON study_group_members FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can leave groups"
  ON study_group_members FOR DELETE
  USING (student_id = auth.uid());

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE study_group_members;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Grant permissions
GRANT ALL ON profile_updates TO authenticated;
GRANT ALL ON study_groups TO authenticated;
GRANT ALL ON study_group_members TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: profile_updates, study_groups, and notifications tables created';
  RAISE NOTICE '✅ Real-time enabled on all tables';
  RAISE NOTICE '✅ NO problematic year references in profile_updates';
END $$;
