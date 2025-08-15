import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // 1. Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get the student's profile
    const { data: studentProfile, error: profileError } = await supabase
      .from('students')
      .select('department, year')
      .eq('id', user.id)
      .single();

    if (profileError || !studentProfile) {
      console.error('Profile Error:', profileError);
      return NextResponse.json({ success: false, message: 'Could not retrieve student profile.' }, { status: 404 });
    }

    const { department, year } = studentProfile;

    // 3. Fetch assignments scoped to the student's department and year
    const { data, error } = await supabase
      .from('assignments')
      .select('*, faculty:faculty_id(full_name)')
      .contains('target_departments', [department])
      .contains('target_years', [year]);

    if (error) {
      throw error;
    }

    // Map the faculty object to faculty_name
    const assignments = data.map(a => ({
      ...a,
      faculty_name: Array.isArray(a.faculty) ? a.faculty[0]?.full_name : a.faculty?.full_name,
    }));


    return NextResponse.json({ success: true, data: assignments }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
