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
  const [isChecking, setIsChecking] = useState(true)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!userEmail) {
      setIsChecking(false)
      return
    }

    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('students')
        .select('id')
        .eq('email', userEmail)
        .single()
      
      setIsRegistered(!!data)
      setIsChecking(false)
    }

    checkUser()
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

      const yearNumber = Number.parseInt(formData.year, 10)
      const { error: upsertError } = await supabase
        .from('students')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: userName,
          department: formData.department,
          year: Number.isNaN(yearNumber) ? null : yearNumber,
          mobile_number: formData.mobileNumber,
        }, { onConflict: 'id' })

      if (upsertError) {
        console.error('Student upsert failed:', upsertError)
        const code = (upsertError as any)?.code as string | undefined
        const msg = upsertError.message || ''
        const isDuplicate = msg.toLowerCase().includes('duplicate') || code === '23505'
        const isPermission = msg.toLowerCase().includes('permission') || code === '42501'

        if (isDuplicate) {
          toast({ title: 'Already saved', description: 'Your details seem to be already recorded. Proceeding to photo capture.' })
        } else if (isPermission) {
          toast({ title: 'Proceeding', description: 'We could not save details due to permissions. You can continue and we will finalize later.' })
        } else {
          setError(`Registration failed: ${msg}`)
          return
        }
      }

      toast({
        title: "Details Saved!",
        description: "Next, please capture your profile image for verification.",
      })

      router.push("/student-registration/capture-image")
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      // In case navigation is blocked for any reason, don't leave loader stuck
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  // Do not block the page while checking. We'll proceed to render the form.

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Already Registered</CardTitle>
            <CardDescription className="text-center pt-2">
              An account with the email <span className="font-semibold">{userEmail}</span> already exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please proceed to login to access your dashboard.</p>
            <Button onClick={() => router.push('/login')} className="w-full bg-purple-600 hover:bg-purple-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
