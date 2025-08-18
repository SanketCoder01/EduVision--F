"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminHomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to registration approvals page
    router.push('/admin/registration-approvals')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
