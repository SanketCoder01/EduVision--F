"use client"

import { DialogDescription } from "@/components/ui/dialog"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Code,
  BookOpen,
  GraduationCap,
  Play,
  Calendar,
  User,
  Clock,
  Eye,
  Camera,
  Mic,
  AlertTriangle,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Assignment {
  id: string
  title: string
  facultyName: string
  className: string
  givenDate: string
  lastDate: string
  description: string
  language: string
  rules: string[]
}

// Mock data for assignments
const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Basic Calculator Implementation",
    facultyName: "Dr. Sarah Johnson",
    className: "Computer Science - FY",
    givenDate: "2024-01-15",
    lastDate: "2024-01-25",
    description:
      "Create a basic calculator that can perform arithmetic operations including addition, subtraction, multiplication, and division. The calculator should handle edge cases like division by zero.",
    language: "C++",
    rules: [
      "No external libraries allowed except standard library",
      "Code must be well-commented",
      "Handle all edge cases",
      "Submit within the deadline",
      "No plagiarism allowed",
    ],
  },
  {
    id: "2",
    title: "Student Management System",
    facultyName: "Prof. Michael Chen",
    className: "Computer Science - FY",
    givenDate: "2024-01-20",
    lastDate: "2024-02-05",
    description:
      "Develop a student management system that can add, delete, update, and display student records. Use appropriate data structures for efficient operations.",
    language: "Java",
    rules: [
      "Use object-oriented programming concepts",
      "Implement proper exception handling",
      "Code should be modular and reusable",
      "Include input validation",
      "Document your code properly",
    ],
  },
]

export default function CompilerPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)

  const options = [
    {
      id: "assignments",
      title: "Assignments",
      description: "Complete coding assignments",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      count: mockAssignments.length,
    },
    {
      id: "exams",
      title: "Exams",
      description: "Take proctored exams",
      icon: GraduationCap,
      color: "from-red-500 to-red-600",
      count: 2,
    },
    {
      id: "practice",
      title: "Free Coding",
      description: "Practice coding",
      icon: Code,
      color: "from-green-500 to-green-600",
      count: null,
    },
    {
      id: "scorecard",
      title: "Scorecards",
      description: "View your results",
      icon: Trophy,
      color: "from-yellow-500 to-orange-600",
      count: null,
    },
  ]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleStartCoding = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowPermissionDialog(true)
  }

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop())

      toast.success("Permissions granted! Starting coding session...")

      // Navigate to the proctored compiler
      window.location.href = `/student-dashboard/compiler/code?assignment=${selectedAssignment?.id}`
    } catch (error) {
      toast.error("Camera and microphone access required for proctored sessions")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (selectedOption === "practice") {
    // Navigate to free coding compiler
    window.location.href = "/student-dashboard/compiler/code"
    return null
  }

  if (selectedOption === "scorecard") {
    // Navigate to scorecard page
    window.location.href = "/student-dashboard/compiler/scorecard"
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Code Compiler</h1>
          <p className="text-xl text-gray-600">Choose your coding environment</p>
        </motion.div>

        {!selectedOption ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${option.color}`} />
                  <CardHeader className="text-center pb-3">
                    <div
                      className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-3`}
                    >
                      <option.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-sm">{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    {option.count !== null && (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {option.count} Available
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : selectedOption === "assignments" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Your Assignments</h2>
              <Button variant="outline" onClick={() => setSelectedOption(null)}>
                Back to Options
              </Button>
            </div>

            <div className="grid gap-6">
              {mockAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {assignment.facultyName}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.className}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                              <Calendar className="h-4 w-4" />
                              Given: {formatDate(assignment.givenDate)}
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                              <Clock className="h-4 w-4" />
                              Due: {formatDate(assignment.lastDate)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-sm px-2 py-1">
                          {assignment.language}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{assignment.title}</DialogTitle>
                              <DialogDescription className="text-lg">Assignment Details</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Faculty:</strong> {assignment.facultyName}
                                </div>
                                <div>
                                  <strong>Class:</strong> {assignment.className}
                                </div>
                                <div>
                                  <strong>Language:</strong> {assignment.language}
                                </div>
                                <div>
                                  <strong>Due Date:</strong> {formatDate(assignment.lastDate)}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Description:</h4>
                                <p className="text-gray-700">{assignment.description}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Rules:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {assignment.rules.map((rule, index) => (
                                    <li key={index}>{rule}</li>
                                  ))}
                                </ul>
                              </div>

                              <Button className="w-full mt-4" onClick={() => handleStartCoding(assignment)}>
                                <Play className="h-4 w-4 mr-2" />
                                Start Coding
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleStartCoding(assignment)}
                        >
                          <Play className="h-4 w-4" />
                          Start Coding
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : selectedOption === "exams" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <GraduationCap className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Exams Coming Soon</h2>
            <p className="text-xl text-gray-600 mb-8">Proctored coding exams will be available soon</p>
            <Button variant="outline" onClick={() => setSelectedOption(null)}>
              Back to Options
            </Button>
          </motion.div>
        ) : null}

        {/* Permission Dialog */}
        <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Camera & Microphone Access Required
              </DialogTitle>
              <DialogDescription>
                This is a proctored coding session. We need access to your camera and microphone to monitor the session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Camera will monitor your face during the session</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Mic className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Microphone will detect if you speak during the session</span>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> You will receive warnings for looking away or speaking. After 3 warnings,
                  your session will be terminated.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPermissionDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={requestPermissions} className="flex-1">
                  Allow Access & Start
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
