import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-url.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-key"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Create server-side client for API routes
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey)
}

// Types
export interface StudentData {
  id?: string
  prn: string
  name: string
  email: string
  phone?: string
  address?: string
  department: string
  year: "first" | "second" | "third" | "fourth"
  date_of_birth?: string
  parent_name?: string
  parent_phone?: string
  password: string
  status?: "active" | "inactive"
  created_at?: string
}

export interface FacultyData {
  id?: string
  employee_id: string
  name: string
  email: string
  phone?: string
  address?: string
  department: string
  designation: string
  qualification?: string
  experience_years: number
  password: string
  status?: "active" | "inactive"
  created_at?: string
}

// University Admin Authentication
export async function authenticateUniversityAdmin(email: string, password: string) {
  try {
    const { data: admin, error } = await supabase
      .from("university_admins")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !admin) {
      // For demo purposes, allow hardcoded admin
      if (email === "sanketg367@gmail.com" && password === "sanku@99") {
        return {
          id: "admin-1",
          name: "University Administrator",
          email: email,
          role: "University Admin",
        }
      }
      throw new Error("Invalid admin credentials")
    }

    if (admin.password !== password) {
      throw new Error("Invalid admin credentials")
    }

    const { password: _, ...adminData } = admin
    return adminData
  } catch (error) {
    console.error("Error authenticating admin:", error)
    throw error
  }
}

// Faculty Authentication
export async function authenticateFaculty(email: string, password: string) {
  try {
    // Demo faculty credentials check first
    if (email === 'faculty@sanjivani.edu.in' && password === 'EduVision2024@Faculty!') {
      return {
        id: 'demo-faculty-1',
        employee_id: 'EMP001',
        name: 'Dr. Faculty Member',
        email: email,
        department: 'Computer Science Engineering',
        designation: 'Professor',
        qualification: 'Ph.D.',
        experience_years: 10,
        status: 'active' as const,
        created_at: new Date().toISOString()
      }
    }

    // Additional demo faculty accounts
    if (email === 'dr.smith@sanjivani.edu.in' && password === 'DrSmith2024!') {
      return {
        id: 'demo-faculty-2',
        employee_id: 'EMP002',
        name: 'Dr. John Smith',
        email: email,
        department: 'Computer Science Engineering',
        designation: 'Associate Professor',
        qualification: 'Ph.D.',
        experience_years: 8,
        status: 'active' as const,
        created_at: new Date().toISOString()
      }
    }

    if (email === 'prof.jones@sanjivani.edu.in' && password === 'ProfJones2024!') {
      return {
        id: 'demo-faculty-3',
        employee_id: 'EMP003',
        name: 'Prof. Sarah Jones',
        email: email,
        department: 'Information Technology',
        designation: 'Assistant Professor',
        qualification: 'M.Tech',
        experience_years: 5,
        status: 'active' as const,
        created_at: new Date().toISOString()
      }
    }

    // Try database connection only if not demo credentials
    const { data: faculty, error } = await supabase
      .from("faculty")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !faculty) {
      throw new Error("Invalid email or password")
    }

    if (faculty.password !== password) {
      throw new Error("Invalid email or password")
    }

    const { password: _, ...facultyData } = faculty
    return facultyData
  } catch (error) {
    console.error("Error authenticating faculty:", error)
    throw error
  }
}

// Student Authentication
export async function authenticateStudent(prn: string, password: string) {
  try {
    // Demo credentials check first
    if (prn === '2024CSE0001' && password === 'student123') {
      return {
        id: 'demo-student-1',
        prn: '2024CSE0001',
        name: 'Demo Student',
        email: '2024CSE0001@sanjivani.edu.in',
        department: 'Computer Science Engineering',
        year: 'first' as const,
        status: 'active' as const,
        created_at: new Date().toISOString()
      }
    }

    // Check for other demo PRN patterns (any year CSE students with student123 password)
    const prnPattern = /^(\d{4})(CSE)(\d{4})$/;
    const match = prn.match(prnPattern);
    if (match && password === 'student123') {
      const [, year, dept, number] = match;
      return {
        id: `demo-student-${number}`,
        prn: prn,
        name: `Demo Student ${number}`,
        email: `${prn}@sanjivani.edu.in`,
        department: 'Computer Science Engineering',
        year: 'first' as const,
        status: 'active' as const,
        created_at: new Date().toISOString()
      }
    }

    // Try database connection only if not demo credentials
    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("prn", prn)
      .eq("status", "active")
      .single()

    if (error || !student) {
      throw new Error("Invalid PRN or password")
    }

    if (student.password !== password) {
      throw new Error("Invalid PRN or password")
    }

    const { password: _, ...studentData } = student
    return studentData
  } catch (error) {
    console.error("Error authenticating student:", error)
    throw error
  }
}

// Student Management Functions
export async function getAllStudents() {
  try {
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}

export async function createStudent(studentData: StudentData) {
  try {
    // Check if email already exists
    const { data: existingStudent } = await supabase
      .from("students")
      .select("email")
      .eq("email", studentData.email)
      .single()

    if (existingStudent) {
      throw new Error("Student with this email already exists")
    }

    // Check if PRN already exists
    const { data: existingPRN } = await supabase.from("students").select("prn").eq("prn", studentData.prn).single()

    if (existingPRN) {
      throw new Error("Student with this PRN already exists")
    }

    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          ...studentData,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating student:", error)
    throw error
  }
}

export async function bulkCreateStudents(students: StudentData[]) {
  try {
    const studentsWithDefaults = students.map((student) => ({
      ...student,
      status: "active",
      created_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase.from("students").insert(studentsWithDefaults).select()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error bulk creating students:", error)
    throw error
  }
}

export async function deleteStudent(id: string) {
  try {
    const { error } = await supabase.from("students").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting student:", error)
    throw error
  }
}

// Faculty Management Functions
export async function getAllFaculty() {
  try {
    const { data, error } = await supabase.from("faculty").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return []
  }
}

export async function createFaculty(facultyData: FacultyData) {
  try {
    // Check if email already exists
    const { data: existingFaculty } = await supabase
      .from("faculty")
      .select("email")
      .eq("email", facultyData.email)
      .single()

    if (existingFaculty) {
      throw new Error("Faculty with this email already exists")
    }

    // Check if employee_id already exists
    const { data: existingEmpId } = await supabase
      .from("faculty")
      .select("employee_id")
      .eq("employee_id", facultyData.employee_id)
      .single()

    if (existingEmpId) {
      throw new Error("Faculty with this employee ID already exists")
    }

    const { data, error } = await supabase
      .from("faculty")
      .insert([
        {
          ...facultyData,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating faculty:", error)
    throw error
  }
}

export async function bulkCreateFaculty(faculty: FacultyData[]) {
  try {
    const facultyWithDefaults = faculty.map((f) => ({
      ...f,
      status: "active",
      created_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase.from("faculty").insert(facultyWithDefaults).select()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error bulk creating faculty:", error)
    throw error
  }
}

export async function deleteFaculty(id: string) {
  try {
    const { error } = await supabase.from("faculty").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting faculty:", error)
    throw error
  }
}

// Utility Functions for ID Generation
export const generatePRN = (department: string, year: string): string => {
  const currentYear = new Date().getFullYear()
  const deptCode = department.substring(0, 3).toUpperCase()
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `${currentYear}${deptCode}${randomNum}`
}

export const generateEmployeeId = (department: string): string => {
  const currentYear = new Date().getFullYear()
  const deptCode = department.substring(0, 3).toUpperCase()
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `EMP${deptCode}${currentYear}${randomNum}`
}

export const generateSecurePassword = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
