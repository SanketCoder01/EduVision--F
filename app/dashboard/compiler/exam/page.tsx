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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  Shield,
  Clock,
  Users,
  Eye,
  AlertTriangle,
  Camera,
  Mic,
  Settings,
  Play,
  Pause,
  Square,
  FileText,
  Zap,
  Upload,
  Download,
  CheckCircle,
  X,
  Calendar,
  Timer
} from "lucide-react"
import AIQuestionGenerator from "@/components/ai/AIQuestionGenerator"

interface ExamData {
  title: string
  facultyName: string
  examDate: string
  startTime: string
  endTime: string
  duration: string
  department: string
  studyingYear: string
  language: string
  description: string
  instructions: string
  totalMarks: string
  passingMarks: string
  enableSecurity: boolean
  enableCamera: boolean
  enableMicrophone: boolean
  enableScreenShare: boolean
  allowTabSwitch: boolean
  maxTabSwitches: string
  enableAutoSubmit: boolean
  warningThreshold: string
  isScheduled: boolean
  scheduleDate: string
  scheduleTime: string
  questionsPerStudent: number
  questionGenerationMethod: 'ai' | 'upload' | 'random'
  uploadedFile?: File
  aiQuestions: any[]
  useAIQuestions: boolean
}

interface Student {
  id: number
  name: string
  rollNo: string
  status: 'online' | 'offline' | 'suspicious'
  violations: number
  lastActivity: string
  progress: number
  tabSwitches: number
  cameraStatus: 'on' | 'off' | 'blocked'
  micStatus: 'on' | 'off' | 'muted'
}

