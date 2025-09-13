"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowLeft, BookOpen, Code, Users, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { authenticateStudent, supabase } from "@/lib/supabase"

interface StudentLoginPageProps {
  onBack: () => void
}

export default function StudentLoginPage({ onBack }: StudentLoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate email domain
    if (!email.endsWith('@sanjivani.edu.in')) {
      setError('Please use your Sanjivani University email address (@sanjivani.edu.in)')
      setIsLoading(false)
      return
    }

    try {
      const authResult = await authenticateStudent(email, password)

      // Check if this is first login - redirect to personal info collection
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authResult.id)
        .single()

      if (!profile) {
        // First time login - store basic auth data and redirect to profile completion
        localStorage.setItem("studentSession", JSON.stringify(authResult))
        localStorage.setItem("userType", "student")
        
        toast({
          title: "Welcome to EduVision!",
          description: "Please complete your profile to get started.",
        })
        router.push("/complete-profile?type=student")
      } else {
        // Existing user - merge profile data with auth data
        const completeUserData = {
          ...authResult,
          profile: profile,
          name: profile.name,
          full_name: profile.name,
          department: profile.department,
          year: profile.year,
          prn: profile.prn,
          phone: profile.phone,
          address: profile.address,
          face_url: profile.face_image,
          photo: profile.face_image,
          avatar: profile.face_image,
          profile_completed: profile.profile_completed
        }
        
        // Store complete user data including profile
        localStorage.setItem("studentSession", JSON.stringify(completeUserData))
        localStorage.setItem("userType", "student")
        
        toast({
          title: `Welcome back, ${profile.name || authResult.email?.split('@')[0]}!`,
          description: "You have successfully logged in to your student dashboard.",
        })
        router.push("/student-dashboard")
      }
    } catch (error: any) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EduVision</h1>
                <p className="text-sm text-gray-600">Student Portal</p>
              </div>
            </motion.div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Student
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                {" "}
                Dashboard
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Access your assignments, track progress, and collaborate with peers in our comprehensive learning
              platform.
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
              <BookOpen className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Assignments</h3>
              <p className="text-sm text-gray-600">Submit and track assignments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <Code className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Code Compiler</h3>
              <p className="text-sm text-gray-600">Practice coding online</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <Users className="h-8 w-8 text-teal-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Study Groups</h3>
              <p className="text-sm text-gray-600">Collaborate with peers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <Lightbulb className="h-8 w-8 text-yellow-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Mentorship</h3>
              <p className="text-sm text-gray-600">Get guidance from mentors</p>
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
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-4"
              >
                <GraduationCap className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gray-900">Student Login</CardTitle>
              <CardDescription className="text-gray-600">
                Access your student dashboard and learning resources
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
                      placeholder="Enter Your Mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
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
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
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
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  {isLoading ? "Signing In..." : "Sign In to Student Portal"}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">Need help? Contact your academic advisor or IT support</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
