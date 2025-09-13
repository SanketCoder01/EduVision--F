"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Edit3, 
  BarChart3,
  Star,
  Bot,
  FileUp,
  BookOpen,
  Building2
} from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  department: string
  year: string
  subject: string
  total_marks: number
  due_date: string
  status: "draft" | "published" | "closed"
  instructions: string
  resources: any[]
  created_at: string
  updated_at?: string
  submissions?: Submission[]
  grade?: string
  feedback?: string
  graded_at?: string
  difficulty?: string
  isAIGenerated?: boolean
  isFileGenerated?: boolean
}

interface Student {
  id: string
  name: string
  email: string
  class: string
  prn: string
}

interface Submission {
  id: string
  student_id: string
  assignment_id: string
  submission_type: string
  status: string
  submitted_at: string
  plagiarism_score: number
  files: { name: string; file_type: string; file_size: number }[]
  grade?: string
  feedback?: string
  graded_at?: string
}

export default function AssignmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        console.log('Fetching assignment with ID:', params.id)
        const { SupabaseAssignmentService } = await import("@/lib/supabase-assignments")
        const assignment = await SupabaseAssignmentService.getAssignmentById(params.id as string)
        
        if (assignment) {
          setAssignment({
            ...assignment,
            subject: assignment.department,
            year: assignment.target_years?.[0] || 'all',
            total_marks: assignment.max_marks,
            instructions: assignment.description,
            resources: []
          })
        } else {
          toast({
            title: "Assignment not found",
            description: "The assignment you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/dashboard/assignments")
        }
      } catch (error) {
        console.error("Error loading assignment:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment data",
          variant: "destructive",
        })
        router.push("/dashboard/assignments")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAssignment()
    }
  }, [params.id, toast, router])

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/assignments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/assignments")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assignments
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/assignments/edit/${assignment.id}`)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Assignment
              </Button>
            </div>
          </div>
        </div>

        {/* Assignment Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                <p className="text-lg text-gray-600">
                  {assignment.subject} • {assignment.department} • {assignment.year}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={getStatusColor(assignment.status)}>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
                <Badge className={getDifficultyColor(assignment.difficulty || '')}>
                  <Star className="mr-1 h-3 w-3" />
                  {assignment.difficulty ? assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1) : 'Not Set'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {assignment.isAIGenerated && (
                <Badge variant="secondary">
                  <Bot className="mr-1 h-3 w-3" />
                  AI Generated
                </Badge>
              )}
              
              {assignment.difficulty && (
                <Badge 
                  variant={assignment.difficulty === "Easy" ? "default" : 
                          assignment.difficulty === "Medium" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {assignment.difficulty}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Due Date</p>
                          <p className="text-sm font-semibold">{formatDate(assignment.due_date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          <p className="text-sm font-semibold">
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Department</p>
                          <p className="text-sm font-semibold">{assignment.department}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Year</p>
                          <p className="text-sm font-semibold">{assignment.year}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-6 w-6" />
                      Assignment Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {assignment.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BookOpen className="h-6 w-6" />
                      Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 leading-relaxed text-lg">
                      {assignment.instructions}
                    </div>
                  </CardContent>
                </Card>

                {/* Resources */}
                {assignment.resources && assignment.resources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-6 w-6" />
                        Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assignment.resources.map((resource, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-700 font-medium">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Compact */}
              <div className="xl:col-span-1 space-y-6">
                {/* Assignment Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assignment Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created</p>
                      <p className="text-sm text-gray-900">{formatDate(assignment.created_at)}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Subject</p>
                      <p className="text-sm text-gray-900">{assignment.subject}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/dashboard/assignments/edit/${assignment.id}`)}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    
                    <Button
                      className="w-full justify-start"
                      onClick={() => router.push(`/dashboard/assignments/submissions/${assignment.id}`)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Submissions
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const url = `${window.location.origin}/student-dashboard/assignments/${assignment.id}`
                        navigator.clipboard.writeText(url)
                        toast({
                          title: "Link Copied",
                          description: "Assignment link copied to clipboard",
                        })
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