export default function CreateExam() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showAIConfirmation, setShowAIConfirmation] = useState(false)
  const [showStudentAssignment, setShowStudentAssignment] = useState(false)
  const [showUploadFile, setShowUploadFile] = useState(false)
  const [showRandomAssignment, setShowRandomAssignment] = useState(false)
  const [studentList, setStudentList] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({})
  const [isPublished, setIsPublished] = useState(false)
  const [examData, setExamData] = useState<ExamData>({
    title: "",
    facultyName: "",
    examDate: "",
    startTime: "",
    endTime: "",
    duration: "120",
    department: "",
    studyingYear: "",
    language: "",
    description: "",
    instructions: "",
    totalMarks: "100",
    passingMarks: "40",
    enableSecurity: true,
    enableCamera: true,
    enableMicrophone: false,
    enableScreenShare: true,
    allowTabSwitch: false,
    maxTabSwitches: "3",
    enableAutoSubmit: true,
    warningThreshold: "3",
    isScheduled: false,
    scheduleDate: "",
    scheduleTime: "",
    questionsPerStudent: 3,
    questionGenerationMethod: 'ai',
    aiQuestions: [],
    useAIQuestions: false
  })

  useEffect(() => {
    setExamData(prev => ({
      ...prev,
      facultyName: "Dr. Sarah Johnson" // This would come from user session
    }))
  }, [])

  const validateMandatoryFields = () => {
    const errors: {[key: string]: boolean} = {}
    
    // Basic Info validation
    if (!examData.title.trim()) errors.title = true
    if (!examData.facultyName.trim()) errors.facultyName = true
    if (!examData.examDate) errors.examDate = true
    if (!examData.startTime) errors.startTime = true
    if (!examData.endTime) errors.endTime = true
    if (!examData.department) errors.department = true
    if (!examData.studyingYear) errors.studyingYear = true
    if (!examData.language) errors.language = true
    if (!examData.totalMarks.trim()) errors.totalMarks = true
    if (!examData.passingMarks.trim()) errors.passingMarks = true
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Basic Info step validation
      return examData.title.trim() && 
             examData.facultyName.trim() && 
             examData.examDate && 
             examData.startTime && 
             examData.endTime && 
             examData.department && 
             examData.studyingYear && 
             examData.language && 
             examData.totalMarks.trim() && 
             examData.passingMarks.trim()
    }
    if (currentStep === 2) {
      // Content step validation
      return examData.description.trim() && examData.instructions.trim()
    }
    return true
  }

  const handleInputChange = (field: string, value: string) => {
    setExamData(prev => ({ ...prev, [field]: value }))
    
    // Remove error when field is filled
    if (value && value.trim() !== '') {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const [mockStudents] = useState<Student[]>([
    { id: 1, name: "Alice Johnson", rollNo: "CS001", status: 'online', violations: 0, lastActivity: "2 min ago", progress: 75, tabSwitches: 1, cameraStatus: 'on', micStatus: 'muted' },
    { id: 2, name: "Bob Smith", rollNo: "CS002", status: 'suspicious', violations: 2, lastActivity: "1 min ago", progress: 45, tabSwitches: 4, cameraStatus: 'off', micStatus: 'off' },
    { id: 3, name: "Carol Davis", rollNo: "CS003", status: 'online', violations: 1, lastActivity: "30 sec ago", progress: 90, tabSwitches: 0, cameraStatus: 'on', micStatus: 'muted' },
    { id: 4, name: "David Wilson", rollNo: "CS004", status: 'offline', violations: 0, lastActivity: "5 min ago", progress: 20, tabSwitches: 0, cameraStatus: 'blocked', micStatus: 'off' },
    { id: 5, name: "Eva Brown", rollNo: "CS005", status: 'online', violations: 0, lastActivity: "1 min ago", progress: 85, tabSwitches: 2, cameraStatus: 'on', micStatus: 'muted' }
  ])


  const handleNext = () => {
    if (currentStep === 1 && !validateMandatoryFields()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill all mandatory fields before proceeding.",
        variant: "destructive"
      })
      return
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = () => {
    if (!validateMandatoryFields()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill all mandatory fields before publishing.",
        variant: "destructive"
      })
      return
    }

    try {
      const newExam = {
        id: Date.now(),
        ...examData,
        isExam: true,
        status: "scheduled",
        createdAt: new Date().toISOString()
      }

      const existingExams = JSON.parse(localStorage.getItem("coding_exams") || "[]")
      const updatedExams = [...existingExams, newExam]
      localStorage.setItem("coding_exams", JSON.stringify(updatedExams))
      
      router.push('/dashboard/compiler/exam/success')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'suspicious': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
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
    } else if (titleLower.includes('computer networks') || titleLower.includes('networking')) {
      return ['OSI Model', 'TCP/IP', 'Routing', 'Switching', 'Network Security', 'Protocols', 'Subnetting', 'Network Topologies']
    } else if (titleLower.includes('database') || titleLower.includes('sql')) {
      return ['SQL Queries', 'Normalization', 'Joins', 'Indexing', 'Transactions', 'Stored Procedures', 'Database Design', 'ACID Properties']
    } else if (titleLower.includes('data structure')) {
      return ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Hashing', 'Sorting Algorithms']
    } else if (titleLower.includes('algorithm')) {
      return ['Searching', 'Sorting', 'Dynamic Programming', 'Greedy Algorithms', 'Graph Algorithms', 'Divide & Conquer', 'Backtracking', 'Complexity Analysis']
    } else {
      return ['Basic Concepts', 'Problem Solving', 'Logic Building', 'Syntax', 'Control Structures', 'Functions', 'Data Types', 'Input/Output']
    }
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Content", icon: Settings },
    { number: 3, title: "Security", icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 p-4 md:p-6">
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
              onClick={() => router.push('/dashboard/compiler')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Coding Exam
          </h1>
          <p className="text-gray-600">
            Create a secure coding exam with real-time monitoring
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {React.createElement(step.icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      Step {step.number}
                    </p>
                    <p className="text-xs text-gray-500">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-red-600' : 'bg-gray-200'
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
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of 4: {steps[currentStep - 1].title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Exam Title *</label>
                      <Input
                        placeholder="Enter exam title (e.g., Java Programming, Python Basics)"
                        value={examData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className={`${validationErrors.title ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Faculty Name</label>
                      <Input
                        value={examData.facultyName}
                        onChange={(e) => handleInputChange("facultyName", e.target.value)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Department *</label>
                      <Select value={examData.department} onValueChange={(value) => handleInputChange("department", value)}>
                        <SelectTrigger className={`${validationErrors.department ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science</SelectItem>
                          <SelectItem value="AIDS">AI & Data Science</SelectItem>
                          <SelectItem value="AIML">AI & Machine Learning</SelectItem>
                          <SelectItem value="CYBER">Cyber Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Year *</label>
                      <Select value={examData.studyingYear} onValueChange={(value) => handleInputChange("studyingYear", value)}>
                        <SelectTrigger className={`${validationErrors.studyingYear ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}>
                          <SelectValue placeholder="Select year" />
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
                      <label className="text-sm font-medium mb-2 block text-red-600">Programming Language *</label>
                      <Select value={examData.language} onValueChange={(value) => handleInputChange("language", value)}>
                        <SelectTrigger className={`${validationErrors.language ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C++">C++</SelectItem>
                          <SelectItem value="Java">Java</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Duration (minutes) *</label>
                      <Input
                        type="number"
                        placeholder="120"
                        value={examData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        className={`${validationErrors.duration ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Exam Date *</label>
                      <Input
                        type="date"
                        value={examData.examDate}
                        onChange={(e) => handleInputChange("examDate", e.target.value)}
                        className={`${validationErrors.examDate ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Start Time *</label>
                      <Input
                        type="time"
                        value={examData.startTime}
                        onChange={(e) => handleInputChange("startTime", e.target.value)}
                        className={`${validationErrors.startTime ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">End Time *</label>
                      <Input
                        type="time"
                        value={examData.endTime}
                        onChange={(e) => handleInputChange("endTime", e.target.value)}
                        className={`${validationErrors.endTime ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}
                      />
                    </div>
                  </div>

                  {/* Scheduling Options */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Calendar className="w-5 h-5" />
                        Scheduling Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Enable Scheduling</label>
                          <p className="text-xs text-gray-600">Automatically publish exam at scheduled time</p>
                        </div>
                        <Switch
                          checked={examData.isScheduled}
                          onCheckedChange={(checked) => handleInputChange("isScheduled", checked)}
                        />
                      </div>
                      
                      {examData.isScheduled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Schedule Date *</label>
                            <Input
                              type="date"
                              value={examData.scheduleDate}
                              onChange={(e) => handleInputChange("scheduleDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Schedule Time *</label>
                            <Input
                              type="time"
                              value={examData.scheduleTime}
                              onChange={(e) => handleInputChange("scheduleTime", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2: Content */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Total Marks *</label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={examData.totalMarks}
                        onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                        className={`${validationErrors.totalMarks ? 'border-red-500 bg-red-50' : 'border-red-200'} focus:border-red-500`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Passing Marks *</label>
                      <Input
                        type="number"
                        placeholder="40"
                        value={examData.passingMarks}
                        onChange={(e) => handleInputChange("passingMarks", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Question Generation Method Selection */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Settings className="w-5 h-5" />
                        Question Generation Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={examData.questionGenerationMethod} onValueChange={(value: any) => handleInputChange("questionGenerationMethod", value)}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="ai">AI Generation</TabsTrigger>
                          <TabsTrigger value="upload">Upload File</TabsTrigger>
                          <TabsTrigger value="random">Random Assignment</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="ai" className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-3">AI Question Generator</h4>
                            <p className="text-sm text-gray-600 mb-4">Generate questions based on exam title and selected topics</p>
                            
                            {examData.title && (
                              <div className="mb-4">
                                <label className="text-sm font-medium mb-2 block">Available Topics for "{examData.title}":</label>
                                <div className="flex flex-wrap gap-2">
                                  {getSubjectOptions(examData.title).map((topic) => (
                                    <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-purple-100">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <AIQuestionGenerator
                              language={examData.language}
                              totalMarks={parseInt(examData.totalMarks) || 100}
                              duration={parseInt(examData.duration) || 120}
                              examTitle={examData.title}
                              availableTopics={getSubjectOptions(examData.title)}
                              onQuestionsGenerated={(questions: any[]) => {
                                handleInputChange("aiQuestions", questions)
                                setShowAIConfirmation(true)
                              }}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="upload" className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-3">Upload Question File</h4>
                            <p className="text-sm text-gray-600 mb-4">Upload PDF or DOCX file with questions</p>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                              <Input
                                type="file"
                                accept=".pdf,.docx,.doc"
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
                                className="hidden"
                                id="question-file"
                              />
                              <label htmlFor="question-file" className="cursor-pointer">
                                <Button variant="outline" className="mt-2">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose File
                                </Button>
                              </label>
                            </div>
                            
                            {examData.uploadedFile && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium">File uploaded: {examData.uploadedFile.name}</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="mt-2 bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    toast({
                                      title: "Processing File",
                                      description: "Extracting questions from uploaded file..."
                                    })
                                    // Simulate file processing
                                    setTimeout(() => {
                                      toast({
                                        title: "Questions Extracted",
                                        description: "Successfully extracted questions from the file."
                                      })
                                    }, 2000)
                                  }}
                                >
                                  Extract Questions
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="random" className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-3">Random Question Assignment</h4>
                            <p className="text-sm text-gray-600 mb-4">Assign different questions to each student</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Questions per Student *</label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={examData.questionsPerStudent}
                                  onChange={(e) => handleInputChange("questionsPerStudent", parseInt(e.target.value) || 3)}
                                  placeholder="3"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button 
                                  onClick={() => setShowStudentAssignment(true)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Generate Random Assignment
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Instructions for Students</label>
                    <Textarea
                      placeholder="Enter exam instructions, rules, and guidelines..."
                      rows={5}
                      value={examData.instructions}
                      onChange={(e) => handleInputChange("instructions", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Security Settings */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Monitoring
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Security Monitoring</label>
                            <p className="text-xs text-gray-600">Monitor student activity during exam</p>
                          </div>
                          <Switch
                            checked={examData.enableSecurity}
                            onCheckedChange={(checked) => handleInputChange("enableSecurity", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Camera</label>
                            <p className="text-xs text-gray-600">Require camera access for monitoring</p>
                          </div>
                          <Switch
                            checked={examData.enableCamera}
                            onCheckedChange={(checked) => handleInputChange("enableCamera", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Microphone</label>
                            <p className="text-xs text-gray-600">Monitor audio during exam</p>
                          </div>
                          <Switch
                            checked={examData.enableMicrophone}
                            onCheckedChange={(checked) => handleInputChange("enableMicrophone", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Screen Share</label>
                            <p className="text-xs text-gray-600">Monitor screen activity</p>
                          </div>
                          <Switch
                            checked={examData.enableScreenShare}
                            onCheckedChange={(checked) => handleInputChange("enableScreenShare", checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Violation Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Allow Tab Switching</label>
                            <p className="text-xs text-gray-600">Allow students to switch browser tabs</p>
                          </div>
                          <Switch
                            checked={examData.allowTabSwitch}
                            onCheckedChange={(checked) => handleInputChange("allowTabSwitch", checked)}
                          />
                        </div>
                        {examData.allowTabSwitch && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Max Tab Switches</label>
                            <Input
                              type="number"
                              placeholder="3"
                              value={examData.maxTabSwitches}
                              onChange={(e) => handleInputChange("maxTabSwitches", e.target.value)}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Auto Submit on Violations</label>
                            <p className="text-xs text-gray-600">Automatically submit when threshold reached</p>
                          </div>
                          <Switch
                            checked={examData.enableAutoSubmit}
                            onCheckedChange={(checked) => handleInputChange("enableAutoSubmit", checked)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Warning Threshold</label>
                          <Input
                            type="number"
                            placeholder="3"
                            value={examData.warningThreshold}
                            onChange={(e) => handleInputChange("warningThreshold", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
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
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Publish Exam
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
                Do you want to continue with the AI generated questions or discard them?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">
                  <strong>{examData.aiQuestions.length} questions</strong> have been generated for your exam.
                </p>
                <p className="text-xs text-purple-600">
                  These questions are based on your exam title "{examData.title}" and selected topics.
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
                    const questionsText = examData.aiQuestions.map((q: any, i: number) => 
                      `Question ${i + 1}: ${q.title}\n\n${q.description}\n\nInput: ${q.inputFormat}\nOutput: ${q.outputFormat}\nConstraints: ${q.constraints}\n\nSample Input:\n${q.sampleInput}\n\nSample Output:\n${q.sampleOutput}\n\n---\n`
                    ).join('\n')
                    handleInputChange("description", questionsText)
                    toast({
                      title: "Questions Added",
                      description: "AI generated questions have been added to your exam."
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

        {/* Student Assignment Modal */}
        <Dialog open={showStudentAssignment} onOpenChange={setShowStudentAssignment}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Random Question Assignment
              </DialogTitle>
              <DialogDescription>
                Assign {examData.questionsPerStudent} questions to each student randomly
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockStudents.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.rollNo}</p>
                      </div>
                      <Badge variant="outline">{examData.questionsPerStudent} Questions</Badge>
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: examData.questionsPerStudent }, (_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Question {i + 1}: Array Manipulation</span>
                          <Input 
                            type="number" 
                            placeholder="Marks" 
                            className="w-20 h-8"
                            defaultValue="10"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowStudentAssignment(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowStudentAssignment(false)
                    toast({
                      title: "Assignment Generated",
                      description: "Random questions have been assigned to all students."
                    })
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generate Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
