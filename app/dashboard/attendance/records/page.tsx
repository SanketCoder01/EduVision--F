"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, Clock, Users, CheckCircle, XCircle, Eye, Download, Filter, Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupabaseAttendanceService } from "@/lib/supabase-attendance"
import { supabase } from "@/lib/supabase"

export default function AttendanceRecordsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [facultySessions, setFacultySessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRecordsDialog, setShowRecordsDialog] = useState(false)
  const [currentFaculty, setCurrentFaculty] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    initializeFacultyData()
  }, [])

  const initializeFacultyData = async () => {
    try {
      // Get current faculty from Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find faculty in faculty table
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (facultyData) {
          setCurrentFaculty(facultyData)
          await loadFacultySessions(facultyData)
        }
      }
    } catch (error) {
      console.error('Error initializing faculty data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFacultySessions = async (faculty: any) => {
    try {
      const sessions = await SupabaseAttendanceService.getFacultyAttendanceSessions(faculty.email)
      setFacultySessions(sessions)
    } catch (error) {
      console.error('Error loading faculty sessions:', error)
    }
  }

  const handleViewRecords = async (session: any) => {
    try {
      setSelectedSession(session)
      const records = await SupabaseAttendanceService.getSessionAttendanceRecords(session.id)
      setAttendanceRecords(records)
      setShowRecordsDialog(true)
    } catch (error) {
      console.error('Error loading attendance records:', error)
      toast({
        title: "Error",
        description: "Failed to load attendance records.",
        variant: "destructive",
      })
    }
  }

  const exportAttendanceData = (session: any, records: any[]) => {
    const csvContent = [
      ['Student Name', 'Student Email', 'Department', 'Year', 'Status', 'Marked At', 'Absence Note'],
      ...records.map(record => [
        record.student_name,
        record.student_email,
        record.student_department,
        record.student_year,
        record.status,
        record.marked_at ? new Date(record.marked_at).toLocaleString() : 'N/A',
        record.absence_note || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${session.subject}_${session.session_date}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  const getSessionStats = (session: any) => {
    const records = attendanceRecords.filter(r => r.session_id === session.id)
    const presentCount = records.filter(r => r.status === 'present').length
    const absentCount = records.filter(r => r.status === 'absent').length
    const totalCount = presentCount + absentCount
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    return { presentCount, absentCount, totalCount, attendanceRate }
  }

  const filteredSessions = facultySessions.filter(session => {
    const matchesSearch = session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || session.status === statusFilter
    
    const matchesDate = dateFilter === "all" || (() => {
      const sessionDate = new Date(session.session_date)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (dateFilter) {
        case "today": return daysDiff === 0
        case "week": return daysDiff <= 7
        case "month": return daysDiff <= 30
        default: return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans">Attendance Records</h1>
          <p className="text-gray-600 font-sans">View and manage attendance records for your sessions</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/attendance/create')}
          className="font-sans"
        >
          Create New Session
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-sans">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by subject or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-sans"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="font-sans">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="font-sans">
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="grid gap-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-sans">No Sessions Found</h3>
              <p className="text-gray-500 text-center font-sans">
                {facultySessions.length === 0 
                  ? "You haven't created any attendance sessions yet."
                  : "No sessions match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-sans">{session.subject}</CardTitle>
                      <CardDescription className="font-sans">
                        {session.class_name} • {session.department} {session.year}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={session.status === 'active' ? 'default' : 'secondary'}
                        className={session.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {session.status === 'active' ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {session.status ? session.status.charAt(0).toUpperCase() + session.status.slice(1) : 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-sans">Date</p>
                      <p className="font-medium font-sans">{formatDate(session.session_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-sans">Time</p>
                      <p className="font-medium font-sans">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-sans">Duration</p>
                      <p className="font-medium font-sans">{session.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-sans">Created</p>
                      <p className="font-medium font-sans">{formatDate(session.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/dashboard/attendance/session/${session.id}`)}
                      className="flex-1 font-sans"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Live View
                    </Button>
                    <Button
                      onClick={() => handleViewRecords(session)}
                      variant="outline"
                      className="flex-1 font-sans"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Attendance Records Dialog */}
      <Dialog open={showRecordsDialog} onOpenChange={setShowRecordsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sans">
              Attendance Records - {selectedSession?.subject}
            </DialogTitle>
            <p className="text-sm text-gray-600 font-sans">
              {selectedSession?.class_name} • {formatDate(selectedSession?.session_date || '')}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary Stats */}
            {attendanceRecords.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 font-sans">
                    {attendanceRecords.filter(r => r.status === 'present').length}
                  </p>
                  <p className="text-sm text-gray-600 font-sans">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600 font-sans">
                    {attendanceRecords.filter(r => r.status === 'absent').length}
                  </p>
                  <p className="text-sm text-gray-600 font-sans">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 font-sans">
                    {attendanceRecords.length}
                  </p>
                  <p className="text-sm text-gray-600 font-sans">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 font-sans">
                    {attendanceRecords.length > 0 
                      ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
                      : 0
                    }%
                  </p>
                  <p className="text-sm text-gray-600 font-sans">Rate</p>
                </div>
              </div>
            )}

            {/* Export Button */}
            {attendanceRecords.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={() => exportAttendanceData(selectedSession, attendanceRecords)}
                  variant="outline"
                  className="font-sans"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            )}

            {/* Records List */}
            <div className="space-y-2">
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-sans">No attendance records found for this session.</p>
                </div>
              ) : (
                attendanceRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium font-sans">{record.student_name}</h4>
                      <p className="text-sm text-gray-600 font-sans">
                        {record.student_email} • {record.student_department} {record.student_year}
                      </p>
                      {record.absence_note && (
                        <p className="text-sm text-gray-600 mt-1 font-sans">
                          <strong>Note:</strong> {record.absence_note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={record.status === 'present' ? 'default' : 'destructive'}
                        className={record.status === 'present' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {record.status === 'present' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                      {record.marked_at && (
                        <p className="text-xs text-gray-500 mt-1 font-sans">
                          {new Date(record.marked_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
