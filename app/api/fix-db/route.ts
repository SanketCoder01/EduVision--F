import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()

    // Create the table with raw SQL
    const { error } = await supabase.rpc('exec', {
      sql: `
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
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow all operations" ON pending_registrations
            FOR ALL USING (true) WITH CHECK (true);
            
        CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
        CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
      `
    })

    if (error) {
      console.error('Database creation error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        action: 'Please run the SQL manually in Supabase Dashboard'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database table created successfully' 
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
