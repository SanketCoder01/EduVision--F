import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, email, password, userType, role } = body

    const theRole = (role || userType) as string
    const theIdentifier = (identifier || email) as string

    if (!theIdentifier || !password || !theRole) {
      return NextResponse.json(
        { success: false, message: "Identifier/email, password, and role are required" },
        { status: 400 },
      )
    }

    if (theRole !== "faculty" && theRole !== "student") {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 })
    }

    const supabase = createClient()
    
    // For students, we need to check department-specific tables
    // For faculty, we check department-specific faculty tables
    let userData = null
    let userFound = false

    if (theRole === 'student') {
      // Check all student department-year tables
      const departments = ['cse', 'aids', 'aiml', 'cyber']
      const years = ['1st_year', '2nd_year', '3rd_year', '4th_year']
      
      const isLikelyPrn = /^PRN\d+/.test(theIdentifier)
      
      for (const dept of departments) {
        for (const year of years) {
          const tableName = `students_${dept}_${year}`
          let query = supabase.from(tableName).select('*')
          
          if (isLikelyPrn) {
            query = query.eq('prn', theIdentifier)
          } else {
            query = query.eq('email', theIdentifier.toLowerCase())
          }
          
          const { data: users, error } = await query
          
          if (!error && users && users.length > 0) {
            userData = users[0]
            userFound = true
            break
          }
        }
        if (userFound) break
      }
    } else {
      // Check faculty department tables
      const departments = ['cse', 'aids', 'aiml', 'cyber']
      
      const isLikelyEmpId = /^EMP\d+/.test(theIdentifier)
      
      for (const dept of departments) {
        const tableName = `faculty_${dept}`
        let query = supabase.from(tableName).select('*')
        
        if (isLikelyEmpId) {
          query = query.eq('employee_id', theIdentifier)
        } else {
          query = query.eq('email', theIdentifier.toLowerCase())
        }
        
        const { data: users, error } = await query
        
        if (!error && users && users.length > 0) {
          userData = users[0]
          userFound = true
          break
        }
      }
    }

    if (!userFound || !userData) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const ok = await bcrypt.compare(password, userData.password_hash || userData.password)
    if (!ok) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Return successful login with user data
    const faceRegistered = Boolean(userData.face_registered)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: theRole,
        department: userData.department,
        year: userData.year || null,
        prn: userData.prn || null,
        employee_id: userData.employee_id || null,
        face_registered: faceRegistered,
        face_url: userData.face_url || userData.photo,
        mobile: userData.mobile
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
