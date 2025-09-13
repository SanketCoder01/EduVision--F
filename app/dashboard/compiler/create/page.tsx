"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  Code,
  Zap,
  Settings,
  FileText,
  Clock,
  Shield
} from "lucide-react"

interface AssignmentData {
  title: string
  facultyName: string
  givenDate: string
  dueDate: string
  department: string
  studyingYear: string
  className: string
  language: string
  attempts: string
  maxAttempts: string
  description: string
  rules: string
  allowCopyPaste: boolean
  allowNegativeMarking: boolean
  allowResubmission: boolean
  enableMarking: boolean
  totalMarks: string
  isExam: boolean
  examDuration: string
  enableSecurity: boolean
}

export default function CreateCompilerAssignment() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: "",
    facultyName: "Dr. Smith Johnson",
    givenDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    department: "",
    studyingYear: "",
    className: "",
    language: "",
    attempts: "no",
    maxAttempts: "1",
    description: "",
    rules: "",
    allowCopyPaste: false,
    allowNegativeMarking: false,
    allowResubmission: false,
    enableMarking: false,
    totalMarks: "",
    isExam: false,
    examDuration: "60",
    enableSecurity: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
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
    try {
      const newAssignment = {
        id: Date.now(),
        ...assignmentData,
        status: "published",
        createdAt: new Date().toISOString()
      }

      const existingAssignments = JSON.parse(localStorage.getItem("coding_assignments") || "[]")
      const updatedAssignments = [...existingAssignments, newAssignment]
      localStorage.setItem("coding_assignments", JSON.stringify(updatedAssignments))
      
      toast({
        title: "Assignment Published!",
        description: "Your coding assignment has been successfully published.",
      })

      router.push('/dashboard/compiler/assignments')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish assignment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generateWithAI = () => {
    toast({
      title: "AI Generation",
      description: "AI assignment generation feature coming soon!",
    })
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Description", icon: Code },
    { number: 3, title: "Settings", icon: Settings },
    { number: 4, title: "Review", icon: Save }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
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
            Create Coding Assignment
          </h1>
          <p className="text-gray-600">
            Create a new coding assignment or exam with AI assistance
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
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <step.icon className="w-5 h-5" />
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

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Assignment Title *</label>
                      <Input
                        placeholder="Enter assignment title"
                        value={assignmentData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Faculty Name</label>
                      <Input
                        value={assignmentData.facultyName}
                        onChange={(e) => handleInputChange("facultyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department *</label>
                      <Select value={assignmentData.department} onValueChange={(value) => handleInputChange("department", value)}>
                        <SelectTrigger>
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
                      <label className="text-sm font-medium mb-2 block">Year *</label>
                      <Select value={assignmentData.studyingYear} onValueChange={(value) => handleInputChange("studyingYear", value)}>
                        <SelectTrigger>
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
                      <label className="text-sm font-medium mb-2 block">Programming Language *</label>
                      <Select value={assignmentData.language} onValueChange={(value) => handleInputChange("language", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C++">C++</SelectItem>
                          <SelectItem value="Java">Java</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                          <SelectItem value="Go">Go</SelectItem>
                          <SelectItem value="Rust">Rust</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Due Date *</label>
                      <Input
                        type="date"
                        value={assignmentData.dueDate}
                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">AI Assistant</h3>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      Let AI help you generate assignment content based on your requirements
                    </p>
                    <Button onClick={generateWithAI} variant="outline" className="border-blue-300 text-blue-700">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Description */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assignment Description *</label>
                    <Textarea
                      placeholder="Enter detailed assignment description, problem statement, requirements, and expected output..."
                      rows={8}
                      value={assignmentData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rules & Guidelines</label>
                    <Textarea
                      placeholder="Enter assignment rules, submission guidelines, and any special instructions..."
                      rows={5}
                      value={assignmentData.rules}
                      onChange={(e) => handleInputChange("rules", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Assignment Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Allow Copy-Paste</label>
                            <p className="text-xs text-gray-600">Students can copy and paste code</p>
                          </div>
                          <Switch
                            checked={assignmentData.allowCopyPaste}
                            onCheckedChange={(checked) => handleInputChange("allowCopyPaste", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Allow Resubmission</label>
                            <p className="text-xs text-gray-600">Students can submit multiple times</p>
                          </div>
                          <Switch
                            checked={assignmentData.allowResubmission}
                            onCheckedChange={(checked) => handleInputChange("allowResubmission", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Marking</label>
                            <p className="text-xs text-gray-600">Assign marks to this assignment</p>
                          </div>
                          <Switch
                            checked={assignmentData.enableMarking}
                            onCheckedChange={(checked) => handleInputChange("enableMarking", checked)}
                          />
                        </div>
                        {assignmentData.enableMarking && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Total Marks</label>
                            <Input
                              type="number"
                              placeholder="Enter total marks"
                              value={assignmentData.totalMarks}
                              onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Exam Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Is this an Exam?</label>
                            <p className="text-xs text-gray-600">Enable exam mode with time limits</p>
                          </div>
                          <Switch
                            checked={assignmentData.isExam}
                            onCheckedChange={(checked) => handleInputChange("isExam", checked)}
                          />
                        </div>
                        {assignmentData.isExam && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Exam Duration (minutes)</label>
                              <Input
                                type="number"
                                placeholder="Enter duration"
                                value={assignmentData.examDuration}
                                onChange={(e) => handleInputChange("examDuration", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <label className="text-sm font-medium">Enable Security Monitoring</label>
                                <p className="text-xs text-gray-600">Monitor student activity during exam</p>
                              </div>
                              <Switch
                                checked={assignmentData.enableSecurity}
                                onCheckedChange={(checked) => handleInputChange("enableSecurity", checked)}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Review & Publish</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><strong>Title:</strong> {assignmentData.title}</div>
                      <div><strong>Faculty:</strong> {assignmentData.facultyName}</div>
                      <div><strong>Department:</strong> {assignmentData.department}</div>
                      <div><strong>Year:</strong> {assignmentData.studyingYear}</div>
                      <div><strong>Language:</strong> {assignmentData.language}</div>
                      <div><strong>Due Date:</strong> {assignmentData.dueDate}</div>
                      <div><strong>Type:</strong> {assignmentData.isExam ? "Exam" : "Assignment"}</div>
                      {assignmentData.enableMarking && <div><strong>Total Marks:</strong> {assignmentData.totalMarks}</div>}
                    </div>
                    {assignmentData.description && (
                      <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{assignmentData.description}</p>
                      </div>
                    )}
                    {assignmentData.rules && (
                      <div>
                        <strong>Rules:</strong>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{assignmentData.rules}</p>
                      </div>
                    )}
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
                  {currentStep < 4 ? (
                    <Button onClick={handleNext} className="flex items-center gap-2">
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Publish Assignment
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
