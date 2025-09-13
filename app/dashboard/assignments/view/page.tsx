"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  Search,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface Assignment {
  id: number
  title: string
  description: string
  department: string
  year: string
  assignment_type: string
  max_marks: number
  due_date: string
  status: string
  visibility: boolean
  created_at?: string
  submissions_count?: number
  pending_count?: number
  graded_count?: number
}

export default function ViewAssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, searchTerm, statusFilter, departmentFilter])

  const loadAssignments = () => {
    try {
      // Load from localStorage for demo
      const storedAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      
      // Add mock submission data
      const assignmentsWithStats = storedAssignments.map((assignment: Assignment) => ({
        ...assignment,
        submissions_count: Math.floor(Math.random() * 50) + 10,
        pending_count: Math.floor(Math.random() * 20) + 5,
        graded_count: Math.floor(Math.random() * 30) + 15,
        created_at: assignment.created_at || new Date().toISOString()
      }))
      
      setAssignments(assignmentsWithStats)
    } catch (error) {
      console.error("Error loading assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = assignments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(assignment => assignment.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(assignment => assignment.department === departmentFilter)
    }

    setFilteredAssignments(filtered)
  }

  const handleDeleteAssignment = (assignmentId: number) => {
    try {
      const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
      setAssignments(updatedAssignments)
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments))
      
      toast({
        title: "Assignment Deleted",
        description: "Assignment has been successfully deleted"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "archived":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">View Assignments</h1>
            <p className="text-lg text-gray-600 mt-1">
              Manage and monitor all your assignments
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/assignments/create")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Create New Assignment
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {assignments.filter(a => a.status === 'published').length}
                  </p>
                  <p className="text-sm text-gray-600">Published</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {assignments.filter(a => a.status === 'draft').length}
                  </p>
                  <p className="text-sm text-gray-600">Drafts</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {assignments.reduce((sum, a) => sum + (a.submissions_count || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="cse">CSE</SelectItem>
                    <SelectItem value="cy">Cyber Security</SelectItem>
                    <SelectItem value="aids">AIDS</SelectItem>
                    <SelectItem value="aiml">AIML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No assignments found</h3>
                <p className="text-gray-500 mb-4">
                  {assignments.length === 0 
                    ? "You haven't created any assignments yet."
                    : "No assignments match your current filters."
                  }
                </p>
                {assignments.length === 0 && (
                  <Button
                    onClick={() => router.push("/dashboard/assignments/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Your First Assignment
                  </Button>
                )}
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
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {assignment.title}
                              </h3>
                              <Badge className={getStatusColor(assignment.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(assignment.status)}
                                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                </div>
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {assignment.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Department:</span> {assignment.department.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> {assignment.year}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {assignment.assignment_type.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Max Marks:</span> {assignment.max_marks}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Due: {formatDate(assignment.due_date)}</span>
                          </div>
                          {assignment.created_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>Created: {formatDate(assignment.created_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Submission Stats */}
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <Users className="h-3 w-3 mr-1" />
                            {assignment.submissions_count || 0} Submissions
                          </Badge>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {assignment.pending_count || 0} Pending
                          </Badge>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {assignment.graded_count || 0} Graded
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAssignment(assignment)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{selectedAssignment?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                  {selectedAssignment?.description}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-1">Department</h4>
                                  <p className="text-gray-600">{selectedAssignment?.department.toUpperCase()}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Year</h4>
                                  <p className="text-gray-600">{selectedAssignment?.year}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Type</h4>
                                  <p className="text-gray-600">{selectedAssignment?.assignment_type.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Max Marks</h4>
                                  <p className="text-gray-600">{selectedAssignment?.max_marks}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/assignments/submissions/${assignment.id}`)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          View Submissions
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/assignments/edit/${assignment.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
