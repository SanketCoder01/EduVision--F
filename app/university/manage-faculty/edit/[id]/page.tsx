"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
  { id: "cy", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS", color: "bg-green-500" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML", color: "bg-orange-500" },
]

export default function EditFacultyPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    qualification: "",
    address: "",
    facultyId: "",
    status: "active",
  })

  useEffect(() => {
    // Load faculty data from localStorage
    const storedFaculty = localStorage.getItem("universityFaculty")
    if (storedFaculty) {
      try {
        const facultyList = JSON.parse(storedFaculty)
        const foundFaculty = facultyList.find((f: any) => f.id === params.id)
        if (foundFaculty) {
          setFormData({
            id: foundFaculty.id,
            name: foundFaculty.name,
            email: foundFaculty.email,
            phone: foundFaculty.phone,
            department: foundFaculty.department,
            qualification: foundFaculty.qualification || "",
            address: foundFaculty.address || "",
            facultyId: foundFaculty.facultyId,
            status: foundFaculty.status || "active",
          })
        }
      } catch (error) {
        console.error("Error loading faculty data:", error)
      }
    }
    setIsLoading(false)
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Validate form data
    if (!formData.name || !formData.email || !formData.phone || !formData.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      })
      return
    }

    // Update faculty in localStorage
    const storedFaculty = localStorage.getItem("universityFaculty")
    if (storedFaculty) {
      try {
        const facultyList = JSON.parse(storedFaculty)
        const updatedList = facultyList.map((f: any) =>
          f.id === formData.id ? { ...f, ...formData, updatedAt: new Date().toISOString() } : f
        )
        localStorage.setItem("universityFaculty", JSON.stringify(updatedList))

        // Also update faculty login data
        const facultyLogins = JSON.parse(localStorage.getItem("facultyLogins") || "[]")
        const updatedLogins = facultyLogins.map((login: any) =>
          login.facultyId === formData.facultyId
            ? {
                ...login,
                name: formData.name,
                email: formData.email,
                department: formData.department,
              }
            : login
        )
        localStorage.setItem("facultyLogins", JSON.stringify(updatedLogins))

        toast({
          title: "Faculty Updated",
          description: `${formData.name}'s information has been updated successfully.`,
        })

        router.push(`/university/manage-faculty/${formData.id}`)
      } catch (error) {
        console.error("Error updating faculty data:", error)
        toast({
          title: "Update Failed",
          description: "There was an error updating the faculty information.",
          variant: "destructive",
        })
      }
    }
  }

  const selectedDepartment = departments.find((d) => d.id === formData.department)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!formData.id) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Not Found</h1>
        </div>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Faculty Not Found</h3>
            <p className="text-gray-600 mb-6">The faculty member you are trying to edit does not exist.</p>
            <Button
              onClick={() => router.push("/university/manage-faculty")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Go Back to Faculty List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Faculty</h1>
            <p className="text-gray-600 mt-1">Update faculty member information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Faculty Details
          </CardTitle>
          {selectedDepartment && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedDepartment.code}</Badge>
              <span className="text-sm text-gray-600">{selectedDepartment.name}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification *</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="qualification"
                  name="qualification"
                  placeholder="e.g., Ph.D in Computer Science"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dept.color}`}></div>
                        <span>{dept.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleInputChange}
                className="pl-10 min-h-20"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="space-x-2">
              <Badge variant="outline" className="text-gray-500">
                Faculty ID: {formData.facultyId}
              </Badge>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
