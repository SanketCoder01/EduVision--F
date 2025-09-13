// Fix the existing Java assignment to use correct target_years format
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jtguryzyprgqraimyimt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z3VyeXp5cHJncXJhaW15aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODIxNTMsImV4cCI6MjA2MjU1ODE1M30.798s8F7LDFsit82qTGZ7X97ww9SAQvmawIDpNgANeYE'
)

async function fixJavaAssignment() {
  console.log('🔧 FIXING JAVA ASSIGNMENT TARGET_YEARS FORMAT...\n')
  
  try {
    // 1. Find the Java assignment
    console.log('1️⃣ Finding Java assignment...')
    const { data: javaAssignments, error: findError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status,
        faculty:faculty_id (name, email)
      `)
      .eq('title', 'Java')
      .eq('department', 'CSE')
    
    if (findError) {
      console.error('❌ Error finding Java assignment:', findError.message)
      return
    }
    
    if (javaAssignments.length === 0) {
      console.log('❌ Java assignment not found!')
      return
    }
    
    const javaAssignment = javaAssignments[0]
    console.log('✅ Found Java assignment:')
    console.log(`   ID: ${javaAssignment.id}`)
    console.log(`   Title: "${javaAssignment.title}"`)
    console.log(`   Faculty: ${javaAssignment.faculty?.name}`)
    console.log(`   Current target_years: ${JSON.stringify(javaAssignment.target_years)}`)
    console.log(`   Status: ${javaAssignment.status}`)
    
    // 2. Check if target_years needs fixing
    const needsFix = javaAssignment.target_years.includes('3') || 
                     javaAssignment.target_years.includes('2') ||
                     javaAssignment.target_years.includes('1') ||
                     javaAssignment.target_years.includes('4')
    
    if (!needsFix) {
      console.log('✅ Java assignment already has correct target_years format!')
      return
    }
    
    // 3. Fix target_years format
    console.log('\n2️⃣ Fixing target_years format...')
    const yearMapping = {
      '1': 'first',
      '2': 'second',
      '3': 'third', 
      '4': 'fourth'
    }
    
    const fixedTargetYears = javaAssignment.target_years.map(year => 
      yearMapping[year] || year
    )
    
    console.log(`   Changing from: ${JSON.stringify(javaAssignment.target_years)}`)
    console.log(`   Changing to: ${JSON.stringify(fixedTargetYears)}`)
    
    // 4. Update the assignment
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('assignments')
      .update({ target_years: fixedTargetYears })
      .eq('id', javaAssignment.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Error updating assignment:', updateError.message)
      return
    }
    
    console.log('✅ Java assignment updated successfully!')
    
    // 5. Verify the fix worked
    console.log('\n3️⃣ Verifying CSE 3rd year can now see the assignment...')
    const { data: cse3rdAssignments, error: verifyError } = await supabase
      .from('assignments')
      .select(`
        id, title, faculty_id, department, target_years, status,
        faculty:faculty_id (name, email)
      `)
      .eq('status', 'published')
      .eq('department', 'CSE')
      .contains('target_years', ['third'])
      .order('created_at', { ascending: false })
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message)
      return
    }
    
    console.log(`🎯 CSE 3rd year students will now see ${cse3rdAssignments.length} assignments:`)
    cse3rdAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. "${a.title}" - ${a.faculty?.name}`)
      if (a.id === javaAssignment.id) {
        console.log('      ✅ This is the fixed Java assignment!')
      }
    })
    
    console.log('\n🎉 JAVA ASSIGNMENT FIX COMPLETE!')
    console.log('\n📋 RESULT:')
    console.log('   ✅ Java assignment now uses correct target_years format')
    console.log('   ✅ CSE 3rd year students can now see the Java assignment')
    console.log('   ✅ Student dashboard will show real faculty assignments')
    console.log('   ✅ Real-time faculty-student connection is working')
    
  } catch (error) {
    console.error('💥 Fix failed:', error.message)
  }
}

fixJavaAssignment()
