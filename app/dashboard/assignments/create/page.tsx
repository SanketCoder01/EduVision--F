"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Send, FileText, Sparkles, BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
// import { createAssignment, addAssignmentResources, uploadFile } from "@/lib/supabase"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE" },
  { id: "cy", name: "Cyber Security", code: "CY" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML" },
]

const years = [
  { id: "first", name: "First Year" },
  { id: "second", name: "Second Year" },
  { id: "third", name: "Third Year" },
  { id: "fourth", name: "Fourth Year" },
]

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assignmentType, setAssignmentType] = useState<"normal" | "ai">("normal")
  const [isLoading, setIsLoading] = useState(false)
  const [resources, setResources] = useState<File[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    year: "",
    dueDate: "",
    dueTime: "23:59",
    startDate: "",
    startTime: "00:00",
    maxMarks: 100,
    assignmentType: "file_upload",
    allowedFileTypes: ["pdf"],
    allowLateSubmission: false,
    allowResubmission: false,
    enablePlagiarismCheck: true,
    allowGroupSubmission: false,
    visibility: true,
    aiPrompt: "",
    difficulty: "intermediate",
    estimatedTime: 60,
  })
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")

  useEffect(() => {
    // Get current user from localStorage or session
    const facultySession = localStorage.getItem("facultySession")
    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
        setFormData((prev) => ({
          ...prev,
          department: user.department || "",
        }))
      } catch (error) {
        console.error("Error parsing faculty session:", error)
        router.push("/login?type=faculty")
      }
    } else {
      router.push("/login?type=faculty")
    }
  }, [router])

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title || !formData.description || !formData.dueDate || !formData.year) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Mock assignment creation for now
      const assignmentData = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        faculty_id: currentUser.id,
        department: formData.department,
        year: formData.year,
        assignment_type: formData.assignmentType,
        allowed_file_types: formData.allowedFileTypes,
        max_marks: formData.maxMarks,
        due_date: new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString(),
        start_date: formData.startDate
          ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
          : new Date().toISOString(),
        visibility: status === "published" ? formData.visibility : false,
        allow_late_submission: formData.allowLateSubmission,
        allow_resubmission: formData.allowResubmission,
        enable_plagiarism_check: formData.enablePlagiarismCheck,
        allow_group_submission: formData.allowGroupSubmission,
        status: status,
        difficulty: formData.difficulty,
        estimated_time: formData.estimatedTime,
        ai_generated: assignmentType === "ai",
        file_based: !!uploadedFile
      }

      // Store in localStorage for demo purposes
      const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      existingAssignments.push(assignmentData)
      localStorage.setItem('assignments', JSON.stringify(existingAssignments))

      toast({
        title: status === "published" ? "Assignment Published" : "Assignment Saved",
        description:
          status === "published"
            ? "Your AI-powered assignment has been published and is now visible to students."
            : "Your AI-powered assignment has been saved as a draft.",
      })

      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFileContent(data.content)
        toast({
          title: "File Processed",
          description: `Successfully extracted content from ${file.name}. You can now generate questions based on this content.`,
        })
      } else {
        throw new Error('Failed to process file')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      toast({
        title: "File Processing Failed",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIAssignment = async () => {
    if (!formData.aiPrompt && !fileContent) {
      toast({
        title: "Missing Content",
        description: "Please enter an AI prompt or upload a file to generate the assignment.",
        variant: "destructive",
      })
      return
    }

    if (!formData.difficulty) {
      toast({
        title: "Missing Difficulty Level",
        description: "Please select a difficulty level before generating the assignment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Create a detailed assignment for ${formData.department} department, ${formData.year} year students. 
                   ${formData.aiPrompt ? `Prompt: ${formData.aiPrompt}` : ''}
                   
                   Please provide:
                   1. A clear assignment title
                   2. Detailed description with objectives
                   3. Requirements and guidelines
                   4. Evaluation criteria
                   5. Specific questions based on the content
                   
                   Make it appropriate for ${formData.difficulty} difficulty level and estimated ${formData.estimatedTime} minutes completion time.`,
          difficulty: formData.difficulty,
          fileContent: fileContent || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        let content = data.content

        // Clean content - remove *** formatting and other markdown
        content = content
          .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1') // Remove *** bold formatting
          .replace(/#{1,6}\s*/g, '') // Remove markdown headers
          .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
          .replace(/^\s*[-*+]\s+/gm, '• ') // Convert markdown lists to bullet points
          .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list formatting
          .replace(/\n{3,}/g, '\n\n') // Clean excessive line breaks
          .trim()

        // Extract title from the generated content
        const titleMatch = content.match(/(?:Title|Assignment):\s*(.+)/i)
        const title = titleMatch ? titleMatch[1].trim() : `AI Generated: ${formData.aiPrompt ? formData.aiPrompt.substring(0, 50) : 'File-based Assignment'}...`

        setFormData((prev) => ({
          ...prev,
          title: title,
          description: content,
        }))

        toast({
          title: "Assignment Generated",
          description: data.fallback ? 
            "Assignment generated using fallback template. You can review and modify it before publishing." :
            "AI has generated your assignment content. You can review and modify it before publishing.",
        })
      } else {
        throw new Error("Failed to generate assignment")
      }
    } catch (error) {
      console.error("Error generating AI assignment:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    setFormData((prev) => {
      const currentTypes = [...prev.allowedFileTypes]
      if (checked && !currentTypes.includes(fileType)) {
        return { ...prev, allowedFileTypes: [...currentTypes, fileType] }
      } else if (!checked && currentTypes.includes(fileType)) {
        return { ...prev, allowedFileTypes: currentTypes.filter((type) => type !== fileType) }
      }
      return prev
    })
  }

  const handleResourceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setResources((prev) => [...prev, ...files])
  }

  const removeResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index))
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-gray-600 mt-1">Design and publish assignments for your students</p>
        </div>
      </div>

      {/* Assignment Type Selection */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Assignment Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  assignmentType === "normal" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                }`}
                onClick={() => setAssignmentType("normal")}
              >
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Normal Assignment</h3>
                  <p className="text-gray-600 text-sm">
                    Create a traditional assignment with custom content and requirements
                  </p>
                  {assignmentType === "normal" && <Badge className="mt-3 bg-blue-600">Selected</Badge>}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  assignmentType === "ai" ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"
                }`}
                onClick={() => setAssignmentType("ai")}
              >
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Assignment</h3>
                  <p className="text-gray-600 text-sm">
                    Generate assignment content using AI based on your prompts and requirements
                  </p>
                  {assignmentType === "ai" && <Badge className="mt-3 bg-purple-600">Selected</Badge>}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Form */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter assignment title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignmentType">Assignment Type</Label>
                  <Select
                    value={formData.assignmentType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, assignmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file_upload">File Upload</SelectItem>
                      <SelectItem value="text_based">Text Based</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMarks">Maximum Marks *</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxMarks: Number.parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dueTime: e.target.value }))}
                      className="w-32"
                    />
                  </div>
                </div>
              </div>

              {formData.assignmentType === "file_upload" && (
                <div className="space-y-2">
                  <Label>Allowed File Types *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["pdf", "docx", "pptx", "xlsx", "zip", "jpg", "png", "txt"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filetype-${type}`}
                          checked={formData.allowedFileTypes.includes(type)}
                          onCheckedChange={(checked) => handleFileTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={`filetype-${type}`} className="text-sm">
                          .{type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {assignmentType === "ai" && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">AI Assignment Generator</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="aiPrompt">AI Prompt</Label>
                      <Textarea
                        id="aiPrompt"
                        placeholder="Describe what kind of assignment you want to create. For example: 'Create a programming assignment about data structures focusing on linked lists and arrays, suitable for intermediate level students'"
                        value={formData.aiPrompt}
                        onChange={(e) => setFormData((prev) => ({ ...prev, aiPrompt: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-full h-px bg-gray-300"></div>
                        <span className="text-sm text-gray-500 px-3">OR</span>
                        <div className="w-full h-px bg-gray-300"></div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fileUpload">Upload File to Generate Questions</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          <input
                            id="fileUpload"
                            type="file"
                            accept=".pdf,.xlsx,.xls,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="fileUpload" className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <FileText className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PDF, Excel, Word, PowerPoint, Images, or Text files
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        {uploadedFile && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{uploadedFile.name}</span>
                              <span className="text-xs text-green-600">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            {fileContent && (
                              <p className="text-xs text-green-600 mt-1">✓ Content extracted successfully</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="15"
                        step="15"
                        value={formData.estimatedTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, estimatedTime: Number.parseInt(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateAIAssignment}
                    disabled={isLoading || (!formData.aiPrompt && !fileContent) || !formData.difficulty}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Assignment
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Assignment Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed instructions for the assignment"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={8}
                />
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Assignment Resources</Label>
                  <Input type="file" multiple onChange={handleResourceUpload} className="max-w-xs" />
                </div>

                {resources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Resources</h4>
                    {resources.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResource(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Assignment Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Visibility</Label>
                      <p className="text-sm text-gray-600">Make assignment visible to students</p>
                    </div>
                    <Switch
                      checked={formData.visibility}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, visibility: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Late Submission</Label>
                      <p className="text-sm text-gray-600">Students can submit after the due date</p>
                    </div>
                    <Switch
                      checked={formData.allowLateSubmission}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowLateSubmission: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Resubmission</Label>
                      <p className="text-sm text-gray-600">Students can resubmit their work</p>
                    </div>
                    <Switch
                      checked={formData.allowResubmission}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowResubmission: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Plagiarism Check</Label>
                      <p className="text-sm text-gray-600">Automatically check for plagiarism</p>
                    </div>
                    <Switch
                      checked={formData.enablePlagiarismCheck}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, enablePlagiarismCheck: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Group Submission</Label>
                      <p className="text-sm text-gray-600">Students can submit as a group</p>
                    </div>
                    <Switch
                      checked={formData.allowGroupSubmission}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowGroupSubmission: checked }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => handleSubmit("draft")}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit("published")}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Send className="h-4 w-4" />
          Publish Assignment
        </Button>
      </div>
    </div>
  )
}
