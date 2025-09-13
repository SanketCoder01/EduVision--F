import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch submissions for an assignment or student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignment_id')
    const studentId = searchParams.get('student_id')

    if (assignmentId) {
      // Get all submissions for an assignment (faculty view)
      const { data: submissions, error } = await supabaseAdmin
        .from('assignment_submissions')
        .select(`
          *,
          student:student_id (
            id,
            name,
            email,
            department,
            year,
            prn
          )
        `)
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: submissions })
    }

    if (studentId) {
      // Get all submissions by a student
      const { data: submissions, error } = await supabaseAdmin
        .from('assignment_submissions')
        .select(`
          *,
          assignment:assignment_id (
            id,
            title,
            description,
            max_marks,
            due_date,
            department,
            target_years
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: submissions })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Submit assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      assignment_id,
      student_id,
      content,
      file_urls = [],
      submission_type = 'text'
    } = body

    // Validate required fields
    if (!assignment_id || !student_id) {
      return NextResponse.json({ 
        error: 'Assignment ID and Student ID are required' 
      }, { status: 400 })
    }

    // Check if assignment exists and is published
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('id, title, due_date, status, allow_resubmission')
      .eq('id', assignment_id)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found' 
      }, { status: 404 })
    }

    if (assignment.status !== 'published') {
      return NextResponse.json({ 
        error: 'Assignment is not published' 
      }, { status: 400 })
    }

    // Check if student already submitted (if resubmission not allowed)
    const { data: existingSubmission } = await supabaseAdmin
      .from('assignment_submissions')
      .select('id, status')
      .eq('assignment_id', assignment_id)
      .eq('student_id', student_id)
      .single()

    if (existingSubmission && !assignment.allow_resubmission) {
      return NextResponse.json({ 
        error: 'Resubmission not allowed for this assignment' 
      }, { status: 400 })
    }

    // Check if past due date
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    const isLate = now > dueDate

    // Create or update submission
    const submissionData = {
      assignment_id,
      student_id,
      content,
      file_urls,
      submission_type,
      status: 'submitted',
      is_late: isLate,
      submitted_at: new Date().toISOString()
    }

    let submission
    if (existingSubmission && assignment.allow_resubmission) {
      // Update existing submission
      const { data, error } = await supabaseAdmin
        .from('assignment_submissions')
        .update(submissionData)
        .eq('id', existingSubmission.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ 
          error: `Failed to update submission: ${error.message}` 
        }, { status: 500 })
      }
      submission = data
    } else {
      // Create new submission
      const { data, error } = await supabaseAdmin
        .from('assignment_submissions')
        .insert(submissionData)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ 
          error: `Failed to create submission: ${error.message}` 
        }, { status: 500 })
      }
      submission = data
    }

    // Create notification for faculty
    await createSubmissionNotification(assignment_id, student_id, assignment.title, isLate)

    return NextResponse.json({ 
      success: true, 
      data: submission,
      message: isLate ? 'Assignment submitted late' : 'Assignment submitted successfully'
    })
  } catch (error: any) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Grade submission
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      submission_id,
      grade,
      feedback,
      graded_by
    } = body

    // Validate required fields
    if (!submission_id || grade === undefined) {
      return NextResponse.json({ 
        error: 'Submission ID and grade are required' 
      }, { status: 400 })
    }

    // Update submission with grade
    const { data: submission, error } = await supabaseAdmin
      .from('assignment_submissions')
      .update({
        grade,
        feedback,
        graded_by,
        graded_at: new Date().toISOString()
      })
      .eq('id', submission_id)
      .select(`
        *,
        assignment:assignment_id (
          title,
          faculty_id
        ),
        student:student_id (
          name,
          email
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to grade submission: ${error.message}` 
      }, { status: 500 })
    }

    // Create notification for student
    await createGradingNotification(
      submission.student_id, 
      submission.assignment.title, 
      grade,
      feedback
    )

    return NextResponse.json({ 
      success: true, 
      data: submission,
      message: 'Submission graded successfully' 
    })
  } catch (error: any) {
    console.error('Error grading submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to create submission notification
async function createSubmissionNotification(
  assignmentId: string,
  studentId: string,
  assignmentTitle: string,
  isLate: boolean
) {
  try {
    // Get assignment faculty
    const { data: assignment } = await supabaseAdmin
      .from('assignments')
      .select('faculty_id')
      .eq('id', assignmentId)
      .single()

    if (!assignment?.faculty_id) return

    // Get student info
    const { data: student } = await supabaseAdmin
      .from('user_profiles')
      .select('name, email')
      .eq('user_id', studentId)
      .single()

    if (!student) return

    // Create notification for faculty
    const notification = {
      user_id: assignment.faculty_id,
      type: 'assignment_submitted',
      title: isLate ? 'Late Assignment Submission' : 'New Assignment Submission',
      message: `${student.name} has submitted the assignment "${assignmentTitle}"${isLate ? ' (Late)' : ''}.`,
      data: {
        assignment_id: assignmentId,
        student_id: studentId,
        student_name: student.name,
        assignment_title: assignmentTitle,
        is_late: isLate
      },
      read: false,
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('notifications')
      .insert(notification)

  } catch (error) {
    console.error('Error creating submission notification:', error)
  }
}

// Helper function to create grading notification
async function createGradingNotification(
  studentId: string,
  assignmentTitle: string,
  grade: number,
  feedback?: string
) {
  try {
    const notification = {
      user_id: studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your assignment "${assignmentTitle}" has been graded. Score: ${grade}`,
      data: {
        assignment_title: assignmentTitle,
        grade,
        feedback
      },
      read: false,
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('notifications')
      .insert(notification)

  } catch (error) {
    console.error('Error creating grading notification:', error)
  }
}
