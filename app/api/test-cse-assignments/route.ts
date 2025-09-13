import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  console.log('🧪 Testing CSE 3rd Year Assignment Flow...')

  try {
    // Step 1: Create a test assignment for CSE 3rd year
    console.log('📝 Step 1: Creating test assignment for CSE 3rd year...')
    
    const testAssignment = {
      title: 'Test Assignment - Data Structures',
      description: 'Test assignment to verify real-time flow for CSE 3rd year students',
      faculty_id: 'test-faculty-id',
      department: 'CSE',
      target_years: ['third'],
      assignment_type: 'coding' as const,
      max_marks: 100,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published' as const,
      created_at: new Date().toISOString()
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert([testAssignment])
      .select()
      .single()

    if (assignmentError) {
      console.error('❌ Error creating test assignment:', assignmentError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create test assignment',
        details: assignmentError 
      })
    }

    console.log('✅ Test assignment created:', assignment.id)

    // Step 2: Test fetching assignments for CSE 3rd year student
    console.log('📚 Step 2: Testing assignment fetch for CSE 3rd year student...')
    
    const { data: assignments, error: fetchError } = await supabase
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

    if (fetchError) {
      console.error('❌ Error fetching assignments:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch assignments',
        details: fetchError 
      })
    }

    console.log(`✅ Found ${assignments.length} assignments for CSE 3rd year`)
    
    // Check if our test assignment is included
    const testAssignmentFound = assignments.find(a => a.id === assignment.id)
    const assignmentFoundStatus = testAssignmentFound ? 'FOUND' : 'NOT_FOUND'

    // Step 3: Test the SupabaseAssignmentService method
    console.log('🔧 Step 3: Testing SupabaseAssignmentService.getStudentAssignments...')
    
    // Import and test the service method
    const { SupabaseAssignmentService } = await import('../../../lib/supabase-assignments')
    const serviceAssignments = await SupabaseAssignmentService.getStudentAssignments('CSE', 'third')
    
    const serviceTestFound = serviceAssignments.find(a => a.id === assignment.id)
    const serviceFoundStatus = serviceTestFound ? 'FOUND' : 'NOT_FOUND'

    // Step 4: Cleanup - Remove test assignment
    console.log('🧹 Step 4: Cleaning up test data...')
    
    const { error: deleteError } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignment.id)

    if (deleteError) {
      console.error('❌ Error cleaning up:', deleteError)
    } else {
      console.log('✅ Test assignment cleaned up')
    }

    // Return test results
    const results = {
      success: true,
      testResults: {
        assignmentCreated: true,
        assignmentId: assignment.id,
        directQueryResults: {
          totalAssignments: assignments.length,
          testAssignmentFound: assignmentFoundStatus
        },
        serviceMethodResults: {
          totalAssignments: serviceAssignments.length,
          testAssignmentFound: serviceFoundStatus
        },
        cleanupCompleted: !deleteError
      },
      summary: {
        assignmentCreation: '✅ PASS',
        directQuery: assignmentFoundStatus === 'FOUND' ? '✅ PASS' : '❌ FAIL',
        serviceMethod: serviceFoundStatus === 'FOUND' ? '✅ PASS' : '❌ FAIL',
        cleanup: !deleteError ? '✅ PASS' : '❌ FAIL'
      }
    }

    console.log('🎉 CSE 3rd Year Assignment Flow Test Completed!')
    console.log('Results:', JSON.stringify(results.summary, null, 2))

    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Test execution failed',
      details: error 
    })
  }
}
