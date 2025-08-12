import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_PASS

    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
        supabaseKey: supabaseKey ? 'Set' : 'Not set',
        gmailUser: gmailUser ? 'Set' : 'Not set',
        gmailPass: gmailPass ? 'Set' : 'Not set'
      },
      supabaseUrl: supabaseUrl,
      supabaseKeyPrefix: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not set'
    })
  } catch (error) {
    console.error('Environment test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 