CREATE OR REPLACE FUNCTION create_study_group_task_attachments_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create study_group_task_attachments table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.study_group_task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.study_group_tasks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$;
