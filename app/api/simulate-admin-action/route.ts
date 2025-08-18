import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, action, rejection_reason } = await request.json()

    if (!email || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and action are required' 
      }, { status: 400 })
    }

    // Create Supabase client inside the request handler
    const supabase = createClient()

    // Find the pending registration
    const { data: pendingReg, error: findError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .single()

    if (findError || !pendingReg) {
      return NextResponse.json({ 
        success: false, 
        message: 'Pending registration not found' 
      }, { status: 404 })
    }

    // Update the status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'test-admin@example.com'
    }

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update(updateData)
      .eq('email', email)

    if (updateError) {
      console.error('Error updating registration:', updateError)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update registration status' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Registration ${action}d successfully`,
      data: {
        email,
        action,
        status: updateData.status
      }
    })

  } catch (error) {
    console.error('Error in simulate-admin-action:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
