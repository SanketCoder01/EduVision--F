import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the request handler
    const supabase = createClient()

    // Get only essential fields to improve performance
    const { data: registrations, error } = await supabase
      .from('pending_registrations')
      .select('id, email, user_type, department, year, status, submitted_at, name, rejection_reason, reviewed_at, reviewed_by')
      .order('submitted_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching pending registrations:', error)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch pending registrations' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registrations: registrations || []
    })

  } catch (error) {
    console.error('Error in pending-registrations:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
