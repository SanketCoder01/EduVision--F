// Simple script to create test attendance sessions
const { supabase } = require('./lib/supabase')

async function createTestAttendanceSessions() {
  console.log('Creating test attendance sessions for CSE 3rd year...')
  
  try {
    // Create multiple test sessions for CSE 3rd year
    const testSessions = [
      {
        faculty_id: 'f1e2d3c4-b5a6-9788-c1d2-e3f4a5b6c7d8',
        faculty_email: 'amruta.pankade@sanjivani.edu.in',
        faculty_name: 'Amruta Pankade',
        department: 'CSE',
        year: 'third',
        class_name: 'Computer Science Engineering - 3rd Year',
        subject: 'Database Management',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '10:50',
        duration_minutes: 50,
        attendance_expiry_minutes: 15,
        session_title: 'DBMS - Normalization Concepts',
        is_active: true,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      {
        faculty_id: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f6a7b8',
        faculty_email: 'rajesh.kumar@sanjivani.edu.in',
        faculty_name: 'Rajesh Kumar',
        department: 'CSE',
        year: 'third',
        class_name: 'Computer Science Engineering - 3rd Year',
        subject: 'Operating Systems',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '11:00',
        end_time: '11:50',
        duration_minutes: 50,
        attendance_expiry_minutes: 10,
        session_title: 'OS - Process Scheduling',
        is_active: true,
        expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString()
      },
      {
        faculty_id: 'x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6',
        faculty_email: 'priya.sharma@sanjivani.edu.in',
        faculty_name: 'Priya Sharma',
        department: 'CSE',
        year: 'third',
        class_name: 'Computer Science Engineering - 3rd Year',
        subject: 'Computer Networks',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '14:50',
        duration_minutes: 50,
        attendance_expiry_minutes: 8,
        session_title: 'CN - TCP/IP Protocol Suite',
        is_active: true,
        expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString()
      }
    ]

    console.log('Inserting test sessions...')
    
    for (let i = 0; i < testSessions.length; i++) {
      const session = testSessions[i]
      console.log(`Creating session ${i + 1}: ${session.subject} by ${session.faculty_name}`)
      
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert([session])
        .select()
        .single()

      if (error) {
        console.error(`Error creating session ${i + 1}:`, error)
        
        // If table doesn't exist, try to create it first
        if (error.code === '42P01') {
          console.log('Table does not exist. Creating attendance_sessions table...')
          
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS public.attendance_sessions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              faculty_id UUID NOT NULL,
              faculty_email TEXT NOT NULL,
              faculty_name TEXT NOT NULL,
              department TEXT NOT NULL,
              year TEXT NOT NULL,
              subject TEXT NOT NULL,
              session_date DATE NOT NULL,
              start_time TIME NOT NULL,
              end_time TIME NOT NULL,
              duration_minutes INTEGER NOT NULL,
              attendance_expiry_minutes INTEGER NOT NULL DEFAULT 5,
              session_title TEXT NOT NULL,
              class_name TEXT NOT NULL,
              is_active BOOLEAN DEFAULT true,
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage sessions" 
            ON public.attendance_sessions FOR ALL 
            USING (auth.role() = 'authenticated');
            
            GRANT ALL ON public.attendance_sessions TO authenticated;
          `
          
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
          
          if (createError) {
            console.error('Error creating table:', createError)
          } else {
            console.log('Table created successfully. Retrying session creation...')
            
            // Retry creating the session
            const { data: retryData, error: retryError } = await supabase
              .from('attendance_sessions')
              .insert([session])
              .select()
              .single()
              
            if (retryError) {
              console.error(`Retry failed for session ${i + 1}:`, retryError)
            } else {
              console.log(`✓ Session ${i + 1} created successfully: ${retryData.id}`)
            }
          }
        }
      } else {
        console.log(`✓ Session ${i + 1} created successfully: ${data.id}`)
      }
    }

    // Verify sessions were created
    console.log('\nVerifying created sessions...')
    const { data: allSessions, error: fetchError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('department', 'CSE')
      .eq('year', 'third')
      .eq('is_active', true)

    if (fetchError) {
      console.error('Error fetching sessions:', fetchError)
    } else {
      console.log(`\n✓ Found ${allSessions?.length || 0} active CSE 3rd year sessions:`)
      allSessions?.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.subject} - ${session.faculty_name} (Expires: ${new Date(session.expires_at).toLocaleTimeString()})`)
      })
    }

    console.log('\n🎉 Test attendance sessions created successfully!')
    console.log('CSE 3rd year students should now see these sessions in their dashboard.')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createTestAttendanceSessions()
