import { NextResponse } from 'next/server';
import { createKysely } from '@vercel/postgres-kysely';

interface Database {
  email_verifications: {
    email: string;
    code: string;
    expires_at: Date;
  };
}

const db = createKysely<Database>();

export async function POST(request: Request) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: 'Email and code are required.' },
      { status: 400 }
    );
  }

  try {
    const verificationRecord = await db
      .selectFrom('email_verifications')
      .selectAll()
      .where('email', '=', email)
      .where('code', '=', code)
      .executeTakeFirst();

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    if (new Date() > new Date(verificationRecord.expires_at)) {
      return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 });
    }

    // Code is valid, remove it from the database
    await db
      .deleteFrom('email_verifications')
      .where('email', '=', email)
      .execute();

    return NextResponse.json({ success: true, message: 'Email verified successfully.' });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email.' },
      { status: 500 }
    );
  }
}
