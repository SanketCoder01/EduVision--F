import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      user_id,
      email,
      name,
      user_type,
      department,
      year,
      college_name,
      prn,
      photo
    } = body

    // Validate required fields
    if (!email || !name || !user_type || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, user_type, department' },
        { status: 400 }
      )
    }

    // For students, year is also required
    if (user_type === 'student' && !year) {
      return NextResponse.json(
        { error: 'Year is required for students' },
        { status: 400 }
      )
    }

    // For students, find existing record across all tables first
    let existingTableName = ''
    let existingUser: any = null
    
    if (user_type === 'student') {
      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st', '2nd', '3rd', '4th']
      
      for (const dept of departments) {
        for (const yr of years) {
          const tblName = `students_${dept}_${yr}_year`
          const { data, error } = await supabaseAdmin
            .from(tblName)
            .select('*')
            .eq('email', email)
            .maybeSingle()
          
          if (data && !error) {
            existingTableName = tblName
            existingUser = data
            break
          }
        }
        if (existingUser) break
      }
    } else {
      // Check faculty table
      const { data, error } = await supabaseAdmin
        .from('faculty')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      
      if (data && !error) {
        existingTableName = 'faculty'
        existingUser = data
      }
    }

    // Determine target table based on new department/year
    let targetTableName = ''
    
    if (user_type === 'student') {
      const deptMap: Record<string, string> = {
        'cse': 'cse',
        'cyber': 'cyber',
        'aids': 'aids',
        'aiml': 'aiml'
      }
      
      const deptCode = deptMap[department.toLowerCase()] || department.toLowerCase()
      targetTableName = `students_${deptCode}_${year}_year`
    } else {
      targetTableName = 'faculty'
    }

    // Prepare the data object
    const profileData: any = {
      name,
      email,
      department,
      college_name: college_name || 'Sanjivani University',
      photo,
      updated_at: new Date().toISOString()
    }

    // Add student-specific fields
    if (user_type === 'student') {
      profileData.year = year
      profileData.prn = prn
    }

    let data, error

    if (existingUser) {
      // User exists - check if table changed (department/year change)
      if (existingTableName !== targetTableName) {
        // Department/year changed - delete from old table, insert into new table
        console.log(`Moving user from ${existingTableName} to ${targetTableName}`)
        
        // Delete from old table
        await supabaseAdmin
          .from(existingTableName)
          .delete()
          .eq('email', email)
        
        // Insert into new table
        const insertResult = await supabaseAdmin
          .from(targetTableName)
          .insert(profileData)
          .select()
          .single()
        
        data = insertResult.data
        error = insertResult.error
      } else {
        // Same table - just update
        const updateData: any = {
          name,
          college_name: college_name || 'Sanjivani University',
          photo,
          updated_at: new Date().toISOString()
        }
        
        if (department) updateData.department = department
        
        if (user_type === 'student') {
          if (year) updateData.year = year
          if (prn) updateData.prn = prn
        }
        
        const updateResult = await supabaseAdmin
          .from(targetTableName)
          .update(updateData)
          .eq('email', email)
          .select()
          .single()
        
        data = updateResult.data
        error = updateResult.error
      }
    } else {
      // Insert new record
      const insertResult = await supabaseAdmin
        .from(targetTableName)
        .insert(profileData)
        .select()
        .single()
      
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to save profile: ${error.message}` },
        { status: 500 }
      )
    }

    // Store session data for client
    const sessionData = {
      ...data,
      department,
      year: user_type === 'student' ? year : undefined,
      userType: user_type
    }

    return NextResponse.json({
      success: true,
      data: data,
      session: sessionData,
      message: 'Profile completed successfully',
      user_type,
      table: targetTableName
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if profile exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const user_type = searchParams.get('user_type') || 'student'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (user_type === 'student') {
      // Check all student tables
      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st', '2nd', '3rd', '4th']

      for (const dept of departments) {
        for (const year of years) {
          const tableName = `students_${dept}_${year}_year`
          const { data, error } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .eq('email', email)
            .maybeSingle()

          if (data && !error) {
            return NextResponse.json({
              exists: true,
              profile: { ...data, department: dept, year },
              table: tableName
            })
          }
        }
      }
    } else {
      // Check faculty table
      const { data, error } = await supabaseAdmin
        .from('faculty')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (data && !error) {
        return NextResponse.json({
          exists: true,
          profile: data,
          table: 'faculty'
        })
      }
    }

    return NextResponse.json({
      exists: false,
      profile: null
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
