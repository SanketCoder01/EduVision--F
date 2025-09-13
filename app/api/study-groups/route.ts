import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch study groups for student or faculty
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const facultyId = searchParams.get('faculty_id')
    const department = searchParams.get('department')
    const year = searchParams.get('year')

    if (studentId) {
      // Get study groups for student based on department and year
      const { data: studyGroups, error } = await supabaseAdmin
        .from('study_groups')
        .select(`
          *,
          faculty:faculty_id (
            id,
            name,
            email,
            department
          ),
          study_group_members!left (
            id,
            student_id,
            joined_at
          )
        `)
        .eq('department', department)
        .contains('target_years', [year])
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Add membership status for the student
      const groupsWithMembership = studyGroups.map(group => {
        const isMember = group.study_group_members?.some(
          (member: any) => member.student_id === studentId
        )
        return {
          ...group,
          is_member: isMember,
          member_count: group.study_group_members?.length || 0,
          study_group_members: undefined // Remove for privacy
        }
      })

      return NextResponse.json({ success: true, data: groupsWithMembership })
    }

    if (facultyId) {
      // Get study groups created by faculty
      const { data: studyGroups, error } = await supabaseAdmin
        .from('study_groups')
        .select(`
          *,
          study_group_members (
            id,
            student_id,
            joined_at,
            student:student_id (
              name,
              email,
              prn
            )
          )
        `)
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: studyGroups })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching study groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new study group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      subject,
      faculty_id,
      department,
      target_years,
      max_members = 20,
      objectives,
      meeting_schedule
    } = body

    // Validate required fields
    if (!name || !subject || !faculty_id || !department || !target_years) {
      return NextResponse.json({ 
        error: 'Name, subject, faculty ID, department, and target years are required' 
      }, { status: 400 })
    }

    // Create study group
    const { data: studyGroup, error } = await supabaseAdmin
      .from('study_groups')
      .insert({
        name,
        description,
        subject,
        faculty_id,
        department,
        target_years,
        max_members,
        objectives,
        meeting_schedule,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to create study group: ${error.message}` 
      }, { status: 500 })
    }

    // Create notifications for students
    await createStudyGroupNotifications(
      studyGroup.id,
      name,
      subject,
      department,
      target_years
    )

    return NextResponse.json({ 
      success: true, 
      data: studyGroup,
      message: 'Study group created successfully' 
    })
  } catch (error: any) {
    console.error('Error creating study group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update study group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Study group ID is required' }, { status: 400 })
    }

    // Update study group
    const { data: studyGroup, error } = await supabaseAdmin
      .from('study_groups')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to update study group: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: studyGroup,
      message: 'Study group updated successfully' 
    })
  } catch (error: any) {
    console.error('Error updating study group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete study group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Study group ID is required' }, { status: 400 })
    }

    // Delete study group (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from('study_groups')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ 
        error: `Failed to delete study group: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Study group deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting study group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to create notifications for study group
async function createStudyGroupNotifications(
  studyGroupId: string,
  groupName: string,
  subject: string,
  department: string,
  targetYears: string[]
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
      console.error('Error fetching students for study group notifications:', error)
      return
    }

    // Create notifications for each student
    const notifications = students.map(student => ({
      user_id: student.user_id,
      type: 'study_group_created',
      title: 'New Study Group Available',
      message: `A new study group "${groupName}" for ${subject} has been created. Join now!`,
      data: {
        study_group_id: studyGroupId,
        group_name: groupName,
        subject,
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
      console.error('Error creating study group notifications:', notificationError)
    }

    // Update today's hub feed
    const hubFeedEntry = {
      type: 'study_group',
      title: groupName,
      content: `New study group created for ${subject}`,
      department,
      target_years: targetYears,
      data: {
        study_group_id: studyGroupId,
        subject
      },
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('todays_hub_feed')
      .insert(hubFeedEntry)

  } catch (error) {
    console.error('Error creating study group notifications:', error)
  }
}
