-- Create attendance tables procedure
CREATE OR REPLACE FUNCTION create_attendance_tables()
RETURNS void AS $$
BEGIN
  -- Attendance sessions table (created by faculty)
  CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    faculty_id UUID NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(10, 8),
    geo_fence_radius INTEGER DEFAULT 100, -- in meters
    require_face_recognition BOOLEAN DEFAULT true,
    require_geo_fencing BOOLEAN DEFAULT true,
    require_liveness_detection BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Student attendance records
  CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    attendance_status VARCHAR(50) NOT NULL CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    face_verified BOOLEAN DEFAULT false,
    geo_location_verified BOOLEAN DEFAULT false,
    liveness_verified BOOLEAN DEFAULT false,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    distance_from_center INTEGER, -- in meters
    face_confidence_score DECIMAL(5, 4),
    liveness_score DECIMAL(5, 4),
    device_info JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, student_id)
  );

  -- Faculty attendance records
  CREATE TABLE IF NOT EXISTS public.faculty_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL,
    attendance_status VARCHAR(50) NOT NULL CHECK (attendance_status IN ('present', 'absent', 'late')),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    face_verified BOOLEAN DEFAULT false,
    geo_location_verified BOOLEAN DEFAULT false,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    distance_from_center INTEGER,
    device_info JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, faculty_id)
  );

  -- Face recognition data for students
  CREATE TABLE IF NOT EXISTS public.student_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL UNIQUE,
    face_encoding TEXT NOT NULL, -- Base64 encoded face data
    face_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Face recognition data for faculty
  CREATE TABLE IF NOT EXISTS public.faculty_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL UNIQUE,
    face_encoding TEXT NOT NULL, -- Base64 encoded face data
    face_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Attendance analytics and reports
  CREATE TABLE IF NOT EXISTS public.attendance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
    report_data JSONB NOT NULL,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Attendance notifications
  CREATE TABLE IF NOT EXISTS public.attendance_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('session_start', 'session_end', 'attendance_marked', 'attendance_reminder')),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class_id ON public.attendance_sessions(class_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty_id ON public.attendance_sessions(faculty_id);
  CREATE INDEX IF NOT EXISTS idx_student_attendance_session_id ON public.student_attendance(session_id);
  CREATE INDEX IF NOT EXISTS idx_student_attendance_student_id ON public.student_attendance(student_id);
  CREATE INDEX IF NOT EXISTS idx_faculty_attendance_session_id ON public.faculty_attendance(session_id);
  CREATE INDEX IF NOT EXISTS idx_faculty_attendance_faculty_id ON public.faculty_attendance(faculty_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON public.attendance_sessions(session_date);
  CREATE INDEX IF NOT EXISTS idx_student_attendance_marked_at ON public.student_attendance(marked_at);
  CREATE INDEX IF NOT EXISTS idx_faculty_attendance_marked_at ON public.faculty_attendance(marked_at);
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create tables
SELECT create_attendance_tables(); 