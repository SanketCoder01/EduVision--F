import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()

    // Test if table exists first
    const { error: testError } = await supabase
      .from('pending_registrations')
      .select('*')
      .limit(0)

    if (testError && testError.message.includes('does not exist')) {
      return NextResponse.json({ 
        success: false, 
        error: 'pending_registrations table does not exist',
        details: 'Please create the table manually in Supabase Dashboard',
        sql: `
-- Copy and paste this SQL in Supabase Dashboard → SQL Editor:

DROP TABLE IF EXISTS pending_registrations CASCADE;

CREATE TABLE pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    department TEXT NOT NULL,
    year TEXT,
    user_type TEXT CHECK (user_type IN ('student', 'faculty')) NOT NULL,
    face_url TEXT,
    status TEXT DEFAULT 'pending_approval',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON pending_registrations
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
        `
      }, { status: 500 })
    }

    // Test insert/delete to verify table works
    const testData = {
      email: 'test@example.com',
      name: 'Test User',
      department: 'CSE',
      user_type: 'student'
    }

    const { data: insertTest, error: insertError } = await supabase
      .from('pending_registrations')
      .insert(testData)
      .select()

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        error: insertError.message,
        details: 'Table exists but insert failed'
      }, { status: 500 })
    }

    // Clean up test data
    if (insertTest && insertTest.length > 0) {
      await supabase
        .from('pending_registrations')
        .delete()
        .eq('email', 'test@example.com')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database table exists and working correctly'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Unexpected error during database check'
    }, { status: 500 })
  }
}
