CREATE OR REPLACE FUNCTION create_mentorship_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create faculty table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.faculty (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create students table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    prn VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create mentorships table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.mentorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create mentorship_meetings table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.mentorship_meetings (
    id VARCHAR(255) PRIMARY KEY,
    faculty_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_type VARCHAR(50) NOT NULL CHECK (meeting_type IN ('individual', 'group')),
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create mentorship_meeting_attendees table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.mentorship_meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(255) NOT NULL REFERENCES public.mentorship_meetings(id) ON DELETE CASCADE,
    student_id VARCHAR(255) NOT NULL,
    attended BOOLEAN,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create mentorship_notes table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.mentorship_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create mentorship_help_requests table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.mentorship_help_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$;
