"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit3,
  Download,
  Filter,
  Search,
  BarChart3,
  AlertTriangle,
  Trophy,
  FileText,
  Timer,
  Target,
  Loader2,
  Save
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useParams, useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  student_name: string
  student_email: string
  department: string
  year: string
  answers: any[]
  marks_obtained: number
  total_marks: number
  time_taken: number
  tab_switches: number
  violations: number
  completed_at: string
  created_at: string
}

const QuizSubmissions = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = searchParams.get('quizId') || params.quizId as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [faculty, setFaculty] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [allQuizzes, setAllQuizzes] = useState<any[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'graded' | 'flagged'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedQuizFilter, setSelectedQuizFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<QuizAttempt | null>(null)
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)

  useEffect(() => {
    fetchFacultyAndQuiz()
  }, [quizId])

  // Real-time subscription for new submissions
  useEffect(() => {
    if (!faculty) return

    console.log('Setting up realtime subscription for faculty:', faculty.id)

    // Subscribe to all quiz_attempts for this faculty's quizzes
    const channel = supabase
      .channel(`quiz-attempts-faculty-${faculty.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_attempts'
      }, async (payload) => {
        console.log('New submission received:', payload.new)
        
        // Check if this attempt belongs to faculty's quiz
        const attemptQuizId = payload.new.quiz_id
        const isMyQuiz = allQuizzes.some(q => q.id === attemptQuizId)
        
        if (isMyQuiz) {
          // If viewing specific quiz, only add if matches
          if (quizId && attemptQuizId !== quizId) return
          
          setAttempts(prev => {
            if (prev.find(a => a.id === payload.new.id)) {
              return prev
            }
            return [payload.new as QuizAttempt, ...prev]
          })
          
          toast({
            title: "New Submission",
            description: `${payload.new.student_name} has submitted a quiz.`
          })
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quiz_attempts'
      }, (payload) => {
        console.log('Attempt updated:', payload.new)
        setAttempts(prev => prev.map(a => 
          a.id === payload.new.id ? payload.new as QuizAttempt : a
        ))
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      console.log('Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [faculty, allQuizzes, quizId])

  const fetchFacultyAndQuiz = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log('Fetching data for user:', user.email)

      // Get faculty data
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()
      
      if (facultyError) {
        console.error('Error fetching faculty:', facultyError)
        return
      }
      
      console.log('Faculty data:', facultyData)
      if (facultyData) {
        setFaculty(facultyData)
      }

      // Get all quizzes by this faculty
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('faculty_id', facultyData?.id)
        .order('created_at', { ascending: false })

      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError)
      }
      
      console.log('Faculty quizzes:', quizzesData)
      setAllQuizzes(quizzesData || [])

      // If specific quiz requested, get that quiz
      if (quizId) {
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()
        
        console.log('Specific quiz:', quizData)
        setQuiz(quizData)

        // Fetch all attempts for this specific quiz
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quizId)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })

        if (attemptsError) {
          console.error('Error fetching attempts:', attemptsError)
        }
        
        console.log('Attempts for quiz:', attemptsData)
        setAttempts(attemptsData || [])
      } else {
        // No specific quiz - fetch all attempts for all faculty's quizzes
        const quizIds = quizzesData?.map(q => q.id) || []
        
        if (quizIds.length > 0) {
          const { data: attemptsData, error: attemptsError } = await supabase
            .from('quiz_attempts')
            .select('*')
            .in('quiz_id', quizIds)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false })

          if (attemptsError) {
            console.error('Error fetching all attempts:', attemptsError)
          }
          
          console.log('All attempts:', attemptsData)
          setAttempts(attemptsData || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats from real data
  const stats = {
    totalStudents: attempts.length,
    submitted: attempts.length,
    graded: attempts.filter(a => a.marks_obtained !== null).length,
    pending: attempts.filter(a => a.marks_obtained === null).length,
    averageScore: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + (a.marks_obtained || 0), 0) / attempts.length / (attempts[0]?.total_marks || 100) * 100)
      : 0
  }

  // View submission dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null)
  const [attemptQuestions, setAttemptQuestions] = useState<any[]>([])
  const [editedScore, setEditedScore] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  const handleViewSubmission = async (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt)
    setEditedScore(attempt.marks_obtained || 0)
    
    // Fetch quiz questions for this attempt
    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', attempt.quiz_id)
      .order('order_number', { ascending: true })
    
    setAttemptQuestions(questionsData || [])
    setViewDialogOpen(true)
  }

  const handleUpdateScore = async () => {
    if (!selectedAttempt) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .update({ marks_obtained: editedScore })
        .eq('id', selectedAttempt.id)
      
      if (error) throw error
      
      // Update local state
      setAttempts(prev => prev.map(a => 
        a.id === selectedAttempt.id ? { ...a, marks_obtained: editedScore } : a
      ))
      
      toast({
        title: "Score Updated",
        description: `Score updated to ${editedScore} for ${selectedAttempt.student_name}`
      })
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishResult = async () => {
    if (!selectedAttempt) return
    
    setIsSaving(true)
    try {
      // Update the quiz to mark results as published
      const { error } = await supabase
        .from('quizzes')
        .update({ results_published: true })
        .eq('id', selectedAttempt.quiz_id)
      
      if (error) throw error
      
      toast({
        title: "Results Published",
        description: "Students can now view their results"
      })
      
      setViewDialogOpen(false)
    } catch (error) {
      console.error('Error publishing results:', error)
      toast({
        title: "Error",
        description: "Failed to publish results",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Filter by year and quiz
  const years = ['all', 'first', 'second', 'third', 'fourth']
  
  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = attempt.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === 'all' || attempt.year === selectedYear
    const matchesQuiz = selectedQuizFilter === 'all' || attempt.quiz_id === selectedQuizFilter
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && attempt.marks_obtained === null) ||
                      (activeTab === 'graded' && attempt.marks_obtained !== null) ||
                      (activeTab === 'flagged' && (attempt.violations > 0 || attempt.tab_switches > 2))
    
    return matchesSearch && matchesYear && matchesQuiz && matchesTab
  })

  const getStatusColor = (attempt: QuizAttempt) => {
    if (attempt.marks_obtained !== null) return 'bg-green-100 text-green-800'
    return 'bg-blue-100 text-blue-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins}m`
  }

  const handleExportResults = async () => {
    // Export to CSV
    const csv = [
      ['Student Name', 'Email', 'Department', 'Year', 'Score', 'Total Marks', 'Time Taken', 'Violations', 'Tab Switches', 'Submitted At'].join(','),
      ...filteredAttempts.map(a => [
        a.student_name,
        a.student_email,
        a.department,
        a.year,
        a.marks_obtained || 'N/A',
        a.total_marks,
        formatDuration(a.time_taken),
        a.violations,
        a.tab_switches,
        formatDate(a.completed_at)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-${quizId}-results.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Submissions
              </h1>
              <p className="mt-2 text-gray-600">
                {quiz?.title || 'Quiz'} - Review student submissions
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline" onClick={handleExportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
              <div className="text-sm text-gray-600">Graded</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{attempts.filter(a => a.violations > 0).length}</div>
              <div className="text-sm text-gray-600">Violations</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {!quizId && allQuizzes.length > 0 && (
              <Select value={selectedQuizFilter} onValueChange={setSelectedQuizFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by quiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quizzes</SelectItem>
                  {allQuizzes.map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="first">1st Year</SelectItem>
                <SelectItem value="second">2nd Year</SelectItem>
                <SelectItem value="third">3rd Year</SelectItem>
                <SelectItem value="fourth">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-lg">
            {[
              { id: 'all', label: 'All', count: attempts.length },
              { id: 'pending', label: 'Pending', count: attempts.filter(a => a.marks_obtained === null).length },
              { id: 'graded', label: 'Graded', count: attempts.filter(a => a.marks_obtained !== null).length },
              { id: 'flagged', label: 'Flagged', count: attempts.filter(a => a.violations > 0 || a.tab_switches > 2).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label}
                <Badge variant="secondary" className="ml-2">{tab.count}</Badge>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Submissions ({filteredAttempts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAttempts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-500">Submissions will appear here in real-time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttempts.map((attempt, index) => (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 border rounded-lg transition-all duration-200 hover:shadow-md ${
                        attempt.violations > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900">{attempt.student_name}</h3>
                            <p className="text-sm text-gray-600">{attempt.student_email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge variant="outline">{attempt.year} Year</Badge>
                              <span className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatDate(attempt.completed_at)}
                              </span>
                              <span className="text-xs text-gray-500">
                                <Timer className="w-3 h-3 inline mr-1" />
                                {formatDuration(attempt.time_taken)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          {/* Score */}
                          <div className="text-center">
                            {attempt.marks_obtained !== null ? (
                              <>
                                <div className="text-2xl font-bold text-blue-600">
                                  {Math.round((attempt.marks_obtained / attempt.total_marks) * 100)}%
                                </div>
                                <div className="text-sm text-gray-500">
                                  {attempt.marks_obtained}/{attempt.total_marks}
                                </div>
                              </>
                            ) : (
                              <div className="text-lg font-bold text-gray-400">--</div>
                            )}
                          </div>

                          {/* Status */}
                          <Badge className={getStatusColor(attempt)}>
                            {attempt.marks_obtained !== null ? 'Graded' : 'Submitted'}
                          </Badge>

                          {/* Violations */}
                          {(attempt.violations > 0 || attempt.tab_switches > 0) && (
                            <div className="text-sm">
                              <span className="text-red-600">Violations: {attempt.violations}</span>
                              <br />
                              <span className="text-orange-600">Tabs: {attempt.tab_switches}</span>
                            </div>
                          )}

                          <Button variant="outline" size="sm" onClick={() => handleViewSubmission(attempt)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          
          {selectedAttempt && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedAttempt.student_name?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedAttempt.student_name}</h3>
                    <p className="text-sm text-gray-600">{selectedAttempt.student_email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{selectedAttempt.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="font-medium text-gray-900">{selectedAttempt.year} Year</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted At</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedAttempt.completed_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time Taken</p>
                    <p className="font-medium text-gray-900">{formatDuration(selectedAttempt.time_taken)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Violations</p>
                    <p className="font-medium text-red-600">{selectedAttempt.violations} violations</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tab Switches</p>
                    <p className="font-medium text-orange-600">{selectedAttempt.tab_switches}</p>
                  </div>
                </div>
              </div>

              {/* Score Editor */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-blue-700">Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={editedScore}
                        onChange={(e) => setEditedScore(parseInt(e.target.value) || 0)}
                        className="w-24"
                        min={0}
                        max={selectedAttempt.total_marks}
                      />
                      <span className="text-lg font-medium">/ {selectedAttempt.total_marks}</span>
                      <span className="text-lg font-bold text-blue-600 ml-2">
                        ({Math.round((editedScore / selectedAttempt.total_marks) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <Button onClick={handleUpdateScore} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Update Score
                  </Button>
                </div>
              </div>

              {/* Question Answers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Question-wise Answers</h3>
                <div className="space-y-4">
                  {(selectedAttempt.answers || []).map((answer: any, index: number) => {
                    const question = attemptQuestions.find(q => q.id === answer.question_id) || attemptQuestions[index]
                    const isCorrect = answer.correct
                    
                    return (
                      <div key={index} className={`p-4 border rounded-lg ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{question?.question_type || 'MCQ'}</Badge>
                              <span className="text-sm text-gray-500">{question?.marks || 1} points</span>
                            </div>
                            <p className="font-medium text-gray-900 mb-2">
                              Q{index + 1}. {question?.question_text || `Question ${index + 1}`}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Student's Answer:</p>
                                <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                  {answer.answer || 'Not answered'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Correct Answer:</p>
                                <p className="font-medium text-green-700">
                                  {question?.correct_answer || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Publish Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {quiz?.results_published ? (
                    <span className="text-green-600 font-medium">✓ Results have been published to students</span>
                  ) : (
                    <span className="text-orange-600">Results are not yet visible to students</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                  {!quiz?.results_published && (
                    <Button onClick={handlePublishResult} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Publish Results to Students
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizSubmissions
