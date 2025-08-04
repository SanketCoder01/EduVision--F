CREATE OR REPLACE FUNCTION create_virtual_classroom_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create virtual_classroom_sessions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.virtual_classroom_sessions (
    id VARCHAR(255) PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    faculty_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create virtual_classroom_attendees table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.virtual_classroom_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL REFERENCES public.virtual_classroom_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create virtual_classroom_resources table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.virtual_classroom_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL REFERENCES public.virtual_classroom_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$;
