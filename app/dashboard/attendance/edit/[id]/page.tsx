"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Save, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function EditAttendancePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    department: "",
    studyingYear: "",
    className: "",
    subject: "",
    date: "",
    timing: "",
    floor: "",
    classroom: "",
    description: "",
    duration: "60",
    status: "active"
  })
  
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [availableClassrooms, setAvailableClassrooms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const departments = [
    "Computer Science Engineering",
    "Information Technology", 
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Biotechnology"
  ]

  const studyingYears = ["1", "2", "3", "4"]
  const floors = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

  useEffect(() => {
    loadAttendanceRecord()
  }, [params.id])

  useEffect(() => {
    // Load classes when department and year are selected
    if (formData.department && formData.studyingYear) {
      loadAvailableClasses()
    }
  }, [formData.department, formData.studyingYear])

  useEffect(() => {
    // Update available classrooms when floor is selected
    if (formData.floor) {
      updateAvailableClassrooms()
    }
  }, [formData.floor])

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

      setFormData({
        department: record.department || "",
        studyingYear: record.studyingYear || "",
        className: record.className || "",
        subject: record.subject || "",
        date: record.date || "",
        timing: record.timing || "",
        floor: record.floor || "",
        classroom: record.classroom || "",
        description: record.description || "",
        duration: record.duration || "60",
        status: record.status || "active"
      })
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

  const loadAvailableClasses = () => {
    try {
      const classes = JSON.parse(localStorage.getItem("study_classes") || "[]")
      const filteredClasses = classes.filter((cls: any) => 
        cls.department === formData.department && 
        cls.studyingYear === formData.studyingYear
      )
      setAvailableClasses(filteredClasses)
    } catch (error) {
      console.error("Error loading classes:", error)
    }
  }

  const updateAvailableClassrooms = () => {
    const floor = formData.floor
    const classrooms = []
    
    for (let i = 1; i <= 6; i++) {
      const roomNumber = `${floor}0${i}`
      classrooms.push(roomNumber)
    }
    
    setAvailableClassrooms(classrooms)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-populate class name when class is selected
    if (field === "className") {
      const selectedClass = availableClasses.find(cls => cls.id === value)
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          subject: selectedClass.subject || selectedClass.name
        }))
      }
    }
  }

  const validateForm = () => {
    const required = ["department", "studyingYear", "className", "subject", "date", "timing", "floor", "classroom"]
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missing.join(", ")}`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      // Get students for the selected class
      const selectedClass = availableClasses.find(cls => cls.id === formData.className)
      const totalStudents = selectedClass?.students_count || 0

      // Update attendance record
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]")
      const updatedRecords = records.map((record: any) => {
        if (record.id === params.id) {
          return {
            ...record,
            ...formData,
            totalStudents,
            updatedAt: new Date().toISOString(),
            geolocation: getGeolocationForClassroom(formData.floor, formData.classroom)
          }
        }
        return record
      })

      localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords))

      toast({
        title: "Success",
        description: "Attendance session updated successfully.",
      })

      router.push("/dashboard/attendance")
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast({
        title: "Error",
        description: "Failed to update attendance session.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]")
      const updatedRecords = records.filter((record: any) => record.id !== params.id)
      localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords))

      toast({
        title: "Success",
        description: "Attendance session deleted successfully.",
      })

      router.push("/dashboard/attendance")
    } catch (error) {
      console.error("Error deleting attendance:", error)
      toast({
        title: "Error",
        description: "Failed to delete attendance session.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const getGeolocationForClassroom = (floor: string, classroom: string) => {
    // Placeholder geolocation data - will be replaced with actual coordinates
    const geoData: {[key: string]: {lat: number, lng: number}} = {
      "101": { lat: 18.5204, lng: 73.8567 },
      "102": { lat: 18.5205, lng: 73.8568 },
      "103": { lat: 18.5206, lng: 73.8569 },
      "104": { lat: 18.5207, lng: 73.8570 },
      "105": { lat: 18.5208, lng: 73.8571 },
      "106": { lat: 18.5209, lng: 73.8572 },
      // Add more classrooms as needed
    }
    
    return geoData[classroom] || { lat: 18.5204, lng: 73.8567 }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Attendance Session</h1>
        </div>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            Edit Attendance Details
          </CardTitle>
          <CardDescription>
            Update the attendance session information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Selection */}
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Studying Year */}
            <div>
              <Label htmlFor="studyingYear">Studying Year *</Label>
              <Select value={formData.studyingYear} onValueChange={(value) => handleInputChange("studyingYear", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {studyingYears.map((year) => (
                    <SelectItem key={year} value={year}>Year {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Name */}
            <div>
              <Label htmlFor="className">Class Name *</Label>
              <Select 
                value={formData.className} 
                onValueChange={(value) => handleInputChange("className", value)}
                disabled={!formData.department || !formData.studyingYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.department || !formData.studyingYear 
                      ? "Select Department & Year first" 
                      : "Select Class"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Subject name"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date *</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
            </div>

            {/* Timing */}
            <div>
              <Label htmlFor="timing">Timing *</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="timing"
                  type="time"
                  value={formData.timing}
                  onChange={(e) => handleInputChange("timing", e.target.value)}
                />
              </div>
            </div>

            {/* Floor */}
            <div>
              <Label htmlFor="floor">Floor *</Label>
              <Select value={formData.floor} onValueChange={(value) => handleInputChange("floor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor}>{floor}st Floor</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Classroom */}
            <div>
              <Label htmlFor="classroom">Classroom *</Label>
              <Select 
                value={formData.classroom} 
                onValueChange={(value) => handleInputChange("classroom", value)}
                disabled={!formData.floor}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!formData.floor ? "Select Floor first" : "Select Classroom"} />
                </SelectTrigger>
                <SelectContent>
                  {availableClassrooms.map((room) => (
                    <SelectItem key={room} value={room}>Room {room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Additional notes about this attendance session..."
                rows={3}
              />
            </div>
          </div>

          {/* Location Preview */}
          {formData.floor && formData.classroom && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Location Details</span>
              </div>
              <p className="text-sm text-blue-700">
                Floor {formData.floor}, Classroom {formData.classroom}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Geolocation will be automatically updated for this classroom
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Attendance Session
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Attendance Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this attendance session? This action cannot be undone and will remove all associated attendance records.
            </p>
            <div className="bg-red-50 p-3 rounded">
              <p className="font-medium text-red-800">{formData.subject}</p>
              <p className="text-sm text-red-600">
                {formData.department} - {new Date(formData.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
