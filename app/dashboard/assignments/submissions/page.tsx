"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Search,
  Download,
  Eye,
  MessageSquare,
  AlertTriangle,
  Shield,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Users,
  BarChart3,
  Upload,
  Brain,
  RefreshCw,
  ExternalLink,
  File,
  Image,
  FileCode,
  FileSpreadsheet,
  Presentation,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"

interface Student {
  id: string
  name: string
  email: string
  prn?: string
  department?: string
  year?: string
}

interface Submission {
  id: string
  assignment_id: string
  student_id: string
  student_email: string
  student_name: string
  student_prn: string
  student_department: string
  student_year: string
  submission_text?: string
  file_urls: string[]
  file_names: string[]
  file_sizes?: number[]
  status: 'submitted' | 'graded' | 'late' | 'under_review'
  grade?: number
  feedback?: string
  plagiarism_score?: number
  plagiarism_report?: any
  ai_grade?: number
  ai_feedback?: string
  submitted_at: string
  graded_at?: string
  assignment?: {
    id: string
    title: string
    max_marks: number
    department: string
    target_years: string[]
  }
}

interface Assignment {
  id: string
  title: string
  department: string
  target_years: string[]
  max_marks: number
  due_date: string
  status: string
}

export default function SubmissionsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const assignmentId = searchParams.get('assignmentId') || searchParams.get('id')
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<string>(assignmentId || 'all')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("submissionDate")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [showGradeDialog, setShowGradeDialog] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [grade, setGrade] = useState("")
  const [aiGrading, setAiGrading] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [showDownloadReport, setShowDownloadReport] = useState(false)

  const subscriptionsRef = useRef<any>(null)

  // Initialize user and load assignments
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login?type=faculty')
          return
        }

        // Get faculty data
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (facultyError || !facultyData) {
          router.push('/faculty-complete-profile')
          return
        }

        setCurrentUser({
          id: facultyData.id,
          email: facultyData.email,
          name: facultyData.name,
          department: facultyData.department
        })

        // Load faculty's assignments
        await loadAssignments(facultyData.id)
        
      } catch (error) {
        console.error('Error initializing:', error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        })
      }
    }

    initialize()

    return () => {
      if (subscriptionsRef.current) {
        subscriptionsRef.current.unsubscribe()
      }
    }
  }, [router])

  // Load submissions when assignment changes
  useEffect(() => {
    if (currentUser && selectedAssignment) {
      loadSubmissions()
      setupRealtimeSubscription()
    }
  }, [currentUser, selectedAssignment])

  const loadAssignments = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, department, target_years, max_marks, due_date, status')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
      
      if (data && data.length > 0 && !assignmentId) {
        setSelectedAssignment(data[0].id)
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }

  const loadSubmissions = async () => {
    if (!currentUser || selectedAssignment === 'all') {
      setSubmissions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('DEBUG: Loading submissions for assignment:', selectedAssignment)

      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:assignment_id (
            id,
            title,
            max_marks,
            department,
            target_years
          )
        `)
        .eq('assignment_id', selectedAssignment)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      console.log('DEBUG: Raw submissions data:', data)

      // Enrich submissions with student data and files from submission_files table
      const enrichedSubmissions = await Promise.all((data || []).map(async (sub) => {
        let studentData: any = null
        
        // Try to find student in department tables
        if (sub.student_department && sub.student_year) {
          const yearMapping: { [key: string]: string } = {
            '1': '1st', '2': '2nd', '3': '3rd', '4': '4th',
            'first': '1st', 'second': '2nd', 'third': '3rd', 'fourth': '4th'
          }
          const yearSuffix = yearMapping[sub.student_year.toLowerCase()] || sub.student_year
          const tableName = `students_${sub.student_department.toLowerCase()}_${yearSuffix}_year`
          
          try {
            const { data: sData } = await supabase
              .from(tableName)
              .select('id, name, email, prn, department, year')
              .eq('id', sub.student_id)
              .maybeSingle()
            
            studentData = sData
          } catch (e) {
            console.log('Could not find student in table:', tableName)
          }
        }

        // Fetch actual submitted files from submission_files table
        let filesData: any[] = []
        try {
          const { data, error: filesError } = await supabase
            .from('submission_files')
            .select('*')
            .eq('submission_id', sub.id)

          if (filesError) {
            console.log('DEBUG: submission_files table error:', filesError.message)
            // Table might not exist - will use legacy columns
          } else {
            filesData = data || []
            console.log('DEBUG: Files from submission_files table:', filesData.length, 'files')
          }
        } catch (e) {
          console.log('DEBUG: Could not query submission_files table')
        }

        // Check legacy columns directly on submission
        console.log('DEBUG: Legacy columns - file_urls:', sub.file_urls, 'file_names:', sub.file_names, 'submission_text:', sub.submission_text)

        // Map the database column names to match our UI expectations
        const mappedFiles = (filesData || []).map((f: any) => ({
          ...f,
          file_name: f.name || f.file_name,
          file_url: f.file_url,
          file_size: f.file_size,
          file_type: f.file_type
        }))

        // Backward compatibility:
        // - Older submissions may have file_urls/file_names stored directly on assignment_submissions
        // - Newer submissions store rows in submission_files
        const legacyFileUrls: string[] = Array.isArray((sub as any).file_urls) ? (sub as any).file_urls : []
        const legacyFileNames: string[] = Array.isArray((sub as any).file_names) ? (sub as any).file_names : []
        const legacyFileSizes: number[] = Array.isArray((sub as any).file_sizes) ? (sub as any).file_sizes : []

        const finalFileUrls = (mappedFiles.length > 0)
          ? mappedFiles.map((f: any) => f.file_url).filter(Boolean)
          : legacyFileUrls

        const finalFileNames = (mappedFiles.length > 0)
          ? mappedFiles.map((f: any) => f.file_name).filter(Boolean)
          : legacyFileNames

        const finalFileSizes = (mappedFiles.length > 0)
          ? mappedFiles.map((f: any) => f.file_size)
          : legacyFileSizes

        const submissionText = (sub as any).submission_text || (sub as any).submission_content || (sub as any).content || ''

        return {
          ...sub,
          student_name: studentData?.name || sub.student_email?.split('@')[0] || 'Unknown Student',
          student_prn: studentData?.prn || 'N/A',
          student_department: studentData?.department || sub.student_department || 'Unknown',
          student_year: studentData?.year || sub.student_year || 'Unknown',
          files: mappedFiles,
          submission_text: submissionText,
          file_urls: finalFileUrls,
          file_names: finalFileNames,
          file_sizes: finalFileSizes
        }
      }))

      console.log('DEBUG: Enriched submissions:', enrichedSubmissions)
      setSubmissions(enrichedSubmissions)
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (subscriptionsRef.current) {
      subscriptionsRef.current.unsubscribe()
    }

    if (selectedAssignment === 'all') return

    const channel = supabase
      .channel(`submissions-${selectedAssignment}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${selectedAssignment}`
        },
        (payload) => {
          console.log('DEBUG: Realtime submission update:', payload)
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Submission",
              description: "A new submission has been received",
            })
          }
          loadSubmissions()
        }
      )
      .subscribe()

    subscriptionsRef.current = { unsubscribe: () => supabase.removeChannel(channel) }
  }

  const getFilteredAndSortedSubmissions = () => {
    let filtered = [...submissions]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(sub =>
        sub.student_name?.toLowerCase().includes(term) ||
        sub.student_prn?.toLowerCase().includes(term) ||
        sub.student_email?.toLowerCase().includes(term) ||
        sub.assignment?.title?.toLowerCase().includes(term)
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(sub => sub.status === filterStatus)
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "submissionDate":
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        case "studentName":
          return (a.student_name || '').localeCompare(b.student_name || '')
        case "grade":
          return (b.grade || 0) - (a.grade || 0)
        case "plagiarism":
          return (b.plagiarism_score || 0) - (a.plagiarism_score || 0)
        default:
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      }
    })
  }

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !grade) {
      toast({
        title: "Error",
        description: "Please enter a grade",
        variant: "destructive"
      })
      return
    }

    const gradeNum = parseFloat(grade)
    const maxMarks = selectedSubmission.assignment?.max_marks || 100

    // Validate grade is not negative
    if (gradeNum < 0) {
      toast({
        title: "Invalid Grade",
        description: "Grade cannot be negative. Please enter a grade of 0 or higher.",
        variant: "destructive"
      })
      return
    }

    // Validate grade is not greater than max_marks
    if (gradeNum > maxMarks) {
      toast({
        title: "Invalid Grade",
        description: `Grade cannot exceed maximum marks (${maxMarks}). Please enter a grade between 0 and ${maxMarks}.`,
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          grade: parseFloat(grade),
          feedback: feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id)

      if (error) throw error

      // Create notification for student
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedSubmission.student_id,
          type: 'assignment_graded',
          title: 'Assignment Graded',
          message: `Your submission for "${selectedSubmission.assignment?.title}" has been graded. Grade: ${grade}/${selectedSubmission.assignment?.max_marks}`,
          data: {
            assignment_id: selectedSubmission.assignment_id,
            grade: grade,
            feedback: feedback
          }
        })

      toast({
        title: "Success",
        description: "Grade saved and student notified",
      })

      setShowGradeDialog(false)
      setGrade("")
      setFeedback("")
      loadSubmissions()
    } catch (error) {
      console.error('Error grading submission:', error)
      toast({
        title: "Error",
        description: "Failed to save grade",
        variant: "destructive"
      })
    }
  }

  const handleAIGrading = async () => {
    if (submissions.filter(s => s.status === 'submitted').length === 0) {
      toast({
        title: "No Submissions",
        description: "No pending submissions to grade",
        variant: "destructive"
      })
      return
    }

    setAiGrading(true)
    setAiProgress(0)

    try {
      const toGrade = submissions.filter(s => s.status === 'submitted')
      const total = toGrade.length
      let processed = 0

      for (const submission of toGrade) {
        // Simulate AI grading (replace with actual AI API call)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Generate AI score based on content
        const textContent = submission.submission_text || ''
        const fileCount = submission.file_urls?.length || 0
        
        // Simple heuristic for demo (replace with real AI)
        let aiScore = 50 + Math.floor(Math.random() * 40)
        if (textContent.length > 500) aiScore += 5
        if (fileCount > 0) aiScore += 5
        if (aiScore > 100) aiScore = 100

        const aiFeedback = generateAIFeedback(aiScore, textContent, fileCount)

        // Update submission
        await supabase
          .from('assignment_submissions')
          .update({
            grade: aiScore,
            feedback: aiFeedback,
            status: 'graded',
            graded_at: new Date().toISOString(),
            ai_grade: aiScore,
            ai_feedback: aiFeedback
          })
          .eq('id', submission.id)

        processed++
        setAiProgress(Math.round((processed / total) * 100))
      }

      toast({
        title: "AI Grading Complete",
        description: `Graded ${total} submissions`,
      })

      loadSubmissions()
    } catch (error) {
      console.error('Error in AI grading:', error)
      toast({
        title: "Error",
        description: "AI grading failed",
        variant: "destructive"
      })
    } finally {
      setAiGrading(false)
      setAiProgress(0)
    }
  }

  const generateAIFeedback = (score: number, content: string, fileCount: number): string => {
    const feedback = []
    
    if (score >= 90) {
      feedback.push("Excellent work! Your submission demonstrates thorough understanding.")
    } else if (score >= 75) {
      feedback.push("Good effort! The submission meets most requirements with some areas for improvement.")
    } else if (score >= 60) {
      feedback.push("Satisfactory work. Consider expanding on key concepts and providing more examples.")
    } else {
      feedback.push("The submission needs improvement. Please review the assignment requirements and resubmit.")
    }

    if (content.length < 200) {
      feedback.push("Consider providing more detailed explanations.")
    }

    if (fileCount === 0 && content.length < 500) {
      feedback.push("Adding supporting files or documentation could strengthen your submission.")
    }

    return feedback.join(" ")
  }

  const generateReport = (submission: any) => {
    // Create a simple HTML report
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assignment Report - ${submission.assignment?.title || 'Assignment'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #4F46E5; margin: 0; }
          .header p { color: #666; margin: 5px 0 0 0; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 150px 1fr; gap: 8px; }
          .label { color: #666; }
          .value { font-weight: 500; }
          .grade-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .grade-box .score { font-size: 48px; font-weight: bold; }
          .feedback-box { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4F46E5; }
          .files-list { list-style: none; padding: 0; }
          .files-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Assignment Report</h1>
          <p>${submission.assignment?.title || 'Assignment'}</p>
          <p>${submission.assignment?.department?.toUpperCase() || ''} Department</p>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="info-grid">
            <span class="label">Name:</span>
            <span class="value">${submission.student_name || 'N/A'}</span>
            <span class="label">PRN:</span>
            <span class="value">${submission.student_prn || 'N/A'}</span>
            <span class="label">Email:</span>
            <span class="value">${submission.student_email || 'N/A'}</span>
            <span class="label">Department:</span>
            <span class="value">${submission.student_department?.toUpperCase() || 'N/A'} - Year ${submission.student_year || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Submission Details</div>
          <div class="info-grid">
            <span class="label">Submitted On:</span>
            <span class="value">${new Date(submission.submitted_at).toLocaleString()}</span>
            <span class="label">Status:</span>
            <span class="value">${submission.status?.toUpperCase() || 'SUBMITTED'}</span>
            ${submission.is_late ? '<span class="label">Late Submission:</span><span class="value" style="color: red;">Yes</span>' : ''}
          </div>
        </div>

        ${submission.files && submission.files.length > 0 ? `
        <div class="section">
          <div class="section-title">Submitted Files</div>
          <ul class="files-list">
            ${submission.files.map((f: any) => `<li>📄 ${f.file_name} (${(f.file_size / 1024).toFixed(1)} KB)</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${submission.submission_text ? `
        <div class="section">
          <div class="section-title">Submission Text</div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${submission.submission_text}</div>
        </div>
        ` : ''}

        ${submission.grade !== undefined && submission.grade !== null ? `
        <div class="grade-box">
          <div class="score">${submission.grade}/${submission.assignment?.max_marks || 100}</div>
          <div>Grade</div>
        </div>
        ` : ''}

        ${submission.feedback ? `
        <div class="section">
          <div class="section-title">Faculty Feedback</div>
          <div class="feedback-box">${submission.feedback}</div>
        </div>
        ` : ''}

        ${submission.graded_at ? `
        <div class="section">
          <div class="section-title">Grading Information</div>
          <div class="info-grid">
            <span class="label">Graded On:</span>
            <span class="value">${new Date(submission.graded_at).toLocaleString()}</span>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Generated by EduVision Learning Management System</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Report_${submission.student_name?.replace(/\s+/g, '_')}_${submission.assignment?.title?.replace(/\s+/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report Downloaded",
      description: "The assignment report has been downloaded successfully.",
    })
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      case 'ppt':
      case 'pptx':
        return <Presentation className="h-4 w-4 text-orange-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 text-purple-500" />
      case 'py':
      case 'js':
      case 'ts':
      case 'cpp':
      case 'java':
        return <FileCode className="h-4 w-4 text-cyan-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-800">Submitted</Badge>
      case "graded":
        return <Badge className="bg-purple-100 text-purple-800">Graded</Badge>
      case "late":
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPlagiarismBadge = (score?: number) => {
    if (score === undefined || score === null) return null
    
    if (score > 15) {
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High ({score}%)
        </Badge>
      )
    } else if (score > 8) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Medium ({score}%)
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Low ({score}%)
        </Badge>
      )
    }
  }

  if (loading && !currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assignment Submissions</h1>
            <p className="text-sm text-gray-500">
              {currentUser?.department?.toUpperCase()} Department
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSubmissions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleAIGrading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={aiGrading || submissions.filter(s => s.status === 'submitted').length === 0}
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Auto-Grade ({submissions.filter(s => s.status === 'submitted').length})
          </Button>
        </div>
      </div>

      {/* AI Grading Progress */}
      {aiGrading && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-purple-900">AI Grading in Progress...</p>
                <Progress value={aiProgress} className="mt-2" />
              </div>
              <span className="text-purple-900 font-bold">{aiProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="font-medium">Select Assignment:</Label>
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Select an assignment" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title} - {assignment.department.toUpperCase()} ({assignment.target_years?.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'submitted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">High Plagiarism</p>
                <p className="text-2xl font-bold">{submissions.filter(s => (s.plagiarism_score || 0) > 15).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === "graded").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by student name, PRN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submissionDate">Date</SelectItem>
              <SelectItem value="studentName">Student</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
              <SelectItem value="plagiarism">Plagiarism</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="h-6 w-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : getFilteredAndSortedSubmissions().length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-500">
            {selectedAssignment === 'all' 
              ? 'Select an assignment to view submissions'
              : 'No submissions match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredAndSortedSubmissions().map((submission) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={(submission.plagiarism_score || 0) > 15 ? "border-l-4 border-l-red-500" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* Student Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {submission.student_name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <h3 className="font-bold">{submission.student_name}</h3>
                            <p className="text-xs text-gray-500">{submission.student_email}</p>
                          </div>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span>PRN: <strong>{submission.student_prn}</strong></span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{submission.student_department?.toUpperCase()} - {submission.student_year}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{new Date(submission.submitted_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Submission Text Preview */}
                      {submission.submission_text && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Submission Text:</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {submission.submission_text}
                          </p>
                        </div>
                      )}

                      {/* Files */}
                      {submission.file_urls && submission.file_urls.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Submitted Files ({submission.file_urls.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {submission.file_urls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {getFileIcon(submission.file_names?.[index] || 'file')}
                                <span className="text-sm font-medium">{submission.file_names?.[index] || `File ${index + 1}`}</span>
                                <span className="text-xs text-gray-400">
                                  ({formatFileSize(submission.file_sizes?.[index])})
                                </span>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grade & Feedback */}
                      <div className="flex flex-wrap gap-2">
                        {submission.plagiarism_score !== undefined && submission.plagiarism_score !== null && (
                          <div className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {getPlagiarismBadge(submission.plagiarism_score)}
                          </div>
                        )}
                        {submission.grade !== undefined && submission.grade !== null && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Grade: {submission.grade}/{submission.assignment?.max_marks || 100}
                          </Badge>
                        )}
                        {submission.ai_grade && (
                          <Badge variant="outline" className="text-purple-600 border-purple-300">
                            <Brain className="h-3 w-3 mr-1" />
                            AI: {submission.ai_grade}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowReport(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      {submission.status !== "graded" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setGrade(submission.grade?.toString() || "")
                            setFeedback(submission.feedback || "")
                            setShowGradeDialog(true)
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Submission Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Student Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Name</Label>
                      <p className="font-medium">{selectedSubmission.student_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">PRN</Label>
                      <p className="font-medium">{selectedSubmission.student_prn}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Email</Label>
                      <p className="font-medium">{selectedSubmission.student_email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Department/Year</Label>
                      <p className="font-medium">{selectedSubmission.student_department?.toUpperCase()} - {selectedSubmission.student_year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Content */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Submission Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSubmission.submission_text && (
                    <div className="mb-4">
                      <Label className="text-gray-500">Text Submission</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{selectedSubmission.submission_text}</p>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                    <div>
                      <Label className="text-gray-500">Submitted Files</Label>
                      <div className="mt-2 space-y-2">
                        {selectedSubmission.file_urls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              {getFileIcon(selectedSubmission.file_names?.[index] || 'file')}
                              <div>
                                <p className="font-medium text-sm">{selectedSubmission.file_names?.[index]}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(selectedSubmission.file_sizes?.[index])}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grading Info */}
              {(selectedSubmission.grade !== undefined || selectedSubmission.feedback) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Grading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSubmission.grade !== undefined && (
                        <div>
                          <Label className="text-gray-500">Grade</Label>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedSubmission.grade}/{selectedSubmission.assignment?.max_marks || 100}
                          </p>
                        </div>
                      )}
                      {selectedSubmission.graded_at && (
                        <div>
                          <Label className="text-gray-500">Graded At</Label>
                          <p className="font-medium">{new Date(selectedSubmission.graded_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {selectedSubmission.feedback && (
                      <div className="mt-4">
                        <Label className="text-gray-500">Feedback</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{selectedSubmission.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>Close</Button>
            {selectedSubmission && selectedSubmission.status === 'graded' && (
              <Button onClick={() => generateReport(selectedSubmission)} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
            {selectedSubmission && selectedSubmission.status !== 'graded' && (
              <Button onClick={() => {
                setShowReport(false)
                setGrade(selectedSubmission.grade?.toString() || "")
                setFeedback(selectedSubmission.feedback || "")
                setShowGradeDialog(true)
              }}>
                Grade Submission
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.student_name} - {selectedSubmission?.assignment?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Grade (out of {selectedSubmission?.assignment?.max_marks || 100})</Label>
              <Input
                type="number"
                min="0"
                max={selectedSubmission?.assignment?.max_marks || 100}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade"
              />
            </div>
            <div>
              <Label>Feedback</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback for the student..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>Cancel</Button>
            <Button onClick={handleGradeSubmission}>Save Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
