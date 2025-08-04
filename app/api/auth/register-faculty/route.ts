import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, middleName, email, phone, department } = body

    console.log("Registration request:", { firstName, lastName, email, department })

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !department) {
      return NextResponse.json({ success: false, message: "All required fields must be filled" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if email already exists in faculty table
    const { data: existingFaculty } = await supabase.from("faculty").select("email").eq("email", email).single()

    if (existingFaculty) {
      return NextResponse.json({ success: false, message: "Email already registered as faculty" }, { status: 400 })
    }

    // Delete any existing unverified registration for this email
    await supabase.from("faculty_registrations").delete().eq("email", email).eq("verified", false)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Insert registration data
    const { data: registrationData, error: insertError } = await supabase
      .from("faculty_registrations")
      .insert({
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || null,
        email,
        phone,
        department,
        verification_code: verificationCode,
        verified: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ success: false, message: "Failed to process registration" }, { status: 500 })
    }

    // Send email with Resend API
    let emailSent = false
    if (process.env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EduVision <noreply@eduvision.app>",
            to: [email],
            subject: "EduVision Faculty Registration - Verification Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #7c3aed; text-align: center;">EduVision</h1>
                <h2>Welcome ${firstName} ${lastName}!</h2>
                <p>Your verification code is:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                  ${verificationCode}
                </div>
                <p>This code expires in 10 minutes.</p>
                <p>Best regards,<br>EduVision Team</p>
              </div>
            `,
          }),
        })

        if (emailResponse.ok) {
          emailSent = true
        }
      } catch (emailError) {
        console.error("Email error:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? "Verification code sent to your email" : "Registration successful",
      verificationCode: verificationCode, // For demo - remove in production
      emailSent,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
