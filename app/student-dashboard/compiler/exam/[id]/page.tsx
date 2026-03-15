"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, AlertCircle, Shield, Camera, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import CodeEditor from "@/components/compiler/CodeEditor"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Exam {
  id: string
  title: string
  description: string
  language: string
  duration: number // in minutes
  faculty_name: string
  questions?: any[]
  start_time: string
  end_time: string
}

export default function ExamCompilerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const examId = params.id as string

  const [studentId, setStudentId] = useState<string>("")
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPermissionDialog, setShowPermissionDialog] = useState(true)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [warningCount, setWarningCount] = useState(0)
  const [tabSwitchDetected, setTabSwitchDetected] = useState(false)

  useEffect(() => {
    loadStudentData()
    if (examId) {
      loadExam()
    }

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && permissionsGranted) {
        setTabSwitchDetected(true)
        setWarningCount(prev => {
          const newCount = prev + 1
          if (newCount >= 3) {
            handleAutoSubmit()
          }
          return newCount
        })
        toast({ 
          title: "Warning!", 
          description: `Tab switch detected! Warning ${warningCount + 1}/3`, 
          variant: "destructive" 
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [examId, permissionsGranted])

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStudentId(user.id)
      }
    } catch (error) {
      console.error("Error loading student:", error)
    }
  }

  const loadExam = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('coding_exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (error) throw error
      setExam(data)
    } catch (error) {
      console.error("Error loading exam:", error)
      toast({ title: "Error", description: "Failed to load exam", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      setCameraStream(stream)
      setPermissionsGranted(true)
      setShowPermissionDialog(false)
      toast({ title: "Permissions Granted", description: "Exam will start now" })
    } catch (error) {
      toast({ 
        title: "Permission Required", 
        description: "Camera and microphone access is required for proctored exams", 
        variant: "destructive" 
      })
    }
  }

  const handleSubmit = async (code: string, output: string) => {
    if (!exam || !studentId) return

    try {
      const { error } = await supabase
        .from('coding_exam_submissions')
        .insert({
          exam_id: exam.id,
          student_id: studentId,
          code,
          output,
          language: exam.language,
          status: 'submitted',
          warnings: warningCount,
          submitted_at: new Date().toISOString()
        })

      if (error) throw error

      toast({ title: "Submitted!", description: "Your exam has been submitted" })
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
      router.push('/student-dashboard/compiler')
    } catch (error) {
      console.error("Error submitting:", error)
      toast({ title: "Error", description: "Failed to submit exam", variant: "destructive" })
    }
  }

  const handleAutoSubmit = () => {
    toast({ title: "Auto-Submitted", description: "Exam auto-submitted due to multiple violations" })
    handleSubmit('', '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-900">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold">Exam not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/student-dashboard/compiler')}>
          Go Back
        </Button>
      </div>
    )
  }

  // Permission Dialog
  if (showPermissionDialog) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Card className="bg-white border-gray-200 shadow-lg max-w-md">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Proctored Exam
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              This is a proctored exam. The following permissions are required:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Camera className="w-4 h-4" />
                <span className="text-sm">Camera access for face monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mic className="w-4 h-4" />
                <span className="text-sm">Microphone access for voice detection</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              <p className="text-yellow-700 text-xs">
                Warning: Switching tabs or windows during the exam will result in warnings. 
                3 warnings will auto-submit your exam.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/student-dashboard/compiler')} className="flex-1">
                Cancel
              </Button>
              <Button onClick={requestPermissions} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Grant Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-900 font-semibold">{exam.title}</h1>
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              {exam.language}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {warningCount > 0 && (
              <Badge variant="destructive">
                Warnings: {warningCount}/3
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Code Editor with Timer */}
      <div className="flex-1">
        <CodeEditor
          sessionType="exam"
          sessionId={examId || undefined}
          initialLanguage={exam.language}
          showTimer={true}
          timeLimit={exam.duration}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
