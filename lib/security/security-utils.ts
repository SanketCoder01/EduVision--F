/**
 * SECURITY UTILITIES FOR EDUVISION
 * Comprehensive security measures for data protection
 */

// Input sanitization
export function sanitizeInput(input: string): string {
  if (!input) return input
  return input
    .replace(/[<>]/g, '') // Remove potential XSS tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
}

// SQL injection prevention - escape special characters
export function escapeSql(input: string): string {
  if (!input) return input
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
}

// Validate email format and domain
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  // Only allow university emails
  if (!email.endsWith('@sanjivani.edu.in')) {
    return { valid: false, error: 'Only @sanjivani.edu.in emails are allowed' }
  }
  
  return { valid: true }
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}

// Rate limiting helper (in-memory, for production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
}

// CSRF token generation and validation
export function generateCsrfToken(): string {
  return generateSecureToken(48)
}

export function validateCsrfToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  return token === sessionToken
}

// Secure headers for API responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
}

// Log security events (in production, send to monitoring service)
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'csrf_failure' | 'suspicious_input' | 'unauthorized_access'
  userId?: string
  ip?: string
  userAgent?: string
  details?: string
}): void {
  console.warn('[SECURITY]', {
    timestamp: new Date().toISOString(),
    ...event
  })
}

// Validate file upload
export function validateFileUpload(file: {
  name: string
  type: string
  size: number
}): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
  ]
  
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }
  
  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar']
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (suspiciousExtensions.includes(ext)) {
    return { valid: false, error: 'Suspicious file extension detected' }
  }
  
  return { valid: true }
}

// Mask sensitive data for logging
export function maskSensitiveData(data: string, type: 'email' | 'phone' | 'prn' | 'password'): string {
  switch (type) {
    case 'email':
      const [local, domain] = data.split('@')
      return `${local.slice(0, 2)}***@${domain}`
    case 'phone':
      return data.slice(0, 3) + '***' + data.slice(-3)
    case 'prn':
      return data.slice(0, 4) + '***' + data.slice(-3)
    case 'password':
      return '***'
    default:
      return '***'
  }
}

// Environment variable validation
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  return { valid: missing.length === 0, missing }
}

// Get secure API key (never expose in client)
export function getSecureApiKey(keyName: string): string | undefined {
  // Only allow server-side access
  if (typeof window !== 'undefined') {
    console.error('Attempted to access secure API key from client')
    return undefined
  }
  
  return process.env[keyName]
}
