"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Square,
  Save,
  Download,
  Upload,
  Settings,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Code,
  Terminal,
  FileText,
  Maximize2,
  Minimize2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Lock,
  Unlock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export default function StudentCompilerPage() {
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [language, setLanguage] = useState("cpp")
  const [assignment, setAssignment] = useState(null)
  const [warnings, setWarnings] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 1 hour
  const [isExamMode, setIsExamMode] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [isExited, setIsExited] = useState(false)
  const [rejoinRequested, setRejoinRequested] = useState(false)
  const [securityMonitoring, setSecurityMonitoring] = useState({
    tabSwitches: 0,
    suspiciousActivity: [],
    lastActivity: new Date().toISOString(),
  })

  const codeEditorRef = useRef(null)
  const activityMonitorRef = useRef(null)

  // Security monitoring
  useEffect(() => {
    if (!isExamMode) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSecurityViolation("Tab switched or window minimized")
      }
    }

    const handleFocus = () => {
      if (document.hasFocus()) {
        logActivity("Window focused")
      }
    }

    const handleBlur = () => {
      handleSecurityViolation("Window lost focus - possible cheating attempt")
    }

    const handleKeyDown = (e) => {
      // Disable certain key combinations
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
        if (!assignment?.allowCopyPaste) {
          e.preventDefault()
          handleSecurityViolation("Attempted copy/paste operation")
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isExamMode, assignment])

  // Timer countdown
  useEffect(() => {
    if (!isExamMode || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isExamMode, timeRemaining])

  // Load assignment data
  useEffect(() => {
    const loadAssignment = () => {
      // Try to load from localStorage first
      const storedAssignments = JSON.parse(localStorage.getItem("coding_assignments") || "[]")
      const assignmentId = window.location.pathname.split('/').pop()
      let foundAssignment = storedAssignments.find((a: any) => a.id === assignmentId)
      
      if (!foundAssignment) {
        // Sample assignment data with questions
        foundAssignment = {
          id: "assignment-1",
          title: "Data Structures Implementation",
          description: "Implement a binary search tree with insert, delete, and search operations.",
          language: "cpp",
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          isExam: true,
          examDuration: 3600,
          enableSecurity: true,
          allowCopyPaste: false,
          maxAttempts: 3,
          totalMarks: 100,
          facultyName: "Dr. Sarah Johnson",
          department: "CSE",
          studyingYear: "2nd",
          rules: "1. No external resources allowed\n2. Complete within time limit\n3. Original code only\n4. No collaboration",
          questions: [
            {
              id: "q1",
              title: "Binary Search Tree Implementation",
              description: "Create a class called BST with methods for insert, delete, and search operations. The tree should maintain BST properties.",
              points: 50
            },
            {
              id: "q2", 
              title: "Tree Traversal",
              description: "Implement inorder, preorder, and postorder traversal methods for your BST.",
              points: 30
            },
            {
              id: "q3",
              title: "Find Minimum and Maximum",
              description: "Add methods to find the minimum and maximum values in the BST.",
              points: 20
            }
          ]
        }
      }
      
      setAssignment(foundAssignment)
      setLanguage(foundAssignment.language)
      setIsExamMode(foundAssignment.isExam)
      setTimeRemaining(foundAssignment.examDuration || 3600)
    }

    loadAssignment()
  }, [])

  const handleSecurityViolation = (violation) => {
    const newWarnings = warnings + 1
    setWarnings(newWarnings)
    
    const activity = {
      type: "security_violation",
      description: violation,
      timestamp: new Date().toISOString(),
      severity: "high"
    }

    setSecurityMonitoring(prev => ({
      ...prev,
      suspiciousActivity: [...prev.suspiciousActivity, activity],
      tabSwitches: violation.includes("Tab") ? prev.tabSwitches + 1 : prev.tabSwitches,
    }))

    // Send to faculty monitoring
    sendActivityToFaculty(activity)

    setWarningMessage(violation)
    setShowWarningDialog(true)

    if (newWarnings >= 3) {
      handleAutoExit()
    }

    toast({
      title: "Security Warning",
      description: `Warning ${newWarnings}/3: ${violation}`,
      variant: "destructive",
    })
  }

  const logActivity = (activity) => {
    const activityLog = {
      type: "normal",
      description: activity,
      timestamp: new Date().toISOString(),
      severity: "low"
    }

    setSecurityMonitoring(prev => ({
      ...prev,
      lastActivity: new Date().toISOString(),
    }))

    sendActivityToFaculty(activityLog)
  }

  const sendActivityToFaculty = (activity) => {
    // Send real-time activity to faculty dashboard
    const facultyActivities = JSON.parse(localStorage.getItem("faculty_student_activities") || "[]")
    const newActivity = {
      studentId: "student_123",
      studentName: "Current Student",
      assignmentId: assignment?.id,
      assignmentTitle: assignment?.title,
      activity,
      timestamp: new Date().toISOString(),
    }
    
    facultyActivities.push(newActivity)
    localStorage.setItem("faculty_student_activities", JSON.stringify(facultyActivities))
  }

  const handleAutoExit = () => {
    setIsExited(true)
    toast({
      title: "Exam Terminated",
      description: "You have been automatically exited due to multiple security violations.",
      variant: "destructive",
    })
    
    // Save current progress
    saveProgress()
  }

  const handleAutoSubmit = () => {
    toast({
      title: "Time's Up!",
      description: "Your exam has been automatically submitted.",
    })
    
    // Auto-submit the code
    submitCode()
  }

  const handleRejoinRequest = () => {
    const studentId = "student_123" // This would come from auth context
    const rejoinRequest = {
      id: `req_${Date.now()}`,
      studentId,
      studentName: "Current Student",
      assignmentId: assignment?.id,
      assignmentTitle: assignment?.title,
      reason: "Multiple security violations - auto-exited",
      requestedAt: new Date().toISOString(),
      status: "pending",
      warnings
    }
    
    const requests = JSON.parse(localStorage.getItem("rejoin_requests") || "[]")
    requests.push(rejoinRequest)
    localStorage.setItem("rejoin_requests", JSON.stringify(requests))
    
    setRejoinRequested(true)
    toast({
      title: "Rejoin Request Sent",
      description: "Please wait for faculty approval to rejoin the exam.",
    })
  }

  const runCode = async () => {
    setIsRunning(true)
    logActivity("Code execution started")
    
    // Simulate code execution
    setTimeout(() => {
      setOutput(`Compiling ${language} code...\n\nExecution successful!\nOutput: Hello World\n\nExecution time: 0.23s\nMemory used: 1.2MB`)
      setIsRunning(false)
      logActivity("Code execution completed")
    }, 2000)
  }

  const saveProgress = () => {
    const progress = {
      assignmentId: assignment?.id,
      code,
      timestamp: new Date().toISOString(),
      warnings,
      securityMonitoring,
    }
    
    localStorage.setItem("coding_progress", JSON.stringify(progress))
    toast({
      title: "Progress Saved",
      description: "Your work has been saved automatically.",
    })
  }

  const submitCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code to Submit",
        description: "Please write some code before submitting.",
        variant: "destructive",
      })
      return
    }

    // Show loading state
    toast({
      title: "Submitting Code...",
      description: "Please wait while we process your submission.",
    })

    // AI Evaluation simulation
    const evaluateCode = () => {
      const codeLength = code.length
      const hasClasses = code.includes('class') || code.includes('struct')
      const hasFunctions = code.includes('function') || code.includes('def') || code.includes('void') || code.includes('int main')
      const hasLoops = code.includes('for') || code.includes('while')
      const hasConditions = code.includes('if') || code.includes('switch')
      
      let score = 0
      let feedback = []
      
      // Basic scoring logic
      if (codeLength > 50) {
        score += 20
        feedback.push("✓ Adequate code length")
      } else {
        feedback.push("✗ Code seems too short")
      }
      
      if (hasClasses) {
        score += 30
        feedback.push("✓ Uses classes/structures")
      } else {
        feedback.push("✗ Missing class implementation")
      }
      
      if (hasFunctions) {
        score += 25
        feedback.push("✓ Contains functions/methods")
      } else {
        feedback.push("✗ Missing function implementations")
      }
      
      if (hasLoops) {
        score += 15
        feedback.push("✓ Uses loops")
      }
      
      if (hasConditions) {
        score += 10
        feedback.push("✓ Uses conditional statements")
      }
      
      return { score: Math.min(score, 100), feedback }
    }

    // Simulate AI processing delay
    setTimeout(() => {
      const evaluation = evaluateCode()
      
      const submission = {
        id: Date.now().toString(),
        assignmentId: assignment?.id,
        assignmentTitle: assignment?.title,
        studentId: "student_123",
        studentName: "Current Student",
        code,
        language,
        submittedAt: new Date().toISOString(),
        warnings,
        securityMonitoring,
        status: "submitted",
        aiEvaluation: evaluation,
        grade: evaluation.score,
        feedback: evaluation.feedback,
        timeSpent: Math.floor((Date.now() - Date.now()) / 60000) + 15, // Mock time
      }
      
      const submissions = JSON.parse(localStorage.getItem("coding_submissions") || "[]")
      submissions.push(submission)
      localStorage.setItem("coding_submissions", JSON.stringify(submissions))
      
      // Add to assignment submissions for faculty view
      const assignmentSubmissions = JSON.parse(localStorage.getItem("assignment_submissions") || "[]")
      assignmentSubmissions.push(submission)
      localStorage.setItem("assignment_submissions", JSON.stringify(assignmentSubmissions))
      
      // Success message with AI feedback
      toast({
        title: "✅ Submission Successful!",
        description: `Code submitted and evaluated. Score: ${evaluation.score}/100`,
      })
      
      // Show detailed results
      setTimeout(() => {
        alert(`🎉 Submission Complete!\n\nAI Evaluation Results:\nScore: ${evaluation.score}/100\n\nFeedback:\n${evaluation.feedback.join('\n')}\n\nYour submission has been recorded and sent to faculty for review.`)
      }, 1000)
      
    }, 2000)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isExited) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Exam Terminated</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You have been exited from the exam due to multiple security violations.
            </p>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">Warnings: {warnings}/3</p>
            </div>
            {!rejoinRequested ? (
              <Button onClick={handleRejoinRequest} className="w-full">
                Request to Rejoin
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Rejoin request sent</p>
                <p className="text-xs text-gray-500">Please contact your faculty for approval</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                {assignment?.title || "Coding Assignment"}
              </h1>
            </div>
            {isExamMode && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>EXAM MODE</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isExamMode && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-mono text-lg text-red-600">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            {warnings > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Warnings: {warnings}/3</span>
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{language.toUpperCase()}</Badge>
              <span className="text-sm text-gray-600">
                {assignment?.facultyName} • {assignment?.department} {assignment?.studyingYear}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={saveProgress}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                onClick={runCode} 
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isRunning ? "Running..." : "Run Code"}
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <Textarea
              ref={codeEditorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="h-full font-mono text-sm resize-none"
              style={{ minHeight: "400px" }}
            />
          </div>
        </div>

        {/* Right Panel - Questions & Output */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Questions Section */}
          <div className="p-4 border-b max-h-80 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Questions ({assignment?.questions?.length || 0})
            </h3>
            {assignment?.questions && assignment.questions.length > 0 ? (
              <div className="space-y-3">
                {assignment.questions.map((question: any, index: number) => (
                  <div key={question.id} className="border-l-4 border-l-blue-500 pl-3 py-2 bg-blue-50 rounded-r">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        Q{index + 1}: {question.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {question.points} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {question.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No questions available</p>
              </div>
            )}
          </div>

          {/* Assignment Details */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-2">Assignment Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">{assignment?.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Total Marks:</span>
                  <span className="font-medium ml-1">{assignment?.totalMarks}</span>
                </div>
                <div>
                  <span className="text-gray-500">Attempts:</span>
                  <span className="font-medium ml-1">{assignment?.maxAttempts}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Terminal className="h-4 w-4 mr-1" />
              Output
            </h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs h-48 overflow-y-auto">
              {output || "Run your code to see the output..."}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <Button onClick={submitCode} className="w-full bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Solution
            </Button>
          </div>
        </div>
      </div>

      {/* Security Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Security Warning
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {warningMessage}
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                Warning {warnings}/3
              </div>
              <p className="text-sm text-gray-600">
                {warnings >= 3 ? "You will be exited from the exam." : "You will be automatically exited after 3 warnings."}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowWarningDialog(false)} className="w-full">
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
