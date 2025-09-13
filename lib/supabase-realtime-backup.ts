import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our data structures
export interface Student {
  id: string
  name: string
  full_name?: string
  email: string
  prn: string
  department: 'CSE' | 'CY' | 'AIDS' | 'AIML'
  year: 'first' | 'second' | 'third' | 'fourth'
  phone?: string
  face_url?: string
  photo?: string
  avatar?: string
  created_at: string
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: 'CSE' | 'CY' | 'AIDS' | 'AIML'
  designation: string
  phone?: string
  face_url?: string
  photo?: string
  avatar?: string
  created_at: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  faculty_id: string
  department: string
  target_years: string[]
  assignment_type: 'file_upload' | 'text_based' | 'quiz' | 'coding' | 'normal' | 'ai'
  max_marks: number
  due_date: string
  status: 'draft' | 'published' | 'closed'
  created_at: string
  faculty?: Faculty
}

export interface Announcement {
  id: string
  title: string
  content: string
  department?: string
  target_years: string[]
  faculty_id: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  target_audience: 'all' | 'students' | 'faculty'
  created_at: string
  faculty?: Faculty
}

export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  location?: string
  department?: string
  target_years: string[]
  faculty_id: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  faculty?: Faculty
}

export interface StudyGroup {
  id: string
  name: string
  description?: string
  subject: string
  department: string
  target_years: string[]
  faculty_id: string
  max_members: number
  status: 'active' | 'inactive' | 'completed'
  created_at: string
  faculty?: Faculty
}

export interface AttendanceSession {
  id: string
  faculty_id: string
  subject: string
  department: string
  target_years: string[]
  session_date: string
  session_time: string
  location?: string
  total_students: number
  present_students: number
  status: 'scheduled' | 'ongoing' | 'completed'
  created_at: string
  faculty?: Faculty
}

export interface Grievance {
  id: string
  student_id: string
  title: string
  description: string
  category: 'academic' | 'administrative' | 'infrastructure' | 'harassment' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'resolved' | 'closed'
  department?: string
  assigned_to?: string
  created_at: string
  updated_at: string
  student?: Student
}

export interface LostFound {
  id: string
  student_id: string
  type: 'lost' | 'found'
  item_name: string
  description: string
  location?: string
  contact_info: string
  status: 'active' | 'resolved' | 'expired'
  image_url?: string
  created_at: string
  student?: Student
}

export interface Hackathon {
  id: string
  title: string
  description: string
  organizer_id: string
  start_date: string
  end_date: string
  registration_deadline: string
  max_participants?: number
  prize_pool?: string
  requirements?: string
  status: 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled'
  department?: string
  target_years: string[]
  created_at: string
  organizer?: Faculty
}

export interface CafeteriaMenu {
  id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  items: string[]
  prices: number[]
  special_offers?: string
  availability: boolean
  created_at: string
  updated_at: string
}

export interface StudentQuery {
  id: string
  student_id: string
  faculty_id?: string
  subject: string
  question: string
  category: 'academic' | 'assignment' | 'exam' | 'general'
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'answered' | 'closed'
  answer?: string
  answered_at?: string
  created_at: string
  student?: Student
  faculty?: Faculty
}

export interface Timetable {
  id: string
  department: string
  year: string
  day_of_week: number
  start_time: string
  end_time: string
  subject: string
  faculty_id: string
  room_number?: string
  type: 'lecture' | 'practical' | 'tutorial'
  created_at: string
  faculty?: Faculty
}

export interface StudyMaterial {
  id: string
  title: string
  description?: string
  subject: string
  department: string
  target_years: string[]
  faculty_id: string
  file_url: string
  file_type: 'pdf' | 'doc' | 'ppt' | 'video' | 'other'
  file_size: number
  download_count: number
  status: 'active' | 'archived'
  created_at: string
  faculty?: Faculty
}

// Service functions for real-time data operations
export class SupabaseRealtimeService {
  
  // Get student data by ID
  static async getStudent(studentId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()
    
    if (error) {
      console.error('Error fetching student:', error)
      return null
    }
    
    return data
  }

  // Get faculty data by ID
  static async getFaculty(facultyId: string): Promise<Faculty | null> {
    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', facultyId)
      .single()
    
    if (error) {
      console.error('Error fetching faculty:', error)
      return null
    }
    
    return data
  }

