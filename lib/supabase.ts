import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtguryzyprgqraimyimt.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE"

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Create server-side client for API routes
export function createServerSupabaseClient(): SupabaseClient {
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Backwards-compatible helper used by some server components/pages
export function createClient(): SupabaseClient {
  return createServerSupabaseClient()
}

// Simple realtime helper used by some UI pages
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
) {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => callback(payload),
    )
    .subscribe()

  return channel
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

// Generic authentication used by legacy API routes
export async function authenticateUser(email: string, password: string, userType: "faculty" | "student") {
  if (userType === "faculty") return authenticateFaculty(email, password)
  return authenticateStudent(email, password)
}

// Faculty Authentication using Supabase Auth
export async function authenticateFaculty(email: string, password: string) {
  try {
    console.log("Authenticating faculty with email:", email)
    
    // Validate email domain
    if (!email.endsWith('@sanjivani.edu.in')) {
      throw new Error('Please use your Sanjivani University email address (@sanjivani.edu.in)')
    }

    // Use Supabase Auth for authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Supabase Auth error:", authError)
      throw new Error("Invalid email or password")
    }

    if (!authData.user) {
      throw new Error("Authentication failed")
    }

    console.log("Authentication successful:", authData.user)
    
    // Return user data with additional info
    return {
      id: authData.user.id,
      email: authData.user.email,
      user_type: 'faculty',
      auth_user: authData.user,
      session: authData.session
    }
  } catch (error) {
    console.error("Error authenticating faculty:", error)
    throw error
  }
}

// Student Authentication using Supabase Auth
export async function authenticateStudent(email: string, password: string) {
  try {
    console.log("Authenticating student with email:", email)
    
    // Validate email domain
    if (!email.endsWith('@sanjivani.edu.in')) {
      throw new Error('Please use your Sanjivani University email address (@sanjivani.edu.in)')
    }

    // Use Supabase Auth for authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Supabase Auth error:", authError)
      throw new Error("Invalid email or password")
    }

    if (!authData.user) {
      throw new Error("Authentication failed")
    }

    console.log("Authentication successful:", authData.user)
    
    // Return user data with additional info
    return {
      id: authData.user.id,
      email: authData.user.email,
      user_type: 'student',
      auth_user: authData.user,
      session: authData.session
    }
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
