import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('Fixing database tables...')
    const supabase = createClient()
    
    // Read the SQL script
    const sqlPath = path.join(process.cwd(), 'scripts', 'fix-tables.sql')
    const sqlScript = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)
    
    const results = []
    
    // Execute each statement separately
    for (const statement of statements) {
      try {
        // Try direct query
        const { error } = await supabase.from('_sql').rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.error(`Error executing statement: ${statement}`, error)
          results.push({ statement, success: false, error: error.message })
        } else {
          results.push({ statement, success: true })
        }
      } catch (error) {
        console.error(`Error executing statement: ${statement}`, error)
        results.push({ statement, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    // Try direct table creation if RPC method fails
    if (results.some(r => !r.success)) {
      try {
        // Create students table directly
        const { error: studentsError } = await supabase.rpc('create_students_table', {})
        
        // Create faculty table directly
        const { error: facultyError } = await supabase.rpc('create_faculty_table', {})
        
        results.push({ 
          method: 'rpc_functions', 
          students: studentsError ? { success: false, error: studentsError.message } : { success: true },
          faculty: facultyError ? { success: false, error: facultyError.message } : { success: true }
        })
      } catch (directError) {
        console.error('Direct table creation failed:', directError)
        results.push({ method: 'rpc_functions', success: false, error: directError instanceof Error ? directError.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables fixed',
      results
    })
  } catch (error) {
    console.error('Database fix error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}