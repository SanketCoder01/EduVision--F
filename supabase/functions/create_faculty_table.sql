CREATE OR REPLACE FUNCTION create_faculty_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop the table if it exists
  DROP TABLE IF EXISTS faculty;
  
  -- Create the faculty table with all required columns
  CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Add RLS policies
  ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
  
  -- Create policy for admins
  CREATE POLICY admin_faculty_policy ON faculty
    FOR ALL
    TO authenticated
    USING (true);
    
  RETURN;
END;
$$;