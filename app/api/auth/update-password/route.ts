import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword, currentPassword } = await request.json()

    if (!userId || !newPassword || !currentPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create admin client for password update
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify current password by attempting sign in
    const { data: { user }, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: userId, // userId is actually email in this context
      password: currentPassword,
    })

    if (authError || !user) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Update password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    // Update password_changed_at timestamp in profile
    const userType = user.user_metadata?.user_type || 'student'
    const tableName = userType === 'student' ? 'students' : 'faculty'
    
    await supabaseAdmin
      .from(tableName)
      .update({ 
        password_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({ 
      success: true, 
      message: "Password updated successfully. Please login with your new password." 
    })

  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ 
      error: "Failed to update password",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
