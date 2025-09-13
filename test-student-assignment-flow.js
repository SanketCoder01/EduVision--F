// Test the complete student assignment flow
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jtguryzyprgqraimyimt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStudentAssignmentFlow() {
  console.log('🔍 Testing Student Assignment Flow...\n')
  
  try {
    // 1. Check CSE 3rd year students
    console.log('1️⃣ Checking CSE 3rd year students...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email, department, year')
      .eq('department', 'CSE')
      .eq('year', 'third')
    
    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError.message)
      return
    }
    
    console.log(`✅ Found ${students.length} CSE 3rd year students:`)
    students.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.email}) - Year: ${s.year}`)
    })
    
    // 2. Check assignments targeting CSE 3rd year
    console.log('\n2️⃣ Checking assignments for CSE 3rd year...')
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        id, title, department, target_years, status, created_at,
        faculty:faculty_id (
          name, email
        )
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (assignmentsError) {
      console.error('❌ Error fetching assignments:', assignmentsError.message)
      return
    }
    
    console.log(`✅ Found ${assignments.length} published assignments for CSE 3rd year:`)
    assignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}"`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'}`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log(`      Created: ${new Date(a.created_at).toLocaleDateString()}`)
      console.log('')
    })
    
    // 3. Test the exact query used by SupabaseAssignmentService
    console.log('3️⃣ Testing SupabaseAssignmentService query...')
    
    // Simulate the year normalization
    const studentYear = '3' // What a student might have
    const yearMapping = {
      '1': 'first',
      '2': 'second', 
      '3': 'third',
      '4': 'fourth',
      'first': 'first',
      'second': 'second',
      'third': 'third',
      'fourth': 'fourth'
    }
    
    const normalizedYear = yearMapping[studentYear] || studentYear
    console.log(`   Input year: "${studentYear}" → Normalized: "${normalizedYear}"`)
    
    const { data: serviceQuery, error: serviceError } = await supabase
      .from('assignments')
      .select(`
        *,
        faculty:faculty_id (
          name,
          email
        )
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', [normalizedYear])
      .order('created_at', { ascending: false })
    
    if (serviceError) {
      console.error('❌ Service query error:', serviceError.message)
      return
    }
    
    console.log(`✅ Service query returned ${serviceQuery.length} assignments`)
    
    // 4. Test real-time subscription
    console.log('\n4️⃣ Testing real-time subscription...')
    let realtimeReceived = false
    
    const channel = supabase
      .channel('test-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: 'department=eq.CSE'
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload.eventType, payload.new?.title || payload.old?.title)
          realtimeReceived = true
        }
      )
      .subscribe()
    
    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create a test assignment to trigger real-time
    console.log('   Creating test assignment to trigger real-time...')
    const { data: testAssignment, error: testError } = await supabase
      .from('assignments')
      .insert([{
        title: 'Real-time Test Assignment',
        description: 'Testing real-time updates',
        faculty_id: assignments[0]?.faculty_id || students[0]?.id,
        department: 'CSE',
        target_years: ['third'],
        assignment_type: 'text_based',
        max_marks: 10,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'published'
      }])
      .select()
    
    if (testError) {
      console.log('   ⚠️ Could not create test assignment:', testError.message)
    } else {
      console.log('   ✅ Test assignment created:', testAssignment[0]?.title)
    }
    
    // Wait for real-time notification
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (realtimeReceived) {
      console.log('   ✅ Real-time subscription working!')
    } else {
      console.log('   ⚠️ Real-time notification not received (may take longer)')
    }
    
    // Clean up
    supabase.removeChannel(channel)
    
    if (testAssignment?.[0]?.id) {
      await supabase.from('assignments').delete().eq('id', testAssignment[0].id)
      console.log('   🧹 Test assignment cleaned up')
    }
    
    console.log('\n🎉 Student assignment flow test complete!')
    
    // Summary
    console.log('\n📋 SUMMARY:')
    console.log(`   • CSE 3rd year students: ${students.length}`)
    console.log(`   • Published assignments for them: ${assignments.length}`)
    console.log(`   • Service query results: ${serviceQuery.length}`)
    console.log(`   • Real-time working: ${realtimeReceived ? 'Yes' : 'Unknown'}`)
    
    if (assignments.length === 0) {
      console.log('\n⚠️  ISSUE IDENTIFIED: No published assignments found for CSE 3rd year students!')
      console.log('   This explains why students cannot see assignments.')
      console.log('   Check if assignments are being created with correct target_years format.')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testStudentAssignmentFlow()
