CREATE OR REPLACE FUNCTION create_study_group_tasks_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create study_group_tasks table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.study_group_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$;
