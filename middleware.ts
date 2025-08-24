import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { DEPARTMENTS, YEARS } from './lib/constants/departments';

// Helper function to check registration status
async function getUserRegistrationStatus(supabase: any, userId: string): Promise<{ registered: boolean, userType: 'faculty' | 'student' | null }> {
  const { data: faculty } = await supabase.from('faculty').select('id').eq('id', userId).single();
  if (faculty) return { registered: true, userType: 'faculty' };

  for (const department of DEPARTMENTS) {
    for (const year of YEARS) {
      const tableName = `students_${department.toLowerCase().replace(/\s+/g, '_')}_${year.toLowerCase().replace(/\s+/g, '_')}`;
      const { data: student } = await supabase.from(tableName).select('id').eq('id', userId).single();
      if (student) return { registered: true, userType: 'student' };
    }
  }

  return { registered: false, userType: null };
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Remove all authentication checks - allow access to all routes
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
