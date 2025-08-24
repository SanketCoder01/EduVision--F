import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, rejectionReason } = body

    if (!id || !action) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const adminEmail = 'admin@sanjivani.edu.in' // Demo admin email

    if (action === 'reject') {
      const { error } = await supabase
        .from('pending_registrations')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminEmail
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ success: false, message: 'Failed to reject registration' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Registration rejected successfully' })
    }

    if (action === 'approve') {
      const { data, error } = await supabase.rpc('approve_registration', {
        registration_id: id,
        admin_email: adminEmail
      })

      if (error || !data.success) {
        return NextResponse.json({ success: false, message: data.message || 'Failed to approve registration' }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}