  // Get assignments for a student based on department and year - USE SUPABASE NOT LOCALSTORAGE
  static async getStudentAssignments(student: Student): Promise<Assignment[]> {
    try {
      // Import the proper service
      const { SupabaseAssignmentService } = await import('./supabase-assignments')
      
      // Use real Supabase data instead of localStorage
      const assignments = await SupabaseAssignmentService.getStudentAssignments(student.department, student.year)
      
      // Transform to match our interface
      return assignments.map((assignment: any) => ({
        ...assignment,
        faculty: assignment.faculty ? {
          id: assignment.faculty.id || assignment.faculty_id,
          name: assignment.faculty.name,
          email: assignment.faculty.email,
          department: assignment.department as 'CSE' | 'CY' | 'AIDS' | 'AIML',
          designation: assignment.faculty.designation || 'Faculty',
          created_at: assignment.faculty.created_at || assignment.created_at
        } : undefined
      }))
    } catch (error) {
      console.error('Error fetching student assignments:', error)
      return []
    }
  }

  // Get announcements for a specific student
  static async getStudentAnnouncements(student: Student): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .or(`department.eq.${student.department},department.eq.All`)
        .contains('target_years', [student.year])
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching announcements:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student announcements:', error)
      return []
    }
  }

  // Get events for a specific student
  static async getStudentEvents(student: Student): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .or(`department.eq.${student.department},department.eq.All`)
        .contains('target_years', [student.year])
        .order('event_date', { ascending: true })
      
      if (error) {
        console.error('Error fetching events:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student events:', error)
      return []
    }
  }

  // Get study groups for a specific student
  static async getStudentStudyGroups(student: Student): Promise<StudyGroup[]> {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('status', 'active')
        .eq('department', student.department)
        .contains('target_years', [student.year])
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching study groups:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student study groups:', error)
      return []
    }
  }

  // Get attendance sessions for a specific student
  static async getStudentAttendance(student: Student): Promise<AttendanceSession[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('status', 'active')
        .eq('department', student.department)
        .contains('target_years', student.year)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching attendance sessions:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      return []
    }
  }
      const attendanceSessions = JSON.parse(localStorage.getItem('attendance_sessions') || '[]')
      
      // Normalize department names for matching
      const normalizeDepName = (dept: string) => {
        if (!dept) return ''
        const normalized = dept.toLowerCase().replace(/[^a-z]/g, '')
        if (normalized.includes('computer') || normalized.includes('cse')) return 'cse'
        if (normalized.includes('cyber') || normalized.includes('cy')) return 'cy'
        if (normalized.includes('artificialintelligencedatascience') || normalized.includes('aids')) return 'aids'
        if (normalized.includes('artificialintelligencemachinelearning') || normalized.includes('aiml')) return 'aiml'
        return normalized
      }
      
      const studentDept = normalizeDepName(student.department)
      
      // Filter attendance sessions for the student's department and year
      const filteredSessions = attendanceSessions.filter((session: any) => {
        const sessionDept = normalizeDepName(session.department)
        const matchesDepartment = sessionDept === studentDept || session.department === 'All'
        const matchesYear = session.target_years?.includes(student.year) ||
                           session.target_years?.includes(student.year.toString()) ||
                           session.year === student.year ||
                           session.year === student.year.toString()
        
        return matchesDepartment && matchesYear
      })
      
      // Sort by session_date descending
      filteredSessions.sort((a: any, b: any) => 
        new Date(b.session_date || b.created_at).getTime() - new Date(a.session_date || a.created_at).getTime()
      )
      
      return filteredSessions
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      return []
    }
  }

  // Get all faculty assignments
  static async getFacultyAssignments(facultyId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching faculty assignments:', error)
      return []
    }
    
    return data || []
  }

  // Get all faculty announcements
  static async getFacultyAnnouncements(facultyId: string): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching faculty announcements:', error)
      return []
    }
    
    return data || []
  }

  // Subscribe to real-time changes for a specific table
  static subscribeToTable(
    tableName: string, 
    callback: (payload: any) => void,
    filter?: { column: string; value: any }
  ) {
    let subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
        },
        callback
      )
      .subscribe()

    return subscription
  }

  // Get Today's Hub data for a student
  static async getTodaysHubData(student: Student) {
    const [assignments, announcements, events, studyGroups, attendance] = await Promise.all([
      this.getStudentAssignments(student),
      this.getStudentAnnouncements(student),
      this.getStudentEvents(student),
      this.getStudentStudyGroups(student),
      this.getStudentAttendance(student)
    ])

    return {
      assignments,
      announcements,
      events,
      studyGroups,
      attendance
    }
  }

  // Get grievances for department
  static async getGrievances(department?: string): Promise<Grievance[]> {
    let query = supabase
      .from('grievances')
      .select(`
        *,
        student:student_id (
          id,
          name,
          full_name,
          email,
          department,
          year
        )
      `)
      .order('created_at', { ascending: false })

    if (department) {
      query = query.eq('department', department)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching grievances:', error)
      return []
    }

    return data || []
  }

  // Get lost and found items
  static async getLostFoundItems(department?: string): Promise<LostFound[]> {
    let query = supabase
      .from('lost_found')
      .select(`
        *,
        student:student_id (
          id,
          name,
          full_name,
          email,
          department,
          year
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching lost and found items:', error)
      return []
    }

    return data || []
  }

  // Get hackathons
  static async getHackathons(student?: Student): Promise<Hackathon[]> {
    let query = supabase
      .from('hackathons')
      .select(`
        *,
        organizer:organizer_id (
          id,
          name,
          email,
          department
        )
      `)
      .in('status', ['upcoming', 'registration_open', 'ongoing'])
      .order('start_date', { ascending: true })

    if (student) {
      query = query.or(`department.is.null,department.eq.${student.department}`)
        .or(`target_years.is.null,target_years.cs.{${student.year}}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching hackathons:', error)
      return []
    }

    return data || []
  }

  // Get cafeteria menu
  static async getCafeteriaMenu(date?: string): Promise<CafeteriaMenu[]> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('cafeteria_menu')
      .select('*')
      .eq('date', targetDate)
      .eq('availability', true)
      .order('meal_type')

    if (error) {
      console.error('Error fetching cafeteria menu:', error)
      return []
    }

    return data || []
  }

  // Get student queries for faculty
  static async getStudentQueries(facultyId?: string, department?: string): Promise<StudentQuery[]> {
    let query = supabase
      .from('student_queries')
      .select(`
        *,
        student:student_id (
          id,
          name,
          full_name,
          email,
          department,
          year
        ),
        faculty:faculty_id (
          id,
          name,
          email,
          department
        )
      `)
      .order('created_at', { ascending: false })

    if (facultyId) {
      query = query.or(`faculty_id.is.null,faculty_id.eq.${facultyId}`)
    }

    if (department) {
      query = query.eq('student.department', department)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching student queries:', error)
      return []
    }

    return data || []
  }

  // Get timetable for student/faculty
  static async getTimetable(department: string, year?: string, facultyId?: string): Promise<Timetable[]> {
    let query = supabase
      .from('timetable')
      .select(`
        *,
        faculty:faculty_id (
          id,
          name,
          email,
          department
        )
      `)
      .eq('department', department)
      .order(['day_of_week', 'start_time'])

    if (year) {
      query = query.eq('year', year)
    }

    if (facultyId) {
      query = query.eq('faculty_id', facultyId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching timetable:', error)
      return []
    }

    return data || []
  }

  // Get study materials for students
  static async getStudyMaterials(student: Student): Promise<StudyMaterial[]> {
    const { data, error } = await supabase
      .from('study_materials')
      .select(`
        *,
        faculty:faculty_id (
          id,
          name,
          email,
          department
        )
      `)
      .eq('department', student.department)
      .contains('target_years', student.year)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching study materials:', error)
      return []
    }

    return data || []
  }

  // Get faculty study materials
  static async getFacultyStudyMaterials(facultyId: string): Promise<StudyMaterial[]> {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching faculty study materials:', error)
      return []
    }

    return data || []
  }

  // Get Today's Hub data for faculty
  static async getFacultyTodaysHubData(facultyId: string) {
    const [assignments, announcements, queries, grievances] = await Promise.all([
      this.getFacultyAssignments(facultyId),
      this.getFacultyAnnouncements(facultyId),
      this.getStudentQueries(facultyId),
      this.getGrievances()
    ])

    return {
      assignments,
      announcements,
      queries,
      grievances
    }
  }

  // Get comprehensive Today's Hub data for students
  static async getStudentTodaysHubData(student: Student) {
    const [assignments, announcements, events, studyGroups, attendance, hackathons, lostFound, cafeteriaMenu, studyMaterials] = await Promise.all([
      this.getStudentAssignments(student),
      this.getStudentAnnouncements(student),
      this.getStudentEvents(student),
      this.getStudentStudyGroups(student),
      this.getStudentAttendance(student),
      this.getHackathons(student),
      this.getLostFoundItems(student.department),
      this.getCafeteriaMenu(),
      this.getStudyMaterials(student)
    ])

    return {
      assignments,
      announcements,
      events,
      studyGroups,
      attendance,
      hackathons,
      lostFound,
      cafeteriaMenu,
      studyMaterials
    }
  }
}
