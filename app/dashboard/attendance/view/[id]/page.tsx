"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Download, FileText, CheckCircle, XCircle } from "lucide-react"
import { AttendanceService } from "@/lib/attendance-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ViewAttendancePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttendanceRecord()
  }, [params.id])

  const loadAttendanceRecord = () => {
    try {
      setIsLoading(true)
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]")
      const record = records.find((r: any) => r.id === params.id)
      
      if (!record) {
        toast({
          title: "Record Not Found",
          description: "The attendance record could not be found.",
          variant: "destructive",
        })
        router.push("/dashboard/attendance")
        return
      }

      setAttendanceRecord(record)
    } catch (error) {
      console.error("Error loading attendance record:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance record.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    const attendanceService = AttendanceService.getInstance()
    const success = attendanceService.exportToPDF(params.id as string)
    
    if (success) {
      toast({
        title: "PDF Export Started",
        description: "Attendance report is being prepared for download.",
      })
    } else {
      toast({
        title: "Export Failed",
        description: "Failed to export attendance report to PDF.",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = () => {
    const attendanceService = AttendanceService.getInstance()
    const success = attendanceService.exportToXLSX(params.id as string)
    
    if (success) {
      toast({
        title: "Excel Export Complete",
        description: "Attendance report has been downloaded successfully.",
      })
    } else {
      toast({
        title: "Export Failed",
        description: "Failed to export attendance report to Excel.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!attendanceRecord) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Record not found</h3>
          <p className="text-gray-500 mb-6">The attendance record you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/attendance")}>
            Back to Attendance
          </Button>
        </div>
      </div>
    )
  }

  const presentStudents = attendanceRecord.students?.filter((s: any) => s.status === "present") || []
  const absentStudents = attendanceRecord.students?.filter((s: any) => s.status === "absent") || []
  const attendanceRate = attendanceRecord.totalStudents > 0 
    ? ((presentStudents.length / attendanceRecord.totalStudents) * 100).toFixed(1)
    : "0"

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Attendance Details</h1>
      </div>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{attendanceRecord.subject}</CardTitle>
              <CardDescription className="text-base mt-1">
                {attendanceRecord.department} - Year {attendanceRecord.studyingYear}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/attendance/edit/${attendanceRecord.id}`)}
              >
                Edit Session
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(attendanceRecord.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{attendanceRecord.timing}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">Floor {attendanceRecord.floor}, Room {attendanceRecord.classroom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="font-medium">{attendanceRate}%</p>
              </div>
            </div>
          </div>
          
          {attendanceRecord.description && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{attendanceRecord.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceRecord.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentStudents.length}</p>
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
                <p className="text-2xl font-bold text-red-600">{absentStudents.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Lists */}
      <Tabs defaultValue="present" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="present">Present Students ({presentStudents.length})</TabsTrigger>
          <TabsTrigger value="absent">Absent Students ({absentStudents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="present">
          {presentStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students marked present</h3>
                  <p className="text-gray-500">Students who mark their attendance will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presentStudents.map((student: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt={student.studentName} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {student.studentName?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{student.studentName}</p>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-green-50 text-green-700">Present</Badge>
                          {student.faceVerified && (
                            <Badge variant="outline" className="text-xs">Face Verified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Marked at: {new Date(student.markedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="absent">
          {absentStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No absent students</h3>
                  <p className="text-gray-500">All students have marked their attendance.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {absentStudents.map((student: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt={student.studentName} />
                        <AvatarFallback className="bg-red-100 text-red-700">
                          {student.studentName?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{student.studentName}</p>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                        <Badge className="bg-red-50 text-red-700 mt-1">Absent</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
