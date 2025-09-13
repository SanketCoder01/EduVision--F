import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch Today's Hub data for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userType = searchParams.get('user_type')
    const department = searchParams.get('department')
    const year = searchParams.get('year')

    if (!userId || !userType) {
      return NextResponse.json({ error: 'User ID and user type are required' }, { status: 400 })
    }

    let hubData: any = {}

    if (userType === 'student') {
      if (!department || !year) {
        return NextResponse.json({ error: 'Department and year are required for students' }, { status: 400 })
      }

      // Get student's today's hub data
      const [assignments, announcements, studyGroups, events, notifications] = await Promise.all([
        getStudentAssignments(department, year),
        getStudentAnnouncements(department, year),
        getStudentStudyGroups(department, year),
        getStudentEvents(department, year),
        getRecentNotifications(userId)
      ])

      hubData = {
        assignments: assignments.slice(0, 5), // Latest 5
        announcements: announcements.slice(0, 3), // Latest 3
        studyGroups: studyGroups.slice(0, 3), // Latest 3
        events: events.slice(0, 3), // Latest 3
        notifications: notifications.slice(0, 5), // Latest 5
        summary: {
          total_assignments: assignments.length,
          pending_assignments: assignments.filter(a => !a.submission).length,
          unread_announcements: announcements.filter(a => !a.read).length,
          active_study_groups: studyGroups.filter(sg => sg.status === 'active').length,
          upcoming_events: events.filter(e => new Date(e.event_date) > new Date()).length
        }
      }
    } else {
      // Get faculty's today's hub data
      const [assignments, announcements, submissions, studyGroups, notifications] = await Promise.all([
        getFacultyAssignments(userId),
        getFacultyAnnouncements(userId),
        getRecentSubmissions(userId),
        getFacultyStudyGroups(userId),
        getRecentNotifications(userId)
      ])

      hubData = {
        assignments: assignments.slice(0, 5), // Latest 5
        announcements: announcements.slice(0, 3), // Latest 3
        submissions: submissions.slice(0, 5), // Latest 5
        studyGroups: studyGroups.slice(0, 3), // Latest 3
        notifications: notifications.slice(0, 5), // Latest 5
        summary: {
          total_assignments: assignments.length,
          pending_grading: submissions.filter(s => !s.grade).length,
          total_announcements: announcements.length,
          active_study_groups: studyGroups.filter(sg => sg.status === 'active').length,
          recent_submissions: submissions.filter(s => 
            new Date(s.submitted_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length
        }
      }
    }

    return NextResponse.json({ success: true, data: hubData })
  } catch (error: any) {
    console.error('Error fetching today\'s hub data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
async function getStudentAssignments(department: string, year: string) {
  const { data, error } = await supabaseAdmin
    .from('assignments')
    .select(`
      *,
      faculty:faculty_id (name, email, department),
      assignment_submissions!left (id, status, grade, submitted_at, student_id)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching student assignments:', error)
    return []
  }

  // Create year mapping for flexible matching
  const yearMapping = {
    '1': ['1', 'first', 'First', '1st'],
    '2': ['2', 'second', 'Second', '2nd'], 
    '3': ['3', 'third', 'Third', '3rd'],
    '4': ['4', 'fourth', 'Fourth', '4th']
  }
  
  const possibleYearValues = yearMapping[year as keyof typeof yearMapping] || [year]
  
  // Filter assignments that are either:
  // 1. For all departments (no department specified)
  // 2. For student's department
  // 3. For all years (no target_years specified)
  // 4. For student's year (flexible matching)
  const filteredData = (data || []).filter(assignment => {
    const isDeptMatch = !assignment.department || assignment.department === department || assignment.department === 'all'
    const isYearMatch = !assignment.target_years || assignment.target_years.length === 0 || 
                       assignment.target_years.some((targetYear: string) => 
                         possibleYearValues.includes(targetYear) || targetYear === 'all'
                       )
    return isDeptMatch && isYearMatch
  })

  return filteredData
}

async function getStudentAnnouncements(department: string, year: string) {
  // Create year mapping for flexible matching
  const yearMapping = {
    '1': ['1', 'first', 'First', '1st'],
    '2': ['2', 'second', 'Second', '2nd'], 
    '3': ['3', 'third', 'Third', '3rd'],
    '4': ['4', 'fourth', 'Fourth', '4th']
  }
  
  const possibleYearValues = yearMapping[year as keyof typeof yearMapping] || [year]
  const yearQuery = possibleYearValues.map(y => `target_years.cs.{${y}}`).join(',')
  
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select(`
      *,
      faculty:faculty_id (name, email)
    `)
    .or(`department.is.null,department.eq.${department}`)
    .or(`target_years.is.null,${yearQuery}`)
    .in('target_audience', ['all', 'students'])
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching student announcements:', error)
    return []
  }

  return data || []
}

async function getStudentStudyGroups(department: string, year: string) {
  // Create year mapping for flexible matching
  const yearMapping = {
    '1': ['1', 'first', 'First', '1st'],
    '2': ['2', 'second', 'Second', '2nd'], 
    '3': ['3', 'third', 'Third', '3rd'],
    '4': ['4', 'fourth', 'Fourth', '4th']
  }
  
  const possibleYearValues = yearMapping[year as keyof typeof yearMapping] || [year]
  
  const { data, error } = await supabaseAdmin
    .from('study_groups')
    .select(`
      *,
      faculty:faculty_id (name, email),
      study_group_members (id)
    `)
    .eq('department', department)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching student study groups:', error)
    return []
  }

  // Filter study groups by year after fetching
  const filteredData = (data || []).filter(group => {
    if (!group.target_years || group.target_years.length === 0) return true
    return group.target_years.some((targetYear: string) => 
      possibleYearValues.includes(targetYear) || targetYear === 'all'
    )
  })

  return filteredData
}

async function getStudentEvents(department: string, year: string) {
  // Create year mapping for flexible matching
  const yearMapping = {
    '1': ['1', 'first', 'First', '1st'],
    '2': ['2', 'second', 'Second', '2nd'], 
    '3': ['3', 'third', 'Third', '3rd'],
    '4': ['4', 'fourth', 'Fourth', '4th']
  }
  
  const possibleYearValues = yearMapping[year as keyof typeof yearMapping] || [year]
  const yearQuery = possibleYearValues.map(y => `target_years.cs.{${y}}`).join(',')

  const { data, error } = await supabaseAdmin
    .from('events')
    .select(`
      *,
      faculty:faculty_id (name, email)
    `)
    .or(`department.is.null,department.eq.${department}`)
    .or(`target_years.is.null,${yearQuery}`)
    .in('status', ['upcoming', 'ongoing'])
    .order('event_date', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error fetching student events:', error)
    return []
  }

  return data || []
}

async function getFacultyAssignments(facultyId: string) {
  const { data, error } = await supabaseAdmin
    .from('assignments')
    .select(`
      *,
      assignment_submissions (id, status, submitted_at)
    `)
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching faculty assignments:', error)
    return []
  }

  return data || []
}

async function getFacultyAnnouncements(facultyId: string) {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching faculty announcements:', error)
    return []
  }

  return data || []
}

async function getRecentSubmissions(facultyId: string) {
  const { data, error } = await supabaseAdmin
    .from('assignment_submissions')
    .select(`
      *,
      assignment:assignment_id (title, faculty_id),
      student:student_id (name, email, prn)
    `)
    .eq('assignment.faculty_id', facultyId)
    .order('submitted_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching recent submissions:', error)
    return []
  }

  return data || []
}

async function getFacultyStudyGroups(facultyId: string) {
  const { data, error } = await supabaseAdmin
    .from('study_groups')
    .select(`
      *,
      study_group_members (id, student:student_id (name))
    `)
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching faculty study groups:', error)
    return []
  }

  return data || []
}

async function getRecentNotifications(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching recent notifications:', error)
    return []
  }

  return data || []
}
