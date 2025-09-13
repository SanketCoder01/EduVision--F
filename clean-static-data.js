// Script to remove ALL static test data and ensure only real faculty assignments exist
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jtguryzyprgqraimyimt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanStaticData() {
  console.log('🧹 Cleaning ALL static test data from database...\n')
  
  try {
    // 1. Check current assignments in database
    console.log('1️⃣ Checking current assignments in database...')
    const { data: allAssignments, error: fetchError } = await supabase
      .from('assignments')
      .select('id, title, description, faculty_id, department, target_years, status, created_at')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Error fetching assignments:', fetchError.message)
      return
    }
    
    console.log(`📊 Found ${allAssignments.length} total assignments:`)
    allAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" (${a.department}) - ${a.status}`)
      console.log(`      Faculty ID: ${a.faculty_id}`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log(`      Created: ${new Date(a.created_at).toLocaleString()}`)
      console.log('')
    })
    
    // 2. Identify test/static assignments (those with test faculty IDs or test titles)
    const testAssignments = allAssignments.filter(a => 
      a.faculty_id === 'test-faculty-id' ||
      a.title.toLowerCase().includes('test') ||
      a.title.toLowerCase().includes('debug') ||
      a.description.toLowerCase().includes('test') ||
      a.description.toLowerCase().includes('debug')
    )
    
    console.log(`🔍 Identified ${testAssignments.length} test/static assignments to remove:`)
    testAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" (ID: ${a.id})`)
    })
    
    // 3. Remove test assignments
    if (testAssignments.length > 0) {
      console.log('\n🗑️ Removing test assignments...')
      
      for (const assignment of testAssignments) {
        const { error: deleteError } = await supabase
          .from('assignments')
          .delete()
          .eq('id', assignment.id)
        
        if (deleteError) {
          console.error(`❌ Error deleting assignment ${assignment.id}:`, deleteError.message)
        } else {
          console.log(`✅ Deleted: "${assignment.title}"`)
        }
      }
    } else {
      console.log('\n✅ No test assignments found to remove')
    }
    
    // 4. Check for real faculty in database
    console.log('\n2️⃣ Checking real faculty in database...')
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name, email, department')
    
    if (facultyError) {
      console.error('❌ Error fetching faculty:', facultyError.message)
    } else {
      console.log(`👨‍🏫 Found ${faculty.length} faculty members:`)
      faculty.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.name} (${f.email}) - ${f.department}`)
      })
    }
    
    // 5. Check remaining assignments after cleanup
    console.log('\n3️⃣ Checking remaining assignments after cleanup...')
    const { data: remainingAssignments, error: remainingError } = await supabase
      .from('assignments')
      .select(`
        id, title, department, target_years, status, created_at,
        faculty:faculty_id (
          name, email, department
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (remainingError) {
      console.error('❌ Error fetching remaining assignments:', remainingError.message)
    } else {
      console.log(`📚 ${remainingAssignments.length} published assignments remaining:`)
      remainingAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}" (${a.department})`)
        console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (${a.faculty?.email || 'No email'})`)
        console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
        console.log('')
      })
    }
    
    // 6. Check CSE 3rd year specific assignments
    console.log('4️⃣ Checking assignments specifically for CSE 3rd year...')
    const { data: cseAssignments, error: cseError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status,
        faculty:faculty_id (
          name, email
        )
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
    
    if (cseError) {
      console.error('❌ Error fetching CSE assignments:', cseError.message)
    } else {
      console.log(`🎯 ${cseAssignments.length} published assignments for CSE 3rd year:`)
      cseAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}"`)
        console.log(`      Faculty: ${a.faculty?.name || 'MISSING FACULTY'} (${a.faculty?.email || 'No email'})`)
        console.log(`      Faculty ID: ${a.faculty_id}`)
        console.log('')
      })
      
      if (cseAssignments.length === 0) {
        console.log('⚠️ NO ASSIGNMENTS FOUND FOR CSE 3rd YEAR!')
        console.log('   This explains why students see no assignments.')
        console.log('   Faculty need to create and publish assignments targeting CSE 3rd year.')
      }
    }
    
    console.log('\n🎉 Static data cleanup completed!')
    console.log('\n📋 SUMMARY:')
    console.log(`   • Test assignments removed: ${testAssignments.length}`)
    console.log(`   • Total faculty in system: ${faculty?.length || 0}`)
    console.log(`   • Published assignments remaining: ${remainingAssignments?.length || 0}`)
    console.log(`   • CSE 3rd year assignments: ${cseAssignments?.length || 0}`)
    
    if (cseAssignments?.length === 0) {
      console.log('\n🚨 ACTION REQUIRED:')
      console.log('   1. Faculty need to log in and create assignments')
      console.log('   2. Assignments must target department "CSE" and year "third"')
      console.log('   3. Assignments must be published (status = "published")')
    }
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message)
  }
}

cleanStaticData()
