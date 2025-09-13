"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Phone, MapPin, Calendar, Users, Building2, GraduationCap } from "lucide-react"

interface StudentFormData {
  name: string
  full_name: string
  email: string
  prn: string
  department: string
  year: string
  phone: string
  address: string
  date_of_birth: string
  gender: string
  blood_group: string
  emergency_contact: string
  parent_name: string
  parent_phone: string
  admission_year: number
}

export default function StudentRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    full_name: "",
    email: "",
    prn: "",
    department: "",
    year: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    emergency_contact: "",
    parent_name: "",
    parent_phone: "",
    admission_year: new Date().getFullYear()
  })

  const departments = [
    { value: "CSE", label: "Computer Science & Engineering" },
    { value: "CYBER", label: "Cyber Security" },
    { value: "AIDS", label: "Artificial Intelligence & Data Science" },
    { value: "AIML", label: "Artificial Intelligence & Machine Learning" }
  ]

  const years = [
    { value: "first", label: "1st Year" },
    { value: "second", label: "2nd Year" },
    { value: "third", label: "3rd Year" },
    { value: "fourth", label: "4th Year" }
  ]

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const genders = ["Male", "Female", "Other"]

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    const required = ['name', 'full_name', 'email', 'prn', 'department', 'year']
    
    for (const field of required) {
      if (!formData[field as keyof StudentFormData]) {
        toast({
          title: "Missing Information",
          description: `Please fill in the ${field.replace('_', ' ')} field.`,
          variant: "destructive"
        })
        return false
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@sanjivani\.edu\.in$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a valid @sanjivani.edu.in email address.",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const getTableName = (department: string, year: string): string => {
    const deptMap: { [key: string]: string } = {
      'CSE': 'cse',
      'CYBER': 'cyber',
      'AIDS': 'aids',
      'AIML': 'aiml'
    }
    
    const yearMap: { [key: string]: string } = {
      'first': '1st',
      'second': '2nd',
      'third': '3rd',
      'fourth': '4th'
    }
    
    const deptCode = deptMap[department] || department.toLowerCase()
    const yearCode = yearMap[year] || year
    
    return `students_${deptCode}_${yearCode}_year`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      // Call API to register student in appropriate department-year table
      const response = await fetch('/api/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          table_name: getTableName(formData.department, formData.year)
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Your student profile has been created successfully!",
        })
        
        // Store student session for immediate access
        localStorage.setItem('studentSession', JSON.stringify({
          ...formData,
          id: result.student_id
        }))
        
        // Redirect to student dashboard
        router.push('/student-dashboard')
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Registration</h1>
          <p className="text-gray-600">Complete your profile to access EduVision platform</p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Student Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Please provide accurate information for your student profile
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your.name@sanjivani.edu.in"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="prn">PRN *</Label>
                      <Input
                        id="prn"
                        value={formData.prn}
                        onChange={(e) => handleInputChange("prn", e.target.value)}
                        placeholder="Enter your PRN"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Enter your phone number"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genders.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="blood_group">Blood Group</Label>
                      <Select value={formData.blood_group} onValueChange={(value) => handleInputChange("blood_group", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter your address"
                        className="w-full pl-10 pt-2 pb-2 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
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
                    
                    <div>
                      <Label htmlFor="year">Academic Year *</Label>
                      <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="admission_year">Admission Year</Label>
                      <Input
                        id="admission_year"
                        type="number"
                        value={formData.admission_year}
                        onChange={(e) => handleInputChange("admission_year", parseInt(e.target.value) || new Date().getFullYear())}
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                      <Input
                        id="parent_name"
                        value={formData.parent_name}
                        onChange={(e) => handleInputChange("parent_name", e.target.value)}
                        placeholder="Enter parent/guardian name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="parent_phone">Parent/Guardian Phone</Label>
                      <Input
                        id="parent_phone"
                        value={formData.parent_phone}
                        onChange={(e) => handleInputChange("parent_phone", e.target.value)}
                        placeholder="Enter parent/guardian phone"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={(e) => handleInputChange("emergency_contact", e.target.value)}
                        placeholder="Enter emergency contact"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Complete Registration
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
