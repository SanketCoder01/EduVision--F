"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, FileText, Edit, Trash2, Bell, Users, MessageSquare, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Assignment, AssignmentResource, Submission, Comment } from "@/types/assignment"
import { SubmissionList } from "./submissions/submission-list"
import { CommentSection } from "./comments/comment-section"
import { AssignmentAnalytics } from "./analytics/assignment-analytics"

interface AssignmentPageProps {
  assignment: Assignment
  resources: AssignmentResource[]
  submissions: Submission[]
  comments: Comment[]
  totalStudents: number
  onDeleteAssignment: (id: string) => Promise<void>
  onSendNotification: (assignmentId: string, type: string, content: string) => Promise<void>
  onGradeSubmission: (submissionId: string, grade: string, marks: number, feedback: string) => Promise<void>
  onReturnForResubmission: (submissionId: string, feedback: string) => Promise<void>
  onAddComment: (assignmentId: string, content: string) => Promise<void>
  currentUserId: string
}

export function AssignmentPage({
  assignment,
  resources,
  submissions,
  comments,
  totalStudents,
  onDeleteAssignment,
  onSendNotification,
  onGradeSubmission,
  onReturnForResubmission,
  onAddComment,
  currentUserId,
}: AssignmentPageProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("submissions")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotifyDialog, setShowNotifyDialog] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("deadline_reminder")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    setIsSubmitting(true)

    try {
      await onDeleteAssignment(assignment.id)

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })

      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle send notification
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await onSendNotification(assignment.id, notificationType, notificationMessage)

      toast({
        title: "Success",
        description: "Notification sent successfully",
      })

      setShowNotifyDialog(false)
      setNotificationMessage("")
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle add comment
  const handleAddComment = async (content: string) => {
    try {
      await onAddComment(assignment.id, content)

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  }

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    return <FileText className="h-4 w-4 mr-1" />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Manage Assignment</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/edit/${assignment.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowNotifyDialog(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">{assignment.title}</h2>
              <p className="text-gray-500 mb-4">Class: {assignment.class_id}</p>

              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="bg-gray-100">
                  <Calendar className="h-3 w-3 mr-1" />
                  Due: {formatDate(assignment.due_date)}
                </Badge>

                <Badge variant="outline" className="bg-gray-100">
                  <Clock className="h-3 w-3 mr-1" />
                  Created: {formatDate(assignment.created_at)}
                </Badge>

                <Badge variant="outline" className="bg-gray-100">
                  <FileText className="h-3 w-3 mr-1" />
                  Type: {assignment.assignment_type.replace("_", " ")}
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Description:</h3>
                <div className="text-gray-700 whitespace-pre-line">{assignment.description}</div>
              </div>

              {resources.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Resources:</h3>
                  <div className="flex flex-wrap gap-2">
                    {resources.map((resource) => (
                      <Button
                        key={resource.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs"
                        asChild
                      >
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          {getFileIcon(resource.name)}
                          <span className="ml-1">{resource.name}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium mb-3">Settings:</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maximum Marks:</span>
                  <span className="font-medium">{assignment.max_marks}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visibility:</span>
                  <span className="font-medium">{assignment.visibility ? "Visible to students" : "Hidden"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Late Submission:</span>
                  <span className="font-medium">{assignment.allow_late_submission ? "Allowed" : "Not allowed"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resubmission:</span>
                  <span className="font-medium">{assignment.allow_resubmission ? "Allowed" : "Not allowed"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plagiarism Check:</span>
                  <span className="font-medium">{assignment.enable_plagiarism_check ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Group Submission:</span>
                  <span className="font-medium">{assignment.allow_group_submission ? "Allowed" : "Not allowed"}</span>
                </div>

                {assignment.word_limit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Word Limit:</span>
                    <span className="font-medium">{assignment.word_limit} words</span>
                  </div>
                )}

                {assignment.allowed_file_types && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allowed File Types:</span>
                    <span className="font-medium">
                      {assignment.allowed_file_types.map((type) => `.${type}`).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="submissions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="submissions"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <Users className="mr-2 h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <SubmissionList
                submissions={submissions}
                onGradeSubmission={onGradeSubmission}
                onReturnForResubmission={onReturnForResubmission}
                maxMarks={assignment.max_marks}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <AssignmentAnalytics
                submissions={submissions}
                totalStudents={totalStudents}
                maxMarks={assignment.max_marks}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <CommentSection
                comments={comments}
                onAddComment={handleAddComment}
                currentUserId={currentUserId}
                currentUserType="faculty"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Assignment Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start">
              <Trash2 className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Are you sure you want to delete this assignment?</h4>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone. All submissions and grades associated with this assignment will be
                  permanently deleted.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAssignment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-base">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                  <SelectItem value="missing_submission">Missing Submission</SelectItem>
                  <SelectItem value="feedback_available">Feedback Available</SelectItem>
                  <SelectItem value="resubmission_request">Resubmission Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notificationMessage" className="text-base">
                Message
              </Label>
              <Textarea
                id="notificationMessage"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter notification message"
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-start">
                <Bell className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">Notification will be sent to:</h4>
                  <p className="text-amber-700 text-xs mt-1">All students in the selected class</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSendNotification}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
