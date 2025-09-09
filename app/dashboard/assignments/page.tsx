"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Assignment {
  id: string
  title: string
  description: string
  department: string
  subject: string
  dueDate: string
  status: "draft" | "published" | "closed"
  submissions: number
  totalStudents: number
  fileType: string
  createdAt: string
  facultyId: string
  year: string
  difficulty?: string
  ai_generated?: boolean
  file_based?: boolean
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const facultySession = localStorage.getItem("facultySession")
    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
        loadAssignments(user)
      } catch (error) {
        console.error("Error parsing faculty session:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const loadAssignments = (user: any) => {
    try {
      // Load assignments from the new storage key used in create page
      const savedAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
      // Filter assignments by faculty ID
      const userAssignments = savedAssignments.filter(
        (assignment: any) => assignment.faculty_id === user.id
      ).map((assignment: any) => ({
        id: assignment.id.toString(),
        title: assignment.title,
        description: assignment.description.substring(0, 150) + '...',
        department: assignment.department,
        subject: assignment.assignment_type || 'General',
        dueDate: assignment.due_date,
        status: assignment.status,
        submissions: 0,
        totalStudents: 25, // Mock data
        fileType: assignment.allowed_file_types?.[0] || 'pdf',
        createdAt: new Date().toISOString(),
        facultyId: assignment.faculty_id,
        year: assignment.year,
        difficulty: assignment.difficulty,
        ai_generated: assignment.ai_generated,
        file_based: assignment.file_based
      }))
      setAssignments(userAssignments)
    } catch (error) {
      console.error("Error loading assignments:", error)
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <Clock className="h-4 w-4" />
      case "closed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleDeleteAssignment = (id: string) => {
    const updatedAssignments = assignments.filter((a) => a.id !== id)
    setAssignments(updatedAssignments)

    // Update localStorage
    const allAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
    const filteredAll = allAssignments.filter((a: any) => a.id.toString() !== id)
    localStorage.setItem("assignments", JSON.stringify(filteredAll))
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
      title: "Published",
      value: assignments.filter((a) => a.status === "published").length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Draft",
      value: assignments.filter((a) => a.status === "draft").length.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Submissions",
      value: assignments.reduce((sum, a) => sum + a.submissions, 0).toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
            {[...Array(3)].map((_, i) => (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Create and manage student assignments</p>
        </div>
        <Link href="/dashboard/assignments/create">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </Link>
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first assignment"}
              </p>
              <Link href="/dashboard/assignments/create">
                <Button>Create Assignment</Button>
              </Link>
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
                  <div className="flex items-start justify-between">
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
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assignment.department} - Year {assignment.year}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {assignment.subject}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {assignment.submissions}/{assignment.totalStudents} submitted
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {assignment.ai_generated && (
                          <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
                            🤖 AI Generated
                          </Badge>
                        )}
                        {assignment.file_based && (
                          <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                            📁 File Based
                          </Badge>
                        )}
                        {assignment.difficulty && (
                          <Badge className="bg-orange-100 text-orange-800 border-0 text-xs">
                            {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/assignments/${assignment.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/assignments/manage/${assignment.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/assignments/submissions?id=${assignment.id}`}>
                            <Users className="h-4 w-4 mr-2" />
                            View Submissions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
