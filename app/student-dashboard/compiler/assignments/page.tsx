"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Clock, ArrowLeft, Play, User, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface CodingAssignment {
  id: string
  title: string
  language: string
  due_date: string
  status: string
  department: string
  studying_year: string
  faculty_name: string
  total_marks: number
  description: string
  instructions: string
}

interface Submission {
  id: string
  assignment_id: string
  status: string
  marks_obtained: number
  submitted_at: string
}

export default function StudentAssignmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<CodingAssignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [studentProfile, setStudentProfile] = useState<{department: string, studying_year: string} | null>(null)

  useEffect(() => {
    loadData()
    
    // Set up realtime subscription for new assignments
    const channel = supabase
      .channel('compiler-assignments-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'compiler_assignments' },
        (payload) => {
          const newAssignment = payload.new as CodingAssignment
          if (studentProfile && 
              newAssignment.department === studentProfile.department &&
              newAssignment.studying_year === studentProfile.studying_year &&
              newAssignment.status === 'published') {
            setAssignments(prev => [newAssignment, ...prev])
            toast({
              title: "New Assignment!",
              description: `${newAssignment.title} has been posted by ${newAssignment.faculty_name}`
            })
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'compiler_assignments' },
        () => loadAssignments()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [studentProfile])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get student profile
        const { data: profile } = await supabase
          .from('students')
          .select('department, year')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setStudentProfile({ department: profile.department, studying_year: profile.year })
          await Promise.all([
            loadAssignments(profile.department, profile.year),
            loadSubmissions(user.id)
          ])
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async (department?: string, year?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get student profile if not provided
      let dept = department
      let yr = year
      if (!dept || !yr) {
        const { data: profile } = await supabase
          .from('students')
          .select('department, year')
          .eq('id', user.id)
          .single()
        if (profile) {
          dept = profile.department
          yr = profile.year
        }
      }

      // Normalize year format
      const normalizedYear = yr?.includes('Year') ? yr : `${yr} Year`

      console.log("Loading assignments for:", dept, normalizedYear)

      const { data, error } = await supabase
        .from('compiler_assignments')
        .select('*')
        .eq('department', dept)
        .eq('studying_year', normalizedYear)
        .eq('status', 'published')
        .order('due_date', { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Loaded assignments:", data)
      setAssignments(data || [])
    } catch (error) {
      console.error("Error loading assignments:", error)
    }
  }

  const loadSubmissions = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_code_submissions')
        .select('*')
        .eq('student_id', studentId)

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error("Error loading submissions:", error)
    }
  }

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(s => s.assignment_id === assignmentId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push('/student-dashboard/compiler')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Coding Assignments
            </h1>
            <p className="text-gray-600">Complete coding assignments from your faculty</p>
          </div>
        </div>

        {studentProfile && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600">{studentProfile.department}</span>
              </span>
              <span className="text-blue-300">|</span>
              <span className="font-medium text-blue-600">{studentProfile.studying_year}</span>
            </div>
          </div>
        )}

        {assignments.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Available</h3>
              <p className="text-gray-600">There are no coding assignments for your department and year at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {assignments.map((assignment, index) => {
              const submission = getSubmissionForAssignment(assignment.id)
              const daysRemaining = getDaysRemaining(assignment.due_date)
              
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-white border-gray-200 shadow-sm ${
                    submission ? 'border-l-4 border-l-green-500' : 
                    daysRemaining <= 2 ? 'border-l-4 border-l-red-500' : 
                    daysRemaining <= 5 ? 'border-l-4 border-l-yellow-500' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900">{assignment.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">{assignment.faculty_name}</span>
                            <span className="text-gray-300">|</span>
                            <Building2 className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">{assignment.department}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
                          {assignment.language}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
                      
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className={daysRemaining <= 2 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            Due: {formatDate(assignment.due_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Total Marks:</span>
                          <span className="font-medium text-gray-900">{assignment.total_marks}</span>
                        </div>
                      </div>

                      {submission ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Submitted: {formatDate(submission.submitted_at)}</span>
                            <span className="font-medium text-green-600">
                              {submission.marks_obtained > 0 ? `${submission.marks_obtained}/${assignment.total_marks} marks` : 'Pending review'}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => router.push(`/student-dashboard/compiler/assignment/${assignment.id}`)}
                          >
                            View Submission
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => router.push(`/student-dashboard/compiler/assignment/${assignment.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Coding
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
