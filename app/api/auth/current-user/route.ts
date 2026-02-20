import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtguryzyprgqraimyimt.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Try to find user in student tables
    const studentTables = [
      'students_cse_1st_year', 'students_cse_2nd_year', 'students_cse_3rd_year', 'students_cse_4th_year',
      'students_cyber_1st_year', 'students_cyber_2nd_year', 'students_cyber_3rd_year', 'students_cyber_4th_year',
      'students_aids_1st_year', 'students_aids_2nd_year', 'students_aids_3rd_year', 'students_aids_4th_year',
      'students_aiml_1st_year', 'students_aiml_2nd_year', 'students_aiml_3rd_year', 'students_aiml_4th_year'
    ]

    for (const table of studentTables) {
      try {
        const { data: student, error } = await supabase
          .from(table)
          .select('*')
          .eq('email', user.email)
          .single()

        if (student && !error) {
          const [, department, year] = table.split('_')
          return NextResponse.json({
            ...student,
            department: department.toUpperCase(),
            year,
            user_type: 'student'
          })
        }
      } catch (error) {
        continue
      }
    }

    // Try faculty table
    try {
      const { data: faculty, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()

      if (faculty && !error) {
        return NextResponse.json({
          ...faculty,
          user_type: 'faculty'
        })
      }
    } catch (error) {
      // Continue
    }

    return NextResponse.json({ error: 'User not found in any table' }, { status: 404 })
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
