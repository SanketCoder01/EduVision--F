// Script to create a test assignment for debugging
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jtguryzyprgqraimyimt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestAssignment() {
  console.log('🚀 Creating test assignment for debugging...\n')
  
  try {
    // 1. Check if faculty exists
    console.log('1️⃣ Checking for faculty...')
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email, department')
      .limit(1)
    
    if (facultyError || !faculty || faculty.length === 0) {
      console.log('❌ No faculty found. Creating test faculty...')
      
      // Create test faculty
      const { data: newFaculty, error: createFacultyError } = await supabase
        .from('faculty')
        .insert([{
          employee_id: 'TEST001',
          name: 'Test Faculty',
          email: 'test.faculty@sanjivani.edu.in',
          department: 'CSE',
          designation: 'Assistant Professor',
          experience_years: 5,
          password: 'test123',
          status: 'active'
        }])
        .select()
        .single()
      
      if (createFacultyError) {
        console.error('❌ Error creating faculty:', createFacultyError.message)
        return
      }
      
      console.log('✅ Test faculty created:', newFaculty.name)
      faculty[0] = newFaculty
    } else {
      console.log('✅ Found faculty:', faculty[0].name)
    }
    
    // 2. Create test assignment
    console.log('\n2️⃣ Creating test assignment...')
    const testAssignment = {
      title: 'Debug Test Assignment - CSE 3rd Year',
      description: 'This is a test assignment created for debugging the student assignment display issue.',
      faculty_id: faculty[0].id,
      department: 'CSE',
      target_years: ['third'], // Use 'third' instead of '3' to match student year format
      assignment_type: 'text_based',
      max_marks: 100,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'published' // Make it published so students can see it
    }
    
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert([testAssignment])
      .select()
      .single()
    
    if (assignmentError) {
      console.error('❌ Error creating assignment:', assignmentError.message)
      return
    }
    
    console.log('✅ Test assignment created successfully!')
    console.log('   ID:', assignment.id)
    console.log('   Title:', assignment.title)
    console.log('   Department:', assignment.department)
    console.log('   Target Years:', assignment.target_years)
    console.log('   Status:', assignment.status)
    console.log('   Due Date:', assignment.due_date)
    
    // 3. Verify assignment can be retrieved for CSE 3rd year students
    console.log('\n3️⃣ Verifying assignment retrieval for CSE 3rd year...')
    const { data: retrievedAssignments, error: retrieveError } = await supabase
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
    
    if (retrieveError) {
      console.error('❌ Error retrieving assignments:', retrieveError.message)
      return
    }
    
    console.log(`✅ Found ${retrievedAssignments.length} assignments for CSE 3rd year:`)
    retrievedAssignments.forEach((assignment, index) => {
      console.log(`   ${index + 1}. "${assignment.title}" by ${assignment.faculty?.name || 'Unknown Faculty'}`)
    })
    
    console.log('\n🎉 Test assignment creation complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Navigate to /debug-student-assignments to run the debug tool')
    console.log('   2. Check if the test assignment appears in the student dashboard')
    console.log('   3. Verify real-time updates are working')
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
}

// Run the script
createTestAssignment()
