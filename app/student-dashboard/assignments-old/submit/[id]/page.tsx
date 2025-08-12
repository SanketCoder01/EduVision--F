"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Paperclip,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { getAssignmentById, createSubmission, uploadFile, getStudentSubmissionForAssignment } from "@/lib/supabase"

interface Assignment {
  id: string
  title: string
  description: string
  faculty_id: string
  department: string
  year: string
  assignment_type: string
  allowed_file_types: string[]
  max_marks: number
  due_date: string
  start_date: string
  visibility: boolean
  allow_late_submission: boolean
  allow_resubmission: boolean
  enable_plagiarism_check: boolean
  status: string
  faculty: {
    name: string
    email: string
  }
  resources: any[]
}

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [textSubmission, setTextSubmission] = useState("")
  const [submissionType, setSubmissionType] = useState<"file" | "text">("file")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    // Get current user
    const studentSession = localStorage.getItem("studentSession")
    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setCurrentUser(user)
        loadAssignment(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
        router.push("/login?type=student")
      }
    } else {
      router.push("/login?type=student")
    }
  }, [params.id, router])

  const loadAssignment = async (user: any) => {
    try {
      setLoading(true)

      // Fetch assignment details
      const assignmentData = await getAssignmentById(params.id)

      if (!assignmentData) {
        toast({
          title: "Assignment not found",
          description: "The assignment you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/student-dashboard/assignments")
        return
      }

      // Check if assignment is for the student's department and year
      if (assignmentData.department !== user.department || assignmentData.year !== user.year) {
        toast({
          title: "Access Denied",
          description: "This assignment is not available for your department/year.",
          variant: "destructive",
        })
        router.push("/student-dashboard/assignments")
        return
      }

      setAssignment(assignmentData)

      // Set submission type based on assignment type
      if (assignmentData.assignment_type === "text_based") {
        setSubmissionType("text")
      } else {
        setSubmissionType("file")
      }

      // Check for existing submission
      try {
        const submission = await getStudentSubmissionForAssignment(user.id, params.id)
        if (submission) {
          setExistingSubmission(submission)
          if (submission.content) {
            setTextSubmission(submission.content)
          }
        }
      } catch (error) {
        // No existing submission found, which is fine
      }
    } catch (error) {
      console.error("Error loading assignment:", error)
      toast({
        title: "Error",
        description: "Failed to load assignment details",
        variant: "destructive",
      })
      router.push("/student-dashboard/assignments")
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    if (!assignment) return

    const validFiles: File[] = []
    const invalidFiles: string[] = []

    files.forEach((file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      if (assignment.allowed_file_types.includes(fileExtension || "")) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file types",
        description: `The following files are not allowed: ${invalidFiles.join(", ")}`,
        variant: "destructive",
      })
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles])
      toast({
        title: "Files uploaded",
        description: `${validFiles.length} file(s) added successfully`,
      })
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "📄"
      case "doc":
      case "docx":
        return "📝"
      case "txt":
        return "📄"
      case "zip":
        return "🗜️"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️"
      default:
        return "📎"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - now.getTime()

    if (diff < 0) {
      return { text: "Overdue", urgent: true, expired: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return { text: `${days} day${days > 1 ? "s" : ""} remaining`, urgent: days <= 1, expired: false }
    } else if (hours > 0) {
      return { text: `${hours} hour${hours > 1 ? "s" : ""} remaining`, urgent: true, expired: false }
    } else {
      return { text: "Due soon", urgent: true, expired: false }
    }
  }

  const handleSubmit = async () => {
    if (!assignment || !currentUser) return

    if (submissionType === "file" && uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file to submit",
        variant: "destructive",
      })
      return
    }

    if (submissionType === "text" && !textSubmission.trim()) {
      toast({
        title: "No content provided",
        description: "Please enter your submission content",
        variant: "destructive",
      })
      return
    }

    // Check if resubmission is allowed
    if (existingSubmission && !assignment.allow_resubmission) {
      toast({
        title: "Resubmission Not Allowed",
        description: "You have already submitted this assignment and resubmission is not allowed.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmSubmission = async () => {
    if (!assignment || !currentUser) return

    setSubmitting(true)
    setShowConfirmDialog(false)

    try {
      const fileUrls: string[] = []
      const fileNames: string[] = []

      // Upload files if any
      if (submissionType === "file" && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            const fileName = `${Date.now()}-${file.name}`
            const filePath = `submissions/${assignment.id}/${currentUser.id}/${fileName}`
            const { url } = await uploadFile(file, "assignment-submissions", filePath)
            fileUrls.push(url)
            fileNames.push(file.name)
          } catch (error) {
            console.error("Error uploading file:", error)
            toast({
              title: "Upload Error",
              description: `Failed to upload ${file.name}`,
              variant: "destructive",
            })
          }
        }
      }

      // Create submission
      const submissionData = {
        assignment_id: assignment.id,
        student_id: currentUser.id,
        content: submissionType === "text" ? textSubmission : null,
        file_urls: fileUrls,
        file_names: fileNames,
        status: "submitted" as const,
      }

      await createSubmission(submissionData)

      toast({
        title: "Assignment submitted successfully!",
        description: "Your submission has been recorded and sent to your instructor.",
      })

      router.push("/student-dashboard/assignments")
    } catch (error) {
      console.error("Error submitting assignment:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
        <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or is not available.</p>
        <Button onClick={() => router.push("/student-dashboard/assignments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
      </div>
    )
  }

  const timeRemaining = getTimeRemaining(assignment.due_date)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/student-dashboard/assignments")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600 mt-1">
              {existingSubmission ? "Update your submission" : "Submit your assignment"}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Submission Alert */}
      {existingSubmission && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Previous Submission Found:</strong> You submitted this assignment on{" "}
            {new Date(existingSubmission.submitted_at).toLocaleDateString()}.
            {assignment.allow_resubmission
              ? " You can resubmit if needed."
              : " Resubmission is not allowed for this assignment."}
          </AlertDescription>
        </Alert>
      )}

      {/* Time Warning */}
      {timeRemaining.urgent && !timeRemaining.expired && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Urgent:</strong> {timeRemaining.text}
          </AlertDescription>
        </Alert>
      )}

      {timeRemaining.expired && !assignment.allow_late_submission && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Overdue:</strong> This assignment is past its due date and late submissions are not allowed.
          </AlertDescription>
        </Alert>
      )}

      {/* Assignment Details */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={timeRemaining.urgent ? "text-orange-600 font-medium" : ""}>{timeRemaining.text}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>{assignment.max_marks} marks</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Faculty:</span>
            <span className="font-medium">{assignment.faculty?.name}</span>
          </div>

          {assignment.allowed_file_types.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Allowed File Types</h3>
              <div className="flex flex-wrap gap-2">
                {assignment.allowed_file_types.map((type) => (
                  <Badge key={type} variant="outline" className="text-sm">
                    .{type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {assignment.resources && assignment.resources.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Resources</h3>
              <div className="space-y-2">
                {assignment.resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {resource.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" />
            Submit Your Work
          </CardTitle>
          <CardDescription>
            {existingSubmission ? "Update your existing submission" : "Submit your assignment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Submission Type Selection */}
          {assignment.assignment_type !== "text_based" && assignment.assignment_type !== "file_upload" && (
            <div className="flex gap-4">
              <Button
                variant={submissionType === "file" ? "default" : "outline"}
                onClick={() => setSubmissionType("file")}
                className={submissionType === "file" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <Upload className="h-4 w-4 mr-2" />
                File Upload
              </Button>
              <Button
                variant={submissionType === "text" ? "default" : "outline"}
                onClick={() => setSubmissionType("text")}
                className={submissionType === "text" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <FileText className="h-4 w-4 mr-2" />
                Text Submission
              </Button>
            </div>
          )}

          {/* File Upload */}
          {submissionType === "file" && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dragActive ? "Drop files here" : "Upload your files"}
                </h3>
                <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-4">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept={assignment.allowed_file_types.map((type) => `.${type}`).join(",")}
                  onChange={handleFileInput}
                />
                <p className="text-xs text-gray-500">Allowed types: {assignment.allowed_file_types.join(", ")}</p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getFileIcon(file.name)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text Submission */}
          {submissionType === "text" && (
            <div className="space-y-4">
              <Label htmlFor="textSubmission" className="text-base font-medium">
                Your Submission
              </Label>
              <Textarea
                id="textSubmission"
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                placeholder="Enter your assignment content here..."
                className="min-h-[300px] resize-none"
              />
              <p className="text-sm text-gray-500">
                Word count: {textSubmission.trim().split(/\s+/).filter(Boolean).length}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={() => router.push("/student-dashboard/assignments")}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || (timeRemaining.expired && !assignment.allow_late_submission)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {existingSubmission ? "Update Submission" : "Submit Assignment"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to {existingSubmission ? "update" : "submit"} this assignment?
              {!assignment.allow_resubmission && !existingSubmission && " This action cannot be undone."}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Submission Summary:</h4>
              <p className="text-sm text-gray-600">Assignment: {assignment.title}</p>
              <p className="text-sm text-gray-600">
                Type: {submissionType === "file" ? "File Upload" : "Text Submission"}
              </p>
              {submissionType === "file" && (
                <p className="text-sm text-gray-600">Files: {uploadedFiles.length} file(s)</p>
              )}
              {submissionType === "text" && (
                <p className="text-sm text-gray-600">
                  Word count: {textSubmission.trim().split(/\s+/).filter(Boolean).length}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSubmission}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm {existingSubmission ? "Update" : "Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
