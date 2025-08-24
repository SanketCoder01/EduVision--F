"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MailCheck, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CheckEmailPage() {
  const router = useRouter()
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'loading'>('loading')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const checkApprovalStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        router.push('/login')
        return
      }

      setUserEmail(user.email)

      // Check if user is already approved and has access
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('email', user.email)
        .single()

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', user.email)
        .single()

      if (studentData || facultyData) {
        setApprovalStatus('approved')
        return
      }

      // Check pending registration status
      const { data: pendingData } = await supabase
        .from('pending_registrations')
        .select('status')
        .eq('email', user.email)
        .single()

      if (pendingData) {
        if (pendingData.status === 'approved') {
          setApprovalStatus('approved')
        } else if (pendingData.status === 'rejected') {
          setApprovalStatus('rejected')
        } else {
          setApprovalStatus('pending')
        }
      } else {
        setApprovalStatus('pending')
      }
    }

    checkApprovalStatus()
    
    // Poll every 30 seconds for status updates
    const interval = setInterval(checkApprovalStatus, 30000)
    return () => clearInterval(interval)
  }, [router])

  const handleGoToDashboard = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      router.push('/login')
      return
    }

    // Check if user is a student or faculty
    const { data: studentData } = await supabase
      .from('students')
      .select('id')
      .eq('email', user.email)
      .single()

    const { data: facultyData } = await supabase
      .from('faculty')
      .select('id')
      .eq('email', user.email)
      .single()

    if (studentData || facultyData) {
      router.push('/dashboard')
    } else {
      // Check department-specific student tables
      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st_year', '2nd_year', '3rd_year', '4th_year']
      
      for (const dept of departments) {
        for (const year of years) {
          const { data } = await supabase
            .from(`students_${dept}_${year}`)
            .select('id')
            .eq('email', user.email)
            .single()
          
          if (data) {
            router.push('/dashboard')
            return
          }
        }
      }
      
      // Default to regular dashboard if no specific match
      router.push('/dashboard')
    }
  }

  if (approvalStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 shadow-lg">
              {approvalStatus === 'pending' && <Clock className="h-8 w-8 text-blue-600" />}
              {approvalStatus === 'approved' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {approvalStatus === 'rejected' && <MailCheck className="h-8 w-8 text-red-600" />}
            </div>
            
            {approvalStatus === 'pending' && (
              <>
                <CardTitle className="mt-4 text-2xl font-bold text-gray-800">Registration Submitted!</CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  Your registration is pending admin approval. You'll be notified once it's reviewed.
                </CardDescription>
              </>
            )}
            
            {approvalStatus === 'approved' && (
              <>
                <CardTitle className="mt-4 text-2xl font-bold text-green-800">Registration Approved!</CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  Congratulations! Your registration has been approved. You can now access your dashboard.
                </CardDescription>
              </>
            )}
            
            {approvalStatus === 'rejected' && (
              <>
                <CardTitle className="mt-4 text-2xl font-bold text-red-800">Registration Rejected</CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  Your registration was not approved. Please contact the admin for more information.
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {approvalStatus === 'pending' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">Status: Pending Review</p>
                  <p className="text-xs text-blue-600 mt-1">
                    This page will automatically update when your status changes.
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    onClick={handleGoToDashboard}
                    variant="outline"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2">
                      Continue to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>
                </motion.div>
              </div>
            )}
            
            {approvalStatus === 'approved' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </motion.div>
            )}
            
            {approvalStatus === 'rejected' && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium">Please contact support</p>
                <p className="text-xs text-red-600 mt-1">
                  Email: admin@sanjivani.edu.in
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4">
              Registered with: {userEmail}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
