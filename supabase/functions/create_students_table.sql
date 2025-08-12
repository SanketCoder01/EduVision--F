CREATE OR REPLACE FUNCTION create_students_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop the table if it exists
  DROP TABLE IF EXISTS students;
  
  -- Create the students table with all required columns
  CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL CHECK (year IN ('first', 'second', 'third', 'fourth')),
    date_of_birth DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    prn VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Add RLS policies
  ALTER TABLE students ENABLE ROW LEVEL SECURITY;
  
  -- Create policy for admins
  CREATE POLICY admin_students_policy ON students
    FOR ALL
    TO authenticated
    USING (true);
    
  RETURN;
END;
$$;