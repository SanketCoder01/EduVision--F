"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Camera, 
  AlertTriangle, 
  Send, 
  Eye,
  Clock,
  Shield,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

interface StudentMonitor {
  id: string
  student_id: string
  student_name: string
  student_email: string
  quiz_id: string
  camera_stream: MediaStream | null
  violations: number
  tab_switches: number
  face_detected: boolean
  is_active: boolean
  started_at: string
  last_activity: string
  frame_data?: string // Base64 camera frame
}

const QuizMonitorPage = () => {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string
  
  const [quiz, setQuiz] = useState<any>(null)
  const [students, setStudents] = useState<StudentMonitor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitor | null>(null)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'violations' | 'active'>('all')

  useEffect(() => {
    fetchQuizData()
    setupRealtimeSubscription()
    
    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels()
    }
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      setIsLoading(true)
      
      // Get quiz details
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
      
      setQuiz(quizData)

      // Get active students taking this quiz
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .is('completed_at', null)

      if (attempts) {
        const studentMonitors: StudentMonitor[] = attempts.map(a => ({
          id: a.id,
          student_id: a.student_id,
          student_name: a.student_name,
          student_email: a.student_email,
          quiz_id: a.quiz_id,
          camera_stream: null,
          violations: a.violations || 0,
          tab_switches: a.tab_switches || 0,
          face_detected: true,
          is_active: true,
          started_at: a.created_at,
          last_activity: a.created_at
        }))
        setStudents(studentMonitors)
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    // Subscribe to quiz_attempts changes with realtime enabled
    const channel = supabase
      .channel(`quiz-monitor-${quizId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_attempts',
        filter: `quiz_id=eq.${quizId}`
      }, (payload) => {
        console.log('Realtime update:', payload.eventType, payload)
        
        if (payload.eventType === 'INSERT') {
          // New student started quiz
          const newStudent: StudentMonitor = {
            id: payload.new.id,
            student_id: payload.new.student_id,
            student_name: payload.new.student_name || 'Unknown Student',
            student_email: payload.new.student_email || 'unknown@email.com',
            quiz_id: payload.new.quiz_id,
            camera_stream: null,
            violations: payload.new.violations || 0,
            tab_switches: payload.new.tab_switches || 0,
            face_detected: true,
            is_active: !payload.new.completed_at,
            started_at: payload.new.created_at,
            last_activity: payload.new.created_at
          }
          setStudents(prev => [...prev, newStudent])
          toast({
            title: "Student Started Quiz",
            description: `${newStudent.student_name} has started the quiz.`
          })
        } else if (payload.eventType === 'UPDATE') {
          // Student progress update
          setStudents(prev => prev.map(s => {
            if (s.id === payload.new.id) {
              return {
                ...s,
                violations: payload.new.violations || 0,
                tab_switches: payload.new.tab_switches || 0,
                face_detected: true,
                is_active: !payload.new.completed_at,
                last_activity: payload.new.updated_at || s.last_activity
              }
            }
            return s
          }))
        } else if (payload.eventType === 'DELETE') {
          setStudents(prev => prev.filter(s => s.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    // Subscribe to camera frames for real-time video
    const cameraChannel = supabase
      .channel(`quiz-cameras-${quizId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_camera_frames',
        filter: `quiz_id=eq.${quizId}`
      }, (payload) => {
        console.log('Camera frame received:', payload.new.student_name)
        
        // Update student with latest frame
        setStudents(prev => prev.map(s => {
          if (s.student_id === payload.new.student_id) {
            return {
              ...s,
              frame_data: payload.new.frame_data,
              face_detected: payload.new.face_detected,
              last_activity: payload.new.timestamp
            }
          }
          return s
        }))
      })
      .subscribe()
  }

  const sendWarning = async (student: StudentMonitor) => {
    if (!warningMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a warning message",
        variant: "destructive"
      })
      return
    }

    try {
      // Save warning to database
      const { error } = await supabase
        .from('quiz_warnings')
        .insert({
          quiz_id: quizId,
          student_id: student.student_id,
          student_name: student.student_name,
          message: warningMessage,
          sent_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Warning Sent",
        description: `Warning sent to ${student.student_name}`
      })
      
      setWarningDialogOpen(false)
      setWarningMessage("")
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error sending warning:', error)
      toast({
        title: "Error",
        description: "Failed to send warning",
        variant: "destructive"
      })
    }
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'violations' && s.violations > 0) ||
                         (filterStatus === 'active' && s.is_active)
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: students.length,
    active: students.filter(s => s.is_active).length,
    violations: students.filter(s => s.violations > 0).length,
    totalViolations: students.reduce((sum, s) => sum + s.violations, 0)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quiz Monitor: {quiz?.title}
                </h1>
                <p className="text-gray-600">
                  Real-time proctoring dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                <Camera className="w-3 h-3 mr-1" />
                {stats.active} Active
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {stats.totalViolations} Violations
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Now</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.violations}</div>
              <div className="text-sm text-gray-600">Flagged Students</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalViolations}</div>
              <div className="text-sm text-gray-600">Total Violations</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'violations', label: 'Violations' }
              ].map(btn => (
                <Button
                  key={btn.id}
                  variant={filterStatus === btn.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(btn.id as any)}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Student Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredStudents.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students currently taking quiz</h3>
                <p className="text-gray-500">Students will appear here when they start the quiz</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden ${
                    student.violations > 0 ? 'ring-2 ring-red-500' : ''
                  }`}>
                    {/* Camera Preview */}
                    <div className="relative h-32 bg-gray-900">
                      {student.frame_data ? (
                        <img 
                          src={student.frame_data} 
                          alt={`${student.student_name}'s camera`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      {/* Status Overlay */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {student.is_active && (
                          <Badge className="bg-green-500 text-white text-xs">Live</Badge>
                        )}
                        {student.violations > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {student.violations}
                          </Badge>
                        )}
                      </div>
                      {/* Face Detection Indicator */}
                      <div className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ${
                        student.face_detected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {student.student_name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{student.student_email}</p>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                        <span>Tab: {student.tab_switches}</span>
                        <span>Violations: {student.violations}</span>
                      </div>
                      
                      <div className="flex gap-1 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedStudent(student)
                            setWarningDialogOpen(true)
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Warn
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                // Auto-submit student quiz
                                toast({
                                  title: "Quiz Auto-Submitted",
                                  description: `${student.student_name}'s quiz has been auto-submitted.`
                                })
                              }}
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Force Submit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Warning Dialog */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Warning to {selectedStudent?.student_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Warning Message</label>
              <Input
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter warning message..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setWarningDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => selectedStudent && sendWarning(selectedStudent)}>
                <Send className="w-4 h-4 mr-2" />
                Send Warning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizMonitorPage
