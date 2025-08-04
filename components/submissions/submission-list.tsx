"use client"

import { useState } from "react"
import { Search, Download, Eye, RefreshCw, Calendar, Shield, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Submission } from "@/types/assignment"

interface SubmissionListProps {
  submissions: Submission[]
  onGradeSubmission: (submissionId: string, grade: string, marks: number, feedback: string) => Promise<void>
  onReturnForResubmission: (submissionId: string, feedback: string) => Promise<void>
  maxMarks: number
}

export function SubmissionList({
  submissions,
  onGradeSubmission,
  onReturnForResubmission,
  maxMarks,
}: SubmissionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState("")
  const [grade, setGrade] = useState("")
  const [marks, setMarks] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock student data - in a real app, you'd fetch this from your database
  const students = {
    s1: { name: "Rahul Sharma", email: "rahul.s@example.com" },
    s2: { name: "Priya Patel", email: "priya.p@example.com" },
    s3: { name: "Amit Kumar", email: "amit.k@example.com" },
    s4: { name: "Sneha Gupta", email: "sneha.g@example.com" },
    s5: { name: "Vikram Singh", email: "vikram.s@example.com" },
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const student = students[sub.student_id as keyof typeof students] || { name: "Unknown", email: "unknown" }
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return sub.status === filterStatus && matchesSearch
  })

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Submitted
          </Badge>
        )
      case "graded":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Graded
          </Badge>
        )
      case "late":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Late
          </Badge>
        )
      case "returned":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Returned
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Draft
          </Badge>
        )
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
  }

  // Handle grade submission
  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return

    if (!grade.trim()) {
      alert("Please enter a grade")
      return
    }

    if (marks <= 0 || marks > maxMarks) {
      alert(`Please enter marks between 1 and ${maxMarks}`)
      return
    }

    setIsSubmitting(true)

    try {
      await onGradeSubmission(selectedSubmission.id, grade, marks, feedback)
      setSelectedSubmission(null)
      setFeedback("")
      setGrade("")
      setMarks(0)
    } catch (error) {
      console.error("Error submitting grade:", error)
      alert("Failed to submit grade and feedback")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle return for resubmission
  const handleReturnForResubmission = async () => {
    if (!selectedSubmission) return

    if (!feedback.trim()) {
      alert("Please provide feedback for resubmission")
      return
    }

    setIsSubmitting(true)

    try {
      await onReturnForResubmission(selectedSubmission.id, feedback)
      setSelectedSubmission(null)
      setFeedback("")
    } catch (error) {
      console.error("Error returning submission:", error)
      alert("Failed to return submission")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Plagiarism</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No submissions found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => {
                const student = students[submission.student_id as keyof typeof students] || {
                  name: "Unknown",
                  email: "unknown",
                }

                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>{submission.submitted_at ? formatDate(submission.submitted_at) : "N/A"}</TableCell>
                    <TableCell>
                      {submission.files && submission.files.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {submission.files.map((file, index) => (
                            <div key={index} className="flex items-center">
                              <span className="text-xs">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : submission.submission_type === "text" ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Text Submission
                        </Badge>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.plagiarism_score !== undefined ? (
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-1.5 ${
                              submission.plagiarism_score > 10
                                ? "bg-red-500"
                                : submission.plagiarism_score > 5
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                          ></div>
                          <span
                            className={
                              submission.plagiarism_score > 10
                                ? "text-red-600 font-medium"
                                : submission.plagiarism_score > 5
                                  ? "text-amber-600"
                                  : "text-green-600"
                            }
                          >
                            {submission.plagiarism_score}%
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.grade ? (
                        <div>
                          <Badge className="bg-purple-100 text-purple-800">{submission.grade}</Badge>
                          {submission.marks && (
                            <div className="text-xs text-gray-500 mt-1">
                              {submission.marks}/{maxMarks} marks
                            </div>
                          )}
                        </div>
                      ) : (
                        "Not graded"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setFeedback(submission.feedback || "")
                            setGrade(submission.grade || "")
                            setMarks(submission.marks || 0)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredSubmissions.length} of {submissions.length} submissions
      </div>

      {/* View/Grade Submission Dialog */}
      <Dialog open={selectedSubmission !== null} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSubmission && (
              <>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-medium">
                      {students[selectedSubmission.student_id as keyof typeof students]?.name || "Unknown Student"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {students[selectedSubmission.student_id as keyof typeof students]?.email || "unknown@example.com"}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 mr-2">Status:</div>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className="bg-gray-100">
                    <Calendar className="h-3 w-3 mr-1" />
                    Submitted: {formatDate(selectedSubmission.submitted_at)}
                  </Badge>

                  {selectedSubmission.plagiarism_score !== undefined && (
                    <Badge
                      variant="outline"
                      className={
                        selectedSubmission.plagiarism_score > 10
                          ? "bg-red-100 text-red-800"
                          : selectedSubmission.plagiarism_score > 5
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Similarity: {selectedSubmission.plagiarism_score}%
                    </Badge>
                  )}

                  {selectedSubmission.graded_at && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      <Check className="h-3 w-3 mr-1" />
                      Graded: {formatDate(selectedSubmission.graded_at)}
                    </Badge>
                  )}
                </div>

                {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Submitted Files:</h4>
                    <div className="space-y-2">
                      {selectedSubmission.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                          <div className="flex items-center">
                            <span className="ml-2">{file.name}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({(file.file_size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.submission_type === "text" && selectedSubmission.content && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Text Submission:</h4>
                    <div className="bg-white p-3 rounded-md border whitespace-pre-wrap">
                      {selectedSubmission.content}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grade" className="text-base">
                        Grade
                      </Label>
                      <Input
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Enter grade (e.g., A, B+, 95)"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marks" className="text-base">
                        Marks (out of {maxMarks})
                      </Label>
                      <Input
                        id="marks"
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={marks}
                        onChange={(e) => setMarks(Number.parseInt(e.target.value))}
                        placeholder={`Enter marks (0-${maxMarks})`}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback" className="text-base">
                      Feedback
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student"
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                      Cancel
                    </Button>

                    <Button variant="outline" onClick={handleReturnForResubmission} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          Returning...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Return for Resubmission
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmitGrade}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Grade
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
