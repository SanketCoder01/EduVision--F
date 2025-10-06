const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for migrations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('Applying attendance system migration...')
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250919-student-lists.sql', 'utf8')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration failed:', error)
      return false
    }
    
    console.log('Migration applied successfully!')
    return true
  } catch (error) {
    console.error('Error applying migration:', error)
    return false
  }
}

async function createTestSession() {
  try {
    console.log('Creating test attendance session for CSE 3rd year...')
    
    const testSession = {
      faculty_id: crypto.randomUUID(),
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
      attendance_expiry_minutes: 10,
      session_title: 'DBMS Lecture - Normalization',
      is_active: true,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([testSession])
      .select()
      .single()

    if (error) {
      console.error('Error creating test session:', error)
      return false
    }

    console.log('Test session created successfully!')
    console.log('Session ID:', data.id)
    console.log('Subject:', data.subject)
    console.log('Faculty:', data.faculty_name)
    console.log('Expires at:', data.expires_at)
    
    return true
  } catch (error) {
    console.error('Error creating test session:', error)
    return false
  }
}

async function main() {
  console.log('Starting attendance system fix...')
  
  // First try to create a test session to see if tables exist
  const sessionCreated = await createTestSession()
  
  if (!sessionCreated) {
    console.log('Tables don\'t exist, applying migration...')
    const migrationSuccess = await applyMigration()
    
    if (migrationSuccess) {
      console.log('Migration successful, creating test session...')
      await createTestSession()
    }
  }
  
  console.log('Attendance system fix completed!')
}

main()
