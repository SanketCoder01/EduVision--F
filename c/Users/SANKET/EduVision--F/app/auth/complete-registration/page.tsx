'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, User, Mail, Phone, GraduationCap, Building, CheckCircle, Loader2, RotateCcw } from 'lucide-react'
import Webcam from 'react-webcam'

interface UserData {
  name: string
  email: string
  department: string
  year: string
  mobile: string
  photo: string
  password: string
  confirmPassword: string
}

const departments = ['CSE', 'Cyber', 'AIDS', 'AIML']
const years = ['1st', '2nd', '3rd', '4th']

function CompleteRegistrationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'details' | 'camera' | 'processing'>('details')
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
  const [faceDetected, setFaceDetected] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const userType = searchParams.get('type') || 'student'
  const supabase = createClient()

  // Simple face detection (you can enhance this with actual face detection)
  const detectFace = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        // Simple check - in real implementation, you'd use face detection API
        setFaceDetected(true)
        setCapturedImage(imageSrc)
      }
    }
  }, [])

  // Auto-detect face every 2 seconds
  useEffect(() => {
    if (step === 'camera' && !capturedImage) {
      const interval = setInterval(() => {
        detectFace()
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [step, capturedImage, detectFace])

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

    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!userData.password || !strongPw.test(userData.password)) {
      newErrors.password = 'Password must be 8+ chars and include lowercase, uppercase, and a number'
    }
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setStep('camera')
    }
  }

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setFaceDetected(true)
    }
  }, [])

  const retakePhoto = () => {
    setCapturedImage('')
    setFaceDetected(false)
  }

  const handleSubmitRegistration = async () => {
    if (!capturedImage) {
      toast({
        title: 'Error',
        description: 'Please capture your photo first',
        variant: 'destructive',
      })
      return
    }

    setStep('processing')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          profile: {
            name: userData.name.trim(),
            email: userData.email.trim(),
            department: userData.department,
            year: userData.year,
            mobile: userData.mobile.trim(),
            photo: userData.photo || null,
          },
          faceImageData: capturedImage,
          password: userData.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Registration Submitted',
          description: 'Your registration is pending admin approval',
        })
        router.push('/auth/pending-approval')
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
      setStep('camera')
    } finally {
      setIsLoading(false)
    }
  }

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Registration</CardTitle>
          <CardDescription>
            Fill in your details to join EduVision
          </CardDescription>
        </CardHeader>
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
                  className="pl-10"
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
                  <SelectTrigger className="pl-10">
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
                    <SelectTrigger className="pl-10">
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
                  className="pl-10"
                />
              </div>
              {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 8 characters)"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
              />
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

  const renderCameraStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Face Capture</CardTitle>
          <CardDescription>
            Position your face in the camera for identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                mirrored
              />
            )}
            
            {faceDetected && !capturedImage && (
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                Face Detected!
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={retakePhoto} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={handleSubmitRegistration} className="flex-1">
                  Submit Registration
                </Button>
              </>
            ) : (
              <Button onClick={capturePhoto} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={() => setStep('details')} 
            className="w-full"
          >
            Back to Details
          </Button>
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Processing Registration</CardTitle>
          <CardDescription>
            Please wait while we verify your information
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 text-center">
            Your registration is being processed. This may take a few moments...
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'details' && renderDetailsStep()}
        {step === 'camera' && renderCameraStep()}
        {step === 'processing' && renderProcessingStep()}
      </AnimatePresence>
    </div>
  )
}

export default function CompleteRegistration() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>}>
      <CompleteRegistrationContent />
    </Suspense>
  )
}
