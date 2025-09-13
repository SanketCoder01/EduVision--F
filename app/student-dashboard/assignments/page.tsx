"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Calendar, Clock, CheckCircle, AlertTriangle, FileText, Download, Upload, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { getStudentSession } from "@/lib/student-auth"
import { SupabaseAssignmentService } from "@/lib/supabase-assignments"
import { supabase } from "@/lib/supabase"

interface Assignment {
  id: string
  title: string
  description: string
  faculty_id: string
  department: string
  year: string
  assignment_type: string
  max_marks: number
  due_date: string
  status: string
  created_at: string
  faculty?: {
    name: string
    email: string
  }
  submission?: any
}

const getAssignmentStatus = (assignment: Assignment, submission: any) => {
  if (!submission) {
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    return dueDate < now ? 'overdue' : 'pending'
  }
  
  if (submission.grade !== null && submission.grade !== undefined) {
    return 'graded'
  }
  
  return 'submitted'
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      console.log('DEBUG: Starting user authentication check...')
      
      try {
        const student = await getStudentSession()
        
        if (student) {
          console.log('DEBUG: Student authenticated:', student)
          setCurrentUser(student)
          loadAssignments(student)
          
          // Set up real-time subscription for assignments
          setupRealtimeSubscription(student)
        } else {
          console.error('DEBUG: No student session found')
          toast({
            title: "Authentication Required",
            description: "Please log in to access your assignments.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('DEBUG: Error during authentication:', error)
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate. Please try again.",
          variant: "destructive"
        })
      }
    }

    getUser()
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  const setupRealtimeSubscription = (user: any) => {
    console.log('DEBUG: Setting up real-time subscription for assignments...')
    
    // Subscribe to assignments table changes
    const assignmentsChannel = supabase
      .channel('assignments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `department=eq.${user.department}`
        },
        (payload) => {
          console.log('DEBUG: Real-time assignment update:', payload)
          
          // Reload assignments when there's a change
          if (currentUser) {
            loadAssignments(currentUser)
            
            // Show toast notification for new assignments
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Assignment Available",
                description: `${payload.new.title} has been published`,
              })
            }
          }
        }
      )
      .subscribe()

    console.log('DEBUG: Real-time subscription established')
  }

  const loadAssignments = async (user: any) => {
    try {
      setIsLoading(true)

      console.log('DEBUG: Loading assignments for user:', { 
        id: user.id,
        dept: user.department, 
        year: user.year,
        email: user.email
      })

      // Validate user data
      if (!user.department || !user.year) {
        console.error('DEBUG: User missing department or year:', user)
        toast({
          title: "Profile Incomplete",
          description: "Please complete your profile with department and year information.",
          variant: "destructive",
        })
        return
      }

      console.log('DEBUG: Fetching assignments from SupabaseAssignmentService...')
      const assignments = await SupabaseAssignmentService.getStudentAssignments(user.department, user.year)
      console.log('DEBUG: Raw assignments from service:', assignments)

      if (!assignments || assignments.length === 0) {
        console.log('DEBUG: No assignments found for department:', user.department, 'year:', user.year)
        setAssignments([])
        return
      }

      console.log('DEBUG: Processing', assignments.length, 'assignments...')

      // Get submissions for each assignment
      const assignmentsWithSubmissions = await Promise.all(
        assignments.map(async (assignment: any) => {
          console.log('DEBUG: Processing assignment:', assignment.id, assignment.title)
          
          try {
            const submission = await SupabaseAssignmentService.getStudentSubmission(assignment.id, user.id)
            console.log('DEBUG: Submission for', assignment.title, ':', submission)
            
            return {
              ...assignment,
              submission,
              status: getAssignmentStatus(assignment, submission),
              faculty: assignment.faculty || {
                name: "Faculty Name",
                email: "faculty@university.edu"
              }
            }
          } catch (error) {
            console.error('DEBUG: Error getting submission for assignment', assignment.id, ':', error)
            return {
              ...assignment,
              submission: null,
              status: getAssignmentStatus(assignment, null),
              faculty: assignment.faculty || {
                name: "Faculty Name", 
                email: "faculty@university.edu"
              }
            }
          }
        })
      )

      console.log('DEBUG: Final processed assignments:', assignmentsWithSubmissions)
      setAssignments(assignmentsWithSubmissions)

      // Set up real-time subscription
      console.log('DEBUG: Setting up real-time subscription...')
      const subscription = SupabaseAssignmentService.subscribeToAssignments((payload) => {
        console.log('DEBUG: Real-time update received:', payload)
        loadAssignments(user)
      })

      return () => {
        console.log('DEBUG: Cleaning up subscription...')
        subscription.unsubscribe()
      }

    } catch (error) {
      console.error('DEBUG: Error in loadAssignments:', error)
      toast({
        title: "Error",
        description: "Failed to load assignments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || assignment.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'graded': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Upload className="w-4 h-4" />
      case 'graded': return <CheckCircle className="w-4 h-4" />
      case 'overdue': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  // Statistics
  const totalAssignments = assignments.length
  const submittedCount = assignments.filter((a: Assignment) => a.status === 'submitted' || a.status === 'graded').length
  const pendingCount = assignments.filter((a: Assignment) => a.status === 'pending').length
  const overdueCount = assignments.filter((a: Assignment) => a.status === 'overdue').length
  const averageGrade = assignments
    .filter((a: Assignment) => a.submission?.grade !== null && a.submission?.grade !== undefined)
    .reduce((sum: number, a: Assignment) => sum + (a.submission?.grade || 0), 0) / 
    Math.max(assignments.filter((a: Assignment) => a.submission?.grade !== null && a.submission?.grade !== undefined).length, 1)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading assignments...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Assignments</h1>
          <p className="text-gray-600">Track and manage your academic assignments</p>
          {currentUser && (
            <p className="text-sm text-gray-500 mt-2">
              {currentUser.name} • {currentUser.department} • Year {currentUser.year}
            </p>
          )}
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
              <p className="text-sm text-gray-600">Submitted</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{isNaN(averageGrade) ? 'N/A' : averageGrade.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Avg Grade</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "You don't have any assignments yet."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAssignments.map((assignment: Assignment, index: number) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {assignment.faculty?.name || 'Faculty Name'}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(assignment.status)} flex items-center gap-1`}>
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {assignment.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        Type: {assignment.assignment_type?.replace('_', ' ') || 'Assignment'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Max Marks: {assignment.max_marks}
                      </div>
                    </div>

                    {assignment.submission?.grade !== null && assignment.submission?.grade !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Grade</span>
                          <span className="text-sm font-bold text-green-600">
                            {assignment.submission.grade}/{assignment.max_marks}
                          </span>
                        </div>
                        <Progress 
                          value={(assignment.submission.grade / assignment.max_marks) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/student-dashboard/assignments/${assignment.id}`}>
                          View Details
                        </Link>
                      </Button>
                      
                      {assignment.status === 'pending' && (
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={`/student-dashboard/assignments/${assignment.id}/submit`}>
                            Submit
                          </Link>
                        </Button>
                      )}
                      
                      {assignment.submission && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/student-dashboard/assignments/${assignment.id}/submission`}>
                            <Download className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
