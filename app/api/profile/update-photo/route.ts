import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, photo, user_type = 'faculty' } = body

    if (!user_id || !photo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine which table to update
    const tableName = user_type === 'student' ? 'students' : 'faculty'

    // Update the photo in the database
    const { data, error } = await supabase
      .from(tableName)
      .update({
        face_url: photo,
        photo: photo,
        avatar: photo,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating photo:', error)
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo updated successfully',
      data
    })
  } catch (error) {
    console.error('Error in update-photo API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
