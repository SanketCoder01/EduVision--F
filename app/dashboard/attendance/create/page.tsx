"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Building, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { SupabaseRealtimeService } from "@/lib/supabase-realtime"

export default function CreateAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    department: "",
    studyingYear: "",
    className: "",
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    floor: "",
    classroom: "",
    description: "",
    duration: "1"
  })
  
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [availableClassrooms, setAvailableClassrooms] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

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
  const durations = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

  useEffect(() => {
    // Load current user
    const facultySession = localStorage.getItem("facultySession")
    const currentUserData = localStorage.getItem("currentUser")
    
    let user = null
    if (facultySession) {
      user = JSON.parse(facultySession)
    } else if (currentUserData) {
      user = JSON.parse(currentUserData)
    }
    
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  useEffect(() => {
    // Load classes when department and year are selected
    if (formData.department && formData.studyingYear && currentUser) {
      loadAvailableClasses()
    }
  }, [formData.department, formData.studyingYear, currentUser])

  useEffect(() => {
    // Update available classrooms when floor is selected
    if (formData.floor) {
      updateAvailableClassrooms()
    }
  }, [formData.floor])

  const loadAvailableClasses = async () => {
    try {
      // Load timetable data from SupabaseRealtimeService
      const timetableData = await SupabaseRealtimeService.getTimetable(formData.department, formData.studyingYear)
      
      // Extract unique classes from timetable
      const uniqueClasses = new Map()
      
      timetableData.forEach((entry: any) => {
        const classKey = `${entry.subject}_${entry.department}_${entry.year}`
        if (!uniqueClasses.has(classKey)) {
          uniqueClasses.set(classKey, {
            id: classKey,
            name: `${entry.subject} - Year ${entry.year}`,
            subject: entry.subject,
            department: entry.department,
            year: entry.year,
            students_count: entry.students_count || 60 // Default count
          })
        }
      })
      
      const classesArray = Array.from(uniqueClasses.values())
      setAvailableClasses(classesArray)
      
      // If no classes found in timetable, create default classes based on department
      if (classesArray.length === 0) {
        const defaultSubjects = getDefaultSubjectsForDepartment(formData.department, formData.studyingYear)
        const defaultClasses = defaultSubjects.map((subject, index) => ({
          id: `${subject}_${formData.department}_${formData.studyingYear}_${index}`,
          name: `${subject} - Year ${formData.studyingYear}`,
          subject: subject,
          department: formData.department,
          year: formData.studyingYear,
          students_count: 60
        }))
        setAvailableClasses(defaultClasses)
      }
    } catch (error) {
      console.error("Error loading classes:", error)
      // Fallback to default classes
      const defaultSubjects = getDefaultSubjectsForDepartment(formData.department, formData.studyingYear)
      const defaultClasses = defaultSubjects.map((subject, index) => ({
        id: `${subject}_${formData.department}_${formData.studyingYear}_${index}`,
        name: `${subject} - Year ${formData.studyingYear}`,
        subject: subject,
        department: formData.department,
        year: formData.studyingYear,
        students_count: 60
      }))
      setAvailableClasses(defaultClasses)
    }
  }

  const getDefaultSubjectsForDepartment = (department: string, year: string) => {
    const subjectsByDepartment: {[key: string]: {[key: string]: string[]}} = {
      "Computer Science Engineering": {
        "1": ["Programming Fundamentals", "Mathematics I", "Physics", "Engineering Drawing", "Communication Skills"],
        "2": ["Data Structures", "Object Oriented Programming", "Mathematics II", "Digital Electronics", "Computer Organization"],
        "3": ["Database Management", "Operating Systems", "Computer Networks", "Software Engineering", "Web Development"],
        "4": ["Machine Learning", "Artificial Intelligence", "Distributed Systems", "Cybersecurity", "Project Work"]
      },
      "Information Technology": {
        "1": ["IT Fundamentals", "Mathematics I", "Physics", "Engineering Drawing", "Communication Skills"],
        "2": ["Programming Languages", "Data Structures", "Mathematics II", "Digital Systems", "Computer Architecture"],
        "3": ["Database Systems", "Network Security", "Web Technologies", "Software Testing", "System Analysis"],
        "4": ["Cloud Computing", "Big Data Analytics", "Mobile Computing", "IT Project Management", "Capstone Project"]
      },
      "Electronics & Communication": {
        "1": ["Basic Electronics", "Mathematics I", "Physics", "Engineering Drawing", "Communication Skills"],
        "2": ["Circuit Analysis", "Signals & Systems", "Mathematics II", "Electronic Devices", "Programming"],
        "3": ["Communication Systems", "Digital Signal Processing", "Microprocessors", "Control Systems", "VLSI Design"],
        "4": ["Wireless Communication", "Embedded Systems", "Antenna Theory", "Project Work", "Industrial Training"]
      }
    }
    
    return subjectsByDepartment[department]?.[year] || ["General Subject 1", "General Subject 2", "General Subject 3"]
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

    // Auto-calculate end time when start time or duration changes
    if (field === "startTime" || field === "duration") {
      const startTime = field === "startTime" ? value : formData.startTime
      const duration = field === "duration" ? parseInt(value) : parseInt(formData.duration)
      
      if (startTime && duration) {
        const [hours, minutes] = startTime.split(":")
        const startDate = new Date()
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        const endDate = new Date(startDate.getTime() + duration * 60000)
        const endTime = endDate.toTimeString().slice(0, 5)
        
        setFormData(prev => ({
          ...prev,
          endTime: endTime
        }))
      }
    }
  }

  const validateForm = () => {
    const required = ["department", "studyingYear", "className", "subject", "date", "startTime", "endTime", "floor", "classroom"]
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missing.join(", ")}`,
        variant: "destructive",
      })
      return false
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      toast({
        title: "Invalid Date",
        description: "Please select today's date or a future date.",
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

      // Create attendance record
      const attendanceRecord = {
        id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        timing: `${formData.startTime} - ${formData.endTime}`,
        totalStudents,
        presentCount: 0,
        absentCount: totalStudents,
        students: [], // Will be populated when students mark attendance
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: "faculty", // Current user
        geolocation: getGeolocationForClassroom(formData.floor, formData.classroom),
        autoCloseAt: new Date(new Date().getTime() + parseInt(formData.duration) * 60000).toISOString()
      }

      // Save to localStorage
      const existingRecords = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]")
      const updatedRecords = [...existingRecords, attendanceRecord]
      localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords))

      // Create notification for students
      createStudentNotification(attendanceRecord)

      toast({
        title: "Success",
        description: "Attendance session created successfully. Students will be notified.",
      })

      router.push("/dashboard/attendance")
    } catch (error) {
      console.error("Error creating attendance:", error)
      toast({
        title: "Error",
        description: "Failed to create attendance session.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  const createStudentNotification = (record: any) => {
    const notification = {
      id: `notif_${Date.now()}`,
      type: "attendance",
      title: "New Attendance Session",
      message: `Attendance for ${record.subject} is now active`,
      attendanceId: record.id,
      department: record.department,
      studyingYear: record.studyingYear,
      className: record.className,
      date: record.date,
      timing: record.timing,
      floor: record.floor,
      classroom: record.classroom,
      createdAt: new Date().toISOString(),
      read: false
    }

    // Save notification for students
    const existingNotifications = JSON.parse(localStorage.getItem("student_notifications") || "[]")
    const updatedNotifications = [...existingNotifications, notification]
    localStorage.setItem("student_notifications", JSON.stringify(updatedNotifications))
  }

  return (
    <div className="w-full max-w-none mx-auto px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Attendance Session</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            Attendance Details
          </CardTitle>
          <CardDescription>
            Set up a new attendance session for your class
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
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                />
              </div>
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Automatically calculated based on start time and duration</p>
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

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration} value={duration}>{duration} minute{duration !== "1" ? "s" : ""}</SelectItem>
                  ))}
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
                Geolocation will be automatically set for this classroom
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
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Attendance Session
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
