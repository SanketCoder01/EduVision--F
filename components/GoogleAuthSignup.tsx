"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, User, Mail, Phone, GraduationCap, Building } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface GoogleAuthSignupProps {
  userType: 'student' | 'faculty'
  onComplete: (userData: any) => void
  onBack: () => void
}

interface UserData {
  name: string
  email: string
  department: string
  year?: string
  mobile: string
  photo?: string
}

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Management Studies'
]

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function GoogleAuthSignup({ userType, onComplete, onBack }: GoogleAuthSignupProps) {
  const [step, setStep] = useState<'auth' | 'details' | 'selfie' | 'loading' | 'welcome'>('auth')
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    department: '',
    year: '',
    mobile: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        // Validate email domain
        const isValidDomain = validateEmailDomain(user.email, userType)
        if (isValidDomain) {
          setUserData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.user_metadata?.full_name || ''
          }))
          setStep('details')
        } else {
          setError(`Invalid email domain. ${userType === 'student' ? '@sanjivani.edu.in' : '@set or @sanjivani'} required.`)
          await supabase.auth.signOut()
        }
      }
    }
    checkUser()
  }, [supabase, userType])

  const validateEmailDomain = (email: string, type: 'student' | 'faculty'): boolean => {
    if (type === 'student') {
      return email.endsWith('@sanjivani.edu.in')
    } else {
      return email.endsWith('@set') || email.endsWith('@sanjivani')
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData.name || !userData.department || !userData.mobile) {
      setError('Please fill in all required fields')
      return
    }
    if (userType === 'student' && !userData.year) {
      setError('Please select your year')
      return
    }
    setStep('selfie')
  }

  const handleSelfieCapture = (photoData: string) => {
    setUserData(prev => ({ ...prev, photo: photoData }))
    setStep('loading')
    
    // Simulate loading for 5 seconds
    setTimeout(() => {
      setStep('welcome')
      setTimeout(() => {
        onComplete(userData)
      }, 3000)
    }, 5000)
  }

  const saveUserData = async () => {
    try {
      const { data, error } = await supabase
        .from(userType === 'student' ? 'students' : 'faculty')
        .insert([{
          email: userData.email,
          name: userData.name,
          department: userData.department,
          year: userData.year,
          mobile: userData.mobile,
          photo: userData.photo,
          created_at: new Date().toISOString()
        }])

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error saving user data:', error)
      throw error
    }
  }

  if (step === 'selfie') {
    return <SelfieCapture onCapture={handleSelfieCapture} onBack={() => setStep('details')} />
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-900"
          >
            Processing your registration...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-gray-600"
          >
            Please wait while we set up your account
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-gray-900"
          >
            Welcome, {userData.name}! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-gray-600"
          >
            Your {userType} account has been successfully created!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-sm text-gray-500"
          >
            Redirecting to your dashboard...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto"
              >
                {userType === 'student' ? <User className="w-8 h-8 text-white" /> : <Building className="w-8 h-8 text-white" />}
              </motion.div>
              <CardTitle className="text-2xl">
                {step === 'auth' ? `${userType === 'student' ? 'Student' : 'Faculty'} Signup` : 'Complete Your Profile'}
              </CardTitle>
              <CardDescription>
                {step === 'auth' 
                  ? `Sign up with your ${userType === 'student' ? '@sanjivani.edu.in' : '@set or @sanjivani'} email`
                  : 'Please provide your details to complete registration'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 'auth' ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </Button>
                  <div className="text-center">
                    <Button variant="ghost" onClick={onBack} className="text-blue-600 hover:text-blue-700">
                      ← Back to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={userData.name}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        className="pl-10 h-12 border-gray-200 bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                      Department *
                    </Label>
                    <Select value={userData.department} onValueChange={(value) => setUserData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {userType === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-sm font-medium text-gray-700">
                        Academic Year *
                      </Label>
                      <Select value={userData.year} onValueChange={(value) => setUserData(prev => ({ ...prev, year: value }))}>
                        <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                      Mobile Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={userData.mobile}
                        onChange={(e) => setUserData(prev => ({ ...prev, mobile: e.target.value }))}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Continue to Photo Capture
                  </Button>

                  <div className="text-center">
                    <Button variant="ghost" onClick={() => setStep('auth')} className="text-blue-600 hover:text-blue-700">
                      ← Back to Authentication
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
