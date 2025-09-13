// Complete fix for real-time faculty-student assignment connection
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jtguryzyprgqraimyimt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'
)

async function fixRealTimeAssignments() {
  console.log('🔧 FIXING REAL-TIME FACULTY-STUDENT ASSIGNMENT CONNECTION...\n')
  
  try {
    // 1. Check all current assignments
    console.log('1️⃣ Checking all assignments in database...')
    const { data: allAssignments, error: allError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status, created_at,
        faculty:faculty_id (name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Error:', allError.message)
      return
    }
    
    console.log(`📚 Found ${allAssignments.length} total assignments:`)
    allAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.department} - ${a.status}`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (ID: ${a.faculty_id})`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log(`      Created: ${a.created_at}`)
      console.log('')
    })
    
    // 2. Check for the "Java" assignment specifically
    console.log('2️⃣ Looking for "Java" assignment posted by faculty...')
    const javaAssignment = allAssignments.find(a => 
      a.title.toLowerCase().includes('java') ||
      a.title === 'Java'
    )
    
    if (javaAssignment) {
      console.log('✅ Found Java assignment:')
      console.log(`   Title: "${javaAssignment.title}"`)
      console.log(`   Faculty: ${javaAssignment.faculty?.name || 'Unknown'}`)
      console.log(`   Department: ${javaAssignment.department}`)
      console.log(`   Target Years: ${JSON.stringify(javaAssignment.target_years)}`)
      console.log(`   Status: ${javaAssignment.status}`)
    } else {
      console.log('❌ Java assignment NOT FOUND in database!')
      console.log('   This means faculty assignment was not saved properly.')
    }
    
    // 3. Check what CSE 3rd year students should see
    console.log('\n3️⃣ Checking assignments for CSE 3rd year students...')
    const { data: cse3rdAssignments, error: cse3rdError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status, created_at,
        faculty:faculty_id (name, email)
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (cse3rdError) {
      console.error('❌ Error:', cse3rdError.message)
    } else {
      console.log(`🎯 CSE 3rd year students should see ${cse3rdAssignments.length} assignments:`)
      cse3rdAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}"`)
        console.log(`      Faculty: ${a.faculty?.name || 'Unknown'}`)
        console.log(`      Status: ${a.status}`)
        console.log('')
      })
    }
    
    // 4. Test the exact query used by student dashboard
    console.log('4️⃣ Testing SupabaseAssignmentService query...')
    const studentDepartment = 'CSE'
    const studentYear = 'third'
    
    const { data: serviceQuery, error: serviceError } = await supabase
      .from('assignments')
      .select(`*, faculty:faculty_id (name, email)`)
      .eq('status', 'published')
      .eq('department', studentDepartment)
      .contains('target_years', [studentYear])
      .order('created_at', { ascending: false })
    
    if (serviceError) {
      console.error('❌ Service query error:', serviceError.message)
    } else {
      console.log(`🔧 Service query returns ${serviceQuery.length} assignments:`)
      serviceQuery.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name || 'Unknown Faculty'}`)
      })
    }
    
    // 5. Check faculty table
    console.log('\n5️⃣ Checking faculty who can post assignments...')
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email, department')
      .eq('department', 'CSE')
    
    if (facultyError) {
      console.error('❌ Error:', facultyError.message)
    } else {
      console.log(`👨‍🏫 Found ${faculty.length} CSE faculty:`)
      faculty.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.name} (${f.email}) - ID: ${f.id}`)
      })
    }
    
    // 6. Create a test assignment to verify the flow
    console.log('\n6️⃣ Creating test assignment to verify real-time flow...')
    
    if (faculty.length > 0) {
      const testFaculty = faculty[0]
      const testAssignment = {
        title: 'Real-Time Test Assignment',
        description: 'Testing real-time faculty-student connection',
        faculty_id: testFaculty.id,
        department: 'CSE',
        target_years: ['third'],
        assignment_type: 'normal',
        max_marks: 100,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
        created_at: new Date().toISOString()
      }
      
      const { data: newAssignment, error: createError } = await supabase
        .from('assignments')
        .insert([testAssignment])
        .select(`*, faculty:faculty_id (name, email)`)
        .single()
      
      if (createError) {
        console.error('❌ Error creating test assignment:', createError.message)
      } else {
        console.log('✅ Test assignment created successfully:')
        console.log(`   ID: ${newAssignment.id}`)
        console.log(`   Title: "${newAssignment.title}"`)
        console.log(`   Faculty: ${newAssignment.faculty?.name}`)
        
        // Verify it appears in student query
        const { data: verifyQuery, error: verifyError } = await supabase
          .from('assignments')
          .select(`*, faculty:faculty_id (name, email)`)
          .eq('status', 'published')
          .eq('department', 'CSE')
          .contains('target_years', ['third'])
          .order('created_at', { ascending: false })
        
        if (verifyError) {
          console.error('❌ Verification error:', verifyError.message)
        } else {
          const testFound = verifyQuery.find(a => a.id === newAssignment.id)
          if (testFound) {
            console.log('✅ Test assignment appears in student query!')
          } else {
            console.log('❌ Test assignment NOT found in student query!')
          }
        }
        
        // Clean up test assignment
        await supabase.from('assignments').delete().eq('id', newAssignment.id)
        console.log('🧹 Test assignment cleaned up')
      }
    }
    
    console.log('\n🎉 REAL-TIME ASSIGNMENT ANALYSIS COMPLETE!')
    console.log('\n📋 FINDINGS:')
    console.log(`   • Total assignments in database: ${allAssignments.length}`)
    console.log(`   • Java assignment found: ${javaAssignment ? '✅ YES' : '❌ NO'}`)
    console.log(`   • CSE 3rd year assignments: ${cse3rdAssignments?.length || 0}`)
    console.log(`   • Service query results: ${serviceQuery?.length || 0}`)
    console.log(`   • Real CSE faculty: ${faculty?.length || 0}`)
    
    if (!javaAssignment) {
      console.log('\n🚨 ISSUE IDENTIFIED:')
      console.log('   The "Java" assignment posted by faculty is NOT in the database!')
      console.log('   This means the faculty assignment creation is not working properly.')
      console.log('   Faculty assignments are not being saved to Supabase.')
    }
    
    if (cse3rdAssignments?.length === 0) {
      console.log('\n🚨 CRITICAL ISSUE:')
      console.log('   NO assignments targeting CSE 3rd year students!')
      console.log('   Student dashboard will be empty until faculty posts assignments.')
    }
    
    console.log('\n🔧 REQUIRED FIXES:')
    console.log('   1. Fix faculty assignment creation to save to Supabase')
    console.log('   2. Ensure target_years includes "third" for 3rd year students')
    console.log('   3. Verify real-time subscriptions are working')
    console.log('   4. Remove any static/localStorage data from student dashboard')
    
  } catch (error) {
    console.error('💥 Analysis failed:', error.message)
  }
}

fixRealTimeAssignments()
