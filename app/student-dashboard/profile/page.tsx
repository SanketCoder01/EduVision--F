"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Camera, User, Mail, CreditCard, AlertCircle, Edit, Save, X, Building, GraduationCap, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function StudentProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    college_name: "Sanjivani University",
    prn: "",
    department: "",
    year: "",
    photo: ""
  })

  useEffect(() => {
    loadStudentProfile()
  }, [])

  const loadStudentProfile = async () => {
    try {
      setDebugInfo("Checking authentication...")
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setDebugInfo(`Auth error: ${authError?.message || "No user found"}`)
        router.push('/login?type=student')
        return
      }

      setDebugInfo(`User found: ${user.email}. Searching for student record...`)

      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st', '2nd', '3rd', '4th']
      let studentData = null
      let foundDept = null
      let foundYear = null

      for (const dept of departments) {
        for (const year of years) {
          const tableName = `students_${dept}_${year}_year`
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('email', user.email)
            .maybeSingle()

          if (data && !error) {
            studentData = data
            foundDept = dept
            foundYear = year
            break
          }
        }
        if (studentData) break
      }

      if (!studentData) {
        setDebugInfo(`Student not found in any table for email: ${user.email}`)
        router.push('/complete-profile')
        return
      }

      setDebugInfo(`Student found. Loading profile...`)
      console.log('Student data loaded:', studentData)

      setStudent({ ...studentData, department: foundDept, year: foundYear })
      
      setFormData({
        name: studentData.name || studentData.full_name || "",
        college_name: studentData.college_name || "Sanjivani University",
        prn: studentData.prn || "",
        department: foundDept || "",
        year: foundYear || "",
        photo: studentData.photo || ""
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      setDebugInfo(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result as string
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

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.prn) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) throw new Error("Not authenticated. Please log in again.")

      // Department and year are immutable - use student's existing values
      const deptCode = student.department?.toLowerCase()
      const tableName = `students_${deptCode}_${student.year}_year`

      const updateData = {
        name: formData.name,
        college_name: formData.college_name,
        prn: formData.prn,
        photo: formData.photo,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('email', user.email)
        .select()
        .single()

      if (error) throw error

      setStudent({ ...data, department: student.department, year: student.year })
      setFormData(prev => ({ ...prev, ...updateData }))

      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      })

      setIsEditing(false)
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
          {debugInfo && <p className="text-sm text-blue-600 mt-2">{debugInfo}</p>}
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-2">Unable to load your profile.</p>
            {debugInfo && <p className="text-sm text-blue-600 mb-4">{debugInfo}</p>}
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getDepartmentLabel = (dept: string) => {
    const labels: Record<string, string> = {
      'cse': 'Computer Science & Engineering (CSE)',
      'cyber': 'Cyber Security',
      'aids': 'AI & Data Science (AIDS)',
      'aiml': 'AI & Machine Learning (AIML)'
    }
    return labels[dept] || dept?.toUpperCase()
  }

  const getYearLabel = (year: string) => {
    const labels: Record<string, string> = {
      '1st': 'First Year',
      '2nd': 'Second Year',
      '3rd': 'Third Year',
      '4th': 'Fourth Year'
    }
    return labels[year] || year
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/student-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
            <Button onClick={() => router.push('/student-dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Photo and Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                      {formData.photo ? (
                        <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  {isEditing && <p className="text-sm text-gray-500 mt-2">Click the camera icon to upload a photo</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold">{student.name || student.full_name || "Not Set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">PRN</p>
                        <p className="text-lg font-semibold">{student.prn || "Not Set"}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Academic Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">College</p>
                    <p className="text-lg">{student.college_name || "Sanjivani University"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-lg">{getDepartmentLabel(student.department)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Year</p>
                    <p className="text-lg">{getYearLabel(student.year)}</p>
                  </div>
                </div>

                {!isEditing && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Note:</strong> Department and Year cannot be changed once set. Contact admin for changes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
