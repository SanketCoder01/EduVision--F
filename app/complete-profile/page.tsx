"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Camera, User, ArrowRight, Check, AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CompleteProfilePageInner />
    </Suspense>
  )
}

function CompleteProfilePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "student"
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [profileExists, setProfileExists] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    college_name: "Sanjivani University", // Fixed college name
    prn: "", // For students only
    department: "",
    year: "", // For students only
    photo: ""
  })
  const [existingProfile, setExistingProfile] = useState<any>(null)

  useEffect(() => {
    checkExistingProfile()
  }, [])

  const checkExistingProfile = async () => {
    try {
      // Get authenticated user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        // No authenticated user, redirect to login
        router.push("/login")
        return
      }

      setUserEmail(user.email || "")

      // Check if profile already exists in department tables
      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st', '2nd', '3rd', '4th']

      if (userType === 'student') {
        for (const dept of departments) {
          for (const year of years) {
            const tableName = `students_${dept}_${year}_year`
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .eq('email', user.email)
              .maybeSingle()

            if (data && !error) {
              // Store existing profile data
              setExistingProfile(data)
              setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                department: data.department || prev.department,
                year: data.year || prev.year,
                prn: data.prn || prev.prn
              }))
              
              // Check if profile has all required fields
              if (data.department && data.year && data.college_name && data.prn) {
                // Profile complete, redirect to dashboard
                setProfileExists(true)
                router.push('/student-dashboard')
                return
              }
            }
          }
        }
      } else {
        // Check faculty table
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (data && !error) {
          // Store existing profile data
          setExistingProfile(data)
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            department: data.department || prev.department
          }))
          
          // Check if profile has all required fields
          if (data.department && data.college_name) {
            // Faculty profile complete - no year needed
            setProfileExists(true)
            router.push('/dashboard')
            return
          }
        }
      }

      // Pre-fill name from Google auth if available
      if (user.user_metadata?.full_name) {
        setFormData(prev => ({ ...prev, name: user.user_metadata.full_name }))
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setIsCheckingProfile(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result as string
          setPhotoPreview(imageData)
          setFormData(prev => ({ ...prev, photo: imageData }))
        }
        reader.readAsDataURL(file)
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive"
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    // For faculty: name, college_name, department are required
    // For students: name, college_name, department, year, prn are required
    if (!formData.name || !formData.college_name || !formData.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      })
      return
    }

    if (userType === 'student' && (!formData.year || !formData.prn)) {
      toast({
        title: "Missing Information",
        description: "Please fill in Year and PRN fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Get user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) throw new Error("Not authenticated. Please log in again.")

      // Save profile
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          name: formData.name,
          user_type: userType,
          department: existingProfile?.department || formData.department,
          year: userType === 'student' ? (existingProfile?.year || formData.year) : undefined,
          college_name: formData.college_name,
          prn: userType === 'student' ? formData.prn : undefined,
          photo: formData.photo,
          is_profile_update: !!existingProfile
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile')
      }

      toast({
        title: "Profile Completed!",
        description: "Your profile has been saved successfully.",
      })

      // Store profile info in settings (localStorage)
      const profileSettings: any = {
        name: formData.name,
        college_name: formData.college_name,
        department: existingProfile?.department || formData.department,
        email: user.email,
        profile_completed: true,
        last_updated: new Date().toISOString()
      }
      
      if (userType === 'student') {
        profileSettings.year = existingProfile?.year || formData.year
        profileSettings.prn = formData.prn
        localStorage.setItem('student_profile_settings', JSON.stringify(profileSettings))
      } else {
        localStorage.setItem('faculty_profile_settings', JSON.stringify(profileSettings))
      }

      // Redirect to appropriate dashboard
      if (userType === 'student') {
        router.push('/student-dashboard?welcome=true')
      } else {
        router.push('/dashboard?welcome=true')
      }
    } catch (error: any) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const departments = [
    { value: "cse", label: "Computer Science & Engineering (CSE)" },
    { value: "cyber", label: "Cyber Security" },
    { value: "aids", label: "AI & Data Science (AIDS)" },
    { value: "aiml", label: "AI & Machine Learning (AIML)" }
  ]

  const years = [
    { value: "1st", label: "First Year" },
    { value: "2nd", label: "Second Year" },
    { value: "3rd", label: "Third Year" },
    { value: "4th", label: "Fourth Year" }
  ]

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile...</p>
        </div>
      </div>
    )
  }

  if (profileExists) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            {userType === 'student' 
              ? 'Please provide your details to access the student dashboard' 
              : 'Please provide your details to access the faculty dashboard'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Logged in as: <span className="font-medium">{userEmail}</span>
          </p>
        </motion.div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">
              {userType === 'student' ? 'Student Information' : 'Faculty Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload - Optional */}
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500 mt-1 block">Photo</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Profile photo (optional)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* College Name - Fixed */}
              <div>
                <Label htmlFor="college_name">College Name *</Label>
                <Input
                  id="college_name"
                  name="college_name"
                  value={formData.college_name}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Fixed to Sanjivani University</p>
              </div>

              {/* PRN - Students Only */}
              {userType === 'student' && (
                <div>
                  <Label htmlFor="prn">PRN (Permanent Registration Number) *</Label>
                  <Input
                    id="prn"
                    name="prn"
                    value={formData.prn}
                    onChange={handleInputChange}
                    placeholder="e.g., 22CSE001"
                    required
                  />
                </div>
              )}

              {/* Department */}
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("department", value)} 
                  value={formData.department}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year - Students Only */}
              {userType === 'student' && (
                <div>
                  <Label htmlFor="year">Studying Year *</Label>
                  <Select onValueChange={(value) => handleSelectChange("year", value)} value={formData.year}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    This cannot be changed later
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-4">
          All fields marked with * are mandatory
        </p>
      </div>
    </div>
  )
}
