import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('pending_registrations')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: tablesError.message 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      tableExists: true
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const testData = {
      email: 'test@sanjivani.edu.in',
      name: 'Test User',
      department: 'CSE',
      year: '1st',
      user_type: 'student',
      phone: '1234567890'
    }

    const { data, error } = await supabase
      .from('pending_registrations')
      .insert(testData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insert failed',
        details: error.message 
      })
    }

    // Clean up test data
    await supabase
      .from('pending_registrations')
      .delete()
      .eq('email', 'test@sanjivani.edu.in')

    return NextResponse.json({ 
      success: true, 
      message: 'Insert test successful',
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    })
  }
}
