import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType } = body

    console.log("Login request:", { email, userType })

    if (!email || !password || !userType) {
      return NextResponse.json(
        { success: false, message: "Email, password, and user type are required" },
        { status: 400 },
      )
    }

    if (userType !== "faculty" && userType !== "student") {
      return NextResponse.json({ success: false, message: "Invalid user type" }, { status: 400 })
    }

    try {
      const user = await authenticateUser(email, password, userType)

      if (!user) {
        return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
      }

      // Remove password from response
      const { password: _, ...userData } = user

      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          ...userData,
          userType,
        },
      })
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
