"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Calendar, Clock, FileText, Users, Settings, Upload, Sparkles, Plus, Trash2, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"
import { supabase } from "@/lib/supabase"
// import { createAssignment, addAssignmentResources, uploadFile } from "@/lib/supabase"

const departments = [
  "CSE",
  "CY", 
  "AIDS",
  "AIML"
]

const years = ["1", "2", "3", "4"]

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
    questions: "",
    submissionGuidelines: "",
    rubric: [],
    autoGradingEnabled: false,
    passingMarks: 40,
    timeLimit: 0,
  })
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "multiple_choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 1,
    explanation: ""
  })

  useEffect(() => {
    // Get current user from Supabase
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Check if user has sanjivani.edu.in email
        const email = session.user.email
        if (!email?.endsWith('@sanjivani.edu.in')) {
          toast({
            title: "Access Denied",
            description: "Only Sanjivani faculty members can access this system.",
            variant: "destructive"
          })
          router.push("/login")
          return
        }

        // Try to fetch existing faculty record
        let { data: facultyData, error } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', email)
          .single()
        
        // If faculty record doesn't exist, create one automatically
        if (error && error.code === 'PGRST116') {
          const name = session.user.user_metadata?.name || email.split('@')[0].replace(/[._]/g, ' ')
          const department = 'CSE' // Default department, can be updated later
          
          const { data: newFacultyData, error: insertError } = await supabase
            .from('faculty')
            .insert([{
              name: name,
              full_name: name,
              email: email,
              department: department,
              designation: 'Faculty',
              employee_id: `FAC_${Date.now()}`
            }])
            .select()
            .single()
          
          if (newFacultyData && !insertError) {
            facultyData = newFacultyData
            toast({
              title: "Welcome!",
              description: "Faculty profile created successfully. You can update your details in profile settings.",
              variant: "default"
            })
          } else {
            console.error("Error creating faculty record:", insertError)
            toast({
              title: "Error",
              description: "Failed to create faculty profile. Please contact admin.",
              variant: "destructive"
            })
            return
          }
        } else if (error) {
          console.error("Error fetching faculty record:", error)
          toast({
            title: "Error",
            description: "Failed to fetch faculty profile. Please try again.",
            variant: "destructive"
          })
          return
        }
        
        if (facultyData) {
          setCurrentUser({
            id: facultyData.id,
            email: facultyData.email,
            name: facultyData.name,
            department: facultyData.department,
            designation: facultyData.designation
          })
        }
      } else {
        // Check localStorage for session
        const localSession = localStorage.getItem('user_session')
        if (localSession) {
          try {
            const user = JSON.parse(localSession)
            // Verify this is a faculty record by checking if it has department
            if (user.department) {
              setCurrentUser(user)
            } else {
              // Fetch faculty record if localStorage doesn't have complete data
              const { data: facultyData, error } = await supabase
                .from('faculty')
                .select('*')
                .eq('email', user.email)
                .single()
              
              if (facultyData && !error) {
                const facultyUser = {
                  id: facultyData.id,
                  email: facultyData.email,
                  name: facultyData.name,
                  department: facultyData.department,
                  designation: facultyData.designation
                }
                setCurrentUser(facultyUser)
                localStorage.setItem('user_session', JSON.stringify(facultyUser))
              } else {
                router.push("/login")
              }
            }
          } catch (error) {
            console.error("Error parsing session:", error)
            router.push("/login")
          }
        } else {
          router.push("/login")
        }
      }
    }
    getUser()
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

    if (!currentUser?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create assignment using Supabase
      // Convert year number to year name for target_years
      const yearMapping: { [key: string]: string } = {
        '1': 'first',
        '2': 'second', 
        '3': 'third',
        '4': 'fourth'
      }
      const targetYear = yearMapping[formData.year] || formData.year
      
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        questions: formData.questions,
        submission_guidelines: formData.submissionGuidelines,
        faculty_id: currentUser.id,
        department: formData.department,
        target_years: [targetYear],
        assignment_type: formData.assignmentType as 'normal' | 'ai' | 'file_upload' | 'text_based' | 'quiz' | 'coding',
        max_marks: formData.maxMarks,
        due_date: `${formData.dueDate}T${formData.dueTime}:00`,
        allow_late_submission: formData.allowLateSubmission,
        allow_resubmission: formData.allowResubmission,
        enable_plagiarism_check: formData.enablePlagiarismCheck,
        allow_group_submission: formData.allowGroupSubmission,
        visibility: formData.visibility,
        difficulty: formData.difficulty,
        estimated_time: formData.estimatedTime,
        ai_prompt: formData.aiPrompt,
        status
      }

      const createdAssignment = await SupabaseAssignmentService.createAssignment(assignmentData)
      
      // If user wants to publish immediately, use secure publish function
      if (status === 'published') {
        const publishResult = await SupabaseAssignmentService.publishAssignment(createdAssignment.id)
        if (!publishResult.success) {
          throw new Error(publishResult.message)
        }
      }

      // Upload resources if any
      if (resources.length > 0) {
        for (const file of resources) {
          try {
            const fileUrl = await SupabaseAssignmentService.uploadAssignmentResource(createdAssignment.id, file)
            await SupabaseAssignmentService.createAssignmentResource({
              assignment_id: createdAssignment.id,
              name: file.name,
              file_type: file.type,
              file_url: fileUrl,
              file_size: file.size
            })
          } catch (error) {
            console.error(`Error uploading resource ${file.name}:`, error)
          }
        }
      }

      // Create notifications for students when assignment is published
      if (status === "published") {
        createStudentNotifications(createdAssignment)
      }

      toast({
        title: status === "published" ? "Assignment Published" : "Assignment Saved",
        description:
          status === "published"
            ? "Assignment has been published and students can now view it."
            : "Assignment has been saved as a draft.",
      })

      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createStudentNotifications = async (assignment: any) => {
    try {
      // Create real-time notification in Supabase for all students in target department/years
      for (const targetYear of assignment.target_years) {
        const notificationData = {
          type: "assignment",
          title: "New Assignment Available",
          message: `${assignment.title} has been assigned to ${assignment.department} ${targetYear} year students`,
          assignment_id: assignment.id,
          department: assignment.department,
          target_year: targetYear,
          faculty_id: assignment.faculty_id,
          created_at: new Date().toISOString(),
          read: false
        }

        // Insert notification into Supabase
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([notificationData])

        if (notificationError) {
          console.error('Error creating notification:', notificationError)
        } else {
          console.log(`✅ Notification created for ${assignment.department} ${targetYear} year students`)
        }
      }
    } catch (error) {
      console.error('Error creating student notifications:', error)
    }
  }

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question.",
        variant: "destructive",
      })
      return
    }

    const newQuestion = {
      ...currentQuestion,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    setQuestions([...questions, newQuestion])
    setCurrentQuestion({
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
      explanation: ""
    })

    toast({
      title: "Question Added",
      description: "Question has been added to the assignment.",
    })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions)
  }

  const updateCurrentQuestion = (field: string, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateQuestionOption = (index: number, value: string) => {
    const updatedOptions = [...currentQuestion.options]
    updatedOptions[index] = value
    setCurrentQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }))
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
                        <SelectItem key={dept} value={dept}>
                          {dept}
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
                        <SelectItem key={year} value={year}>
                          Year {year}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxMarks: parseInt(e.target.value) || 1 }))}
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
                          onCheckedChange={(checked: boolean) => handleFileTypeChange(type, checked)}
                        />
                        <Label htmlFor={`filetype-${type}`} className="text-sm">
                          .{type}
                        </Label>
                      </div>
                    ))}
                  </div>


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

            <TabsContent value="content" className="space-y-6">
              {assignmentType === "normal" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Manual Assignment Questions</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignmentQuestions">Assignment Questions *</Label>
                      <Textarea
                        id="assignmentQuestions"
                        placeholder="Enter your assignment questions here. You can add multiple questions, instructions, and requirements for students."
                        value={formData.questions || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, questions: e.target.value }))}
                        rows={8}
                        className="min-h-[200px]"
                      />
                      <p className="text-sm text-gray-600">
                        Add detailed questions, instructions, and requirements for your assignment. Students will see this when they view the assignment details.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submissionGuidelines">Submission Guidelines</Label>
                      <Textarea
                        id="submissionGuidelines"
                        placeholder="Enter submission guidelines, format requirements, and any special instructions..."
                        value={formData.submissionGuidelines || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, submissionGuidelines: e.target.value }))}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

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
                </div>
              )}
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
