import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get the logged-in student's department and year from the 'students' table
    const { data: studentProfile, error: profileError } = await supabase
      .from('students')
      .select('department, year')
      .eq('id', user.id)
      .single();

    if (profileError || !studentProfile) {
      console.error('Error fetching student profile:', profileError);
      return new NextResponse(JSON.stringify({ error: 'Could not retrieve student profile.' }), { status: 500 });
    }

    const { department, year } = studentProfile;

    // Build the query to fetch relevant announcements based on the student's profile:
    // 1. University-wide announcements (is_university_wide = true)
    // 2. Department-wide announcements (department matches, but year is not specified)
    // 3. Class-specific announcements (both department and year match)
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        created_at,
        department,
        year,
        is_university_wide,
        faculty:author_id ( name, department )
      `)
      .or(`is_university_wide.eq.true,and(department.eq.${department},year.is.null),and(department.eq.${department},year.eq.${year})`)
      .order('created_at', { ascending: false });

    if (announcementsError) {
      console.error('Error fetching announcements:', announcementsError);
      return new NextResponse(JSON.stringify({ error: 'Failed to fetch announcements.' }), { status: 500 });
    }

    // Return the filtered list of announcements, or an empty array if none are found.
    return NextResponse.json(announcements || []);

  } catch (error) {
    console.error('An unexpected error occurred in GET /api/announcements:', error);
    return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred.' }), { status: 500 });
  }
}