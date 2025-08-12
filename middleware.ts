import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/api/auth/*',
  '/_next/*',
  '/favicon.ico',
  '/auth/*',
  '/faculty/face-capture',
  '/student/face-capture'
]

// Define role-based paths
const studentPaths = ['/student-dashboard']
const facultyPaths = ['/dashboard', '/faculty-dashboard']

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const isPublicPath = publicPaths.some(path => 
    path.endsWith('*') ? pathname.startsWith(path.slice(0, -1)) : pathname === path
  )

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get authentication data from cookies (simplified approach)
  const authToken = req.cookies.get('auth_token')
  const userType = req.cookies.get('user_type')
  const userEmail = req.cookies.get('user_email')
  const userData = req.cookies.get('user_data')
  
  let user = null
  
  // Check if user is authenticated using multiple methods
  if (authToken && userType) {
    user = {
      userType: userType.value,
      email: userEmail?.value || '',
      authenticated: true
    }
    console.log('Middleware: User authenticated via auth_token:', user.userType)
  } else if (userData) {
    try {
      const decodedData = atob(userData.value)
      const [type, email, name] = decodedData.split('|')
      user = {
        userType: type,
        email: email,
        name: name,
        authenticated: true
      }
      console.log('Middleware: User authenticated via user_data:', user.userType)
    } catch (error) {
      console.error('Middleware: Error parsing user_data:', error)
      user = null
    }
  } else {
    console.log('Middleware: No authentication cookies found')
  }

  // If user is not logged in, redirect to appropriate login page
  if (!user) {
    console.log('Middleware: User not authenticated, redirecting to login')
    console.log('Middleware: Pathname:', pathname)
    console.log('Middleware: Faculty paths:', facultyPaths)
    // If trying to access faculty area, redirect to faculty login
    if (facultyPaths.some(path => pathname.startsWith(path))) {
      console.log('Middleware: Redirecting to faculty login')
      return NextResponse.redirect(new URL('/login?type=faculty', req.url))
    }
    // Default to student login
    console.log('Middleware: Redirecting to student login')
    return NextResponse.redirect(new URL('/login?type=student', req.url))
  }

  // Get user role
  const userRole = user.userType || 'student'
  console.log('Middleware: User authenticated as:', userRole)
  console.log('Middleware: Accessing path:', pathname)
  
  // If student trying to access faculty area, redirect to student dashboard
  if (userRole === 'student' && facultyPaths.some(path => pathname.startsWith(path))) {
    console.log('Middleware: Student accessing faculty area, redirecting to student dashboard')
    return NextResponse.redirect(new URL('/student-dashboard', req.url))
  }
  
  // If faculty trying to access student area, redirect to faculty dashboard
  if (userRole === 'faculty' && studentPaths.some(path => pathname.startsWith(path))) {
    console.log('Middleware: Faculty accessing student area, redirecting to faculty dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  console.log('Middleware: Allowing access to:', pathname)

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
