"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Calendar, Loader2, FileText, ExternalLink, Eye, Bot, FileUp, Shield, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"

interface Assignment {
  id: string
  title: string
  description: string
  questions?: string
  subject: string
  department: string
  target_years: string[]
  due_date: string
  created_at: string
  status: "draft" | "published"
  max_marks: number
  submission_guidelines?: string
  enable_plagiarism_check?: boolean
  allow_late_submission?: boolean
  allow_resubmission?: boolean
  faculty?: {
    name: string
    email: string
  }
}

export default function AssignmentEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: "",
    department: "",
    year: "",
    due_date: "",
    total_marks: 100,
    instructions: "",
    status: "draft" as "draft" | "published",
    plagiarism_check_enabled: false,
    allow_late_submission: false,
    allow_resubmission: false,
    auto_grading_enabled: false,
    allowed_file_types: [] as string[],
    subject: ""
  })

  const departments = [
    "CSE",
    "CY", 
    "AIDS",
    "AIML"
  ]

  const years = ["1", "2", "3", "4"]

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
    const loadAssignment = async () => {
      try {
        setLoading(true)
        
        // Get assignment from Supabase
        const assignment = await SupabaseAssignmentService.getAssignmentById(params.id as string)
        
        if (assignment) {
          setAssignment(assignment as any)
          // Format due_date for datetime-local input
          const formattedDueDate = assignment.due_date ? 
            new Date(assignment.due_date).toISOString().slice(0, 16) : ""
          
            setFormData({
              title: assignment.title || "",
              description: assignment.description || "",
              questions: assignment.questions || "",
              department: assignment.department || "",
              year: assignment.target_years?.[0] || "",
              due_date: formattedDueDate,
              total_marks: assignment.max_marks || 100,
              instructions: assignment.submission_guidelines || "",
              status: assignment.status as "draft" | "published", 
              plagiarism_check_enabled: Boolean(assignment.enable_plagiarism_check),
              allow_late_submission: Boolean(assignment.allow_late_submission),
              allow_resubmission: Boolean(assignment.allow_resubmission),
              auto_grading_enabled: false,
              allowed_file_types: [],
              subject: assignment.subject || ""
            })
        } else {
          toast({
            title: "Assignment not found",
            description: "The assignment you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/dashboard/assignments")
        }
      } catch (error) {
        console.error("Error loading assignment:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }


    loadAssignment()
  }, [params.id, toast, router])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAssignment = async (newStatus?: "draft" | "published") => {
    // Validation for required fields
    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter an assignment title",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Missing Description", 
        description: "Please enter an assignment description",
        variant: "destructive",
      })
      return
    }

    if (!formData.department) {
      toast({
        title: "Missing Department",
        description: "Please select a department",
        variant: "destructive",
      })
      return
    }

    if (!formData.year) {
      toast({
        title: "Missing Year",
        description: "Please select a target year",
        variant: "destructive",
      })
      return
    }

    if (!formData.due_date) {
      toast({
        title: "Missing Due Date",
        description: "Please set a due date",
        variant: "destructive",
      })
      return
    }

    // Additional validation for publishing
    if (newStatus === "published") {
      if (!formData.questions?.trim()) {
        toast({
          title: "Missing Questions",
          description: "Please add assignment questions before publishing",
          variant: "destructive",
        })
        return
      }

      if (formData.total_marks <= 0) {
        toast({
          title: "Invalid Marks",
          description: "Please set valid total marks (greater than 0)",
          variant: "destructive",
        })
        return
      }
    }

    setSaving(true)

    try {
      const statusToUse = newStatus || formData.status
      
      console.log('DEBUG: Saving assignment with data:', {
        status: statusToUse,
        plagiarism_check: formData.plagiarism_check_enabled,
        late_submission: formData.allow_late_submission,
        resubmission: formData.allow_resubmission
      })
      
      // Convert year format for database
      const yearMapping: { [key: string]: string } = {
        '1': 'first',
        '2': 'second', 
        '3': 'third',
        '4': 'fourth',
        'first': 'first',
        'second': 'second',
        'third': 'third',
        'fourth': 'fourth'
      }
      
      const normalizedYear = yearMapping[formData.year] || formData.year
      
      // Update assignment in Supabase with all settings
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        questions: formData.questions?.trim() || '',
        submission_guidelines: formData.instructions?.trim() || '',
        department: formData.department,
        target_years: [normalizedYear],
        due_date: formData.due_date + "T23:59:59",
        max_marks: formData.total_marks,
        status: statusToUse,
        enable_plagiarism_check: Boolean(formData.plagiarism_check_enabled),
        allow_late_submission: Boolean(formData.allow_late_submission),
        allow_resubmission: Boolean(formData.allow_resubmission),
        updated_at: new Date().toISOString()
      }
      
      console.log('DEBUG: Update data being sent:', updateData)
      
      const result = await SupabaseAssignmentService.updateAssignment(params.id as string, updateData)
      console.log('DEBUG: Update result:', result)
      
      toast({
        title: statusToUse === "published" ? "Assignment Published!" : "Assignment Saved",
        description: statusToUse === "published" 
          ? `Assignment "${formData.title}" has been published successfully. Students can now see it.`
          : `Assignment "${formData.title}" has been saved as draft.`,
      })
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push("/dashboard/assignments")
      }, 1500)
      
    } catch (error: any) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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
              <CardTitle className="font-sans">Basic Information</CardTitle>
              <CardDescription className="font-sans">
                Edit the basic details of your assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="font-sans">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter assignment title"
                  className="font-sans"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-sans">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter assignment description"
                  rows={3}
                  className="font-sans"
                />
              </div>

              <div>
                <Label htmlFor="questions" className="font-sans">Assignment Questions</Label>
                <Textarea
                  id="questions"
                  value={formData.questions}
                  onChange={(e) => handleInputChange("questions", e.target.value)}
                  placeholder="Enter assignment questions (one per line or formatted as needed)"
                  rows={6}
                  className="font-sans text-sm"
                />
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  Add the specific questions or tasks for this assignment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxMarks" className="font-sans">Maximum Marks *</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => handleInputChange("total_marks", parseInt(e.target.value) || 0)}
                    placeholder="Enter maximum marks"
                    min="1"
                    className="font-sans"
                  />
                </div>

                <div>
                  <Label htmlFor="due_date" className="font-sans">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange("due_date", e.target.value)}
                    className="font-sans"
                  />
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
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
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
            </CardContent>
          </Card>

          {/* Assignment Content */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Assignment Content</CardTitle>
              <CardDescription className="font-sans">
                Edit the assignment description and instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instructions" className="font-sans">Submission Guidelines</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Enter specific submission guidelines for students"
                  rows={4}
                  className="font-sans text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assignment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Settings className="h-5 w-5" />
                Assignment Settings
              </CardTitle>
              <CardDescription className="font-sans">
                Configure submission rules and plagiarism checking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plagiarism Check */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-base font-medium font-sans">Plagiarism Check</Label>
                    <p className="text-sm text-gray-600 font-sans">Enable automatic plagiarism detection for submissions</p>
                  </div>
                </div>
                <Switch
                  id="plagiarism_check_enabled"
                  checked={formData.plagiarism_check_enabled}
                  onCheckedChange={(checked) => handleInputChange("plagiarism_check_enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allow_late_submission">Allow Late Submission</Label>
                <Switch
                  id="allow_late_submission"
                  checked={formData.allow_late_submission}
                  onCheckedChange={(checked) => handleInputChange("allow_late_submission", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allow_resubmission">Allow Resubmission</Label>
                <Switch
                  id="allow_resubmission"
                  checked={formData.allow_resubmission}
                  onCheckedChange={(checked) => handleInputChange("allow_resubmission", checked)}
                />
              </div>

              {/* Word Limit */}
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

          {/* Uploaded Resources */}
          {assignment.resources && assignment.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {assignment.resources.map((resource: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium truncate">{resource.name || `Resource ${index + 1}`}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Assignment Settings Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Marks:</span>
                <Badge variant="secondary">{formData.total_marks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Department:</span>
                <Badge variant="outline">{formData.department}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Year:</span>
                <Badge variant="outline">{formData.year}</Badge>
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plagiarism Check:</span>
                  <Badge variant={formData.plagiarism_check_enabled ? "default" : "secondary"}>
                    {formData.plagiarism_check_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Late Submission:</span>
                  <Badge variant={formData.allow_late_submission ? "default" : "secondary"}>
                    {formData.allow_late_submission ? "Allowed" : "Not Allowed"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resubmission:</span>
                  <Badge variant={formData.allow_resubmission ? "default" : "secondary"}>
                    {formData.allow_resubmission ? "Allowed" : "Not Allowed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSaveAssignment()}
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
                onClick={() => handleSaveAssignment("published")}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {saving ? "Publishing..." : "Publish Assignment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
