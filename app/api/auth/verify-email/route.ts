import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: 'Email and code are required.' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  try {
    // Fetch verification record
    const { data: verificationRecord, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    if (new Date() > new Date(verificationRecord.expires_at)) {
      return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 });
    }

    // Code is valid, remove it from the database
    const { error: deleteError } = await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email.' },
      { status: 500 }
    );
  }
}
