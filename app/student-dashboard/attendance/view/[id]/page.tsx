"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle, XCircle, Edit3, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AttendanceDetailView() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null)
  const [subjectHistory, setSubjectHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  useEffect(() => {
    loadAttendanceDetail()
  }, [params.id])

  const loadAttendanceDetail = () => {
    try {
      const allRecords = JSON.parse(localStorage.getItem("student_attendance_history") || "[]")
      const record = allRecords.find((r: any) => r.id === params.id)
      
      if (record) {
        setAttendanceRecord(record)
        
        // Load all records for this subject to show complete history
        const subjectRecords = allRecords.filter((r: any) => r.subject === record.subject)
        
        // Add some mock historical data for demonstration
        const mockHistoricalData = [
          {
            id: "mock_1",
            date: "2024-01-15",
            status: "present",
            timing: "10:00 AM - 11:00 AM",
            classroom: "301",
            floor: "3"
          },
          {
            id: "mock_2", 
            date: "2024-01-12",
            status: "absent",
            timing: "10:00 AM - 11:00 AM",
            classroom: "301",
            floor: "3",
            note: "Had fever and doctor advised rest"
          },
          {
            id: "mock_3",
            date: "2024-01-10",
            status: "present", 
            timing: "10:00 AM - 11:00 AM",
            classroom: "301",
            floor: "3"
          },
          {
            id: "mock_4",
            date: "2024-01-08",
            status: "present",
            timing: "10:00 AM - 11:00 AM", 
            classroom: "301",
            floor: "3"
          },
          {
            id: "mock_5",
            date: "2024-01-05",
            status: "absent",
            timing: "10:00 AM - 11:00 AM",
            classroom: "301", 
            floor: "3",
            note: "Family emergency - had to travel home"
          },
          {
            id: "mock_6",
            date: "2024-01-03",
            status: "present",
            timing: "10:00 AM - 11:00 AM",
            classroom: "301",
            floor: "3"
          }
        ]
        
        // Combine real records with mock data and sort by date
        const combinedHistory = [...subjectRecords, ...mockHistoricalData]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setSubjectHistory(combinedHistory)
      }
    } catch (error) {
      console.error("Error loading attendance detail:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditNote = (recordId: string, currentNote: string = "") => {
    setEditingNote(recordId)
    setNoteText(currentNote)
  }

  const handleSaveNote = (recordId: string) => {
    try {
      // Update the note in subject history
      const updatedHistory = subjectHistory.map(record => {
        if (record.id === recordId) {
          return { ...record, note: noteText.trim() }
        }
        return record
      })
      setSubjectHistory(updatedHistory)
      
      // If this is a real record (not mock), update localStorage
      if (recordId.startsWith("student_att_") || recordId.startsWith("hist_")) {
        const allRecords = JSON.parse(localStorage.getItem("student_attendance_history") || "[]")
        const updatedAllRecords = allRecords.map((record: any) => {
          if (record.id === recordId) {
            return { ...record, note: noteText.trim() }
          }
          return record
        })
        localStorage.setItem("student_attendance_history", JSON.stringify(updatedAllRecords))
      }
      
      setEditingNote(null)
      setNoteText("")
      
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setNoteText("")
  }

  const getAttendanceStats = () => {
    const totalSessions = subjectHistory.length
    const presentSessions = subjectHistory.filter(record => record.status === "present").length
    const absentSessions = totalSessions - presentSessions
    const attendanceRate = totalSessions > 0 ? ((presentSessions / totalSessions) * 100).toFixed(1) : "0"
    
    return {
      totalSessions,
      presentSessions,
      absentSessions,
      attendanceRate
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!attendanceRecord) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Record Not Found</h1>
          <p className="text-gray-600 mb-6">The attendance record you're looking for doesn't exist.</p>
          <Link href="/student-dashboard/attendance">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Attendance
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const stats = getAttendanceStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/student-dashboard/attendance">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Attendance
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{attendanceRecord.subject}</h1>
            <p className="text-gray-500 mt-1">Detailed attendance history and records</p>
          </div>
        </div>

        {/* Subject Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.presentSessions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absentSessions}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Attendance History - {attendanceRecord.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectHistory.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border-2 ${
                    record.status === "present" 
                      ? "border-green-200 bg-green-50" 
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {record.status === "present" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {record.status === "present" ? "Present" : "Absent"}
                        </div>
                        <div className={`text-lg font-bold ${
                          record.status === "present" ? "text-green-700" : "text-red-700"
                        }`}>
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {record.timing}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Floor {record.floor}, Room {record.classroom}
                        </div>
                      </div>

                      {/* Note Section */}
                      {record.status === "absent" && (
                        <div className="mt-3">
                          {editingNote === record.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add a note about why you were absent..."
                                rows={3}
                                className="w-full"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveNote(record.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save Note
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Absence Note:</p>
                                  {record.note ? (
                                    <p className="text-sm text-gray-600">{record.note}</p>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">No note added</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditNote(record.id, record.note || "")}
                                  className="ml-2"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
