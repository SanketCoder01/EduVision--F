import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

// Generate unique PRN for students
function generatePRN(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PRN${year}${random}`
}

// Generate unique Employee ID for faculty
function generateEmployeeId(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `EMP${year}${random}`
}

// Generate random password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Hash password with bcrypt to match login verification
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Approval request body:', body)
    
    const { id, action, rejectionReason } = body
    const registrationId = id

    if (!registrationId || !action) {
      console.log('Missing fields - id:', registrationId, 'action:', action)
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create Supabase client with service role for administrative operations
    const supabase = createServiceRoleClient()

    // For demo purposes, we'll skip admin authentication check
    // In production, you should implement proper admin authentication
    const adminEmail = 'admin@sanjivani.edu.in' // Demo admin email

    // Get the pending registration
    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ 
        success: false, 
        message: 'Registration not found' 
      }, { status: 404 })
    }

    if (registration.status !== 'pending_approval') {
      console.log('Registration status check failed. Current status:', registration.status)
      return NextResponse.json({ 
        success: false, 
        message: `Registration is not pending approval. Current status: ${registration.status}` 
      }, { status: 400 })
    }

    if (action === 'reject') {
      // Update status to rejected
      const { error: updateError } = await supabase
        .from('pending_registrations')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminEmail
        })
        .eq('id', registrationId)

      if (updateError) {
        console.error('Error rejecting registration:', updateError)
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to reject registration' 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Registration rejected successfully' 
      })
    }

    if (action === 'approve') {
      // Generate credentials
      const password = generatePassword()
      const hashedPassword = await hashPassword(password)

      if (registration.user_type === 'student') {
        const prn = generatePRN()
        console.log('Processing student approval for:', registration.email)

        // Update pending registration status
        const { error: updateError } = await supabase
          .from('pending_registrations')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminEmail
          })
          .eq('id', registrationId)

        if (updateError) {
          console.error('Error updating registration status:', updateError)
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to update registration status' 
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Student registration approved successfully',
          credentials: {
            email: registration.email,
            password: password,
            prn: prn
          }
        })

      } else if (registration.user_type === 'faculty') {
        const employeeId = generateEmployeeId()
        console.log('Processing faculty approval for:', registration.email)

        // Update pending registration status
        const { error: updateError } = await supabase
          .from('pending_registrations')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminEmail
          })
          .eq('id', registrationId)

        if (updateError) {
          console.error('Error updating registration status:', updateError)
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to update registration status' 
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Faculty registration approved successfully',
          credentials: {
            email: registration.email,
            password: password,
            employee_id: employeeId
          }
        })
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error in approve registration:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}