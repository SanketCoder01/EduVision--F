"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap, Clock, ArrowLeft, Play, User, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface CodingExam {
  id: string
  title: string
  language: string
  duration: number
  start_time: string
  end_time: string
  status: string
  department: string
  studying_year: string
  faculty_name: string
  total_marks: number
}

export default function StudentExamsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [exams, setExams] = useState<CodingExam[]>([])
  const [loading, setLoading] = useState(true)
  const [studentProfile, setStudentProfile] = useState<{department: string, studying_year: string} | null>(null)

  useEffect(() => {
    loadData()
    
    // Set up realtime subscription for new exams
    const channel = supabase
      .channel('compiler-exams-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'compiler_exams' },
        (payload) => {
          const newExam = payload.new as CodingExam
          if (studentProfile && 
              newExam.department === studentProfile.department &&
              newExam.studying_year === studentProfile.studying_year &&
              ['scheduled', 'ongoing'].includes(newExam.status)) {
            setExams(prev => [newExam, ...prev])
            toast({
              title: "New Exam!",
              description: `${newExam.title} has been scheduled by ${newExam.faculty_name}`
            })
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'compiler_exams' },
        () => loadExams()
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
          await loadExams(profile.department, profile.year)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadExams = async (department?: string, year?: string) => {
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

      console.log("Loading exams for:", dept, normalizedYear)

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('compiler_exams')
        .select('*')
        .eq('department', dept)
        .eq('studying_year', normalizedYear)
        .in('status', ['scheduled', 'ongoing'])
        .gte('end_time', now)
        .order('start_time', { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Loaded exams:", data)
      setExams(data || [])
    } catch (error) {
      console.error("Error loading exams:", error)
    }
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

  const getExamStatus = (exam: CodingExam) => {
    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    if (now < startTime) return 'upcoming'
    if (now >= startTime && now <= endTime) return 'ongoing'
    return 'ended'
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
              <GraduationCap className="w-6 h-6 text-red-600" />
              Coding Exams
            </h1>
            <p className="text-gray-600">Take proctored coding exams from your faculty</p>
          </div>
        </div>

        {studentProfile && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span><strong>Department:</strong> {studentProfile.department}</span>
              <span><strong>Year:</strong> {studentProfile.studying_year}</span>
            </div>
          </div>
        )}

        {exams.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Scheduled</h3>
              <p className="text-gray-600">There are no upcoming coding exams for your department and year.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {exams.map((exam, index) => {
              const status = getExamStatus(exam)
              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-white border-gray-200 shadow-sm ${
                    status === 'ongoing' ? 'border-l-4 border-l-green-500' : 
                    status === 'upcoming' ? 'border-l-4 border-l-yellow-500' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900">{exam.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">{exam.faculty_name}</span>
                            <span className="text-gray-300">|</span>
                            <Building2 className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">{exam.department}</span>
                          </div>
                        </div>
                        <Badge className={
                          status === 'ongoing' ? 'bg-green-100 text-green-800 border-green-300' :
                          status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }>
                          {status === 'ongoing' ? 'LIVE NOW' : status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>{exam.total_marks} marks</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Start: {formatDate(exam.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>End: {formatDate(exam.end_time)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                          {exam.language}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          {exam.department}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          {exam.studying_year}
                        </Badge>
                      </div>

                      {status === 'ongoing' ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => router.push(`/student-dashboard/compiler/exam/${exam.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Enter Exam Now
                        </Button>
                      ) : status === 'upcoming' ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled
                        >
                          Available at {formatDate(exam.start_time)}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled
                        >
                          Exam Ended
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
