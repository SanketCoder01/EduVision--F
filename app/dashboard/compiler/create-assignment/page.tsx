"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  Code,
  Clock,
  Users,
  FileText,
  Zap,
  Upload,
  CheckCircle,
  X,
  Calendar,
  Settings
} from "lucide-react"
import AIQuestionGenerator from "@/components/ai/AIQuestionGenerator"

interface AssignmentData {
  title: string
  facultyName: string
  dueDate: string
  dueTime: string
  department: string
  studyingYear: string
  language: string
  description: string
  instructions: string
  totalMarks: string
  passingMarks: string
  allowLateSubmission: boolean
  lateSubmissionPenalty: string
  maxAttempts: string
  timeLimit: string
  enableCodeExecution: boolean
  enableAutoGrading: boolean
  questionGenerationMethod: 'ai' | 'upload' | 'manual'
  uploadedFile?: File
  aiQuestions: any[]
  useAIQuestions: boolean
}

export default function CreateCompilerAssignment() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showAIConfirmation, setShowAIConfirmation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({})

  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: "",
    facultyName: "",
    dueDate: "",
    dueTime: "",
    department: "",
    studyingYear: "",
    language: "",
    description: "",
    instructions: "",
    totalMarks: "",
    passingMarks: "",
    allowLateSubmission: false,
    lateSubmissionPenalty: "10",
    maxAttempts: "3",
    timeLimit: "",
    enableCodeExecution: true,
    enableAutoGrading: false,
    questionGenerationMethod: 'manual',
    uploadedFile: undefined,
    aiQuestions: [],
    useAIQuestions: false
  })

  useEffect(() => {
    setAssignmentData(prev => ({
      ...prev,
      facultyName: "Dr. Sarah Johnson" // This would come from user session
    }))
  }, [])

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Basic Info step validation
      return assignmentData.title.trim() && 
             assignmentData.facultyName.trim() && 
             assignmentData.dueDate && 
             assignmentData.dueTime && 
             assignmentData.department && 
             assignmentData.studyingYear && 
             assignmentData.language && 
             assignmentData.totalMarks.trim() && 
             assignmentData.passingMarks.trim()
    }
    if (currentStep === 2) {
      // Content step validation
      return assignmentData.description.trim() && assignmentData.instructions.trim()
    }
    return true
  }

  const handleInputChange = (field: string, value: any) => {
    setAssignmentData(prev => ({ ...prev, [field]: value }))
    
    // Remove error when field is filled
    if (value && typeof value === 'string' && value.trim() !== '') {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    if (!canProceedToNextStep()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill all mandatory fields before proceeding.",
        variant: "destructive"
      })
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePublish = () => {
    if (!canProceedToNextStep()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill all mandatory fields before publishing.",
        variant: "destructive"
      })
      return
    }

    try {
      const newAssignment = {
        id: Date.now(),
        ...assignmentData,
        isExam: false,
        status: "active",
        createdAt: new Date().toISOString(),
        submissions: 0,
        totalStudents: 0
      }

      const existingAssignments = JSON.parse(localStorage.getItem("coding_assignments") || "[]")
      const updatedAssignments = [...existingAssignments, newAssignment]
      localStorage.setItem("coding_assignments", JSON.stringify(updatedAssignments))
      
      toast({
        title: "Assignment Created",
        description: "Your coding assignment has been created successfully."
      })
      
      router.push('/dashboard/compiler/view-assignments')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Dynamic subject-based options
  const getSubjectOptions = (title: string) => {
    const titleLower = title.toLowerCase()
    
    if (titleLower.includes('java')) {
      return ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Exception Handling', 'Collections', 'Multithreading', 'File I/O', 'JDBC']
    } else if (titleLower.includes('python')) {
      return ['Data Types', 'Functions', 'Classes', 'Modules', 'File Handling', 'Exception Handling', 'Libraries', 'Data Structures']
    } else if (titleLower.includes('c++') || titleLower.includes('cpp')) {
      return ['Pointers', 'Classes', 'Inheritance', 'Templates', 'STL', 'Memory Management', 'Operator Overloading', 'File I/O']
    } else if (titleLower.includes('javascript') || titleLower.includes('js')) {
      return ['Variables', 'Functions', 'Objects', 'Arrays', 'DOM Manipulation', 'Event Handling', 'Async Programming', 'ES6+ Features']
    } else {
      return ['Basic Concepts', 'Problem Solving', 'Logic Building', 'Syntax', 'Control Structures', 'Functions', 'Data Types', 'Input/Output']
    }
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Content", icon: Code },
    { number: 3, title: "Settings", icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-none mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assignment Options
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Coding Assignment
            </h1>
            <p className="text-gray-600 text-lg">
              Create a coding assignment with AI-powered question generation
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {React.createElement(step.icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      Step {step.number}
                    </p>
                    <p className="text-xs text-gray-500">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6" })}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep === 1 && "Enter basic assignment information and requirements"}
                {currentStep === 2 && "Define assignment content and questions"}
                {currentStep === 3 && "Configure assignment settings and preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Assignment Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Java Array Operations"
                        value={assignmentData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Faculty Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={assignmentData.facultyName}
                        onChange={(e) => handleInputChange("facultyName", e.target.value)}
                        className="h-12"
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Due Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={assignmentData.dueDate}
                          onChange={(e) => handleInputChange("dueDate", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Due Time <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="time"
                          value={assignmentData.dueTime}
                          onChange={(e) => handleInputChange("dueTime", e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <Select value={assignmentData.department} onValueChange={(value) => handleInputChange("department", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                          <SelectItem value="AIDS">AI & Data Science</SelectItem>
                          <SelectItem value="AIML">AI & Machine Learning</SelectItem>
                          <SelectItem value="IT">Information Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Studying Year <span className="text-red-500">*</span>
                      </label>
                      <Select value={assignmentData.studyingYear} onValueChange={(value) => handleInputChange("studyingYear", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Programming Language <span className="text-red-500">*</span>
                      </label>
                      <Select value={assignmentData.language} onValueChange={(value) => handleInputChange("language", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Java">Java</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                          <SelectItem value="C++">C++</SelectItem>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Total Marks <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={assignmentData.totalMarks}
                          onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Passing Marks <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="40"
                          value={assignmentData.passingMarks}
                          onChange={(e) => handleInputChange("passingMarks", e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Time Limit (Optional)
                      </label>
                      <Input
                        placeholder="e.g., 2 hours"
                        value={assignmentData.timeLimit}
                        onChange={(e) => handleInputChange("timeLimit", e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Content */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Assignment Description <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Describe the assignment objectives and what students need to accomplish..."
                        value={assignmentData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-32"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Instructions <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Provide detailed instructions for students..."
                        value={assignmentData.instructions}
                        onChange={(e) => handleInputChange("instructions", e.target.value)}
                        className="min-h-32"
                      />
                    </div>
                  </div>

                  {/* Question Generation Options */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Question Generation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant={assignmentData.questionGenerationMethod === 'ai' ? 'default' : 'outline'}
                        onClick={() => handleInputChange("questionGenerationMethod", 'ai')}
                        className="h-20 flex flex-col items-center gap-2"
                      >
                        <Zap className="w-6 h-6" />
                        AI Generation
                      </Button>
                      <Button
                        variant={assignmentData.questionGenerationMethod === 'upload' ? 'default' : 'outline'}
                        onClick={() => handleInputChange("questionGenerationMethod", 'upload')}
                        className="h-20 flex flex-col items-center gap-2"
                      >
                        <Upload className="w-6 h-6" />
                        Upload File
                      </Button>
                      <Button
                        variant={assignmentData.questionGenerationMethod === 'manual' ? 'default' : 'outline'}
                        onClick={() => handleInputChange("questionGenerationMethod", 'manual')}
                        className="h-20 flex flex-col items-center gap-2"
                      >
                        <FileText className="w-6 h-6" />
                        Manual Entry
                      </Button>
                    </div>

                    {/* AI Question Generator */}
                    {assignmentData.questionGenerationMethod === 'ai' && (
                      <div className="mt-6">
                        <AIQuestionGenerator
                          language={assignmentData.language}
                          totalMarks={parseInt(assignmentData.totalMarks) || 100}
                          duration={120}
                          examTitle={assignmentData.title}
                          availableTopics={getSubjectOptions(assignmentData.title)}
                          onQuestionsGenerated={(questions) => {
                            handleInputChange("aiQuestions", questions)
                            setShowAIConfirmation(true)
                          }}
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    {assignmentData.questionGenerationMethod === 'upload' && (
                      <div className="mt-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Upload PDF or DOCX file with questions</p>
                          <Input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleInputChange("uploadedFile", file)
                                toast({
                                  title: "File Uploaded",
                                  description: `${file.name} has been uploaded successfully.`
                                })
                              }
                            }}
                            className="max-w-xs mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Submission Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Allow Late Submission</label>
                            <p className="text-xs text-gray-500">Students can submit after due date</p>
                          </div>
                          <Switch
                            checked={assignmentData.allowLateSubmission}
                            onCheckedChange={(checked) => handleInputChange("allowLateSubmission", checked)}
                          />
                        </div>
                        {assignmentData.allowLateSubmission && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Late Submission Penalty (%)
                            </label>
                            <Input
                              type="number"
                              value={assignmentData.lateSubmissionPenalty}
                              onChange={(e) => handleInputChange("lateSubmissionPenalty", e.target.value)}
                              placeholder="10"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Maximum Attempts
                          </label>
                          <Input
                            type="number"
                            value={assignmentData.maxAttempts}
                            onChange={(e) => handleInputChange("maxAttempts", e.target.value)}
                            placeholder="3"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Code Execution Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Enable Code Execution</label>
                            <p className="text-xs text-gray-500">Students can run and test their code</p>
                          </div>
                          <Switch
                            checked={assignmentData.enableCodeExecution}
                            onCheckedChange={(checked) => handleInputChange("enableCodeExecution", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Enable Auto Grading</label>
                            <p className="text-xs text-gray-500">Automatic grading based on test cases</p>
                          </div>
                          <Switch
                            checked={assignmentData.enableAutoGrading}
                            onCheckedChange={(checked) => handleInputChange("enableAutoGrading", checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentStep < 3 ? (
                    <Button 
                      onClick={handleNext} 
                      disabled={!canProceedToNextStep()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Create Assignment
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Question Confirmation Dialog */}
        <Dialog open={showAIConfirmation} onOpenChange={setShowAIConfirmation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                AI Generated Questions
              </DialogTitle>
              <DialogDescription>
                Do you want to use the AI generated questions for this assignment?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">
                  <strong>{assignmentData.aiQuestions.length} questions</strong> have been generated for your assignment.
                </p>
                <p className="text-xs text-purple-600">
                  These questions are based on your assignment title "{assignmentData.title}" and selected topics.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAIConfirmation(false)
                    handleInputChange("aiQuestions", [])
                    handleInputChange("useAIQuestions", false)
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard Questions
                </Button>
                <Button 
                  onClick={() => {
                    setShowAIConfirmation(false)
                    handleInputChange("useAIQuestions", true)
                    const questionsText = assignmentData.aiQuestions.map((q: any, i: number) => 
                      `Question ${i + 1}: ${q.title}\n\n${q.description}\n\nInput: ${q.inputFormat}\nOutput: ${q.outputFormat}\nConstraints: ${q.constraints}\n\nSample Input:\n${q.sampleInput}\n\nSample Output:\n${q.sampleOutput}\n\n---\n`
                    ).join('\n')
                    handleInputChange("description", assignmentData.description + '\n\n' + questionsText)
                    toast({
                      title: "Questions Added",
                      description: "AI generated questions have been added to your assignment."
                    })
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use These Questions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
