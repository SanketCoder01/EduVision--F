import { supabase } from '@/lib/supabase'

export type UserRole = 'faculty' | 'student' | 'unknown'

export interface UserInfo {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  year?: string
  profileData?: any
}

/**
 * Identifies if a user is faculty or student based on their email
 * Faculty emails are stored in the 'faculty' table
 * Student emails are stored in the 'students' table (or department-specific tables)
 */
export async function identifyUser(email: string): Promise<UserInfo> {
  try {
    // First check faculty table
    const { data: facultyData, error: facultyError } = await supabase
      .from('faculty')
      .select('*')
      .eq('email', email)
      .single()

    if (facultyData && !facultyError) {
      return {
        id: facultyData.id,
        email: facultyData.email,
        name: facultyData.name,
        role: 'faculty',
        department: facultyData.department,
        profileData: facultyData
      }
    }

    // Check main students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single()

    if (studentData && !studentError) {
      return {
        id: studentData.id,
        email: studentData.email,
        name: studentData.name,
        role: 'student',
        department: studentData.department,
        year: studentData.year,
        profileData: studentData
      }
    }

    // Check department-specific student tables
    const departments = ['cse', 'cyber', 'aids', 'aiml']
    const years = ['1st_year', '2nd_year', '3rd_year', '4th_year']

    for (const dept of departments) {
      for (const year of years) {
        const tableName = `students_${dept}_${year}`
        const { data: deptStudent, error: deptError } = await supabase
          .from(tableName)
          .select('*')
          .eq('email', email)
          .single()

        if (deptStudent && !deptError) {
          return {
            id: deptStudent.id,
            email: deptStudent.email,
            name: deptStudent.name,
            role: 'student',
            department: dept.toUpperCase(),
            year: year.replace('_year', ''),
            profileData: deptStudent
          }
        }
      }
    }

    // If not found in any table
    return {
      id: '',
      email: email,
      name: 'Unknown User',
      role: 'unknown'
    }
  } catch (error) {
    console.error('Error identifying user:', error)
    return {
      id: '',
      email: email,
      name: 'Unknown User',
      role: 'unknown'
    }
  }
}

/**
 * Get current user info from session
 */
export async function getCurrentUserInfo(): Promise<UserInfo | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !user.email) {
      return null
    }

    return await identifyUser(user.email)
  } catch (error) {
    console.error('Error getting current user info:', error)
    return null
  }
}

/**
 * Check if the current session is from student portal
 * Student portal typically has a different URL pattern
 */
export function isStudentPortal(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.includes('/student-dashboard')
}

/**
 * Check if the current session is from faculty dashboard
 */
export function isFacultyDashboard(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.includes('/dashboard') && !window.location.pathname.includes('/student-dashboard')
}

/**
 * Get display name with role badge
 */
export function getDisplayName(userInfo: UserInfo): string {
  if (userInfo.role === 'faculty') {
    return `${userInfo.name} (Faculty)`
  } else if (userInfo.role === 'student') {
    return `${userInfo.name} (Student)`
  }
  return userInfo.name
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'faculty':
      return 'bg-purple-100 text-purple-800'
    case 'student':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
