import { supabase } from './lib/supabase'

async function testAttendanceDatabase() {
  console.log('Testing attendance database...')
  
  try {
    // Check if attendance_sessions table exists and has data
    console.log('\n1. Checking attendance_sessions table...')
    const { data: sessions, error: sessionsError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .limit(5)
    
    if (sessionsError) {
      console.error('Error querying attendance_sessions:', sessionsError)
      console.log('This likely means the table does not exist or migration was not applied')
    } else {
      console.log(`Found ${sessions?.length || 0} attendance sessions`)
      if (sessions && sessions.length > 0) {
        console.log('Sample session:', sessions[0])
      }
    }

    // Check specifically for CSE third year sessions
    console.log('\n2. Checking CSE third year sessions...')
    const { data: cseSessions, error: cseError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('department', 'CSE')
      .eq('year', 'third')
    
    if (cseError) {
      console.error('Error querying CSE third year sessions:', cseError)
    } else {
      console.log(`Found ${cseSessions?.length || 0} CSE third year sessions`)
      cseSessions?.forEach((session, index) => {
        console.log(`Session ${index + 1}:`, {
          id: session.id,
          subject: session.subject,
          faculty_name: session.faculty_name,
          is_active: session.is_active,
          expires_at: session.expires_at,
          created_at: session.created_at
        })
      })
    }

    // Check attendance_records table
    console.log('\n3. Checking attendance_records table...')
    const { data: records, error: recordsError } = await supabase
      .from('attendance_records')
      .select('*')
      .limit(5)
    
    if (recordsError) {
      console.error('Error querying attendance_records:', recordsError)
    } else {
      console.log(`Found ${records?.length || 0} attendance records`)
    }

    // Check if we can create a test session
    console.log('\n4. Testing session creation for CSE third year...')
    const testSession = {
      faculty_id: 'test-faculty-id',
      faculty_email: 'test@sanjivani.edu.in',
      faculty_name: 'Test Faculty',
      department: 'CSE',
      year: 'third',
      class_name: 'Computer Science Engineering - 3rd Year',
      subject: 'Database Management',
      session_date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '10:50',
      duration_minutes: 50,
      attendance_expiry_minutes: 5,
      session_title: 'Test Session',
      is_active: true,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }

    const { data: newSession, error: createError } = await supabase
      .from('attendance_sessions')
      .insert([testSession])
      .select()
      .single()

    if (createError) {
      console.error('Error creating test session:', createError)
    } else {
      console.log('Successfully created test session:', newSession.id)
      
      // Clean up - delete the test session
      await supabase
        .from('attendance_sessions')
        .delete()
        .eq('id', newSession.id)
      console.log('Test session cleaned up')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testAttendanceDatabase()
