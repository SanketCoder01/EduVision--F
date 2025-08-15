"use client"

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const userType = searchParams.get('type') || 'student'
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate email domain based on user type
      const isValidDomain = userType === 'student' 
        ? email.endsWith('@sanjivani.edu.in')
        : email.endsWith('@set') || email.endsWith('@sanjivani')

      if (!isValidDomain) {
        setError(`Invalid email domain for ${userType}. Please use appropriate institutional email.`)
        return
      }

      // Check if user exists in the database
      const tableName = userType === 'faculty' ? 'faculty' : 'students'
      const { data: userData, error: userError } = await supabase
        .from(tableName)
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (userError || !userData) {
        setError('No account found with this email address.')
        return
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?type=${userType}`,
      })

      if (resetError) {
        throw resetError
      }

      setIsSuccess(true)
      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setError(error.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto px-4"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-600">Email Sent!</h3>
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Please check your email and follow the instructions to reset your password.
              </p>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/login?type=${userType}`)}
                  className="flex-1"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className="flex-1"
                >
                  Send Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder={`Enter your ${userType} email`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                {userType === 'student' 
                  ? 'Use your @sanjivani.edu.in email address'
                  : 'Use your institutional email address'
                }
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Email...
                </>
              ) : (
                'Send Reset Email'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/login?type=${userType}`)}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <ForgotPasswordContent />
      </Suspense>
    </div>
  )
}
