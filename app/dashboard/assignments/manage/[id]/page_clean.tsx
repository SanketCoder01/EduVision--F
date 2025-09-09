"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Edit3,
  Trash2,
  Bell,
  ExternalLink,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ManageAssignmentPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotifyDialog, setShowNotifyDialog] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("deadline_reminder")

  // Mock resources
  const mockResources = [
    {
      id: "res1",
      assignment_id: params.id,
      name: "Priority Queue Example",
      file_type: "application/pdf",
      file_url: "#",
    },
    {
      id: "res2",
      assignment_id: params.id,
      name: "Heap Implementation Guide",
      file_type: "application/docx",
      file_url: "#",
    },
  ]

  // Mock classes data
  const classes = [
    { id: "1", name: "10th Grade" },
    { id: "2", name: "FY CSE" },
    { id: "3", name: "SY CSE" },
  ]

  // Fetch assignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load assignment from localStorage
        const storedAssignments = localStorage.getItem("assignments")
        if (storedAssignments) {
          const assignments = JSON.parse(storedAssignments)
          const foundAssignment = assignments.find((a: any) => a.id.toString() === params.id)
          if (foundAssignment) {
            setAssignment({
              ...foundAssignment,
              class_id: foundAssignment.department,
              due_date: foundAssignment.due_date,
              created_at: foundAssignment.created_at || new Date().toISOString()
            })
          } else {
            toast({
              title: "Assignment not found",
              description: "The assignment you're looking for doesn't exist.",
              variant: "destructive",
            })
            router.push("/dashboard/assignments")
            return
          }
        }
        
        setResources(mockResources)
      } catch (error) {
        console.error("Error fetching assignment data:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast, router])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />
    } else if (fileType.includes("doc")) {
      return <FileText className="h-4 w-4 text-blue-500" />
    } else if (fileType.includes("zip")) {
      return <FileText className="h-4 w-4 text-gray-500" />
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    setIsSubmitting(true)

    try {
      // Delete from localStorage
      const storedAssignments = localStorage.getItem("assignments")
      if (storedAssignments) {
        const assignments = JSON.parse(storedAssignments)
        const updatedAssignments = assignments.filter((a: any) => a.id.toString() !== params.id)
        localStorage.setItem("assignments", JSON.stringify(updatedAssignments))
      }

      // Also delete related submissions
      const storedSubmissions = localStorage.getItem("assignmentSubmissions")
      if (storedSubmissions) {
        const allSubmissions = JSON.parse(storedSubmissions)
        const updatedSubmissions = allSubmissions.filter((sub: any) => sub.assignmentId !== params.id)
        localStorage.setItem("assignmentSubmissions", JSON.stringify(updatedSubmissions))
      }

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
      // In a real implementation, send notification via Supabase

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment Not Found</h2>
        <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/assignments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignments
        </Button>
      </div>
    )
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
          <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/edit/${params.id}`)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/submissions/${params.id}`)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Submissions
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
              <p className="text-gray-500 mb-4">
                Class: {classes.find((c) => c.id === assignment.class_id)?.name || assignment.department || "Unknown Class"}
              </p>

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
                  Type: {assignment.assignment_type?.replace("_", " ") || "Assignment"}
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
                        className="flex items-center text-xs bg-transparent"
                        asChild
                      >
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          {getFileIcon(resource.file_type)}
                          <span className="ml-1">{resource.name}</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
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
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{assignment.status || "Published"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{assignment.department || "N/A"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{assignment.year || "N/A"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{assignment.subject || "N/A"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{assignment.total_marks || 100}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Assignment</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this assignment? This action cannot be undone and will also delete all related submissions.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAssignment} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Notification Dialog */}
      {showNotifyDialog && (
        <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                    <SelectItem value="assignment_update">Assignment Update</SelectItem>
                    <SelectItem value="general_announcement">General Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notification-message">Message</Label>
                <Textarea
                  id="notification-message"
                  placeholder="Enter your notification message..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendNotification} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Notification"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
