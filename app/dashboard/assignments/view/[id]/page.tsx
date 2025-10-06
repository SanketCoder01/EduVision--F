"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Edit3, 
  BarChart3,
  BookOpen,
  GraduationCap,
  Building2,
  Star,
  Bot,
  FileUp,
  Shield,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  questions?: string
  subject: string
  department: string
  target_years: string[]
  due_date: string
  created_at: string
  status: "draft" | "published"
  max_marks: number
  submission_guidelines?: string
  enable_plagiarism_check?: boolean
  allow_late_submission?: boolean
  allow_resubmission?: boolean
  faculty?: {
    name: string
    email: string
  }
}

export default function AssignmentViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true)
        
        // Get assignment from Supabase
        const assignment = await SupabaseAssignmentService.getAssignmentById(params.id as string)
        
        if (assignment) {
          setAssignment(assignment as Assignment)
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
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params.id, toast, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800"
      case "draft": return "bg-gray-100 text-gray-800"
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
          <Button
            onClick={() => router.push(`/dashboard/assignments/manage/${assignment.id}`)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Submissions
          </Button>
        </div>
      </div>

      {/* Assignment Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 font-sans">{assignment.title}</CardTitle>
              <CardDescription className="text-base font-sans">
                {assignment.subject} • {assignment.department} • {assignment.target_years?.[0] || 'N/A'}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getStatusColor(assignment.status)}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </Badge>
              {assignment.enable_plagiarism_check && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  Plagiarism Check
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <FileText className="h-5 w-5" />
                Assignment Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 font-sans">
                  {assignment.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Questions */}
          {assignment.questions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans">
                  <HelpCircle className="h-5 w-5" />
                  Assignment Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-700 font-sans bg-gray-50 p-4 rounded-lg border">
                  {assignment.questions}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Guidelines */}
          {assignment.submission_guidelines && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans">
                  <BookOpen className="h-5 w-5" />
                  Submission Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-700 font-sans">
                  {assignment.submission_guidelines}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Shield className="h-5 w-5" />
                Assignment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium font-sans">Plagiarism Check</span>
                </div>
                {assignment.enable_plagiarism_check ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium font-sans">Late Submission</span>
                </div>
                {assignment.allow_late_submission ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium font-sans">Resubmission</span>
                </div>
                {assignment.allow_resubmission ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium font-sans">Due Date</p>
                  <p className="text-sm text-gray-600 font-sans">{formatDate(assignment.due_date)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium font-sans">Created</p>
                  <p className="text-sm text-gray-600 font-sans">{formatDate(assignment.created_at)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium font-sans">Total Marks</p>
                  <p className="text-sm text-gray-600 font-sans">{assignment.max_marks} points</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium font-sans">Department</p>
                  <p className="text-sm text-gray-600 font-sans">{assignment.department}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium font-sans">Target Years</p>
                  <p className="text-sm text-gray-600 font-sans">{assignment.target_years?.join(', ') || 'N/A'}</p>
                </div>
              </div>
              
              {assignment.faculty && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium font-sans">Faculty</p>
                      <p className="text-sm text-gray-600 font-sans">{assignment.faculty.name}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/assignments/edit/${assignment.id}`)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Assignment
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/assignments/manage/${assignment.id}`)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Submissions & Analytics
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
                Copy Student Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
