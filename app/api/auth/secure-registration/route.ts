import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { email, department, year, user_type, mobile, name, photo, updateOnly } = await request.json()

    console.log('Registration request:', { email, department, year, user_type, mobile: mobile ? 'provided' : 'missing', name, photo: photo ? 'provided' : 'missing' })

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

    // Handle face image update only
    if (updateOnly && photo) {
      let face_image_url = null
      try {
        const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `face_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('faces')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          })

        if (uploadError) {
          console.error('Face image upload error:', uploadError)
        } else {
          const { data: urlData } = supabase.storage
            .from('faces')
            .getPublicUrl(fileName)
          face_image_url = urlData.publicUrl
        }
      } catch (error) {
        console.error('Face image processing error:', error)
      }

      // Update existing pending registration with face image
      const { error: updateError } = await supabase
        .from('pending_registrations')
        .update({ face_url: face_image_url })
        .eq('email', email)

      if (updateError) {
        return NextResponse.json({ 
          success: false, 
          error: updateError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Face image updated successfully' 
      })
    }

    // 1. Basic field validation with detailed logging
    console.log('Validating fields:', { email: !!email, name: !!name, department: !!department, user_type: !!user_type, year: !!year })

    if (!email || !email.includes('@')) {
      console.log('Email validation failed:', email)
      return NextResponse.json({ 
        success: false, 
        error: 'Valid email is required' 
      }, { status: 400 })
    }

    if (!name || !department || !user_type) {
      console.log('Required fields missing:', { name: !!name, department: !!department, user_type: !!user_type })
      return NextResponse.json({ 
        success: false, 
        error: 'Name, department, and user type are required' 
      }, { status: 400 })
    }

    if (user_type === 'student' && !year) {
      console.log('Year required for student but missing:', year)
      return NextResponse.json({ 
        success: false, 
        error: 'Year is required for students' 
      }, { status: 400 })
    }

    // Store face image in Supabase Storage if provided
    let face_image_url = null
    if (photo) {
      try {
        // Convert base64 to blob
        const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `face_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('faces')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          })

        if (uploadError) {
          console.error('Face image upload error:', uploadError)
        } else {
          const { data: urlData } = supabase.storage
            .from('faces')
            .getPublicUrl(fileName)
          face_image_url = urlData.publicUrl
        }
      } catch (error) {
        console.error('Face image processing error:', error)
      }
    }

    // 5. Try to insert into pending_registrations table
    try {
      // First, let's check if the table exists and what columns it has
      const { data: tableInfo, error: tableError } = await supabase
        .from('pending_registrations')
        .select('*')
        .limit(0)

      console.log('Table check result:', { tableError: tableError?.message })

      // Prepare basic insert data
      const insertData: any = {
        email,
        name: name || '',
        user_type: user_type,
        status: 'pending_approval'
      }

      // Add department (try different formats)
      const deptMap: { [key: string]: string } = {
        'cse': 'CSE',
        'cyber': 'CYBER', 
        'aids': 'AIDS',
        'aiml': 'AIML'
      }
      insertData.department = deptMap[department.toLowerCase()] || department.toUpperCase()

      // Add year for students
      if (user_type === 'student' && year) {
        const yearMap: { [key: string]: string } = {
          '1st_year': '1st',
          '2nd_year': '2nd', 
          '3rd_year': '3rd',
          '4th_year': '4th'
        }
        insertData.year = yearMap[year] || year.replace('_year', '').replace('st', '').replace('nd', '').replace('rd', '').replace('th', '') + (year.includes('1st') ? 'st' : year.includes('2nd') ? 'nd' : year.includes('3rd') ? 'rd' : 'th')
      }

      // Add optional fields
      if (mobile) insertData.phone = mobile
      if (face_image_url) insertData.face_url = face_image_url

      console.log('Attempting to insert:', insertData)

      // Check if user already exists
      const { data: existingReg } = await supabase
        .from('pending_registrations')
        .select('id, status')
        .eq('email', email)
        .single()

      if (existingReg) {
        if (existingReg.status === 'pending_approval') {
          return NextResponse.json({ 
            success: true, 
            message: 'Registration already submitted and pending approval.',
            requiresApproval: true,
            pending_registration_id: existingReg.id
          })
        } else if (existingReg.status === 'approved') {
          return NextResponse.json({ 
            success: true, 
            message: 'Registration already approved. Please proceed to login.',
            requiresApproval: false
          })
        } else {
          // Update existing rejected registration
          const { data: updatedData, error: updateError } = await supabase
            .from('pending_registrations')
            .update({...insertData, status: 'pending_approval'})
            .eq('email', email)
            .select('id')
            .single()

          if (updateError) {
            console.error('Update registration error:', updateError)
            return NextResponse.json({ 
              success: false, 
              error: `Database error: ${updateError.message}`
            }, { status: 500 })
          }

          return NextResponse.json({ 
            success: true, 
            message: 'Registration resubmitted for admin approval.',
            requiresApproval: true,
            pending_registration_id: updatedData.id
          })
        }
      }

      // Insert new registration
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_registrations')
        .insert(insertData)
        .select('id')
        .single()

      if (pendingError) {
        console.error('Pending registration error:', pendingError)
        return NextResponse.json({ 
          success: false, 
          error: `Database error: ${pendingError.message}`,
          details: pendingError
        }, { status: 500 })
      }

      console.log('Registration successful:', pendingData)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Registration submitted for admin approval. You will receive an email once approved.',
        requiresApproval: true,
        pending_registration_id: pendingData?.id
      })
    } catch (dbError: any) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to submit registration: ${dbError.message}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Secure registration error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
