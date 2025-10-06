import { NextResponse } from 'next/server';

export async function POST() {
  // Temporarily disabled to avoid Supabase connection errors
  return NextResponse.json({ 
    success: true, 
    message: 'Attendance expiry disabled temporarily' 
  });
}

// Original code commented out
/*
import { NextResponse } from 'next/server';
import { attendanceService } from '@/lib/supabase-attendance';

export async function POST() {
  try {
    const result = await attendanceService.closeExpiredSessions();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in expire-sessions API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
*/
