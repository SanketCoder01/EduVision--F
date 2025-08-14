import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createKysely } from '@vercel/postgres-kysely';

const resend = new Resend(process.env.RESEND_API_KEY);

interface Database {
  email_verifications: {
    email: string;
    code: string;
    expires_at: Date;
  };
}

const db = createKysely<Database>();

export async function POST(request: Request) {
  const { email, userType } = await request.json();

  const allowedDomains = {
    student: 'sanjivani.edu.in',
    faculty: 'set.edu.in',
  };

  const domain = userType === 'student' ? allowedDomains.student : allowedDomains.faculty;

  if (!email.endsWith(`@${domain}`)) {
    return NextResponse.json(
      { error: `Invalid email domain. Please use a @${domain} email address.` },
      { status: 400 }
    );
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

  try {
    // Store the verification code in the database
    await db
      .insertInto('email_verifications')
      .values({ email, code, expires_at })
      .onConflict((oc) => oc
        .column('email')
        .doUpdateSet({ code, expires_at }))
      .execute();

    // Send the verification code via email
    await resend.emails.send({
      from: 'verification@eduvision.tech',
      to: email,
      subject: 'Your EduVision Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="text-align: center; color: #333;">EduVision Email Verification</h2>
          <p style="font-size: 16px;">Hi there,</p>
          <p style="font-size: 16px;">Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; padding: 10px; background: #f5f5f5; border-radius: 5px;">${code}</p>
          <p style="font-size: 16px;">This code will expire in 15 minutes.</p>
          <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #777; text-align: center;">© 2024 EduVision. All rights reserved.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email.' },
      { status: 500 }
    );
  }
}
