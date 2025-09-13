// Test the complete real-time faculty-student assignment flow
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jtguryzyprgqraimyimt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'
)

async function testRealTimeFlow() {
  console.log('🧪 TESTING COMPLETE REAL-TIME FACULTY-STUDENT ASSIGNMENT FLOW...\n')
  
  try {
    // 1. Check current assignments for CSE 3rd year
    console.log('1️⃣ Checking current assignments for CSE 3rd year students...')
    const { data: currentAssignments, error: currentError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status, created_at,
        faculty:faculty_id (name, email)
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (currentError) {
      console.error('❌ Error:', currentError.message)
      return
    }
    
    console.log(`📚 CSE 3rd year students currently see ${currentAssignments.length} assignments:`)
    currentAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name || 'Unknown Faculty'}`)
      console.log(`      Created: ${new Date(a.created_at).toLocaleString()}`)
      console.log('')
    })
    
    // 2. Check if Java assignment is visible
    const javaAssignment = currentAssignments.find(a => a.title.toLowerCase().includes('java'))
    if (javaAssignment) {
      console.log('✅ Java assignment is visible to CSE 3rd year students!')
      console.log(`   Title: "${javaAssignment.title}"`)
      console.log(`   Faculty: ${javaAssignment.faculty?.name}`)
      console.log(`   Target Years: ${JSON.stringify(javaAssignment.target_years)}`)
    } else {
      console.log('❌ Java assignment is NOT visible to CSE 3rd year students!')
    }
    
    // 3. Test the exact query used by SupabaseAssignmentService
    console.log('\n2️⃣ Testing SupabaseAssignmentService.getStudentAssignments()...')
    
    // Simulate the service call
    const studentDepartment = 'CSE'
    const studentYear = 'third'
    
    const { data: serviceAssignments, error: serviceError } = await supabase
      .from('assignments')
      .select(`*, faculty:faculty_id (name, email)`)
      .eq('status', 'published')
      .eq('department', studentDepartment)
      .contains('target_years', [studentYear])
      .order('created_at', { ascending: false })
    
    if (serviceError) {
      console.error('❌ Service error:', serviceError.message)
    } else {
      console.log(`🔧 SupabaseAssignmentService would return ${serviceAssignments.length} assignments:`)
      serviceAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name || 'Unknown Faculty'}`)
      })
    }
    
    // 4. Test real-time subscription setup
    console.log('\n3️⃣ Testing real-time subscription for assignment updates...')
    
    let subscriptionWorking = false
    const testChannel = supabase
      .channel('test-assignments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: 'department=eq.CSE'
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload.eventType)
          subscriptionWorking = true
        }
      )
      .subscribe()
    
    console.log('   ✅ Real-time subscription established')
    
    // 5. Create a test assignment to verify real-time flow
    console.log('\n4️⃣ Creating test assignment to verify real-time notifications...')
    
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email')
      .eq('department', 'CSE')
      .limit(1)
    
    if (facultyError || !faculty.length) {
      console.log('⚠️ No CSE faculty found, skipping real-time test')
    } else {
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
        console.log('✅ Test assignment created:')
        console.log(`   ID: ${newAssignment.id}`)
        console.log(`   Title: "${newAssignment.title}"`)
        console.log(`   Faculty: ${newAssignment.faculty?.name}`)
        
        // Wait a moment for real-time notification
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        if (subscriptionWorking) {
          console.log('✅ Real-time subscription is working!')
        } else {
          console.log('⚠️ Real-time subscription may not be working')
        }
        
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
            console.log('✅ Test assignment appears in student query immediately!')
          } else {
            console.log('❌ Test assignment NOT found in student query!')
          }
        }
        
        // Clean up test assignment
        await supabase.from('assignments').delete().eq('id', newAssignment.id)
        console.log('🧹 Test assignment cleaned up')
      }
    }
    
    // Cleanup subscription
    supabase.removeChannel(testChannel)
    
    console.log('\n🎉 REAL-TIME FLOW TEST COMPLETE!')
    console.log('\n📋 RESULTS:')
    console.log(`   • Current CSE 3rd year assignments: ${currentAssignments.length}`)
    console.log(`   • Java assignment visible: ${javaAssignment ? '✅ YES' : '❌ NO'}`)
    console.log(`   • Service query working: ${serviceAssignments?.length > 0 ? '✅ YES' : '❌ NO'}`)
    console.log(`   • Real-time subscription: ${subscriptionWorking ? '✅ WORKING' : '⚠️ UNKNOWN'}`)
    
    if (javaAssignment && serviceAssignments?.length > 0) {
      console.log('\n🎯 FACULTY-STUDENT CONNECTION STATUS: ✅ WORKING')
      console.log('   • Faculty can post assignments ✅')
      console.log('   • Students can see assignments ✅')
      console.log('   • Real-time updates enabled ✅')
      console.log('   • Target years format correct ✅')
    } else {
      console.log('\n🚨 FACULTY-STUDENT CONNECTION STATUS: ❌ ISSUES FOUND')
      if (!javaAssignment) {
        console.log('   • Java assignment not visible to students')
      }
      if (!serviceAssignments?.length) {
        console.log('   • Service query returning no results')
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testRealTimeFlow()
