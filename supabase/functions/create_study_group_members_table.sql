CREATE OR REPLACE FUNCTION create_study_group_members_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create study_group_members table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    student_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$;
