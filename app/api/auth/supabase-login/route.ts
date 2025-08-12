import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, role } = await request.json();

    if (!identifier || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    let user = null;
    let table = '';

    // Determine which table to query based on role
    if (role === 'student') {
      table = 'students';
      // Check if identifier is PRN (10 digits) or email
      const isPrn = /^\d{10}$/.test(identifier);
      const query = isPrn ? { prn: identifier } : { email: identifier };
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(query)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      user = data;
    } else if (role === 'faculty') {
      table = 'faculty';
      // Check if identifier is employee_id or email
      const isEmployeeId = /^EMP/.test(identifier);
      const query = isEmployeeId ? { employee_id: identifier } : { email: identifier };
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(query)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      user = data;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password_hash, ...userData } = user;
    
    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        userType: role,
        faceRegistered: user.face_registered || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
