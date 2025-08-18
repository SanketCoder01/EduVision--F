"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const checkAuth = () => {
      try {
        const adminSession = localStorage.getItem('isAdmin')
        const adminEmail = localStorage.getItem('adminEmail')
        
        if (adminSession === 'true' && adminEmail) {
          // Already logged in, redirect to admin dashboard
          router.push('/admin/registration-approvals')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Check if email is in allowed admin list
      const allowedAdminEmails = [
        'sanket.gaikwad_24uce@sanjivani.edu.in',
        'admin@sanjivani.edu.in',
        'test@admin.sanjivani.edu.in'
      ]
      
      const isAdminEmail = email.endsWith('@admin.sanjivani.edu.in') || 
                          allowedAdminEmails.includes(email)

      if (!isAdminEmail) {
        setError('Access denied. Only admin emails are allowed.')
        return
      }

      // For demo purposes, allow any password for admin emails
      // In production, you should implement proper authentication
      if (isAdminEmail) {
        // Set admin session in localStorage
        localStorage.setItem('adminEmail', email)
        localStorage.setItem('isAdmin', 'true')
        
        // Force a small delay to ensure localStorage is set
        setTimeout(() => {
          // Redirect to admin dashboard
          router.push('/admin/registration-approvals')
        }, 100)
      } else {
        setError('Invalid admin credentials')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Access the EduVision admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Admin Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sanjivani.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In as Admin'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Demo Admin Emails:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• sanket.gaikwad_24uce@sanjivani.edu.in</li>
              <li>• admin@sanjivani.edu.in</li>
              <li>• test@admin.sanjivani.edu.in</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Any password will work for demo purposes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
