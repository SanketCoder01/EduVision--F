import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email parameter is required' 
      }, { status: 400 })
    }

    // Create Supabase client inside the request handler
    const supabase = createClient()

    // Check pending registration
    const { data: pendingReg, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Error checking pending registration:', error)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to check pending registration' 
      }, { status: 500 })
    }

    if (pendingReg) {
      return NextResponse.json({
        success: true,
        data: pendingReg
      })
    } else {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No pending registration found'
      })
    }

  } catch (error) {
    console.error('Error in check-pending-registration:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
