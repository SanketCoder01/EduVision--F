"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import AnimatedLoader from "@/components/ui/animated-loader"
import { createClient } from "@/lib/supabase/client"

function RegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const userName = searchParams.get("name") || "Student"
  const userEmail = searchParams.get("email") || ""
  const userPhoto = searchParams.get("photo") || ""

  const [formData, setFormData] = useState({
    department: "",
    year: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // no pre-check against students; approval workflow handles uniqueness
  }, [userEmail])

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Explicitly validate Select fields (required doesn't work on Radix Select)
    if (!formData.department || !formData.year) {
      setError("Please select your Department and Year of Study.")
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
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.")
          return
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long.")
          return
        }

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
          department: formData.department,
          year: formData.year,
          user_type: 'student',
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
        description: "Your registration is now pending admin approval.",
      })
      // Redirect to face capture page
      router.push("/student-registration/capture-image");
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      // In case navigation is blocked for any reason, don't leave loader stuck
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  // No pre-block; allow registration form to render

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>User details not found. Please try signing in again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login?type=student')}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <AnimatedLoader />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader>
            {userPhoto && (
              <Image
                src={userPhoto}
                alt="Profile Photo"
                width={80}
                height={80}
                className="rounded-full mx-auto mb-3 border-4 border-gray-200"
              />
            )}
            <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
            <CardDescription>
              Welcome, {userName}! Just a few more details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={userName} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={userEmail} readOnly disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(value) => handleInputChange("department", value)} required>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science and Engineering (CSE)">Computer Science and Engineering (CSE)</SelectItem>
                      <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                      <SelectItem value="Artificial Intelligence and Data Science (AIDS)">Artificial Intelligence and Data Science (AIDS)</SelectItem>
                      <SelectItem value="Artificial Intelligence and Machine Learning (AIML)">Artificial Intelligence and Machine Learning (AIML)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Study</Label>
                  <Select onValueChange={(value) => handleInputChange("year", value)} required>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                Save and Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function StudentRegistrationPage() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <RegistrationForm />
    </Suspense>
  )
}
