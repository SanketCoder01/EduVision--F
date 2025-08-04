"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Calendar, Clock, CheckCircle, AlertTriangle, FileText, Download, Upload, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
  getAssignmentsByDepartmentAndYear,
  getStudentSubmissionForAssignment,
  subscribeToAssignments,
} from "@/lib/supabase"

interface Assignment {
  id: string
  title: string
  description: string
  faculty_id: string
  department: string
  year: string
  assignment_type: string
  allowed_file_types: string[]
  max_marks: number
  due_date: string
  start_date: string
  visibility: boolean
  allow_late_submission: boolean
  allow_resubmission: boolean
  enable_plagiarism_check: boolean
  status: string
  created_at: string
  faculty: {
    name: string
    email: string
  }
  resources: any[]
  submission?: any
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const studentSession = localStorage.getItem("studentSession")
    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setCurrentUser(user)
        loadAssignments(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
        toast({
          title: "Session Error",
          description: "Please log in again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Authentication Required",
        description: "Please log in to view assignments.",
        variant: "destructive",
      })
    }
  }, [])

  const loadAssignments = async (user: any) => {
    try {
      setIsLoading(true)

      // Fetch assignments for the student's department and year
      const assignmentsData = await getAssignmentsByDepartmentAndYear(user.department, user.year)

      // For each assignment, check if student has submitted
      const assignmentsWithSubmissions = await Promise.all(
        assignmentsData.map(async (assignment) => {
          try {
            const submission = await getStudentSubmissionForAssignment(user.id, assignment.id)
            return {
              ...assignment,
              submission,
              status: getAssignmentStatus(assignment, submission),
            }
          } catch (error) {
            return {
              ...assignment,
              submission: null,
              status: getAssignmentStatus(assignment, null),
            }
          }
        }),
      )

      setAssignments(assignmentsWithSubmissions)

      // Set up real-time subscription for new assignments
      const subscription = subscribeToAssignments(user.department, user.year, (payload) => {
        console.log("Assignment update:", payload)
        // Reload assignments when there's a change
        loadAssignments(user)
      })

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error loading assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load assignments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAssignmentStatus = (assignment: Assignment, submission: any) => {
    if (submission) {
      if (submission.status === "graded") return "graded"
      if (submission.status === "returned") return "returned"
      return "submitted"
    }

    const now = new Date()
    const dueDate = new Date(assignment.due_date)

    if (now > dueDate) return "overdue"
    return "pending"
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "graded":
        return "bg-green-100 text-green-800"
      case "returned":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="h-4 w-4" />
      case "graded":
        return <CheckCircle className="h-4 w-4" />
      case "returned":
        return <AlertTriangle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const stats = [
    {
      title: "Total Assignments",
      value: assignments.length.toString(),
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending",
      value: assignments.filter((a) => a.status === "pending").length.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Submitted",
      value: assignments.filter((a) => a.status === "submitted" || a.status === "graded").length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Average Score",
      value: (() => {
        const gradedAssignments = assignments.filter((a) => a.submission?.grade)
        if (gradedAssignments.length === 0) return "N/A"
        const average =
          gradedAssignments.reduce((sum, a) => sum + (a.submission.grade || 0), 0) / gradedAssignments.length
        return `${Math.round((average / gradedAssignments[0]?.max_marks || 100) * 100)}%`
      })(),
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-1">
          View and submit assignments for {currentUser?.department?.toUpperCase()} - {currentUser?.year} Year
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No assignments have been assigned yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                        <Badge className={`${getStatusColor(assignment.status)} border-0`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(assignment.status)}
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {assignment.faculty?.name || "Faculty"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {assignment.assignment_type.replace("_", " ")} • {assignment.max_marks} marks
                        </div>
                        {assignment.status === "pending" && (
                          <div
                            className={`flex items-center gap-1 ${
                              getDaysRemaining(assignment.due_date) <= 1
                                ? "text-red-600"
                                : getDaysRemaining(assignment.due_date) <= 3
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          >
                            <Clock className="h-4 w-4" />
                            {getDaysRemaining(assignment.due_date) > 0
                              ? `${getDaysRemaining(assignment.due_date)} days left`
                              : "Overdue"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress and Score */}
                  {assignment.status === "graded" && assignment.submission?.grade !== undefined && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Score</span>
                        <span className="text-sm font-bold text-green-800">
                          {assignment.submission.grade}/{assignment.max_marks}
                        </span>
                      </div>
                      <Progress
                        value={(assignment.submission.grade / assignment.max_marks) * 100}
                        className="h-2 mb-2"
                      />
                      {assignment.submission.feedback && (
                        <p className="text-sm text-green-700 mt-2">
                          <strong>Feedback:</strong> {assignment.submission.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {(assignment.status === "pending" || assignment.status === "returned") && (
                      <Link href={`/student-dashboard/assignments/submit/${assignment.id}`}>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                          <Upload className="h-4 w-4 mr-2" />
                          {assignment.status === "returned" ? "Resubmit" : "Submit"} Assignment
                        </Button>
                      </Link>
                    )}
                    {assignment.status === "submitted" && (
                      <Button variant="outline" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submitted on{" "}
                        {assignment.submission?.submitted_at &&
                          new Date(assignment.submission.submitted_at).toLocaleDateString()}
                      </Button>
                    )}
                    {assignment.status === "graded" && (
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    )}
                    <Link href={`/student-dashboard/assignments/view/${assignment.id}`}>
                      <Button variant="ghost">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
