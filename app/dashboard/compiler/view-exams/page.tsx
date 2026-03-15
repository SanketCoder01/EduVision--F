"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { 
  ArrowLeft,
  Eye,
  Edit,
  Monitor,
  Users,
  Calendar,
  Clock,
  Award,
  Settings,
  Play,
  Pause,
  Square,
  FileText,
  Code,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Exam {
  id: string
  title: string
  faculty_name: string
  faculty_id: string
  department: string
  studying_year: string
  language: string
  created_at: string
  start_time: string
  end_time: string
  duration: number
  total_marks: number
  passing_marks: number
  status: string
  description: string
  instructions: string
  questions: any[]
  enable_proctoring: boolean
  submissions_count?: number
}

interface Submission {
  id: string
  student_id: string
  student_name: string
  student_email: string
  exam_id: string
  code: string
  language: string
  output: string
  status: string
  marks_obtained: number
  submitted_at: string
  violation_count?: number
  violation_types?: string[]
  question_index: number
}

export default function ViewExams() {
  const router = useRouter()
  const { toast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [facultyId, setFacultyId] = useState<string>("")

  useEffect(() => {
    loadExams()
    
    // Real-time subscription for exams
    const channel = supabase
      .channel('faculty-exams-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'compiler_exams' },
        (payload) => {
          const newExam = payload.new as Exam
          if (newExam.faculty_id === facultyId) {
            setExams(prev => [newExam, ...prev])
            toast({
              title: "New Exam Created",
              description: `${newExam.title} has been scheduled`
            })
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'compiler_exams' },
        (payload) => {
          const updatedExam = payload.new as Exam
          setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [facultyId])

  const loadExams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setFacultyId(user.id)
      
      const { data, error } = await supabase
        .from('compiler_exams')
        .select('*')
        .eq('faculty_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Get submission counts
      const examsWithCounts = await Promise.all((data || []).map(async (exam) => {
        const { count } = await supabase
          .from('student_code_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('exam_id', exam.id)
        
        return { ...exam, submissions_count: count || 0 }
      }))
      
      setExams(examsWithCounts)
    } catch (error) {
      console.error("Error loading exams:", error)
      toast({ title: "Error", description: "Failed to load exams", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async (examId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_code_submissions')
        .select(`
          id,
          student_id,
          code,
          language,
          output,
          status,
          marks_obtained,
          submitted_at,
          question_index,
          students (name, email)
        `)
        .eq('exam_id', examId)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      
      const formattedSubmissions = (data || []).map((s: any) => ({
        ...s,
        student_name: s.students?.name || 'Unknown',
        student_email: s.students?.email || 'Unknown'
      }))
      
      setSubmissions(formattedSubmissions)
    } catch (error) {
      console.error("Error loading submissions:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExamAction = async (examId: string, action: string) => {
    const exam = exams.find(e => e.id === examId)
    if (!exam) return

    switch (action) {
      case 'edit':
        router.push(`/dashboard/compiler/edit/${examId}`)
        break
      case 'results':
        setSelectedExam(exam)
        await loadSubmissions(examId)
        break
      case 'start':
        const { error: startError } = await supabase
          .from('compiler_exams')
          .update({ status: 'ongoing' })
          .eq('id', examId)
        if (!startError) {
          toast({ title: "Exam Started", description: `${exam.title} is now ongoing` })
          loadExams()
        }
        break
      case 'end':
        const { error: endError } = await supabase
          .from('compiler_exams')
          .update({ status: 'completed' })
          .eq('id', examId)
        if (!endError) {
          toast({ title: "Exam Ended", description: `${exam.title} has been completed` })
          loadExams()
        }
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this exam?')) {
          const { error: deleteError } = await supabase
            .from('compiler_exams')
            .delete()
            .eq('id', examId)
          if (!deleteError) {
            toast({ title: "Exam Deleted", description: `${exam.title} has been deleted` })
            loadExams()
          }
        }
        break
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-none mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exam Options
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              View Exams
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and monitor your coding exams
            </p>
          </div>
        </motion.div>

        {/* Exams Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {exams.map((exam) => (
            <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {exam.questions?.length || 0} Questions
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{exam.title}</CardTitle>
                <CardDescription>
                  {exam.department} - {exam.studying_year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(exam.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formatTime(exam.start_time)} - {formatTime(exam.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span>{exam.total_marks} Marks | {exam.language}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Submissions:</span>
                    <span className="font-semibold text-green-600">{exam.submissions_count || 0}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => setSelectedExam(exam)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {exam.status === 'scheduled' && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'start')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {exam.status === 'ongoing' && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'end')}
                          className="bg-red-600 hover:bg-red-700"
                          size="sm"
                        >
                          <Square className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      )}
                      
                      {(exam.status === 'completed' || exam.status === 'ongoing') && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'results')}
                          className="bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      )}
                      
                      {exam.status !== 'ongoing' && (
                        <Button
                          onClick={() => handleExamAction(exam.id, 'edit')}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Exam Details Modal */}
        {selectedExam && (
          <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedExam.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedExam.department} - {selectedExam.studying_year} | Faculty: {selectedExam.faculty_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Exam Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedExam.submissions_count || 0}</div>
                        <div className="text-sm text-gray-600">Submissions</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedExam.total_marks}</div>
                        <div className="text-sm text-gray-600">Total Marks</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{selectedExam.questions?.length || 0}</div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Schedule Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exam Date:</span>
                        <span className="font-semibold">{formatDate(selectedExam.start_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Time:</span>
                        <span className="font-semibold">{formatTime(selectedExam.start_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Time:</span>
                        <span className="font-semibold">{formatTime(selectedExam.end_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{selectedExam.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <Badge className="bg-blue-100 text-blue-800">{selectedExam.language}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Proctoring Enabled:</span>
                        <Badge className={selectedExam.enable_proctoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExam.enable_proctoring ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedExam.description}</p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedExam.status === 'scheduled' && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'start')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Exam
                    </Button>
                  )}
                  
                  {selectedExam.status === 'ongoing' && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'end')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Exam
                    </Button>
                  )}
                  
                  {(selectedExam.status === 'completed' || selectedExam.status === 'ongoing') && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'results')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                  )}
                  
                  {selectedExam.status !== 'ongoing' && (
                    <Button
                      onClick={() => handleExamAction(selectedExam.id, 'edit')}
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Exam
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Results Modal with Submissions */}
        <Dialog open={!!selectedExam && submissions.length > 0} onOpenChange={() => {
          setSelectedExam(null)
          setSubmissions([])
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {selectedExam && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Results: {selectedExam.title}</DialogTitle>
                  <DialogDescription>
                    {submissions.length} submission(s) received
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-10">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No submissions yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">#</th>
                            <th className="text-left p-3">Student</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Marks</th>
                            <th className="text-left p-3">Submitted</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((sub, i) => (
                            <tr key={sub.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{i + 1}</td>
                              <td className="p-3">
                                <div className="font-medium">{sub.student_name}</div>
                                <div className="text-sm text-gray-500">{sub.student_email}</div>
                              </td>
                              <td className="p-3">
                                <Badge className={sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {sub.status}
                                </Badge>
                              </td>
                              <td className="p-3 font-semibold">{sub.marks_obtained || '-'}</td>
                              <td className="p-3 text-sm text-gray-600">
                                {new Date(sub.submitted_at).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <Button size="sm" onClick={() => setSelectedSubmission(sub)}>
                                  <Code className="w-4 h-4 mr-1" />
                                  View Code
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Code View Modal */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            {selectedSubmission && (
              <>
                <DialogHeader>
                  <DialogTitle>Code Submission</DialogTitle>
                  <DialogDescription>
                    By {selectedSubmission.student_name} | {selectedSubmission.language}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Code */}
                  <div>
                    <h4 className="font-semibold mb-2">Code:</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {selectedSubmission.code || 'No code submitted'}
                    </pre>
                  </div>
                  
                  {/* Output */}
                  <div>
                    <h4 className="font-semibold mb-2">Output:</h4>
                    <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                      {selectedSubmission.output || 'No output'}
                    </pre>
                  </div>
                  
                  {/* Violations */}
                  {(selectedSubmission.violation_count > 0 || (selectedSubmission.violation_types && selectedSubmission.violation_types.length > 0)) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Violations Detected ({selectedSubmission.violation_count || selectedSubmission.violation_types?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.violation_types?.map((type: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-red-300 text-red-700 bg-red-100">
                            {type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-red-600 mt-2">
                        This student triggered warnings during the exam. Please review before grading.
                      </p>
                    </div>
                  )}
                  
                  {/* Marks */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-semibold">Marks Obtained:</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedSubmission.marks_obtained || 0}</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
