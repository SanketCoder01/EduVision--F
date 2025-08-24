"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, UserPlus, LogIn, Building } from 'lucide-react'
import GoogleAuthSignup from './GoogleAuthSignup'
import EmailPasswordLogin from './EmailPasswordLogin'
import { useRouter } from 'next/navigation'

type AuthStep = 'main' | 'student-register' | 'faculty-register' | 'login'

export default function AuthenticationSystem() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('main')
  const router = useRouter()

  const handleRegistrationComplete = (userData: any) => {
    // Registration completed, redirect to pending approval
    router.push('/auth/pending-approval')
  }

  const handleBackToMain = () => {
    setCurrentStep('main')
  }

  if (currentStep === 'student-register') {
    return (
      <GoogleAuthSignup
        userType="student"
        onComplete={handleRegistrationComplete}
        onBack={handleBackToMain}
      />
    )
  }

  if (currentStep === 'faculty-register') {
    return (
      <GoogleAuthSignup
        userType="faculty"
        onComplete={handleRegistrationComplete}
        onBack={handleBackToMain}
      />
    )
  }

  if (currentStep === 'login') {
    return (
      <EmailPasswordLogin
        onBack={handleBackToMain}
      />
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
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto"
              >
                <GraduationCap className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold">EduVision</CardTitle>
              <CardDescription className="text-lg">
                Welcome to your educational platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Registration Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 text-center">New User? Register Here</h3>
                
                <Button
                  onClick={() => setCurrentStep('student-register')}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <GraduationCap className="w-5 h-5 mr-3" />
                  Register as Student
                </Button>
                
                <Button
                  onClick={() => setCurrentStep('faculty-register')}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <Building className="w-5 h-5 mr-3" />
                  Register as Faculty
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* Login Option */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 text-center">Already Registered?</h3>
                
                <Button
                  onClick={() => setCurrentStep('login')}
                  variant="outline"
                  className="w-full h-14 border-2 border-gray-200 hover:border-gray-300 font-medium rounded-lg transition-all duration-200"
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign In to Account
                </Button>
              </div>

              {/* Info Text */}
              <div className="text-center text-xs text-gray-500 space-y-1 pt-4">
                <p>New registrations require admin approval</p>
                <p>You'll receive login credentials via email after approval</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
