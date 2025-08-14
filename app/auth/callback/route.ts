import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userType = requestUrl.searchParams.get('type') || 'student';

  if (code) {
    const supabase = createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Auth Callback Error:', sessionError.message);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not authenticate user`);
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=User not found`);
    }

    // Check if user profile already exists
    const tableName = userType === 'faculty' ? 'faculty' : 'students';
    const { data: profile, error: profileError } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is 'No rows found', which is not an actual error in this case.
        console.error('Error fetching profile:', profileError);
    }

    if (profile) {
      // User exists, redirect to their dashboard
      const dashboardUrl = userType === 'faculty' ? '/dashboard' : '/student-dashboard';
      return NextResponse.redirect(requestUrl.origin + dashboardUrl);
    } else {
      // User does not exist, redirect to registration
      const registrationUrl = userType === 'faculty' ? '/faculty-registration' : '/student-registration';
      const name = encodeURIComponent(user.user_metadata.full_name || 'New User');
      const email = encodeURIComponent(user.email || '');
      return NextResponse.redirect(`${requestUrl.origin}${registrationUrl}?name=${name}&email=${email}`);
    }
  }

  // Fallback for invalid requests
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid callback`);
}
