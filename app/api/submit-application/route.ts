import { NextRequest, NextResponse } from 'next/server';
import { submitApplication } from '@/lib/application-forms';

export async function POST(request: NextRequest) {
  try {
    const { form_id, student_name, student_email, form_data } = await request.json();

    if (!form_id || !student_name || !student_email || !form_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const submission = {
      form_id,
      student_name,
      student_email,
      form_data,
      status: 'pending' as const
    };

    const { error } = await submitApplication(submission);
    if (error) {
      console.error('Error submitting application:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!'
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
} 