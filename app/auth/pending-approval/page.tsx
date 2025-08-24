'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, User, Mail, GraduationCap, Phone, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AnimatedLoader from '@/components/ui/animated-loader'

interface PendingRegistration {
  id: string
  email: string
  name: string
  phone?: string
  department: string
  year?: string
  user_type: 'student' | 'faculty'
  face_url?: string
  status: string
  rejection_reason?: string
  submitted_at: string
}

export default function PendingApprovalPage() {
  const [status, setStatus] = useState<'loading' | 'pending' | 'approved' | 'rejected' | 'error'>('loading')
  const [pendingReg, setPendingReg] = useState<PendingRegistration | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const checkStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', user.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      setError('Could not verify registration status. Please try again later.')
      setStatus('error')
      return
    }

    if (!data) {
        // Check if user exists in final tables (approved and moved)
        const { data: student } = await supabase.from('students').select('id').eq('email', user.email).single();
        const { data: faculty } = await supabase.from('faculty').select('id').eq('email', user.email).single();
        
        if(student || faculty) {
            setStatus('approved');
            // Redirect immediately to dashboard
            setTimeout(() => {
              if (student) {
                router.push('/dashboard')
              } else {
                router.push('/dashboard')
              }
            }, 1000)
        } else {
            setError('Your registration is not found. It might have been rejected or there was an error. Please try registering again.')
            setStatus('error')
        }
        return;
    }

    setPendingReg(data)
    
    switch (data.status) {
      case 'approved':
        setStatus('approved')
        break
      case 'rejected':
        setRejectionReason(data.rejection_reason)
        setStatus('rejected')
        break
      default:
        setStatus('pending')
    }
  }, [supabase, router])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  useEffect(() => {
    if (status !== 'approved') return

    const timer = setTimeout(() => {
      if (pendingReg?.user_type === 'student') {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [status, router, pendingReg])
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            checkStatus();
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [supabase, checkStatus]);


  if (status === 'loading') {
    return <AnimatedLoader />
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/student-registration')}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4">Registration Rejected</CardTitle>
            <CardDescription>
              {rejectionReason || 'Your registration has been rejected by the administrator.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/student-registration')}>Register Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4">Registration Approved!</CardTitle>
            <CardDescription>
              Redirecting you to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <Button 
              onClick={() => {
                if (pendingReg?.user_type === 'student') {
                  router.push('/dashboard')
                } else {
                  router.push('/dashboard')
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Dashboard Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Registration Under Review
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Your application is being reviewed by our admin team
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {pendingReg && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                    <AvatarImage src={pendingReg.face_url} alt={pendingReg.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                      {pendingReg.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">{pendingReg.name}</h3>
                      <Badge className={`${
                        pendingReg.user_type === 'student' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}>
                        {pendingReg.user_type === 'student' ? 'Student' : 'Faculty'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{pendingReg.email}</span>
                      </div>
                      
                      {pendingReg.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{pendingReg.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>{pendingReg.department}</span>
                      </div>
                      
                      {pendingReg.year && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{pendingReg.year} Year</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(pendingReg.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-amber-600 mt-0.5" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 mb-2">What happens next?</p>
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span>Admin reviews your registration details</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span>You'll receive an email notification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span>Access to your dashboard upon approval</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={checkStatus}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Status
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg"
              >
                Refresh Page
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <p className="font-medium">Need help?</p>
              <p className="mt-1">Contact admin if you have questions about your registration status</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
