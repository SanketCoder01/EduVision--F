"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface RegistrationStatusCheckerProps {
  email: string
  onApproved: () => void
}

export default function RegistrationStatusChecker({ email, onApproved }: RegistrationStatusCheckerProps) {
  const [checking, setChecking] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    const checkStatus = async () => {
      if (checking) return
      
      setChecking(true)
      try {
        const { data, error } = await supabase
          .from('pending_registrations')
          .select('status')
          .eq('email', email)
          .single()

        if (data?.status === 'approved') {
          toast({
            title: 'Registration Approved! 🎉',
            description: 'Your account has been approved. Redirecting to login...',
          })
          clearInterval(interval)
          setTimeout(() => {
            onApproved()
            router.push('/auth/login')
          }, 2000)
        } else if (data?.status === 'rejected') {
          toast({
            title: 'Registration Rejected',
            description: 'Your registration was rejected. Please contact admin.',
            variant: 'destructive'
          })
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Error checking status:', error)
      } finally {
        setChecking(false)
      }
    }

    // Check immediately and then every 5 seconds
    checkStatus()
    interval = setInterval(checkStatus, 5000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [email, onApproved, router, supabase, checking])

  return null
}
