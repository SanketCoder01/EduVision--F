import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from('students').select('id').limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Supabase connection successful.', data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Supabase connection test error:', errorMessage);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
