// Simple test to debug assignment flow
const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAssignments() {
  console.log('🔍 Debugging Assignment Flow...\n')
  
  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...')
    const { data: testConnection, error: connectionError } = await supabase
      .from('assignments')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message)
      return
    }
    console.log('✅ Database connection successful\n')
    
    // Test 2: Count all assignments
    console.log('2️⃣ Counting all assignments...')
    const { count, error: countError } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting assignments:', countError.message)
      return
    }
    console.log(`✅ Total assignments in database: ${count}\n`)
    
    // Test 3: Get all assignments with details
    console.log('3️⃣ Fetching all assignments...')
    const { data: allAssignments, error: allError } = await supabase
      .from('assignments')
      .select('id, title, department, target_years, status, faculty_id, created_at')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Error fetching assignments:', allError.message)
      return
    }
    
    console.log(`✅ Retrieved ${allAssignments.length} assignments:`)
    allAssignments.forEach((assignment, index) => {
      console.log(`   ${index + 1}. "${assignment.title}"`)
      console.log(`      Dept: ${assignment.department} | Years: ${JSON.stringify(assignment.target_years)} | Status: ${assignment.status}`)
      console.log(`      Faculty ID: ${assignment.faculty_id} | Created: ${new Date(assignment.created_at).toLocaleDateString()}`)
      console.log('')
    })
    
    // Test 4: Check published CSE assignments
    console.log('4️⃣ Checking published CSE assignments...')
    const { data: csePublished, error: cseError } = await supabase
      .from('assignments')
      .select('id, title, target_years, faculty_id')
      .eq('department', 'CSE')
      .eq('status', 'published')
    
    if (cseError) {
      console.error('❌ Error fetching CSE assignments:', cseError.message)
      return
    }
    
    console.log(`✅ Found ${csePublished.length} published CSE assignments:`)
    csePublished.forEach((assignment, index) => {
      console.log(`   ${index + 1}. "${assignment.title}" - Years: ${JSON.stringify(assignment.target_years)}`)
    })
    console.log('')
    
    // Test 5: Test year filtering for 3rd year
    console.log('5️⃣ Testing 3rd year filtering...')
    const { data: thirdYear, error: thirdYearError } = await supabase
      .from('assignments')
      .select('id, title, target_years')
      .eq('department', 'CSE')
      .eq('status', 'published')
      .contains('target_years', ['3'])
    
    if (thirdYearError) {
      console.error('❌ Error filtering 3rd year assignments:', thirdYearError.message)
      return
    }
    
    console.log(`✅ Found ${thirdYear.length} assignments for CSE 3rd year:`)
    thirdYear.forEach((assignment, index) => {
      console.log(`   ${index + 1}. "${assignment.title}" - Years: ${JSON.stringify(assignment.target_years)}`)
    })
    console.log('')
    
    // Test 6: Check faculty table
    console.log('6️⃣ Checking faculty table...')
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email, department')
      .limit(3)
    
    if (facultyError) {
      console.error('❌ Error fetching faculty:', facultyError.message)
      return
    }
    
    console.log(`✅ Found ${faculty.length} faculty members:`)
    faculty.forEach((f, index) => {
      console.log(`   ${index + 1}. ${f.name} (${f.email}) - Dept: ${f.department}`)
    })
    console.log('')
    
    // Test 7: Check students table
    console.log('7️⃣ Checking students table...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email, department, year')
      .eq('department', 'CSE')
      .limit(3)
    
    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError.message)
      return
    }
    
    console.log(`✅ Found ${students.length} CSE students:`)
    students.forEach((s, index) => {
      console.log(`   ${index + 1}. ${s.name} (${s.email}) - Year: ${s.year}`)
    })
    
    console.log('\n🎉 Debug complete! Check the results above to identify any issues.')
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
}

// Run the debug
debugAssignments()
