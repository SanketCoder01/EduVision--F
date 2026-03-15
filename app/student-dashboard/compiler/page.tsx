"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Code, BookOpen, GraduationCap, Trophy, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface StudentProfile {
  department: string
  studying_year: string
}

interface CodingAssignment {
  id: string
  title: string
  description: string
  language: string
  due_date: string
  faculty_name: string
  department: string
  studying_year: string
  status: string
}

interface CodingExam {
  id: string
  title: string
  language: string
  duration: number
  start_time: string
  end_time: string
  department: string
  studying_year: string
  status: string
}

export default function CompilerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [studentId, setStudentId] = useState<string>("")
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [assignments, setAssignments] = useState<CodingAssignment[]>([])
  const [exams, setExams] = useState<CodingExam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Set up realtime subscription for new assignments
    const channel = supabase
      .channel('compiler-assignments-student')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'compiler_assignments' },
        (payload) => {
          const newAssignment = payload.new as CodingAssignment
          // Only add if matches student's department and year
          if (studentProfile && 
              newAssignment.department === studentProfile.department &&
              (newAssignment.studying_year === studentProfile.studying_year ||
               newAssignment.studying_year === `${studentProfile.studying_year} Year`) &&
              newAssignment.status === 'published') {
            setAssignments(prev => [newAssignment, ...prev])
            toast({
              title: "New Assignment!",
              description: `${newAssignment.title} has been posted.`
            })
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'compiler_exams' },
        (payload) => {
          const newExam = payload.new as CodingExam
          if (studentProfile &&
              newExam.department === studentProfile.department &&
              (newExam.studying_year === studentProfile.studying_year ||
               newExam.studying_year === `${studentProfile.studying_year} Year`) &&
              ['scheduled', 'ongoing'].includes(newExam.status)) {
            setExams(prev => [newExam, ...prev])
            toast({
              title: "New Exam!",
              description: `${newExam.title} has been scheduled.`
            })
          }
        }
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
        setStudentId(user.id)
        await loadStudentProfile(user.id)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('department, year')
        .eq('id', userId)
        .single()

      if (data) {
        setStudentProfile({ department: data.department, studying_year: data.year })
      }
      if (error) throw error
    } catch (error) {
      console.error("Error loading student profile:", error)
    }
  }

  const loadAssignments = async (department: string, year: string) => {
    try {
      // Normalize year format to match database
      const normalizedYear = year.includes('Year') ? year : `${year} Year`
      
      const { data, error } = await supabase
        .from('compiler_assignments')
        .select('*')
        .eq('department', department)
        .eq('studying_year', normalizedYear)
        .eq('status', 'published')
        .order('due_date', { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Loaded assignments for", department, normalizedYear, ":", data)
      setAssignments(data || [])
    } catch (error) {
      console.error("Error loading assignments:", error)
    }
  }

  const loadExams = async (department: string, year: string) => {
    try {
      const normalizedYear = year.includes('Year') ? year : `${year} Year`
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('compiler_exams')
        .select('*')
        .eq('department', department)
        .eq('studying_year', normalizedYear)
        .in('status', ['scheduled', 'ongoing'])
        .gte('end_time', now)
        .order('start_time', { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Loaded exams for", department, normalizedYear, ":", data)
      setExams(data || [])
    } catch (error) {
      console.error("Error loading exams:", error)
    }
  }

  const options = [
    {
      id: "assignments",
      title: "Assignments",
      description: "Complete coding assignments from your faculty",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      href: "/student-dashboard/compiler/assignments"
    },
    {
      id: "exams",
      title: "Exams",
      description: "Take proctored coding exams",
      icon: GraduationCap,
      color: "from-red-500 to-red-600",
      href: "/student-dashboard/compiler/exams"
    },
    {
      id: "free-coding",
      title: "Free Coding",
      description: "Practice coding with auto-save",
      icon: Code,
      color: "from-green-500 to-green-600",
      href: "/student-dashboard/compiler/free-coding"
    },
    {
      id: "scorecard",
      title: "Scorecards",
      description: "View your results and submissions",
      icon: Trophy,
      color: "from-yellow-500 to-orange-600",
      href: "/student-dashboard/compiler/scorecard"
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Code Compiler</h1>
          </div>
          <p className="text-gray-600 text-lg">Professional coding environment with Monaco Editor</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
              <div className="text-sm text-gray-600">Assignments</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{exams.length}</div>
              <div className="text-sm text-gray-600">Upcoming Exams</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">7</div>
              <div className="text-sm text-gray-600">Languages</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">Auto</div>
              <div className="text-sm text-gray-600">Save Mode</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                className="cursor-pointer h-full bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                onClick={() => router.push(option.href)}
              >
                <div className={`h-1 bg-gradient-to-r ${option.color}`} />
                <CardHeader className="text-center pb-3">
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-3`}>
                    <option.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 text-lg">{option.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Open <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Deadlines */}
        {(assignments.length > 0 || exams.length > 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Deadlines</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Assignments */}
              {assignments.slice(0, 3).map(assignment => (
                <Card key={assignment.id} className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-gray-900 font-medium">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm">{assignment.faculty_name}</p>
                      </div>
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        {assignment.language}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Due: {formatDate(assignment.due_date)}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => router.push(`/student-dashboard/compiler/assignment/${assignment.id}`)}
                    >
                      Start Coding
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Exams */}
              {exams.slice(0, 2).map(exam => (
                <Card key={exam.id} className="bg-white border-gray-200 border-l-2 border-l-red-500 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-gray-900 font-medium">{exam.title}</h3>
                        <p className="text-gray-600 text-sm">{exam.duration} minutes</p>
                      </div>
                      <Badge variant="outline" className="border-red-500 text-red-600">
                        EXAM
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Starts: {formatDate(exam.start_time)}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3 w-full bg-red-600 hover:bg-red-700"
                      onClick={() => router.push(`/student-dashboard/compiler/exam/${exam.id}`)}
                    >
                      Enter Exam
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
