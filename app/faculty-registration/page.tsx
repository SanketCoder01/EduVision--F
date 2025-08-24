"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, GraduationCap, User, Phone, Shield, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import AnimatedLoader from "@/components/ui/animated-loader"
import { createClient } from "@/lib/supabase/client"
import CourseSelector from "@/components/ui/course-selector"
import { getDepartmentByCourse } from "@/lib/constants/fields-courses"

function RegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const userName = searchParams.get("name") || "Faculty Member"
  const userEmail = searchParams.get("email") || ""
  const userPhoto = searchParams.get("photo") || ""

  const [formData, setFormData] = useState({
    field: "",
    course: "",
    department: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  })

  // Auto-update department when course changes
  const handleCourseChange = (course: string) => {
    const department = getDepartmentByCourse(course)
    setFormData(prev => ({
      ...prev,
      course,
      department
    }))
    setError("")
  }
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  
  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.field || !formData.course || !formData.department) {
      setError("Please select your Field, Course, and Department.")
      return
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check and try again.")
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Could not identify user. Please try logging in again.")
        return
      }

      // Detect OAuth users (e.g., Google) and skip password flow for them
      const provider = (user as any)?.app_metadata?.provider as string | undefined
      const isOAuth = provider && provider !== 'email'

      if (!isOAuth) {
        const { error: updateUserError } = await supabase.auth.updateUser({
          password: formData.password,
        })
        if (updateUserError) {
          setError(`Password update failed: ${updateUserError.message}`)
          return
        }
      }

      // Submit to secure registration API -> creates pending_registrations row
      const res = await fetch('/api/auth/secure-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          field: formData.field,
          course: formData.course,
          department: formData.department,
          user_type: 'faculty',
          mobile: formData.mobileNumber,
          name: userName,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.message || 'Registration submission failed'
        setError(msg)
        return
      }

      toast({
        title: "Registration Submitted!",
        description: "Redirecting to face capture for verification...",
      })
      
      // Redirect to face capture component
      setTimeout(() => {
        router.push(`/auth/face-capture?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(userName)}&type=faculty`)
      }, 1500)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      // In case navigation is blocked for any reason, don't leave loader stuck
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  
  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>User details not found. Please try signing in again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login?type=faculty')}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <AnimatedLoader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="relative inline-block">
              <Image
                src={userPhoto || "/images/default-avatar.png"}
                alt="Profile Photo"
                width={96}
                height={96}
                className="rounded-full mx-auto mb-4 border-4 border-purple-200 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-purple-500 text-white p-2 rounded-full shadow-lg">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Faculty Registration
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Welcome, {userName}! Let's complete your academic profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-500 text-white p-2 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Full Name</Label>
                    <Input value={userName} readOnly disabled className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Email Address</Label>
                    <Input value={userEmail} readOnly disabled className="bg-white/50" />
                  </div>
                </div>
              </motion.div>

              {/* Academic Information Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500 text-white p-2 rounded-lg shadow-md">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-800">Academic Information</h3>
                </div>
                
                {/* Field and Course Selection */}
                <div className="mb-6">
                  <CourseSelector
                    selectedField={formData.field}
                    selectedCourse={formData.course}
                    onFieldChangeAction={(field: string) => handleInputChange('field', field)}
                    onCourseChangeAction={handleCourseChange}
                  />
                </div>

                {/* Department Selection */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-purple-800 font-medium">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    readOnly
                    disabled
                    placeholder="Auto-selected based on course"
                    className="bg-white/50 border-purple-200 text-purple-800 font-medium"
                  />
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 text-white p-2 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Contact Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-green-800 font-medium">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    required
                    className="bg-white/80 border-green-200 focus:border-green-400"
                  />
                </div>
              </motion.div>

              {/* Security Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 text-white p-2 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800">Security Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-orange-800 font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="bg-white/80 border-orange-200 focus:border-orange-400 pr-10"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-orange-800 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                        className="bg-white/80 border-orange-200 focus:border-orange-400 pr-10"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Complete Registration
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function FacultyRegistrationPage() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <RegistrationForm />
    </Suspense>
  )
}
