// Authentication using Supabase Auth + Database
// Authenticates with Supabase Auth, then fetches/creates database entry

import { supabase } from './supabase'

export async function authenticateStudent(email: string, password: string) {
  try {
    console.log('🔍 Step 1: Authenticating with Supabase Auth:', email)
    
    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      throw new Error(`Authentication failed: ${authError.message}`)
    }

    console.log('✅ Step 1 Complete: Supabase Auth successful')
    console.log('🔍 Step 2: Fetching student from database...')

    // Step 2: Check if student exists in database
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)

    console.log('📊 Database query result:', { students, queryError })

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Database error:', queryError)
      
      // Check if it's an RLS error
      if (queryError.message.includes('row-level security') || queryError.code === '406') {
        throw new Error('Database access denied. Run this in Supabase SQL Editor:\n\nALTER TABLE students DISABLE ROW LEVEL SECURITY;')
      }
      
      throw new Error(`Database error: ${queryError.message}`)
    }

    let student = students && students.length > 0 ? students[0] : null

    // Step 3: If student doesn't exist in database, create entry
    if (!student) {
      console.log('⚠️ Student not in database, creating entry...')
      
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          email: email,
          name: authData.user?.user_metadata?.full_name || email.split('@')[0],
          department: 'CSE', // Default, will be updated during registration
          year: 'third', // Default, will be updated during registration
          prn: 'TEMP_' + Date.now(), // Temporary PRN, will be updated during registration
          registration_completed: false
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Failed to create student entry:', insertError)
        throw new Error(`Failed to create student profile: ${insertError.message}`)
      }

      student = newStudent
      console.log('✅ Created new student entry:', student)
    }

    console.log('✅ Step 2 Complete: Student data retrieved:', student.name)
    
    return student
  } catch (error: any) {
    console.error('🚨 Authentication error:', error)
    throw new Error(error.message || 'Authentication failed')
  }
}

export async function authenticateFaculty(email: string, password: string) {
  try {
    console.log('🔍 Step 1: Authenticating with Supabase Auth:', email)
    
    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      throw new Error(`Authentication failed: ${authError.message}`)
    }

    console.log('✅ Step 1 Complete: Supabase Auth successful')
    console.log('🔍 Step 2: Fetching faculty from database...')

    // Step 2: Check if faculty exists in database
    const { data: faculties, error: queryError } = await supabase
      .from('faculty')
      .select('*')
      .eq('email', email)

    console.log('📊 Database query result:', { faculties, queryError })

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Database error:', queryError)
      
      // Check if it's an RLS error
      if (queryError.message.includes('row-level security') || queryError.code === '406') {
        throw new Error('Database access denied. Run this in Supabase SQL Editor:\n\nALTER TABLE faculty DISABLE ROW LEVEL SECURITY;')
      }
      
      throw new Error(`Database error: ${queryError.message}`)
    }

    let faculty = faculties && faculties.length > 0 ? faculties[0] : null

    // Step 3: If faculty doesn't exist in database, create entry
    if (!faculty) {
      console.log('⚠️ Faculty not in database, creating entry...')
      
      const { data: newFaculty, error: insertError } = await supabase
        .from('faculty')
        .insert({
          email: email,
          name: authData.user?.user_metadata?.full_name || email.split('@')[0],
          department: 'Computer Science', // Default, will be updated during registration
          designation: 'Faculty', // Default, will be updated during registration
          registration_completed: false
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Failed to create faculty entry:', insertError)
        throw new Error(`Failed to create faculty profile: ${insertError.message}`)
      }

      faculty = newFaculty
      console.log('✅ Created new faculty entry:', faculty)
    }

    console.log('✅ Step 2 Complete: Faculty data retrieved:', faculty.name)
    
    return faculty
  } catch (error: any) {
    console.error('🚨 Authentication error:', error)
    throw new Error(error.message || 'Authentication failed')
  }
}
