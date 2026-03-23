// Faculty auth utilities using Supabase Auth only
import { supabase } from './supabase'

// Get current faculty from Supabase Auth and database
export async function getFacultySession(): Promise<any> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  const { data: faculty, error: facultyError } = await supabase
    .from('faculty')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()
  
  if (facultyError || !faculty) {
    return null
  }
  
  return faculty
}

// Get current student from Supabase Auth and department-year tables
export async function getStudentSessionFromAuth(): Promise<any> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  const departments = ['cse', 'cyber', 'aids', 'aiml']
  const years = ['1st', '2nd', '3rd', '4th']
  
  for (const dept of departments) {
    for (const year of years) {
      const tableName = `students_${dept}_${year}_year`
      const { data, error: studentError } = await supabase
        .from(tableName)
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
      
      if (data && !studentError) {
        return { ...data, department: dept, year }
      }
    }
  }
  
  return null
}

// Get current user type (student or faculty)
export async function getUserType(): Promise<'student' | 'faculty' | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // Check if faculty
  const { data: faculty } = await supabase
    .from('faculty')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()
  
  if (faculty) {
    return 'faculty'
  }
  
  // Check if student
  const departments = ['cse', 'cyber', 'aids', 'aiml']
  const years = ['1st', '2nd', '3rd', '4th']
  
  for (const dept of departments) {
    for (const year of years) {
      const { data: student } = await supabase
        .from(`students_${dept}_${year}_year`)
        .select('id')
        .eq('email', user.email)
        .maybeSingle()
      
      if (student) {
        return 'student'
      }
    }
  }
  
  return null
}
