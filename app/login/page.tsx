"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, GraduationCap, Building2, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { authenticateFaculty, supabase } from "@/lib/supabase"
import UniversityPortal from "@/components/UniversityPortal"
import StudentLoginPage from "@/components/StudentLoginPage"

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showUniversityPortal, setShowUniversityPortal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")

  if (type === "student") {
    return <StudentLoginPage onBack={() => router.push("/")} />
  }

  if (type === "faculty") {
    // Show faculty-specific login form (current form is already for faculty)
    // Continue with the existing faculty login form below
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", { email, password })
      const authResult = await authenticateFaculty(email, password)
      console.log("Authentication successful:", authResult)

      // Check if this is first login - redirect to personal info collection
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authResult.id)
        .single()

      if (!profile) {
        // First time login - store basic auth data and redirect to profile completion
        localStorage.setItem("facultySession", JSON.stringify(authResult))
        
        toast({
          title: "Welcome to EduVision!",
          description: "Please complete your profile to get started.",
        })
        router.push("/complete-profile?type=faculty")
      } else {
        // Existing user - merge profile data with auth data
        const completeUserData = {
          ...authResult,
          profile: profile,
          name: profile.name,
          full_name: profile.name,
          department: profile.department,
          designation: profile.designation,
          phone: profile.phone,
          address: profile.address,
          face_url: profile.face_image,
          photo: profile.face_image,
          avatar: profile.face_image,
          profile_completed: profile.profile_completed
        }
        
        // Store complete user data including profile
        localStorage.setItem("facultySession", JSON.stringify(completeUserData))
        
        toast({
          title: `Welcome back, ${profile.name || authResult.email?.split('@')[0]}!`,
          description: "You have successfully logged in to your faculty dashboard.",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please try again.")
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showUniversityPortal) {
    return <UniversityPortal onBack={() => setShowUniversityPortal(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EduVision</h1>
                <p className="text-sm text-gray-600">Faculty Portal</p>
              </div>
            </motion.div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome Back,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                Educator
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Access your teaching dashboard and manage your academic responsibilities with ease.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Assignments</h3>
              <p className="text-sm text-gray-600">Create and manage assignments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Students</h3>
              <p className="text-sm text-gray-600">Track student progress</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Faculty Login</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}


              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* University Access Button - Below the login form */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowUniversityPortal(true)}
                  variant="outline"
                  className="w-full h-12 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-medium rounded-lg transition-all duration-200 bg-transparent"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  University Access
                </Button>
              </div>

              <div className="text-center pt-4">
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
