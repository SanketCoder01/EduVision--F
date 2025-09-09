"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowLeft, BookOpen, Users, BarChart3, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"

interface FacultyLoginPageProps {
  onBack: () => void
}

export default function FacultyLoginPage({ onBack }: FacultyLoginPageProps) {
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

    try {
      // Demo faculty credentials
      if (email === "faculty@sanjivani.edu.in" && password === "EduVision2024@Faculty!") {
        localStorage.setItem(
          "faculty_session",
          JSON.stringify({
            email: email,
            name: "Dr. Faculty Member",
            role: "faculty",
            department: "Computer Science",
          }),
        )

        toast({
          title: "Login Successful",
          description: "Welcome to Faculty Dashboard!",
        })

        router.push("/dashboard")
      } else {
        throw new Error("Invalid faculty credentials")
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

  const handleUniversityAccess = () => {
    router.push("/university")
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
              Faculty
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                Dashboard
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage your courses, assignments, and student interactions with our comprehensive faculty management
              system.
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
              <h3 className="font-semibold text-gray-900 mb-1">Assignment Management</h3>
              <p className="text-sm text-gray-600">Create and manage assignments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Student Management</h3>
              <p className="text-sm text-gray-600">Track student progress</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">Performance insights</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <Building2 className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">University Access</h3>
              <p className="text-sm text-gray-600">Administrative portal</p>
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4"
              >
                <GraduationCap className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gray-900">Faculty Login</CardTitle>
              <CardDescription className="text-gray-600">
                Access your faculty dashboard and manage your courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Demo Credentials */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Demo Credentials:</h4>
                <p className="text-sm text-blue-700">Email: faculty@sanjivani.edu.in</p>
                <p className="text-sm text-blue-700">Password: EduVision2024@Faculty!</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Faculty Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your faculty email"
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
                  {isLoading ? "Signing In..." : "Sign In to Faculty Portal"}
                </Button>
              </form>

              {/* University Access Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleUniversityAccess}
                  variant="outline"
                  className="w-full h-12 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-medium rounded-lg transition-all duration-200 bg-transparent"
                  disabled={isLoading}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  University Access
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">For university administrators only</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
