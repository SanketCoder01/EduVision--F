CREATE OR REPLACE FUNCTION create_study_groups_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create study_groups table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    creation_type VARCHAR(50) NOT NULL CHECK (creation_type IN ('faculty', 'student')),
    max_members INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$;
