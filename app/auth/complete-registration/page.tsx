"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, User, Mail, Phone, GraduationCap, Building, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import SelfieCapture from '@/components/SelfieCapture'

interface UserData {
  name: string
  email: string
  department: string
  year?: string
  mobile: string
  photo?: string
  password?: string
  confirmPassword?: string
}

const departments = [
  'Computer Science and Engineering',
  'Cyber Security',
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence and Machine Learning'
]

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']

function CompleteRegistrationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'details' | 'selfie' | 'processing' | 'welcome'>('details')
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    department: '',
    year: '',
    mobile: '',
    photo: searchParams.get('photo') || '',
    password: '',
    confirmPassword: ''
  })
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const userType = searchParams.get('type') || 'student'
  const supabase = createClient()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!userData.name.trim()) newErrors.name = 'Name is required'
    if (!userData.email.trim()) newErrors.email = 'Email is required'
    if (!userData.department) newErrors.department = 'Department is required'
    if (userType === 'student' && !userData.year) newErrors.year = 'Year is required'
    if (!userData.mobile.trim()) newErrors.mobile = 'Mobile number is required'
    if (userData.mobile && !/^\d{10}$/.test(userData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number'
    }

    // Password requirements (Supabase default: at least one lowercase, uppercase, number, and 8+ chars)
    if (!userData.password) {
      newErrors.password = 'Password is required'
    } else if (userData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else {
      const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      if (!strongPw.test(userData.password)) {
        newErrors.password = 'Password must include uppercase, lowercase, and a number'
      }
    }
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted, validating...', userData)
    
    if (validateForm()) {
      console.log('Validation passed, moving to selfie step')
      setStep('selfie')
    } else {
      console.log('Validation failed, errors:', errors)
      toast({
        title: 'Please fix the following errors',
        description: 'Check all required fields and ensure passwords match.',
        variant: 'destructive',
      })
    }
  }

  const handleSelfieCapture = (imageData: string) => {
    setCapturedImage(imageData)
    setStep('processing')
    handleRegistrationComplete(imageData)
  }

  const handleRegistrationComplete = async (faceImageData: string) => {
    setIsLoading(true)
    try {
      // Call fast server API; race with timeout to avoid UX stall
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const body = {
        userType,
        profile: {
          name: userData.name.trim(),
          email: userData.email.trim(),
          department: userData.department,
          year: userData.year,
          mobile: userData.mobile.trim(),
          photo: userData.photo || null,
        },
        faceImageData,
        password: userData.password,
      }

      // Fire-and-continue: we don't block navigation on this
      const postPromise = fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
        keepalive: true,
      }).catch(() => undefined).finally(() => clearTimeout(timeout))

      // Show welcome step with manual navigation buttons
      setStep('welcome')

    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
      setStep('selfie')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Registration</h1>
          <p className="text-gray-600">Fill in your details to get started</p>
        </div>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Select value={userData.department} onValueChange={(value) => setUserData({ ...userData, department: value })}>
                  <SelectTrigger className={`pl-10 ${errors.department ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
            </div>

            {userType === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <Select value={userData.year} onValueChange={(value) => setUserData({ ...userData, year: value })}>
                    <SelectTrigger className={`pl-10 ${errors.year ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={userData.mobile}
                  onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
                  className={`pl-10 ${errors.mobile ? "border-red-500" : ""}`}
                />
              </div>
              {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 8 characters)"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={errors.password ? "border-red-500" : ""}
                />
              </div>
              <p className="text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, and a number
              </p>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Continue to Face Capture
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderSelfieStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Face Capture</CardTitle>
          <CardDescription>
            Take a clear photo of your face for attendance and identification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelfieCapture onCapture={handleSelfieCapture} />
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep('details')} 
              className="w-full"
            >
              Back to Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderProcessingStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h3 className="text-xl font-semibold">Processing Registration</h3>
            <p className="text-gray-600">
              Please wait while we set up your account and save your information...
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderWelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-orange-600">Registration Submitted!</h3>
            <p className="text-gray-600">
              Thank you, {userData.name}! Your registration has been submitted for approval.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Pending Approval:</strong> Your account is being reviewed by administrators. 
                You'll be notified once approved.
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">Access dashboards directly:</p>
              <div className="space-y-2">
                <a 
                  href="/student-dashboard" 
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block text-sm"
                >
                  Go to Student Dashboard
                </a>
                <a 
                  href="/dashboard" 
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center block text-sm"
                >
                  Go to Faculty Dashboard
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'details' && renderDetailsStep()}
        {step === 'selfie' && renderSelfieStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'welcome' && renderWelcomeStep()}
      </AnimatePresence>
    </div>
  )
}

export default function CompleteRegistration() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CompleteRegistrationContent />
    </Suspense>
  )
}
