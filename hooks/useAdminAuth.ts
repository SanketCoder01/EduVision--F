"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
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

    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAdmin' || e.key === 'adminEmail') {
        checkAdminSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = (email: string) => {
    try {
      localStorage.setItem('adminEmail', email)
      localStorage.setItem('isAdmin', 'true')
      setIsAdmin(true)
      setAdminEmail(email)
      return true
    } catch (error) {
      console.error('Error setting admin session:', error)
      return false
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('adminEmail')
      localStorage.removeItem('isAdmin')
      setIsAdmin(false)
      setAdminEmail('')
      router.push('/admin/login')
    } catch (error) {
      console.error('Error clearing admin session:', error)
    }
  }

  const requireAuth = (redirectTo = '/admin/login') => {
    if (!isLoading && !isAdmin) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  return {
    isAdmin,
    adminEmail,
    isLoading,
    login,
    logout,
    requireAuth
  }
}
