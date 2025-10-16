import { supabase } from './supabase'

export interface StudentData {
  id: string
  name: string
  full_name: string
  email: string
  prn: string
  department: string
  year: string
  phone?: string
  address?: string
  face_url?: string
  photo?: string
  avatar?: string
  registration_completed?: boolean
  created_at?: string
}

export interface FacultyData {
  id: string
  name: string
  full_name: string
  email: string
  department: string
  designation?: string
  phone?: string
  address?: string
  employee_id?: string
  face_url?: string
  photo?: string
  avatar?: string
  registration_completed?: boolean
  created_at?: string
}

/**
 * Fetch students by department
 * @param department - Department code (cse, cyber, aids, aiml)
 * @returns Array of students in that department
 */
export async function getStudentsByDepartment(department: string): Promise<StudentData[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('department', department)
    .eq('registration_completed', true)
    .order('name')

  if (error) {
    console.error('Error fetching students by department:', error)
    return []
  }

  return data || []
}

/**
 * Fetch students by department and year
 * @param department - Department code (cse, cyber, aids, aiml)
 * @param year - Year (first, second, third, fourth)
 * @returns Array of students in that department and year
 */
export async function getStudentsByDepartmentAndYear(
  department: string,
  year: string
): Promise<StudentData[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('department', department)
    .eq('year', year)
    .eq('registration_completed', true)
    .order('name')

  if (error) {
    console.error('Error fetching students by department and year:', error)
    return []
  }

  return data || []
}

/**
 * Fetch students by multiple years in a department
 * @param department - Department code
 * @param years - Array of years (e.g., ['first', 'second'])
 * @returns Array of students matching the criteria
 */
export async function getStudentsByDepartmentAndYears(
  department: string,
  years: string[]
): Promise<StudentData[]> {
  if (years.length === 0) {
    return getStudentsByDepartment(department)
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('department', department)
    .in('year', years)
    .eq('registration_completed', true)
    .order('year')
    .order('name')

  if (error) {
    console.error('Error fetching students by department and years:', error)
    return []
  }

  return data || []
}

/**
 * Get total student count by department
 */
export async function getStudentCountByDepartment(department: string): Promise<number> {
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('department', department)
    .eq('registration_completed', true)

  if (error) {
    console.error('Error counting students:', error)
    return 0
  }

  return count || 0
}

/**
 * Get student count by department and year
 */
export async function getStudentCountByDepartmentAndYear(
  department: string,
  year: string
): Promise<number> {
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('department', department)
    .eq('year', year)
    .eq('registration_completed', true)

  if (error) {
    console.error('Error counting students:', error)
    return 0
  }

  return count || 0
}

/**
 * Get all students for a faculty member's department
 */
export async function getStudentsForFaculty(facultyDepartment: string): Promise<StudentData[]> {
  // Cyber Security faculty can access CSE, AIDS, AIML students too
  if (facultyDepartment === 'cyber' || facultyDepartment === 'Cyber Security') {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .in('department', ['cse', 'cyber', 'aids', 'aiml'])
      .eq('registration_completed', true)
      .order('department')
      .order('year')
      .order('name')

    if (error) {
      console.error('Error fetching students for faculty:', error)
      return []
    }

    return data || []
  }

  // Other departments can only access their own students
  return getStudentsByDepartment(facultyDepartment)
}

/**
 * Search students by name, email, or PRN
 */
export async function searchStudents(
  query: string,
  department?: string,
  year?: string
): Promise<StudentData[]> {
  let queryBuilder = supabase
    .from('students')
    .select('*')
    .eq('registration_completed', true)

  if (department) {
    queryBuilder = queryBuilder.eq('department', department)
  }

  if (year) {
    queryBuilder = queryBuilder.eq('year', year)
  }

  // Search in name, email, or PRN
  queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%,prn.ilike.%${query}%`)

  const { data, error } = await queryBuilder.order('name')

  if (error) {
    console.error('Error searching students:', error)
    return []
  }

  return data || []
}

/**
 * Get faculty by department
 */
export async function getFacultyByDepartment(department: string): Promise<FacultyData[]> {
  const { data, error } = await supabase
    .from('faculty')
    .select('*')
    .eq('department', department)
    .eq('registration_completed', true)
    .order('name')

  if (error) {
    console.error('Error fetching faculty:', error)
    return []
  }

  return data || []
}

/**
 * Get department statistics
 */
export async function getDepartmentStats(department: string) {
  const firstYearCount = await getStudentCountByDepartmentAndYear(department, 'first')
  const secondYearCount = await getStudentCountByDepartmentAndYear(department, 'second')
  const thirdYearCount = await getStudentCountByDepartmentAndYear(department, 'third')
  const fourthYearCount = await getStudentCountByDepartmentAndYear(department, 'fourth')
  const totalCount = await getStudentCountByDepartment(department)

  return {
    department,
    total: totalCount,
    byYear: {
      first: firstYearCount,
      second: secondYearCount,
      third: thirdYearCount,
      fourth: fourthYearCount
    }
  }
}

/**
 * Get all department statistics
 */
export async function getAllDepartmentStats() {
  const departments = ['cse', 'cyber', 'aids', 'aiml']
  const stats = await Promise.all(
    departments.map(dept => getDepartmentStats(dept))
  )

  return stats
}

// Helper function to format department names
export function formatDepartmentName(dept: string): string {
  const names: Record<string, string> = {
    cse: 'Computer Science & Engineering',
    cyber: 'Cyber Security',
    aids: 'Artificial Intelligence & Data Science',
    aiml: 'Artificial Intelligence & Machine Learning'
  }
  return names[dept] || dept.toUpperCase()
}

// Helper function to format year names
export function formatYearName(year: string): string {
  const names: Record<string, string> = {
    first: 'First Year',
    second: 'Second Year',
    third: 'Third Year',
    fourth: 'Fourth Year'
  }
  return names[year] || year
}
