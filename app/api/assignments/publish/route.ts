import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtguryzyprgqraimyimt.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE"

export async function POST(request: NextRequest) {
  try {
    const { assignmentId } = await request.json()
    
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Use the secure publish function
    const { data, error } = await supabase.rpc('publish_assignment_securely', {
      assignment_id: assignmentId
    })

    if (error) {
      console.error('Error publishing assignment:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment published successfully',
      data
    })
  } catch (error) {
    console.error('Error in publish assignment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
