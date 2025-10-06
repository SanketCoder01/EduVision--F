const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local')
  console.log('Please add your Supabase URL to .env.local file')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  console.log('Please add your Supabase service role key to .env.local file')
  console.log('You can find this in your Supabase dashboard under Settings > API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Starting migration...')
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250919-student-lists.sql', 'utf8')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        })
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} might have failed (this could be normal if table already exists):`, error.message)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error (might be normal):`, err.message)
      }
    }
    
    console.log('🎉 Migration completed!')
    
    // Test if tables were created
    console.log('🔍 Testing table creation...')
    
    const { data: tables, error: testError } = await supabase
      .from('student_lists')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Tables might not be created properly:', testError.message)
      console.log('\n📋 Manual steps:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the contents of supabase/migrations/20250919-student-lists.sql')
      console.log('4. Run the SQL manually')
    } else {
      console.log('✅ Tables created successfully!')
      console.log('🎯 You can now use the attendance system!')
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    console.log('\n📋 Manual steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of supabase/migrations/20250919-student-lists.sql')
    console.log('4. Run the SQL manually')
  }
}

applyMigration()
