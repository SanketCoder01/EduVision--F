import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const supabase = createServerSupabaseClient()
    
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Fetch dean profile
    const { data: deanData, error: deanError } = await supabase
      .from('deans')
      .select('*')
      .eq('email', email)
      .single()
    
    if (deanError || !deanData) {
      // Logout if not a dean
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: "Unauthorized: Not a dean account" },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: authData.user,
      dean: deanData,
      session: authData.session
    })
    
  } catch (error) {
    console.error("Dean login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
