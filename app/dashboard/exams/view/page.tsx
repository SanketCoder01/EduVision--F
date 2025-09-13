"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Monitor,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Stop
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface Exam {
  id: number
  title: string
  description: string
  department: string
  year: string
  exam_date: string
  duration: number
  language: string
  max_marks: number
  status: string
  visibility: boolean
  enable_security: boolean
  questions: any[]
  created_at?: string
  active_students?: number
  completed_submissions?: number
  pending_submissions?: number
}

export default function ViewExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadExams()
  }, [])

  useEffect(() => {
    filterExams()
  }, [exams, searchTerm, statusFilter, departmentFilter])

  const loadExams = () => {
    try {
      // Load from localStorage for demo
      const storedAssignments = JSON.parse(localStorage.getItem('coding_assignments') || '[]')
      const examData = storedAssignments.filter((item: any) => item.isExam)
      
      // Add mock data for active monitoring
      const examsWithStats = examData.map((exam: Exam) => ({
        ...exam,
        active_students: Math.floor(Math.random() * 25) + 5,
        completed_submissions: Math.floor(Math.random() * 30) + 10,
        pending_submissions: Math.floor(Math.random() * 15) + 5,
        created_at: exam.created_at || new Date().toISOString()
      }))
      
      setExams(examsWithStats)
    } catch (error) {
      console.error("Error loading exams:", error)
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterExams = () => {
    let filtered = exams

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(exam => exam.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(exam => exam.department === departmentFilter)
    }

    setFilteredExams(filtered)
  }

  const handleDeleteExam = (examId: number) => {
    try {
      const storedAssignments = JSON.parse(localStorage.getItem('coding_assignments') || '[]')
      const updatedAssignments = storedAssignments.filter((a: any) => a.id !== examId)
      localStorage.setItem('coding_assignments', JSON.stringify(updatedAssignments))
      
      const updatedExams = exams.filter(e => e.id !== examId)
      setExams(updatedExams)
      
      toast({
        title: "Exam Deleted",
        description: "Exam has been successfully deleted"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete exam",
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
      case "active":
        return <Play className="h-4 w-4 text-blue-500" />
      case "completed":
        return <Stop className="h-4 w-4 text-gray-500" />
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
      case "active":
        return "bg-blue-100 text-blue-800"
      case "completed":
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

  const isExamActive = (exam: Exam) => {
    const now = new Date()
    const examStart = new Date(exam.exam_date)
    const examEnd = new Date(examStart.getTime() + exam.duration * 60000)
    return now >= examStart && now <= examEnd
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">View Exams</h1>
            <p className="text-lg text-gray-600 mt-1">
              Monitor and manage all your coding exams
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/dashboard/exams/monitor")}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Monitor Students
            </Button>
            <Button
              onClick={() => router.push("/dashboard/exams/create")}
              className="bg-red-600 hover:bg-red-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create New Exam
            </Button>
          </div>
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
                  <p className="text-2xl font-bold text-red-600">{exams.length}</p>
                  <p className="text-sm text-gray-600">Total Exams</p>
                </div>
                <Calendar className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {exams.filter(e => isExamActive(e)).length}
                  </p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
                <Play className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {exams.filter(e => e.status === 'published').length}
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
                  <p className="text-2xl font-bold text-purple-600">
                    {exams.reduce((sum, e) => sum + (e.active_students || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Active Students</p>
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
                      placeholder="Search exams..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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

        {/* Exams List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredExams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No exams found</h3>
                <p className="text-gray-500 mb-4">
                  {exams.length === 0 
                    ? "You haven't created any exams yet."
                    : "No exams match your current filters."
                  }
                </p>
                {exams.length === 0 && (
                  <Button
                    onClick={() => router.push("/dashboard/exams/create")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Create Your First Exam
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${isExamActive(exam) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {exam.title}
                              </h3>
                              <Badge className={getStatusColor(exam.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(exam.status)}
                                  {isExamActive(exam) ? 'Active' : exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                </div>
                              </Badge>
                              {exam.enable_security && (
                                <Badge variant="outline" className="border-orange-200 text-orange-700">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Secured
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {exam.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Department:</span> {exam.department.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> {exam.year}
                          </div>
                          <div>
                            <span className="font-medium">Language:</span> {exam.language.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {exam.duration} min
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Exam: {formatDate(exam.exam_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Max Marks: {exam.max_marks}</span>
                          </div>
                        </div>

                        {/* Live Stats */}
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            {exam.active_students || 0} Active
                          </Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {exam.completed_submissions || 0} Completed
                          </Badge>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {exam.pending_submissions || 0} Pending
                          </Badge>
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            {exam.questions.length} Questions
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
                              onClick={() => setSelectedExam(exam)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{selectedExam?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                  {selectedExam?.description}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-1">Department</h4>
                                  <p className="text-gray-600">{selectedExam?.department.toUpperCase()}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Year</h4>
                                  <p className="text-gray-600">{selectedExam?.year}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Language</h4>
                                  <p className="text-gray-600">{selectedExam?.language.toUpperCase()}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Duration</h4>
                                  <p className="text-gray-600">{selectedExam?.duration} minutes</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Questions ({selectedExam?.questions.length})</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {selectedExam?.questions.map((q: any, idx: number) => (
                                    <div key={q.id} className="p-2 bg-gray-50 rounded text-sm">
                                      <strong>Q{idx + 1}:</strong> {q.title} ({q.points} points)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {isExamActive(exam) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/exams/monitor/${exam.id}`)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Monitor className="h-4 w-4 mr-1" />
                            Monitor Live
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/exams/submissions/${exam.id}`)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          View Submissions
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/exams/edit/${exam.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteExam(exam.id)}
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
