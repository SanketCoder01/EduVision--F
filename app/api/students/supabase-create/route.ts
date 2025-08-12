import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate PRN
const generatePRN = (department: string, year: string): string => {
  const currentYear = new Date().getFullYear();
  const deptCode = department.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `${currentYear}${deptCode}${randomNum}`;
};

// Generate password
const generatePassword = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Send email
const sendEmail = async (to: string, prn: string, password: string, name: string) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: to,
    subject: 'EduVision - Your Login Credentials',
    html: `
      <h2>Welcome to EduVision!</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <p><strong>PRN:</strong> ${prn}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please login at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">EduVision Portal</a></p>
      <p>Best regards,<br>EduVision Team</p>
    `,
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, department, academic_year, date_of_birth, parent_name, parent_phone } = body;

    // Validation
    if (!name || !email || !department || !academic_year) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('students')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 });
    }

    // Generate PRN and password
    const prn = generatePRN(department, academic_year);
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);

    // Create student
    const { data: student, error } = await supabase
      .from('students')
      .insert({
        prn,
        name,
        email,
        phone,
        address,
        department,
        year: academic_year,
        date_of_birth,
        parent_name,
        parent_phone,
        password_hash: passwordHash,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      return NextResponse.json({ success: false, message: 'Failed to create student' }, { status: 500 });
    }

    // Send email
    try {
      await sendEmail(email, prn, password, name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      student: { ...student, password_hash: undefined }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
