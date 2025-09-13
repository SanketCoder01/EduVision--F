// Quick script to check assignments in Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://jtguryzyprgqraimyimt.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAssignments() {
  console.log('Checking assignments in database...')
  
  try {
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('id, title, status, department, target_years, faculty_id')
      .limit(10)
    
    if (error) {
      console.error('Error fetching assignments:', error)
      return
    }
    
    console.log(`Found ${assignments?.length || 0} assignments:`)
    assignments?.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.title} (${assignment.id})`)
      console.log(`   Status: ${assignment.status}`)
      console.log(`   Department: ${assignment.department}`)
      console.log(`   Target Years: ${assignment.target_years}`)
      console.log(`   Faculty ID: ${assignment.faculty_id}`)
      console.log('---')
    })
    
    // Also check faculty
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email, department')
      .limit(5)
    
    if (!facultyError && faculty) {
      console.log(`\nFound ${faculty.length} faculty members:`)
      faculty.forEach((f, index) => {
        console.log(`${index + 1}. ${f.name} (${f.email}) - ${f.department}`)
      })
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkAssignments()
