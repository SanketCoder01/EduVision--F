import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Department-year table mapping
const getStudentTableName = (department: string, year: string): string => {
  const deptMap: { [key: string]: string } = {
    'CSE': 'cse',
    'CYBER': 'cyber', 
    'AIDS': 'aids',
    'AIML': 'aiml'
  }
  
  const yearMap: { [key: string]: string } = {
    '1': '1st',
    '2': '2nd',
    '3': '3rd', 
    '4': '4th',
    'first': '1st',
    'second': '2nd',
    'third': '3rd',
    'fourth': '4th'
  }
  
  const deptCode = deptMap[department.toUpperCase()] || department.toLowerCase()
  const yearCode = yearMap[year] || year
  
  return `students_${deptCode}_${yearCode}_year`
}

// Extract department and year from email
const extractDeptYearFromEmail = (email: string): { department: string, year: string } | null => {
  // Pattern: firstname.lastname_YYdept@sanjivani.edu.in
  // Example: sanket.gaikwad_24uce@sanjivani.edu.in (24 = 2024, uce = CSE)
  const match = email.match(/([^@]+)_(\d{2})([a-z]+)@sanjivani\.edu\.in/)
  
  if (!match) return null
  
  const [, , yearCode, deptCode] = match
  
  // Map department codes
  const deptMapping: { [key: string]: string } = {
    'uce': 'CSE',
    'cyber': 'CYBER',
    'aids': 'AIDS', 
    'aiml': 'AIML'
  }
  
  // Calculate year based on current year and admission year
  const currentYear = new Date().getFullYear()
  const admissionYear = 2000 + parseInt(yearCode)
  const academicYear = currentYear - admissionYear + 1
  
  const department = deptMapping[deptCode.toLowerCase()]
  
  if (!department || academicYear < 1 || academicYear > 4) {
    return null
  }
  
  return {
    department,
    year: academicYear.toString()
  }
}

// Find student across all department-year tables
export const findStudentByEmail = async (email: string): Promise<any> => {
  console.log('DEBUG: Finding student for email:', email)
  
  // First try to extract department and year from email
  const extracted = extractDeptYearFromEmail(email)
  
  if (extracted) {
    console.log('DEBUG: Extracted from email:', extracted)
    const tableName = getStudentTableName(extracted.department, extracted.year)
    console.log('DEBUG: Querying table:', tableName)
    
    try {
      const { data: student, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('email', email)
        .single()
      
      if (student && !error) {
        console.log('DEBUG: Student found in', tableName, ':', student)
        // Return with normalized department (lowercase) and year
        return {
          ...student,
          department: extracted.department.toLowerCase(),
          year: extracted.year
        }
      }
    } catch (error) {
      console.log('DEBUG: Error querying', tableName, ':', error)
    }
  }
  
  // Fallback: search all possible tables
  const departments = ['CSE', 'CYBER', 'AIDS', 'AIML']
  const years = ['1', '2', '3', '4']
  
  console.log('DEBUG: Fallback search across all tables...')
  
  for (const dept of departments) {
    for (const year of years) {
      const tableName = getStudentTableName(dept, year)
      
      try {
        const { data: student, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('email', email)
          .single()
        
        if (student && !error) {
          console.log('DEBUG: Student found in fallback search:', tableName, student)
          // Return with normalized department (lowercase) and year
          return {
            ...student,
            department: dept.toLowerCase(),
            year: year
          }
        }
      } catch (error) {
        // Continue searching other tables
        continue
      }
    }
  }
  
  console.log('DEBUG: Student not found in any table for email:', email)
  return null
}

// Get student session with proper table lookup
export const getStudentSession = async (): Promise<any> => {
  console.log('DEBUG: Getting student session...')
  
  // Get user from Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.log('DEBUG: No authenticated user found')
    return null
  }
  
  console.log('DEBUG: Found Supabase auth user:', user.email)
  const student = await findStudentByEmail(user.email!)
  
  if (student) {
    console.log('DEBUG: Student found:', student)
    return student
  }
  
  console.log('DEBUG: Student not found in any table')
  return null
}
