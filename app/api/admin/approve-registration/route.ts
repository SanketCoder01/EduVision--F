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
    const { registrationId, action, rejectionReason } = await request.json()

    if (!registrationId || !action) {
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
      return NextResponse.json({ 
        success: false, 
        message: 'Registration is not pending approval' 
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
        
        // Construct table names for dual insertion
        const department = registration.department.toLowerCase();
        const year = registration.year.toLowerCase().replace(' year', 'th_year').replace('st_year', '1st_year').replace('nd_year', '2nd_year').replace('rd_year', '3rd_year');
        const specificTableName = `students_${department}_${year}`;
        const generalTableName = `students_${department}`;

        // Check if student already exists in specific table
        const { data: existingStudent } = await supabase
          .from(specificTableName)
          .select('id')
          .eq('email', registration.email)
          .single()

        if (existingStudent) {
          // Student already exists, update the status in pending_registrations only
          console.log('Student already exists, updating pending registration status only')
        } else {
          const studentData = {
            user_id: registration.user_id,
            prn: prn,
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
            department: registration.department,
            year: registration.year,
            password_hash: hashedPassword,
            face_registered: true,
            face_registered_at: new Date().toISOString(),
            face_url: registration.face_url,
            face_data: registration.face_data
          };

          // Insert into specific department-year table
          const { data: student, error: studentError } = await supabase
            .from(specificTableName)
            .insert(studentData)
            .select()
            .single()

          if (studentError) {
            console.error('Error creating student in specific table:', studentError)
            return NextResponse.json({ 
              success: false, 
              message: 'Failed to create student account in specific table' 
            }, { status: 500 })
          }

          // Also insert into general department table for faculty access
          const { error: generalStudentError } = await supabase
            .from(generalTableName)
            .insert(studentData)

          if (generalStudentError) {
            console.error('Error creating student in general table:', generalStudentError)
            // Don't return error here as the main insertion succeeded
            // This is for faculty convenience only
          }

          // Insert face encoding if available
          if (registration.face_data?.face_encoding) {
            const { error: faceError } = await supabase
              .from('student_faces')
              .insert({
                student_id: student.id,
                face_encoding: registration.face_data.face_encoding,
                face_url: registration.face_url
              })

            if (faceError) {
              console.error('Error inserting face encoding:', faceError)
            }
          }
        }

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
        
        // Construct table names for faculty (department-specific, no year)
        const department = registration.department.toLowerCase();
        const facultyTableName = `faculty_${department}`;

        // Check if faculty already exists in department table
        const { data: existingFaculty } = await supabase
          .from(facultyTableName)
          .select('id')
          .eq('email', registration.email)
          .single()

        if (existingFaculty) {
          // Faculty already exists, update the status in pending_registrations only
          console.log('Faculty already exists, updating pending registration status only')
        } else {
          const facultyData = {
            user_id: registration.user_id,
            employee_id: employeeId,
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
            department: registration.department,
            password_hash: hashedPassword,
            face_registered: true,
            face_registered_at: new Date().toISOString(),
            face_url: registration.face_url,
            face_data: registration.face_data
          };

          // Insert into department-specific faculty table
          const { data: faculty, error: facultyError } = await supabase
            .from(facultyTableName)
            .insert(facultyData)
            .select()
            .single()

          if (facultyError) {
            console.error('Error creating faculty in department table:', facultyError)
            return NextResponse.json({ 
              success: false, 
              message: 'Failed to create faculty account in department table' 
            }, { status: 500 })
          }

          // Also insert into general faculty table for system-wide access
          const { error: generalFacultyError } = await supabase
            .from('faculty')
            .insert(facultyData)

          if (generalFacultyError) {
            console.error('Error creating faculty in general table:', generalFacultyError)
            // Don't return error here as the main insertion succeeded
          }

          // Insert face encoding if available
          if (registration.face_data?.face_encoding) {
            const { error: faceError } = await supabase
              .from('faculty_faces')
              .insert({
                faculty_id: faculty.id,
                face_encoding: registration.face_data.face_encoding,
                face_url: registration.face_url
              })

            if (faceError) {
              console.error('Error inserting face encoding:', faceError)
            }
          }
        }

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