import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch assignments for a student or faculty
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const facultyId = searchParams.get('faculty_id')
    const department = searchParams.get('department')
    const year = searchParams.get('year')

    if (studentId) {
      // Get assignments for student based on department and year
      const { data: assignments, error } = await supabaseAdmin
        .from('assignments')
        .select(`
          *,
          faculty:faculty_id (
            id,
            name,
            email,
            department
          ),
          assignment_submissions!left (
            id,
            status,
            grade,
            submitted_at,
            graded_at
          )
        `)
        .eq('department', department)
        .contains('target_years', [year])
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Filter submissions for this specific student
      const assignmentsWithSubmissions = assignments.map(assignment => {
        const studentSubmission = assignment.assignment_submissions?.find(
          (sub: any) => sub.student_id === studentId
        )
        return {
          ...assignment,
          submission: studentSubmission || null,
          assignment_submissions: undefined // Remove all submissions for privacy
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: assignmentsWithSubmissions 
      })
    }

    if (facultyId) {
      // Get assignments created by faculty
      const { data: assignments, error } = await supabaseAdmin
        .from('assignments')
        .select(`
          *,
          assignment_submissions (
            id,
            student_id,
            status,
            submitted_at,
            graded_at
          )
        `)
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: assignments 
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      faculty_id,
      department,
      target_years,
      assignment_type,
      max_marks,
      due_date,
      status = 'draft',
      instructions,
      allowed_file_types,
      word_limit,
      allow_late_submission = false,
      allow_resubmission = false,
      enable_plagiarism_check = false
    } = body

    // Validate required fields
    if (!title || !description || !faculty_id || !department || !target_years || !due_date) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create assignment
    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        title,
        description,
        faculty_id,
        department,
        target_years,
        assignment_type: assignment_type || 'file_upload',
        max_marks: max_marks || 100,
        due_date,
        status,
        instructions,
        allowed_file_types,
        word_limit,
        allow_late_submission,
        allow_resubmission,
        enable_plagiarism_check,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to create assignment: ${error.message}` 
      }, { status: 500 })
    }

    // If published, create notifications for students
    if (status === 'published') {
      await createAssignmentNotifications(assignment.id, department, target_years, title)
    }

    return NextResponse.json({ 
      success: true, 
      data: assignment,
      message: 'Assignment created successfully' 
    })
  } catch (error: any) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update assignment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Update assignment
    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to update assignment: ${error.message}` 
      }, { status: 500 })
    }

    // If status changed to published, create notifications
    if (updateData.status === 'published') {
      await createAssignmentNotifications(
        assignment.id, 
        assignment.department, 
        assignment.target_years, 
        assignment.title
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: assignment,
      message: 'Assignment updated successfully' 
    })
  } catch (error: any) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete assignment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Delete assignment (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ 
        error: `Failed to delete assignment: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Assignment deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to create notifications for assignment
async function createAssignmentNotifications(
  assignmentId: string, 
  department: string, 
  targetYears: string[], 
  assignmentTitle: string
) {
  try {
    // Get all students in the target department and years
    const { data: students, error } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, name, email')
      .eq('user_type', 'student')
      .eq('department', department)
      .in('year', targetYears)

    if (error || !students?.length) {
      console.error('Error fetching students for notifications:', error)
      return
    }

    // Create notifications for each student
    const notifications = students.map(student => ({
      user_id: student.user_id,
      type: 'assignment_published',
      title: 'New Assignment Published',
      message: `A new assignment "${assignmentTitle}" has been published for your class.`,
      data: {
        assignment_id: assignmentId,
        assignment_title: assignmentTitle,
        department,
        target_years: targetYears
      },
      read: false,
      created_at: new Date().toISOString()
    }))

    // Insert notifications
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating notifications:', notificationError)
    }

    // Update today's hub feed
    const hubFeedEntry = {
      type: 'assignment',
      title: assignmentTitle,
      content: `New assignment published for ${department} students`,
      department,
      target_years: targetYears,
      data: {
        assignment_id: assignmentId,
        assignment_title: assignmentTitle
      },
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('todays_hub_feed')
      .insert(hubFeedEntry)

  } catch (error) {
    console.error('Error creating assignment notifications:', error)
  }
}
