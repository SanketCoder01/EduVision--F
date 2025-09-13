"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Plus, Calendar, Clock, MapPin, FileText, Download, Eye, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function AttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<any>(null)

  useEffect(() => {
    loadAttendanceRecords()
  }, [])

  const loadAttendanceRecords = () => {
    try {
      setIsLoading(true)
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]")
      setAttendanceRecords(records)
    } catch (error) {
      console.error("Error loading attendance records:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance records.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = (record: any) => {
    setRecordToDelete(record)
    setShowDeleteDialog(true)
  }

  const confirmDeleteRecord = () => {
    if (!recordToDelete) return

    try {
      const updatedRecords = attendanceRecords.filter(record => record.id !== recordToDelete.id)
      localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords))
      setAttendanceRecords(updatedRecords)
      
      toast({
        title: "Success",
        description: "Attendance record deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete attendance record.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setRecordToDelete(null)
    }
  }

  const getAttendanceStats = () => {
    const today = new Date().toDateString()
    const todayRecords = attendanceRecords.filter(record => 
      new Date(record.date).toDateString() === today
    )
    
    const totalStudents = attendanceRecords.reduce((sum, record) => 
      sum + (record.totalStudents || 0), 0
    )
    
    const presentStudents = attendanceRecords.reduce((sum, record) => 
      sum + (record.presentCount || 0), 0
    )

    return {
      totalRecords: attendanceRecords.length,
      todayRecords: todayRecords.length,
      totalStudents,
      presentStudents,
      attendanceRate: totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : "0"
    }
  }

  const stats = getAttendanceStats()

  if (isLoading) {
    return (
      <div className="w-full max-w-none mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <div className="animate-pulse h-10 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <Button 
          onClick={() => router.push("/dashboard/attendance/create")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Attendance
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRecords}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayRecords}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-orange-600">{stats.attendanceRate}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          {attendanceRecords.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
                  <p className="text-gray-500 mb-6">Create your first attendance session to start tracking student attendance.</p>
                  <Button 
                    onClick={() => router.push("/dashboard/attendance/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{record.subject}</CardTitle>
                          <CardDescription>
                            {record.department} - Year {record.studyingYear}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={record.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {record.timing}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          Floor {record.floor}, Room {record.classroom}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-sm">
                            <span className="font-medium text-green-600">{record.presentCount || 0}</span>
                            <span className="text-gray-500"> / {record.totalStudents || 0} present</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.presentCount && record.totalStudents 
                              ? `${((record.presentCount / record.totalStudents) * 100).toFixed(0)}%`
                              : "0%"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 pt-3 mt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/attendance/view/${record.id}`)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/attendance/edit/${record.id}`)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRecord(record)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest attendance sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceRecords.slice(0, 5).map((record, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{record.subject}</p>
                      <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">
                      {record.presentCount || 0}/{record.totalStudents || 0}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your attendance system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push("/dashboard/attendance/create")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Attendance
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Export functionality
                    toast({
                      title: "Export Started",
                      description: "Attendance data export will be available soon.",
                    })
                  }}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export All Records
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </p>
            {recordToDelete && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{recordToDelete.subject}</p>
                <p className="text-sm text-gray-600">
                  {recordToDelete.department} - {new Date(recordToDelete.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRecord}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
