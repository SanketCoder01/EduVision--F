import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUniversityEmail, getEmailType, extractStudentInfo } from '@/lib/security/email-validation'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { email, department, year, userType, phone, name } = await request.json()

    // Helpers to normalize inputs
    const toYearLabel = (val: string | null | undefined): string | null => {
      if (!val) return null
      const v = String(val).trim().toLowerCase()
      if (['1', '1st', 'first', 'first year', '1st year'].includes(v)) return '1st Year'
      if (['2', '2nd', 'second', 'second year', '2nd year'].includes(v)) return '2nd Year'
      if (['3', '3rd', 'third', 'third year', '3rd year'].includes(v)) return '3rd Year'
      if (['4', '4th', 'fourth', 'fourth year', '4th year'].includes(v)) return '4th Year'
      return val // fallback to original
    }
    const normDeptCode = (dept: string | null | undefined): string | null => {
      if (!dept) return null
      const d = dept.toLowerCase()
      if (d.includes('cse') || d.includes('computer') ) return 'cse'
      if (d.includes('cyber')) return 'cyber'
      if (d.includes('aids') || d.includes('data science')) return 'aids'
      if (d.includes('aiml') || d.includes('machine learning')) return 'aiml'
      return d
    }

    // Current authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Validate university email domain (single domain only)
    if (!validateUniversityEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Only emails ending with @sanjivani.edu.in are allowed' 
      }, { status: 403 })
    }

    // 2. Relaxed: allow both students and faculty as long as domain is valid

    // 3. No email-based dept/year enforcement — admins will approve appropriately

    // Do not block on existing auth user; approval flow manages uniqueness

    // 5. Create pending registration record for admin approval (store normalized year)
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_registrations')
      .insert({
        user_id: user?.id || null,
        email,
        user_type: userType,
        department,
        year: userType === 'student' ? toYearLabel(year) : null,
        name: name || null,
        mobile_number: phone || null,
        status: 'pending_approval',
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (pendingError) {
      console.error('Pending registration error:', pendingError?.message || pendingError)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to submit registration for approval' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration submitted for admin approval. You will receive an email once approved.',
      requiresApproval: true,
      pending_registration_id: pendingData?.id
    })

  } catch (error) {
    console.error('Secure registration error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
