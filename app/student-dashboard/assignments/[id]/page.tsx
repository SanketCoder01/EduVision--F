"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  Eye, 
  ExternalLink,
  BookOpen,
  HelpCircle,
  Download,
  AlertCircle,
  CheckCircle,
  Award,
  BarChart3,
  Shield,
  MessageSquare,
  Star,
  GraduationCap,
  Target,
  Timer,
  Send,
  Paperclip
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"
import { supabase } from "@/lib/supabase"

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user from Supabase Auth session only
        const { data: { session } } = await supabase.auth.getSession()
        let user = null
        
        if (session?.user) {
          // Use API route to get current user data from correct table
          try {
            const response = await fetch('/api/auth/current-user', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            })
            
            if (response.ok) {
              user = await response.json()
              console.log('Current user loaded from API:', user)
            } else {
              console.error('Failed to load user from API:', response.status)
            }
          } catch (error) {
            console.error('Error fetching current user:', error)
          }
        }
        
        console.log('Current user found:', user)
        
        if (user) {
          setCurrentUser(user)
          
          // Load assignment details with complete faculty information
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('assignments')
            .select(`
              *,
              faculty:faculty_id (
                id,
                name,
                email,
                department,
                designation,
                phone,
                photo,
                avatar
              )
            `)
            .eq('id', params.id)
            .single()
          
          console.log('Assignment query result:', { assignmentData, assignmentError })
          
          if (assignmentError || !assignmentData) {
            console.error('Error loading assignment:', assignmentError)
            // Try to fetch assignment with service role (bypass RLS)
            try {
              const response = await fetch(`/api/assignments/${params.id}`)
              
              if (response.ok) {
                const fallbackAssignment = await response.json()
                console.log('Fallback assignment loaded:', fallbackAssignment)
                setAssignment(fallbackAssignment)
              } else {
                console.error('API fetch failed:', response.status, response.statusText)
                // Don't return here, continue to show error but don't block loading
                setAssignment(null)
              }
            } catch (fetchError) {
              console.error('Fetch error:', fetchError)
              setAssignment(null)
            }
          } else {
            console.log('Assignment loaded successfully:', assignmentData)
            setAssignment(assignmentData)
          }
          
          // Load existing submission from assignment_submissions table
          const { data: submissionData } = await supabase
            .from('assignment_submissions')
            .select('*')
            .eq('assignment_id', params.id)
            .eq('student_id', user.id)
            .single()
            
          if (submissionData) {
            setSubmission(submissionData)
            setSubmissionText(submissionData.submission_text || "")
          }
        } else {
          console.log('No user found')
          // Still try to load assignment for debugging
          try {
            const response = await fetch(`/api/assignments/${params.id}`)
            if (response.ok) {
              const fallbackAssignment = await response.json()
              console.log('Assignment loaded without user:', fallbackAssignment)
              setAssignment(fallbackAssignment)
            }
          } catch (error) {
            console.error('Failed to load assignment without user:', error)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load assignment data.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSubmissionFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmission = async () => {
    if (!currentUser || !assignment) return
    
    if (!submissionText.trim() && submissionFiles.length === 0) {
      toast({
        title: "Submission Required",
        description: "Please provide either text submission or upload files.",
        variant: "destructive"
      })
      return
    }

    // Validate file types if assignment has restrictions
    if (submissionFiles.length > 0 && assignment.allowed_file_types && assignment.allowed_file_types.length > 0) {
      const invalidFiles = submissionFiles.filter(file => {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        return !assignment.allowed_file_types.includes(fileExtension)
      })
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid File Type",
          description: `Files ${invalidFiles.map(f => f.name).join(', ')} are not allowed. Only ${assignment.allowed_file_types.join(', ')} files are permitted.`,
          variant: "destructive"
        })
        return
      }
    }

    setIsSubmitting(true)
    
    try {
      // Create submission data - only include fields that exist in currentUser
      const submissionData = {
        assignment_id: assignment.id,
        student_id: currentUser.id,
        student_email: currentUser.email || currentUser.user_email,
        student_department: currentUser.department,
        student_year: currentUser.year,
        submission_text: submissionText,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        is_late: new Date() > new Date(assignment.due_date)
      }

      let submissionResult
      if (submission) {
        // Update existing submission
        const { data, error } = await supabase
          .from('assignment_submissions')
          .update(submissionData)
          .eq('id', submission.id)
          .select()
          .single()
          
        if (error) throw error
        submissionResult = data
      } else {
        // Create new submission
        const { data, error } = await supabase
          .from('assignment_submissions')
          .insert([submissionData])
          .select()
          .single()
          
        if (error) throw error
        submissionResult = data
      }

      // Upload files if any
      if (submissionFiles.length > 0) {
        for (const file of submissionFiles) {
          try {
            const filePath = `submissions/${submissionResult.id}/${Date.now()}_${file.name}`
            const { error: uploadError } = await supabase.storage
              .from('assignment-files')
              .upload(filePath, file)
              
            if (uploadError) throw uploadError
            
            const { data: { publicUrl } } = supabase.storage
              .from('assignment-files')
              .getPublicUrl(filePath)

            await supabase.from('submission_files').insert([{
              submission_id: submissionResult.id,
              file_name: file.name,
              file_url: publicUrl,
              file_size: file.size,
              file_type: file.type
            }])
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error)
            toast({
              title: "File Upload Failed",
              description: `Failed to upload ${file.name}.`,
              variant: "destructive"
            })
          }
        }
      }

      // Run plagiarism check if enabled
      if (assignment.enable_plagiarism_check && submissionText.trim()) {
        await runPlagiarismCheck(submissionResult.id, submissionText)
      }

      // Create notification for faculty
      await createFacultyNotification(assignment, currentUser)

      setSubmission(submissionResult)
      setSubmissionFiles([])
      toast({
        title: "Submission Successful",
        description: "Your assignment has been submitted successfully.",
      })

    } catch (error) {
      console.error('Error submitting assignment:', error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const runPlagiarismCheck = async (submissionId: string, text: string) => {
    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update submission with plagiarism score
        await supabase
          .from('assignment_submissions')
          .update({
            plagiarism_score: result.similarity_percentage,
            plagiarism_report: result
          })
          .eq('id', submissionId)
      }
    } catch (error) {
      console.error('Error running plagiarism check:', error)
    }
  }

  const createFacultyNotification = async (assignment: any, student: any) => {
    try {
      const notificationData = {
        type: "submission",
        title: "New Assignment Submission",
        message: `${student.name} has submitted "${assignment.title}"`,
        assignment_id: assignment.id,
        student_id: student.id,
        faculty_id: assignment.faculty_id,
        department: assignment.department,
        created_at: new Date().toISOString(),
        read: false
      }

      await supabase.from('notifications').insert([notificationData])
    } catch (error) {
      console.error('Error creating faculty notification:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - now.getTime()
    
    if (diff < 0) return "Overdue"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} days, ${hours} hours remaining`
    return `${hours} hours remaining`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 mb-4">The assignment you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isOverdue = new Date(assignment.due_date) < new Date()
  const isSubmitted = !!submission

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <Badge variant={assignment.assignment_type === 'ai' ? 'default' : 'secondary'} className="mb-2">
                      {assignment.assignment_type === 'ai' ? 'AI Generated' : assignment.assignment_type?.toUpperCase()}
                    </Badge>
                    <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Instructor</p>
                      <p className="font-semibold text-gray-900">{assignment.faculty?.name || 'Unknown Faculty'}</p>
                      <p className="text-xs text-gray-500">{assignment.faculty?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Target className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Max Marks</p>
                      <p className="font-semibold text-gray-900">{assignment.max_marks} points</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Timer className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Time Remaining</p>
                      <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {getTimeRemaining(assignment.due_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-80">
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5" />
                      Due Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {formatDate(assignment.due_date)}
                    </p>
                    <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                      {getTimeRemaining(assignment.due_date)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Assignment Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {assignment.description}
                    </p>
                  </div>
                  {assignment.resources?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
                      <div className="space-y-2">
                        {assignment.resources.map((resource: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">{resource.name}</p>
                                <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.open(resource.url, '_blank')}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions */}
            {assignment.questions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {assignment.questions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Submission Guidelines */}
            {assignment.submission_guidelines && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Submission Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {assignment.submission_guidelines}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Submission Section */}
            {(assignment.allow_late_submission || !isOverdue) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Show text area only for text_based assignments */}
                    {assignment.assignment_type === 'text_based' && (
                      <div>
                        <Label htmlFor="submission-text">Text Submission</Label>
                        <Textarea
                          id="submission-text"
                          placeholder="Enter your assignment submission here..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          rows={6}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {/* Show file upload for file_upload assignments */}
                    {assignment.assignment_type === 'file_upload' && (
                      <div>
                        <Label htmlFor="file-upload">Upload Files</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="mt-1"
                          accept={assignment.allowed_file_types?.join(',') || ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: {assignment.allowed_file_types?.join(', ') || 'PDF, DOC, DOCX, TXT, JPG, PNG, ZIP'}
                        </p>
                      </div>
                    )}

                    {/* Show both for other assignment types */}
                    {assignment.assignment_type !== 'text_based' && assignment.assignment_type !== 'file_upload' && (
                      <>
                        <div>
                          <Label htmlFor="submission-text">Text Submission</Label>
                          <Textarea
                            id="submission-text"
                            placeholder="Enter your assignment submission here..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows={6}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="file-upload">Upload Files (Optional)</Label>
                          <Input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="mt-1"
                            accept={assignment.allowed_file_types?.join(',') || ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: {assignment.allowed_file_types?.join(', ') || 'PDF, DOC, DOCX, TXT, JPG, PNG, ZIP'}
                          </p>
                        </div>
                      </>
                    )}

                    {submissionFiles.length > 0 && (
                      <div>
                        <Label>Selected Files</Label>
                        <div className="mt-2 space-y-2">
                          {submissionFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {submission?.files?.length > 0 && (
                      <div>
                        <Label>Previously Uploaded Files</Label>
                        <div className="mt-2 space-y-2">
                          {submission.files.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">{file.file_name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(file.file_size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(file.file_url, '_blank')}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmission}
                      disabled={isSubmitting || (
                        assignment.assignment_type === 'text_based' ? !submissionText.trim() : 
                        assignment.assignment_type === 'file_upload' ? submissionFiles.length === 0 :
                        (!submissionText.trim() && submissionFiles.length === 0)
                      )}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {isSubmitted ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Submission Details */}
            {submission && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      Your Submission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Submitted On</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Submission Type</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {submission.submission_text ? 'Text' : 'File Upload'}
                        </p>
                      </div>
                    </div>

                    {submission.submission_text && (
                      <div className="p-4 bg-white rounded-lg border border-green-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Your Response
                        </h4>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">{submission.submission_text}</p>
                        </div>
                      </div>
                    )}

                    {submission.files?.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-green-200">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Uploaded Files
                        </h4>
                        <div className="space-y-2">
                          {submission.files.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">{file.file_name}</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(file.file_url, '_blank')}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Assignment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Department</span>
                    <Badge variant="outline">{assignment.department}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Target Years</span>
                    <div className="flex gap-1">
                      {assignment.target_years?.map((year: string) => (
                        <Badge key={year} variant="secondary" className="text-xs">
                          {year}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difficulty</span>
                    <Badge 
                      variant={assignment.difficulty === 'hard' ? 'destructive' : 
                              assignment.difficulty === 'intermediate' ? 'default' : 'secondary'}
                    >
                      {assignment.difficulty}
                    </Badge>
                  </div>
                  
                  {assignment.estimated_time && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Est. Time</span>
                      <span className="font-medium">{assignment.estimated_time} min</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Late Submission</span>
                    <Badge variant={assignment.allow_late_submission ? 'default' : 'destructive'}>
                      {assignment.allow_late_submission ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resubmission</span>
                    <Badge variant={assignment.allow_resubmission ? 'default' : 'secondary'}>
                      {assignment.allow_resubmission ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plagiarism Check</span>
                    <Badge variant={assignment.enable_plagiarism_check ? 'default' : 'secondary'}>
                      {assignment.enable_plagiarism_check ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submission Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Submission Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Submitted</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Submitted on {formatDate(submission.submitted_at)}
                      </p>
                      {assignment.allow_resubmission && !isOverdue && (
                        <p className="text-xs text-blue-600">
                          You can update your submission until the due date
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {isOverdue ? 'Overdue' : 'Not Submitted'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isOverdue 
                          ? 'This assignment is past due'
                          : 'Submit your assignment before the due date'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Faculty Contact */}
            {assignment.faculty && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Instructor Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {assignment.faculty.photo || assignment.faculty.avatar ? (
                          <img 
                            src={assignment.faculty.photo || assignment.faculty.avatar} 
                            alt={assignment.faculty.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{assignment.faculty.name}</h4>
                        <p className="text-sm text-gray-600">{assignment.faculty.designation || 'Faculty'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{assignment.faculty.email}</span>
                      </div>
                      
                      {assignment.faculty.phone && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{assignment.faculty.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{assignment.faculty.department} Department</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}