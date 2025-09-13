// Clear all static test assignments and verify real faculty assignments
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jtguryzyprgqraimyimt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'
)

async function clearStaticAssignments() {
  console.log('🧹 CLEARING STATIC TEST ASSIGNMENTS...\n')
  
  try {
    // 1. Check all assignments
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
    
    console.log(`📚 Found ${allAssignments.length} assignments:`)
    allAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.department} - ${a.status}`)
      console.log(`      Faculty: ${a.faculty?.name || 'Unknown'} (ID: ${a.faculty_id})`)
      console.log(`      Target Years: ${JSON.stringify(a.target_years)}`)
      console.log('')
    })
    
    // 2. Identify static test assignments
    const staticAssignments = allAssignments.filter(a => 
      a.title.includes('Data Structures') ||
      a.title.includes('Algorithm Analysis') ||
      a.title.includes('Arrays and Linked Lists') ||
      a.faculty?.name === 'Dr. John Smith' ||
      a.faculty?.email?.includes('test') ||
      a.faculty_id === 'test-faculty-id' ||
      !a.faculty?.name // No real faculty
    )
    
    console.log(`🗑️ Found ${staticAssignments.length} static test assignments to remove:`)
    staticAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name || 'No Faculty'}`)
    })
    
    // 3. Delete static assignments
    if (staticAssignments.length > 0) {
      console.log('\n🗑️ Deleting static test assignments...')
      for (const assignment of staticAssignments) {
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
    console.log('\n4️⃣ Checking remaining assignments...')
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
    
    // 5. Test CSE 3rd year query
    console.log('5️⃣ Testing CSE 3rd year assignment query...')
    const { data: cse3rdAssignments, error: cse3rdError } = await supabase
      .from('assignments')
      .select(`*, faculty:faculty_id (name, email)`)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (cse3rdError) {
      console.error('❌ Error:', cse3rdError.message)
    } else {
      console.log(`🎯 CSE 3rd year students will see ${cse3rdAssignments.length} assignments:`)
      cse3rdAssignments.forEach((a, i) => {
        console.log(`   ${i + 1}. "${a.title}"`)
        console.log(`      Faculty: ${a.faculty?.name || 'Unknown'}`)
        console.log(`      Type: ${a.assignment_type}`)
        console.log(`      Due: ${a.due_date}`)
        console.log('')
      })
    }
    
    console.log('\n🎉 STATIC ASSIGNMENT CLEANUP COMPLETE!')
    console.log('\n📋 SUMMARY:')
    console.log(`   • Static assignments deleted: ${staticAssignments.length}`)
    console.log(`   • Real assignments remaining: ${remainingAssignments.length}`)
    console.log(`   • CSE 3rd year assignments: ${cse3rdAssignments?.length || 0}`)
    
    if (cse3rdAssignments?.length === 0) {
      console.log('\n⚠️ NO ASSIGNMENTS FOR CSE 3RD YEAR!')
      console.log('   Faculty need to create and publish assignments.')
      console.log('   Make sure target_years includes "third" (not "3").')
    } else {
      console.log('\n✅ Student dashboard should now show real faculty assignments!')
    }
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message)
  }
}

clearStaticAssignments()
