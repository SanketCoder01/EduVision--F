import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    // Validate email domain based on user type
    const email = user.email || '';
    const isValidDomain = userType === 'student' 
      ? email.endsWith('@sanjivani.edu.in')
      : email.endsWith('@set.ac.in') || email.endsWith('@sanjivani.org');

    if (!isValidDomain) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(`Invalid email domain for ${userType}. Please use appropriate institutional email.`)}`
      );
    }

    // Redirect to registration form completion
    const registrationUrl = userType === 'faculty' ? '/faculty-registration' : '/student-registration';
    const url = new URL(requestUrl.origin + registrationUrl);
    url.searchParams.set('type', userType);
    url.searchParams.set('email', email);
    url.searchParams.set('name', user.user_metadata?.full_name || user.user_metadata?.name || '');
    url.searchParams.set('photo', user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
    return NextResponse.redirect(url.toString());
  }

  // Fallback for invalid requests
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid callback`);
}
