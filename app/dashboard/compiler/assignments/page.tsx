"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Code,
  Calendar,
  Users,
  FileText,
  ArrowLeft,
  Download,
  Play
} from "lucide-react"

interface Assignment {
  id: number
  title: string
  facultyName: string
  department: string
  studyingYear: string
  language: string
  dueDate: string
  isExam: boolean
  status: string
  submissions: number
  totalStudents: number
  createdAt: string
  description: string
  rules?: string
}

export default function CompilerAssignments() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, searchTerm, filterDepartment, filterType])

  const loadAssignments = () => {
    try {
      // Load both assignments and exams
      const savedAssignments = JSON.parse(localStorage.getItem("coding_assignments") || "[]")
      const savedExams = JSON.parse(localStorage.getItem("coding_exams") || "[]")
      
      // Combine assignments and exams
      const allItems = [
        ...savedAssignments.map((item: any) => ({ ...item, isExam: false })),
        ...savedExams.map((item: any) => ({ ...item, isExam: true, dueDate: item.examDate }))
      ]
      
      const itemsWithStats = allItems.map((item: any) => ({
        ...item,
        submissions: Math.floor(Math.random() * 50) + 10,
        totalStudents: Math.floor(Math.random() * 100) + 50
      }))
      
      setAssignments(itemsWithStats)
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = assignments

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.language.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter(assignment => assignment.department === filterDepartment)
    }

    if (filterType !== "all") {
      if (filterType === "assignment") {
        filtered = filtered.filter(assignment => !assignment.isExam)
      } else if (filterType === "exam") {
        filtered = filtered.filter(assignment => assignment.isExam)
      }
    }

    setFilteredAssignments(filtered)
  }

  const handleDelete = (id: number) => {
    try {
      const updatedAssignments = assignments.filter(a => a.id !== id)
      localStorage.setItem("coding_assignments", JSON.stringify(updatedAssignments))
      setAssignments(updatedAssignments)
    } catch (error) {
      console.error("Error deleting assignment:", error)
    }
  }

  const getStatusColor = (assignment: Assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    
    if (dueDate < now) return "destructive"
    if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return "secondary"
    return "default"
  }

  const getStatusText = (assignment: Assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    
    if (dueDate < now) return "Expired"
    if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return "Due Soon"
    return "Active"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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
            Compiler Assignments
          </h1>
          <p className="text-gray-600">
            Manage and review all your coding assignments and exams
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="CSE">Computer Science</SelectItem>
                <SelectItem value="AIDS">AI & Data Science</SelectItem>
                <SelectItem value="AIML">AI & Machine Learning</SelectItem>
                <SelectItem value="CYBER">Cyber Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => router.push('/dashboard/compiler/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Code className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assignments.filter(a => new Date(a.dueDate) > new Date()).length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {assignments.filter(a => !a.isExam).length}
                  </p>
                </div>
                <Code className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exams</p>
                  <p className="text-2xl font-bold text-red-600">
                    {assignments.filter(a => a.isExam).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignments Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAssignments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No assignments found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {assignment.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant={assignment.isExam ? "destructive" : "default"}>
                            {assignment.isExam ? "Exam" : "Assignment"}
                          </Badge>
                          <Badge variant="outline">{assignment.language}</Badge>
                          <Badge variant={getStatusColor(assignment)}>
                            {getStatusText(assignment)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        {assignment.department} - {assignment.studyingYear}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{assignment.submissions}</span> / {assignment.totalStudents} submitted
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round((assignment.submissions / assignment.totalStudents) * 100)}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{assignment.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Faculty:</strong> {assignment.facultyName}</div>
                              <div><strong>Department:</strong> {assignment.department}</div>
                              <div><strong>Year:</strong> {assignment.studyingYear}</div>
                              <div><strong>Language:</strong> {assignment.language}</div>
                              <div><strong>Due Date:</strong> {assignment.dueDate}</div>
                              <div><strong>Type:</strong> {assignment.isExam ? "Exam" : "Assignment"}</div>
                            </div>
                            <div>
                              <strong>Description:</strong>
                              <p className="mt-1 text-sm text-gray-600">{assignment.description}</p>
                            </div>
                            {assignment.rules && (
                              <div>
                                <strong>Rules:</strong>
                                <p className="mt-1 text-sm text-gray-600">{assignment.rules}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
