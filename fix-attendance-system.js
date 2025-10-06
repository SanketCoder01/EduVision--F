const { createClient } = require('@supabase/supabase-js')

// Create Supabase client - replace with your actual credentials
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

// If you have environment variables set up, uncomment these:
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAttendanceSystem() {
  console.log('🔧 Fixing attendance system...')
  
  try {
    // Step 1: Create attendance_sessions table if it doesn't exist
    console.log('1. Creating attendance_sessions table...')
    
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS public.attendance_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        faculty_id TEXT NOT NULL,
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
    `
    
    // Step 2: Create attendance_records table if it doesn't exist
    console.log('2. Creating attendance_records table...')
    
    const createRecordsTable = `
      CREATE TABLE IF NOT EXISTS public.attendance_records (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id UUID NOT NULL,
        student_id TEXT NOT NULL,
        student_email TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_department TEXT NOT NULL,
        student_year TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
        marked_at TIMESTAMP WITH TIME ZONE,
        absence_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_attendance_session 
          FOREIGN KEY (session_id) 
          REFERENCES public.attendance_sessions(id) 
          ON DELETE CASCADE
      );
    `
    
    // Step 3: Set up RLS policies
    console.log('3. Setting up security policies...')
    
    const setupSecurity = `
      ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow authenticated users to manage sessions" ON public.attendance_sessions;
      DROP POLICY IF EXISTS "Allow authenticated users to manage records" ON public.attendance_records;
      
      CREATE POLICY "Allow authenticated users to manage sessions" 
      ON public.attendance_sessions FOR ALL 
      USING (auth.role() = 'authenticated');
      
      CREATE POLICY "Allow authenticated users to manage records" 
      ON public.attendance_records FOR ALL 
      USING (auth.role() = 'authenticated');
      
      GRANT ALL ON public.attendance_sessions TO authenticated;
      GRANT ALL ON public.attendance_records TO authenticated;
    `
    
    // Execute table creation (you'll need to run these in Supabase SQL editor)
    console.log('📝 Please run the following SQL in your Supabase SQL editor:')
    console.log('\n--- ATTENDANCE SYSTEM SETUP ---')
    console.log(createSessionsTable)
    console.log(createRecordsTable)
    console.log(setupSecurity)
    console.log('--- END SQL ---\n')
    
    // Step 4: Create test sessions for CSE 3rd year
    console.log('4. Creating test attendance sessions...')
    
    const testSessions = [
      {
        faculty_id: 'faculty-001',
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
        session_title: 'DBMS - Normalization and ACID Properties',
        is_active: true,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      {
        faculty_id: 'faculty-002',
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
        session_title: 'OS - Process Scheduling Algorithms',
        is_active: true,
        expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString()
      },
      {
        faculty_id: 'faculty-003',
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
        attendance_expiry_minutes: 12,
        session_title: 'CN - TCP/IP Protocol Stack',
        is_active: true,
        expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString()
      }
    ]
    
    // Try to insert test sessions
    for (let i = 0; i < testSessions.length; i++) {
      const session = testSessions[i]
      console.log(`Creating session: ${session.subject} by ${session.faculty_name}`)
      
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert([session])
        .select()
        .single()

      if (error) {
        console.error(`❌ Error creating session ${i + 1}:`, error.message)
        if (error.code === '42P01') {
          console.log('⚠️  Table does not exist. Please run the SQL commands above first.')
        }
      } else {
        console.log(`✅ Session created: ${data.id}`)
      }
    }
    
    // Verify sessions
    console.log('\n5. Verifying attendance sessions...')
    const { data: sessions, error: fetchError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('department', 'CSE')
      .eq('year', 'third')
      .eq('is_active', true)

    if (fetchError) {
      console.error('❌ Error fetching sessions:', fetchError.message)
    } else {
      console.log(`✅ Found ${sessions?.length || 0} active CSE 3rd year sessions`)
      sessions?.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.subject} - ${session.faculty_name}`)
        console.log(`     Expires: ${new Date(session.expires_at).toLocaleString()}`)
      })
    }
    
    console.log('\n🎉 Attendance system setup completed!')
    console.log('📱 CSE 3rd year students should now see attendance sessions in their dashboard.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Instructions for manual setup
console.log('🚀 ATTENDANCE SYSTEM FIX')
console.log('========================')
console.log('1. Update the Supabase credentials at the top of this file')
console.log('2. Run: node fix-attendance-system.js')
console.log('3. Copy and run the SQL commands in your Supabase SQL editor')
console.log('4. Re-run this script to create test sessions')
console.log('')

fixAttendanceSystem()
