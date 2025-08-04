import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, verificationCode } = body

    console.log("Verification request:", { email, verificationCode })

    if (!email || !verificationCode) {
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    if (verificationCode.length !== 6) {
      return NextResponse.json({ success: false, message: "Verification code must be 6 digits" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Find registration record
    const { data: registration, error: fetchError } = await supabase
      .from("faculty_registrations")
      .select("*")
      .eq("email", email)
      .eq("verification_code", verificationCode)
      .eq("verified", false)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ success: false, message: "Invalid verification code or email" }, { status: 400 })
    }

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(registration.expires_at)
    if (now > expiresAt) {
      await supabase.from("faculty_registrations").delete().eq("email", email)
      return NextResponse.json({ success: false, message: "Verification code has expired" }, { status: 400 })
    }

    // Create faculty account
    const defaultPassword = "password123"
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const { data: facultyData, error: facultyError } = await supabase
      .from("faculty")
      .insert({
        first_name: registration.first_name,
        last_name: registration.last_name,
        middle_name: registration.middle_name,
        email: registration.email,
        phone: registration.phone,
        department: registration.department,
        password: hashedPassword,
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (facultyError) {
      console.error("Faculty creation error:", facultyError)
      return NextResponse.json({ success: false, message: "Failed to create faculty account" }, { status: 500 })
    }

    // Delete registration record
    await supabase.from("faculty_registrations").delete().eq("email", email)

    return NextResponse.json({
      success: true,
      message: `Account created successfully! Login with email: ${email} and password: ${defaultPassword}`,
      defaultPassword: defaultPassword, // For demo - remove in production
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
