// Complete cleanup of ALL test data and verification of real faculty assignments
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jtguryzyprgqraimyimt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk4MjE1MywiZXhwIjoyMDYyNTU4MTUzfQ.lCh4nz8TFQX2pCmKdaOKVXhbp8zVGOFVgCJpgCMhQDo'
)

async function cleanAllTestData() {
  console.log('🧹 CLEANING ALL TEST DATA FROM DATABASE...\n')
  
  try {
    // 1. Check current assignments
    console.log('1️⃣ Checking current assignments...')
    const { data: allAssignments, error: fetchError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status, created_at,
        faculty:faculty_id (name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Error fetching assignments:', fetchError.message)
      return
    }
    
    console.log(`📚 Found ${allAssignments.length} assignments:`)
    allAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.department} - ${a.status}`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (${a.faculty?.email || 'No email'})`)
      console.log(`      ID: ${a.id}`)
      console.log('')
    })
    
    // 2. Identify test assignments to delete
    const testAssignments = allAssignments.filter(a => 
      a.title.includes('Data Structures') ||
      a.title.includes('Algorithm Analysis') ||
      a.title.includes('Test') ||
      a.faculty?.name === 'Dr. John Smith' ||
      a.faculty?.email?.includes('test') ||
      !a.faculty?.name // No real faculty
    )
    
    console.log(`🗑️ Found ${testAssignments.length} test assignments to delete:`)
    testAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name || 'No Faculty'}`)
    })
    
    // 3. Delete test assignments
    if (testAssignments.length > 0) {
      console.log('\n🗑️ Deleting test assignments...')
      for (const assignment of testAssignments) {
        const { error: deleteError } = await supabase
          .from('assignments')
          .delete()
          .eq('id', assignment.id)
        
        if (deleteError) {
          console.error(`❌ Error deleting "${assignment.title}":`, deleteError.message)
        } else {
          console.log(`✅ Deleted "${assignment.title}"`)
        }
      }
    }
    
    // 4. Check remaining assignments
    console.log('\n4️⃣ Checking remaining assignments after cleanup...')
    const { data: remainingAssignments, error: remainingError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status, created_at,
        faculty:faculty_id (name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (remainingError) {
      console.error('❌ Error:', remainingError.message)
      return
    }
    
    console.log(`📚 ${remainingAssignments.length} assignments remaining:`)
    remainingAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.department} - ${a.status}`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (${a.faculty?.email || 'No email'})`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log('')
    })
    
    // 5. Check CSE 3rd year assignments specifically
    console.log('5️⃣ Checking CSE 3rd year assignments...')
    const { data: cse3rdAssignments, error: cse3rdError } = await supabase
      .from('assignments')
      .select(`
        *,
        faculty:faculty_id (name, email)
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (cse3rdError) {
      console.error('❌ Error:', cse3rdError.message)
    } else {
      console.log(`🎯 Found ${cse3rdAssignments.length} assignments for CSE 3rd year:`)
      cse3rdAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}"`)
        console.log(`      Faculty: ${a.faculty?.name || 'Unknown'}`)
        console.log(`      Type: ${a.assignment_type}`)
        console.log(`      Due: ${a.due_date}`)
        console.log('')
      })
    }
    
    // 6. Check real faculty
    console.log('6️⃣ Checking real faculty in database...')
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
    
    console.log('\n🎉 CLEANUP COMPLETE!')
    console.log('\n📋 SUMMARY:')
    console.log(`   • Test assignments deleted: ${testAssignments.length}`)
    console.log(`   • Real assignments remaining: ${remainingAssignments.length}`)
    console.log(`   • CSE 3rd year assignments: ${cse3rdAssignments?.length || 0}`)
    console.log(`   • Real CSE faculty: ${faculty?.length || 0}`)
    
    if (cse3rdAssignments?.length === 0) {
      console.log('\n⚠️ NO ASSIGNMENTS FOR CSE 3RD YEAR!')
      console.log('   Faculty need to create and publish assignments through the dashboard.')
      console.log('   Make sure target_years includes "third" for 3rd year students.')
    } else {
      console.log('\n✅ CSE 3rd year assignments found - student dashboard should show these!')
    }
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message)
  }
}

cleanAllTestData()
