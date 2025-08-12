import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('Initializing database tables...')
    
    // Create students table
    const { error: studentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      `
    })

    if (studentsError) {
      console.error('Error creating students table:', studentsError)
    }

    // Create faculty table
    const { error: facultyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS faculty (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      `
    })

    if (facultyError) {
      console.error('Error creating faculty table:', facultyError)
    }

    // Create university_admins table
    const { error: adminError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS university_admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (adminError) {
      console.error('Error creating university_admins table:', adminError)
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables initialized successfully',
      errors: {
        students: studentsError?.message,
        faculty: facultyError?.message,
        admin: adminError?.message
      }
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 