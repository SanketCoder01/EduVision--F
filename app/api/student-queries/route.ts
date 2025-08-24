import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is faculty or student
    const { data: facultyData } = await supabase
      .from('faculty')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let queries
    if (facultyData) {
      // Faculty can see all queries
      const { data, error } = await supabase
        .from('student_queries')
        .select(`
          *,
          student:student_id (
            name,
            email,
            department,
            year
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      queries = data
    } else {
      // Students can only see their own queries
      const { data, error } = await supabase
        .from('student_queries')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      queries = data
    }

    return NextResponse.json({ success: true, data: queries })
  } catch (error) {
    console.error('Error fetching queries:', error)
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query_text, category = 'general', priority = 'medium' } = body

    if (!query_text?.trim()) {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('student_queries')
      .insert({
        student_id: user.id,
        query_text: query_text.trim(),
        category,
        priority,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating query:', error)
    return NextResponse.json({ error: 'Failed to create query' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is faculty
    const { data: facultyData } = await supabase
      .from('faculty')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!facultyData) {
      return NextResponse.json({ error: 'Only faculty can reply to queries' }, { status: 403 })
    }

    const body = await request.json()
    const { query_id, reply_text, status = 'replied' } = body

    if (!query_id || !reply_text?.trim()) {
      return NextResponse.json({ error: 'Query ID and reply text are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('student_queries')
      .update({
        faculty_id: user.id,
        reply_text: reply_text.trim(),
        status,
        replied_at: new Date().toISOString()
      })
      .eq('id', query_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error replying to query:', error)
    return NextResponse.json({ error: 'Failed to reply to query' }, { status: 500 })
  }
}
