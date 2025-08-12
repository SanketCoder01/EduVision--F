import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
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

    // Use Supabase instead of Appwrite
    const tableName = theRole === 'student' ? 'students' : 'faculty'

    // Query Supabase for user
    const isLikelyPrn = /^\d{10}$/.test(theIdentifier)
    let query = supabase.from(tableName).select('*')
    
    if (isLikelyPrn) {
      query = query.eq('prn', theIdentifier)
    } else {
      query = query.eq('email', theIdentifier.toLowerCase())
    }
    
    const { data: users, error } = await query
    
    if (error || !users || users.length === 0) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // If face not registered flag exists and is false/null, let client show setup
    const faceRegistered = Boolean(user.face_registered)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        prn: user.prn,
        email: user.email,
        name: user.name,
        userType: theRole,
        department: user.department ?? null,
        year: user.year ?? null,
        faceRegistered,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
