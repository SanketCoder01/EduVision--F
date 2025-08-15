import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Read the SQL file content
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(process.cwd(), 'app', 'sql', 'create_attendance_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL to create attendance tables
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('Error creating attendance tables:', error);
      return NextResponse.json(
        { error: 'Failed to create attendance tables' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Attendance tables created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initializing attendance system:', error);
    return NextResponse.json(
      { error: 'Failed to initialize attendance system' },
      { status: 500 }
    );
  }
} 