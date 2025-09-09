"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Calendar,
  Star,
  Bot,
  FileUp,
  Loader2
} from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  department: string
  year: string
  due_date: string
  created_at: string
  status: "draft" | "published"
  difficulty: "beginner" | "intermediate" | "advanced"
  isAIGenerated?: boolean
  isFileGenerated?: boolean
  total_marks: number
  instructions?: string
}

export default function AssignmentEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    department: "",
    year: "",
    due_date: "",
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
    total_marks: 100,
    instructions: "",
    status: "draft" as "draft" | "published"
  })

  const departments = [
    "Computer Science",
    "Information Technology", 
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical"
  ]

  const years = [
    "First Year",
    "Second Year", 
    "Third Year",
    "Fourth Year"
  ]

  const subjects = [
    "Data Structures",
    "Algorithms",
    "Database Management",
    "Web Development",
    "Machine Learning",
    "Software Engineering",
    "Computer Networks",
    "Operating Systems"
  ]

  useEffect(() => {
    const fetchAssignment = () => {
      try {
        const storedAssignments = localStorage.getItem("assignments")
        if (storedAssignments) {
          const assignments = JSON.parse(storedAssignments)
          const foundAssignment = assignments.find((a: any) => a.id.toString() === params.id)
          
          if (foundAssignment) {
            setAssignment(foundAssignment)
            setFormData({
              title: foundAssignment.title || "",
              description: foundAssignment.description || "",
              subject: foundAssignment.subject || "",
              department: foundAssignment.department || "",
              year: foundAssignment.year || "",
              due_date: foundAssignment.due_date ? foundAssignment.due_date.split('T')[0] : "",
              difficulty: foundAssignment.difficulty || "intermediate",
              total_marks: foundAssignment.total_marks || 100,
              instructions: foundAssignment.instructions || "",
              status: foundAssignment.status || "draft"
            })
          } else {
            toast({
              title: "Assignment not found",
              description: "The assignment you're looking for doesn't exist.",
              variant: "destructive",
            })
            router.push("/dashboard/assignments")
          }
        }
      } catch (error) {
        console.error("Error loading assignment:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params.id, toast, router])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (newStatus?: "draft" | "published") => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const storedAssignments = localStorage.getItem("assignments")
      const assignments = storedAssignments ? JSON.parse(storedAssignments) : []
      
      const updatedAssignment = {
        ...assignment,
        ...formData,
        id: assignment?.id || (Array.isArray(params.id) ? params.id[0] : params.id),
        created_at: assignment?.created_at || new Date().toISOString(),
        status: newStatus || formData.status,
        due_date: new Date(formData.due_date).toISOString(),
        updated_at: new Date().toISOString()
      }

      const assignmentIndex = assignments.findIndex((a: any) => a.id.toString() === params.id)
      if (assignmentIndex !== -1) {
        assignments[assignmentIndex] = updatedAssignment
        localStorage.setItem("assignments", JSON.stringify(assignments))
        
        setAssignment(updatedAssignment)
        
        toast({
          title: "Success",
          description: `Assignment ${newStatus === "published" ? "published" : "saved"} successfully`,
        })

        if (newStatus === "published") {
          router.push("/dashboard/assignments")
        }
      }
    } catch (error) {
      console.error("Error saving assignment:", error)
      toast({
        title: "Error",
        description: "Failed to save assignment",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/assignments")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Edit Assignment</h1>
            {assignment.isAIGenerated && (
              <Badge variant="secondary">
                <Bot className="mr-1 h-3 w-3" />
                AI Generated
              </Badge>
            )}
            {assignment.isFileGenerated && (
              <Badge variant="secondary">
                <FileUp className="mr-1 h-3 w-3" />
                File Based
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/assignments/view/${assignment.id}`)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Edit the basic details of your assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter assignment title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select value={formData.difficulty} onValueChange={(value: "beginner" | "intermediate" | "advanced") => handleInputChange("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-green-600" />
                          Beginner
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-600" />
                          Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-red-600" />
                          Advanced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange("due_date", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => handleInputChange("total_marks", parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Content */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Content</CardTitle>
              <CardDescription>
                Edit the assignment description and instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Assignment Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter detailed assignment description"
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Enter specific instructions for students"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge className={assignment.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Difficulty:</span>
                <Badge className={getDifficultyColor(formData.difficulty)}>
                  <Star className="mr-1 h-3 w-3" />
                  {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                </Badge>
              </div>

              {formData.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(formData.due_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long", 
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full"
                variant="outline"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save as Draft
              </Button>
              
              <Button
                onClick={() => handleSave("published")}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save & Publish
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
