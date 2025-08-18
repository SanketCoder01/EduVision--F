"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import AdminNav from '@/components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check for admin session
    const checkAdminSession = () => {
      try {
        const adminSession = localStorage.getItem('isAdmin')
        const email = localStorage.getItem('adminEmail')
        
        if (adminSession === 'true' && email) {
          setIsAdmin(true)
          setAdminEmail(email)
        } else {
          setIsAdmin(false)
          setAdminEmail('')
        }
      } catch (error) {
        console.error('Error checking admin session:', error)
        setIsAdmin(false)
        setAdminEmail('')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminSession()
  }, [])

  useEffect(() => {
    // Only redirect if not on login page and not authenticated
    if (!isLoading && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isLoading, isAdmin, pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminEmail')
    setIsAdmin(false)
    setAdminEmail('')
    router.push('/admin/login')
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Don't show layout if not authenticated
  if (!isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">
                EduVision Admin
              </h1>
              <AdminNav />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{adminEmail}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
