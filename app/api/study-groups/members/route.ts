import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch study group members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studyGroupId = searchParams.get('study_group_id')

    if (!studyGroupId) {
      return NextResponse.json({ error: 'Study group ID is required' }, { status: 400 })
    }

    // Get study group members
    const { data: members, error } = await supabaseAdmin
      .from('study_group_members')
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
      .eq('study_group_id', studyGroupId)
      .order('joined_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    console.error('Error fetching study group members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Join study group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { study_group_id, student_id } = body

    // Validate required fields
    if (!study_group_id || !student_id) {
      return NextResponse.json({ 
        error: 'Study group ID and student ID are required' 
      }, { status: 400 })
    }

    // Check if study group exists and is active
    const { data: studyGroup, error: groupError } = await supabaseAdmin
      .from('study_groups')
      .select('id, name, max_members, status')
      .eq('id', study_group_id)
      .single()

    if (groupError || !studyGroup) {
      return NextResponse.json({ 
        error: 'Study group not found' 
      }, { status: 404 })
    }

    if (studyGroup.status !== 'active') {
      return NextResponse.json({ 
        error: 'Study group is not active' 
      }, { status: 400 })
    }

    // Check if student is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('study_group_members')
      .select('id')
      .eq('study_group_id', study_group_id)
      .eq('student_id', student_id)
      .single()

    if (existingMember) {
      return NextResponse.json({ 
        error: 'Student is already a member of this study group' 
      }, { status: 400 })
    }

    // Check if group is full
    const { count: memberCount } = await supabaseAdmin
      .from('study_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('study_group_id', study_group_id)

    if (memberCount && memberCount >= studyGroup.max_members) {
      return NextResponse.json({ 
        error: 'Study group is full' 
      }, { status: 400 })
    }

    // Add student to study group
    const { data: membership, error } = await supabaseAdmin
      .from('study_group_members')
      .insert({
        study_group_id,
        student_id,
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: `Failed to join study group: ${error.message}` 
      }, { status: 500 })
    }

    // Create notification for faculty
    await createMemberJoinNotification(study_group_id, student_id, studyGroup.name)

    return NextResponse.json({ 
      success: true, 
      data: membership,
      message: 'Successfully joined study group' 
    })
  } catch (error: any) {
    console.error('Error joining study group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Leave study group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studyGroupId = searchParams.get('study_group_id')
    const studentId = searchParams.get('student_id')

    if (!studyGroupId || !studentId) {
      return NextResponse.json({ 
        error: 'Study group ID and student ID are required' 
      }, { status: 400 })
    }

    // Remove student from study group
    const { error } = await supabaseAdmin
      .from('study_group_members')
      .delete()
      .eq('study_group_id', studyGroupId)
      .eq('student_id', studentId)

    if (error) {
      return NextResponse.json({ 
        error: `Failed to leave study group: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully left study group' 
    })
  } catch (error: any) {
    console.error('Error leaving study group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to create member join notification
async function createMemberJoinNotification(
  studyGroupId: string,
  studentId: string,
  groupName: string
) {
  try {
    // Get study group faculty
    const { data: studyGroup } = await supabaseAdmin
      .from('study_groups')
      .select('faculty_id')
      .eq('id', studyGroupId)
      .single()

    if (!studyGroup?.faculty_id) return

    // Get student info
    const { data: student } = await supabaseAdmin
      .from('user_profiles')
      .select('name, email')
      .eq('user_id', studentId)
      .single()

    if (!student) return

    // Create notification for faculty
    const notification = {
      user_id: studyGroup.faculty_id,
      type: 'study_group_member_joined',
      title: 'New Study Group Member',
      message: `${student.name} has joined the study group "${groupName}".`,
      data: {
        study_group_id: studyGroupId,
        student_id: studentId,
        student_name: student.name,
        group_name: groupName
      },
      read: false,
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('notifications')
      .insert(notification)

  } catch (error) {
    console.error('Error creating member join notification:', error)
  }
}
