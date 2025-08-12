import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { sql } = await request.json()
    
    if (!sql) {
      return NextResponse.json({
        success: false,
        error: 'SQL statement is required'
      }, { status: 400 })
    }
    
    // Try to execute the SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error executing SQL:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error in execute-sql endpoint:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}