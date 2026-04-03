import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/student-login',
  '/faculty-registration',
  '/student-registration',
  '/auth/callback',
  '/auth/check-email',
  '/api/auth',
  '/api/webhooks',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

// Routes that require faculty authentication
const facultyRoutes = [
  '/dashboard',
]

// Routes that require student authentication  
const studentRoutes = [
  '/student-dashboard',
]

// Admin routes
const adminRoutes = [
  '/admin',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return res
  }

  // Allow static files
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return res
  }

  // Security headers for all responses
  res.headers.set('X-DNS-Prefetch-Control', 'on')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://jtguryzyprgqraimyimt.supabase.co wss://jtguryzyprgqraimyimt.supabase.co https://api.groq.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()
  
  res.headers.set('Content-Security-Policy', cspHeader)

  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    // No session - redirect to appropriate login
    if (!session) {
      const loginType = facultyRoutes.some(r => pathname.startsWith(r)) ? 'faculty' : 
                       studentRoutes.some(r => pathname.startsWith(r)) ? 'student' : ''
      
      if (loginType) {
        const redirectUrl = new URL(`/login?type=${loginType}`, req.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check role-based access using email domain
    const userEmail = session.user.email || ''
    const isSanjivaniEmail = userEmail.endsWith('@sanjivani.edu.in') || userEmail.endsWith('@set.sanjivani.edu.in')
    const isStudentEmail = userEmail.endsWith('@sanjivani.edu.in') && !userEmail.endsWith('@set.sanjivani.edu.in')
    const isCafeEmail = userEmail.endsWith('@cafe.in')
    
    // Look for user_metadata.user_type if it exists (set by our trigger/auth config)
    const userType = session.user.user_metadata?.user_type || session.user.app_metadata?.user_type

    // Faculty routes protection
    if (facultyRoutes.some(r => pathname.startsWith(r))) {
      // Block cafe emails from faculty dashboard
      if (isCafeEmail) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      // We allow anyone with a sanjivani email or explicitly tagged as faculty
      if (!isSanjivaniEmail && userType !== 'faculty') {
        return NextResponse.redirect(new URL('/student-dashboard', req.url))
      }
    }

    // Student routes protection
    if (studentRoutes.some(r => pathname.startsWith(r))) {
      // Block cafe emails from student dashboard
      if (isCafeEmail) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      // Only allow student emails
      if (!isStudentEmail) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Admin routes protection
    if (adminRoutes.some(r => pathname.startsWith(r))) {
      const userType = session.user.user_metadata?.user_type || 
                      session.user.app_metadata?.user_type
      if (userType !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow request to continue but log it
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
