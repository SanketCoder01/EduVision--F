// Direct database check for real assignments vs student dashboard
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jtguryzyprgqraimyimt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'
)

async function debugAssignments() {
  console.log('🔍 DEBUGGING REAL ASSIGNMENTS VS STUDENT DASHBOARD\n')
  
  try {
    // 1. Check ALL assignments in database
    console.log('1️⃣ Checking ALL assignments in database...')
    const { data: allAssignments, error: allError } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Error:', allError.message)
      return
    }
    
    console.log(`📚 Found ${allAssignments.length} total assignments:`)
    allAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.department} - Status: ${a.status}`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log(`      Faculty ID: ${a.faculty_id}`)
      console.log(`      Created: ${a.created_at}`)
      console.log('')
    })
    
    // 2. Check published assignments for CSE
    console.log('2️⃣ Checking published CSE assignments...')
    const { data: cseAssignments, error: cseError } = await supabase
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
      .order('created_at', { ascending: false })
    
    if (cseError) {
      console.error('❌ Error:', cseError.message)
      return
    }
    
    console.log(`🎯 Found ${cseAssignments.length} published CSE assignments:`)
    cseAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}"`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (${a.faculty?.email || 'No email'})`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log(`      Due Date: ${a.due_date}`)
      console.log('')
    })
    
    // 3. Check specifically for CSE 3rd year
    console.log('3️⃣ Checking assignments targeting CSE 3rd year...')
    const { data: cse3rdAssignments, error: cse3rdError } = await supabase
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
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (cse3rdError) {
      console.error('❌ Error:', cse3rdError.message)
      return
    }
    
    console.log(`🎯 Found ${cse3rdAssignments.length} assignments for CSE 3rd year:`)
    cse3rdAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}"`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (${a.faculty?.email || 'No email'})`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log(`      Assignment Type: ${a.assignment_type}`)
      console.log(`      Max Marks: ${a.max_marks}`)
      console.log(`      Due Date: ${a.due_date}`)
      console.log(`      Created: ${a.created_at}`)
      console.log('')
    })
    
    // 4. Check faculty table
    console.log('4️⃣ Checking faculty in database...')
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('*')
      .eq('department', 'CSE')
    
    if (facultyError) {
      console.error('❌ Error:', facultyError.message)
    } else {
      console.log(`👨‍🏫 Found ${faculty.length} CSE faculty:`)
      faculty.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.name} (${f.email}) - ID: ${f.id}`)
      })
    }
    
    // 5. Check students table
    console.log('\n5️⃣ Checking CSE 3rd year students...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('department', 'CSE')
      .eq('year', 'third')
    
    if (studentsError) {
      console.error('❌ Error:', studentsError.message)
    } else {
      console.log(`👨‍🎓 Found ${students.length} CSE 3rd year students:`)
      students.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} (${s.email}) - ID: ${s.id}`)
      })
    }
    
    console.log('\n🚨 ANALYSIS:')
    if (cse3rdAssignments.length === 0) {
      console.log('❌ NO ASSIGNMENTS FOUND FOR CSE 3RD YEAR!')
      console.log('   This explains why student dashboard is empty.')
      console.log('   Check if faculty assignment has correct target_years array.')
    } else {
      console.log(`✅ Found ${cse3rdAssignments.length} assignments for CSE 3rd year`)
      console.log('   Student dashboard should show these assignments.')
    }
    
    // 6. Test the exact query used by SupabaseAssignmentService
    console.log('\n6️⃣ Testing SupabaseAssignmentService query...')
    const studentDepartment = 'CSE'
    const studentYear = '3' // This might be the issue - number vs string
    
    // Normalize year like the service does
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
    const normalizedYear = yearMapping[studentYear.toLowerCase()] || studentYear
    
    console.log(`   Student Year Input: "${studentYear}"`)
    console.log(`   Normalized Year: "${normalizedYear}"`)
    
    const { data: serviceQuery, error: serviceError } = await supabase
      .from('assignments')
      .select(`*, faculty:faculty_id (name, email)`)
      .eq('status', 'published')
      .eq('department', studentDepartment)
      .contains('target_years', [normalizedYear])
      .order('created_at', { ascending: false })
    
    if (serviceError) {
      console.error('❌ Service query error:', serviceError.message)
    } else {
      console.log(`🔧 Service query returned ${serviceQuery.length} assignments:`)
      serviceQuery.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name || 'Unknown Faculty'}`)
      })
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message)
  }
}

debugAssignments()
