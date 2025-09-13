// Test script to verify assignment flow from faculty to student
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAssignmentFlow() {
  console.log('=== Testing Assignment Flow ===')
  
  try {
    // 1. Check all assignments in database
    console.log('\n1. Checking all assignments in database...')
    const { data: allAssignments, error: allError } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('Error fetching all assignments:', allError)
      return
    }
    
    console.log(`Found ${allAssignments?.length || 0} total assignments`)
    allAssignments?.forEach(assignment => {
      console.log(`- ${assignment.title} | Dept: ${assignment.department} | Years: ${JSON.stringify(assignment.target_years)} | Status: ${assignment.status}`)
    })
    
    // 2. Check published assignments for CSE department
    console.log('\n2. Checking published CSE assignments...')
    const { data: cseAssignments, error: cseError } = await supabase
      .from('assignments')
      .select('*')
      .eq('department', 'CSE')
      .eq('status', 'published')
    
    if (cseError) {
      console.error('Error fetching CSE assignments:', cseError)
      return
    }
    
    console.log(`Found ${cseAssignments?.length || 0} published CSE assignments`)
    cseAssignments?.forEach(assignment => {
      console.log(`- ${assignment.title} | Years: ${JSON.stringify(assignment.target_years)} | Faculty: ${assignment.faculty_id}`)
    })
    
    // 3. Test year filtering for 3rd year students
    console.log('\n3. Testing year filtering for 3rd year CSE students...')
    const { data: thirdYearAssignments, error: thirdYearError } = await supabase
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
      .contains('target_years', ['3'])
    
    if (thirdYearError) {
      console.error('Error fetching 3rd year assignments:', thirdYearError)
      return
    }
    
    console.log(`Found ${thirdYearAssignments?.length || 0} assignments for CSE 3rd year`)
    thirdYearAssignments?.forEach(assignment => {
      console.log(`- ${assignment.title} | Faculty: ${assignment.faculty?.name || 'Unknown'} | Due: ${assignment.due_date}`)
    })
    
    // 4. Check faculty table
    console.log('\n4. Checking faculty table...')
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email, department')
      .limit(5)
    
    if (facultyError) {
      console.error('Error fetching faculty:', facultyError)
      return
    }
    
    console.log(`Found ${faculty?.length || 0} faculty members`)
    faculty?.forEach(f => {
      console.log(`- ${f.name} | ${f.email} | Dept: ${f.department}`)
    })
    
    // 5. Check students table
    console.log('\n5. Checking students table...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email, department, year')
      .eq('department', 'CSE')
      .eq('year', '3')
      .limit(3)
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return
    }
    
    console.log(`Found ${students?.length || 0} CSE 3rd year students`)
    students?.forEach(s => {
      console.log(`- ${s.name} | ${s.email} | Year: ${s.year}`)
    })
    
    // 6. Test real-time subscription setup
    console.log('\n6. Testing real-time subscription...')
    const channel = supabase
      .channel('test-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: 'department=eq.CSE'
        },
        (payload) => {
          console.log('Real-time update received:', payload)
        }
      )
      .subscribe()
    
    console.log('Real-time subscription established')
    
    // Clean up
    setTimeout(() => {
      supabase.removeChannel(channel)
      console.log('Real-time subscription cleaned up')
    }, 2000)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testAssignmentFlow()
