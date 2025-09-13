"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  Upload,
  Download,
  FileText,
  Users,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  User,
  GraduationCap,
  School,
  FileImage,
  FileSpreadsheet,
  Sparkles,
  Bot,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function FacultyTimetablePage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadedTimetables, setUploadedTimetables] = useState<any[]>([])
  const [academicCalendars, setAcademicCalendars] = useState<any[]>([])
  const [extractedSchedule, setExtractedSchedule] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [showExtractionDialog, setShowExtractionDialog] = useState(false)
  const [extractionResults, setExtractionResults] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")

  useEffect(() => {
    const facultySession = localStorage.getItem("facultySession")
    const currentUserData = localStorage.getItem("currentUser")

    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
        setSelectedDepartment(user.department || "")
      } catch (error) {
        console.error("Error parsing faculty session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
        setSelectedDepartment(user.department || "")
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }

    // Load data from localStorage
    const savedTimetables = localStorage.getItem("uploadedTimetables")
    const savedCalendars = localStorage.getItem("academicCalendars")
    const savedSchedule = localStorage.getItem("extractedSchedule")
    const savedAssignments = localStorage.getItem("assignments")
    
    if (savedTimetables) {
      try {
        setUploadedTimetables(JSON.parse(savedTimetables))
      } catch (error) {
        console.error("Error parsing timetables:", error)
      }
    }
    
    if (savedCalendars) {
      try {
        setAcademicCalendars(JSON.parse(savedCalendars))
      } catch (error) {
        console.error("Error parsing calendars:", error)
      }
    }
    
    if (savedSchedule) {
      try {
        setExtractedSchedule(JSON.parse(savedSchedule))
      } catch (error) {
        console.error("Error parsing schedule:", error)
      }
    }
    
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments))
      } catch (error) {
        console.error("Error parsing assignments:", error)
      }
    }
  }, [])

  const departments = [
    "Computer Science Engineering",
    "Artificial Intelligence & Data Science", 
    "Artificial Intelligence & Machine Learning",
    "Cyber Security"
  ]

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year"]

  const simulateAIExtraction = (file: File) => {
    // Simulate AI extraction based on file type
    const mockSchedule = [
      {
        day: "Monday",
        lectures: [
          { time: "09:00-10:00", subject: "Data Structures", room: "CS-101", faculty: "Dr. Smith" },
          { time: "10:00-11:00", subject: "Algorithms", room: "CS-102", faculty: "Dr. Johnson" },
          { time: "11:15-12:15", subject: "Database Systems", room: "CS-103", faculty: "Dr. Brown" },
          { time: "14:00-15:00", subject: "Software Engineering", room: "CS-104", faculty: "Dr. Davis" }
        ]
      },
      {
        day: "Tuesday",
        lectures: [
          { time: "09:00-10:00", subject: "Machine Learning", room: "AI-201", faculty: "Dr. Wilson" },
          { time: "10:00-11:00", subject: "Computer Networks", room: "CS-105", faculty: "Dr. Miller" },
          { time: "11:15-12:15", subject: "Operating Systems", room: "CS-106", faculty: "Dr. Taylor" }
        ]
      },
      {
        day: "Wednesday",
        lectures: [
          { time: "09:00-10:00", subject: "Web Development", room: "CS-107", faculty: "Dr. Anderson" },
          { time: "10:00-11:00", subject: "Mobile Computing", room: "CS-108", faculty: "Dr. Thomas" },
          { time: "14:00-15:00", subject: "Cyber Security", room: "CS-109", faculty: "Dr. Jackson" }
        ]
      },
      {
        day: "Thursday",
        lectures: [
          { time: "09:00-10:00", subject: "Artificial Intelligence", room: "AI-202", faculty: "Dr. White" },
          { time: "10:00-11:00", subject: "Data Mining", room: "AI-203", faculty: "Dr. Harris" },
          { time: "11:15-12:15", subject: "Cloud Computing", room: "CS-110", faculty: "Dr. Martin" }
        ]
      },
      {
        day: "Friday",
        lectures: [
          { time: "09:00-10:00", subject: "Project Work", room: "CS-111", faculty: "Dr. Garcia" },
          { time: "10:00-11:00", subject: "Seminar", room: "CS-112", faculty: "Dr. Rodriguez" }
        ]
      }
    ]
    
    return {
      schedule: mockSchedule,
      metadata: {
        totalLectures: mockSchedule.reduce((acc, day) => acc + day.lectures.length, 0),
        subjects: [...new Set(mockSchedule.flatMap(day => day.lectures.map(l => l.subject)))],
        faculty: [...new Set(mockSchedule.flatMap(day => day.lectures.map(l => l.faculty)))],
        rooms: [...new Set(mockSchedule.flatMap(day => day.lectures.map(l => l.room)))]
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedDepartment && selectedYear) {
      setIsExtracting(true)
      
      const newTimetable = {
        id: Date.now().toString(),
        name: file.name,
        department: selectedDepartment,
        year: selectedYear,
        uploadedBy: currentUser?.name || "Faculty",
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
        extracted: false
      }

      // Simulate AI extraction process
      setTimeout(() => {
        const extractionResult = simulateAIExtraction(file)
        
        const updatedTimetable = {
          ...newTimetable,
          extracted: true,
          extractedData: extractionResult
        }
        
        const updatedTimetables = [...uploadedTimetables, updatedTimetable]
        setUploadedTimetables(updatedTimetables)
        localStorage.setItem("uploadedTimetables", JSON.stringify(updatedTimetables))
        
        // Update extracted schedule
        const scheduleWithMetadata = extractionResult.schedule.map(daySchedule => ({
          ...daySchedule,
          department: selectedDepartment,
          year: selectedYear,
          timetableId: updatedTimetable.id
        }))
        
        const updatedSchedule = [...extractedSchedule, ...scheduleWithMetadata]
        setExtractedSchedule(updatedSchedule)
        localStorage.setItem("extractedSchedule", JSON.stringify(updatedSchedule))
        
        setExtractionResults(extractionResult)
        setShowExtractionDialog(true)
        setIsExtracting(false)
        
        toast({
          title: "Timetable Extracted Successfully!",
          description: `Extracted ${extractionResult.metadata.totalLectures} lectures across ${extractionResult.schedule.length} days.`
        })
      }, 3000)
      
      // Reset file input
      event.target.value = ""
    }
  }

  const handleAcademicCalendarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newCalendar = {
        id: Date.now().toString(),
        name: file.name,
        uploadedBy: currentUser?.name || "Faculty",
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
        academicYear: "2024-2025"
      }

      const updatedCalendars = [...academicCalendars, newCalendar]
      setAcademicCalendars(updatedCalendars)
      localStorage.setItem("academicCalendars", JSON.stringify(updatedCalendars))
      
      toast({
        title: "Academic Calendar Uploaded",
        description: "Academic calendar has been uploaded successfully."
      })
      
      event.target.value = ""
    }
  }

  const deleteTimetable = (id: string) => {
    const updatedTimetables = uploadedTimetables.filter(t => t.id !== id)
    setUploadedTimetables(updatedTimetables)
    localStorage.setItem("uploadedTimetables", JSON.stringify(updatedTimetables))
    
    // Remove associated schedule data
    const updatedSchedule = extractedSchedule.filter(s => s.timetableId !== id)
    setExtractedSchedule(updatedSchedule)
    localStorage.setItem("extractedSchedule", JSON.stringify(updatedSchedule))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getLecturesForDate = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const daySchedule = extractedSchedule.find(s => s.day === dayName)
    return daySchedule?.lectures || []
  }

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return assignments.filter(a => a.dueDate?.startsWith(dateStr))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredTimetables = uploadedTimetables.filter(timetable => 
    (!selectedDepartment || timetable.department === selectedDepartment) &&
    (!selectedYear || timetable.year === selectedYear)
  )

  const getTodaysLectures = () => {
    const today = new Date()
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
    const todaySchedule = extractedSchedule.find(s => 
      s.day === dayName && 
      s.department === selectedDepartment && 
      s.year === selectedYear
    )
    return todaySchedule?.lectures || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <CalendarDays className="h-8 w-8" />
              Smart Timetable Management
            </h1>
            <p className="text-blue-100">
              AI-powered timetable extraction with interactive calendar and scheduling
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Bot className="h-4 w-4 mr-1" />
              AI Enhanced
            </Badge>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Extract
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Schedule
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Interactive Calendar
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* AI Extraction Status */}
          {isExtracting && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="animate-spin">
                    <Bot className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">AI Extracting Timetable Data...</h3>
                    <p className="text-blue-700">Please wait while we analyze and extract schedule information from your file.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI-Powered Timetable Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="timetable-upload"
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!selectedDepartment || !selectedYear}
            />
            <label
              htmlFor="timetable-upload"
              className={`cursor-pointer ${!selectedDepartment || !selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click to upload timetable
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, Images, Excel, Word files (Max 10MB)
              </p>
            </label>
          </div>
          
          {(!selectedDepartment || !selectedYear) && (
            <p className="text-sm text-orange-600 text-center">
              Please select both department and year before uploading
            </p>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {uploadedTimetables.length}
            </div>
            <p className="text-sm text-gray-600">Total Timetables</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {new Set(uploadedTimetables.map(t => t.department)).size}
            </div>
            <p className="text-sm text-gray-600">Departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {new Set(uploadedTimetables.map(t => t.year)).size}
            </div>
            <p className="text-sm text-gray-600">Year Groups</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {uploadedTimetables.filter(t => {
                const uploadDate = new Date(t.uploadedAt)
                const today = new Date()
                return uploadDate.toDateString() === today.toDateString()
              }).length}
            </div>
            <p className="text-sm text-gray-600">Uploaded Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Timetables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Timetables
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTimetables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No timetables uploaded yet</p>
              <p className="text-sm">Upload your first timetable to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimetables.map((timetable) => (
                <motion.div
                  key={timetable.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{timetable.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {timetable.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {timetable.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(timetable.uploadedAt).toLocaleDateString()}
                          </span>
                          <span>{formatFileSize(timetable.size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTimetable(timetable.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Schedule View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDay && (
                <div className="space-y-4">
                  {extractedSchedule
                    .filter(s => s.day === selectedDay && s.department === selectedDepartment)
                    .map((daySchedule, index) => (
                      <div key={index} className="space-y-3">
                        <h3 className="font-semibold text-lg">{daySchedule.day} Schedule</h3>
                        <div className="grid gap-3">
                          {daySchedule.lectures?.map((lecture: any, lectureIndex: number) => (
                            <Card key={lectureIndex} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Badge variant="outline">{lecture.time}</Badge>
                                  <div>
                                    <h4 className="font-medium">{lecture.subject}</h4>
                                    <p className="text-sm text-gray-600">{lecture.faculty}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{lecture.room}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interactive Calendar {currentDate.getFullYear()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <Button variant="outline" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => (
                  <div key={index} className="min-h-[80px] border rounded p-1">
                    {date && (
                      <div
                        className={`cursor-pointer p-1 rounded ${
                          selectedCalendarDate?.toDateString() === date.toDateString()
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedCalendarDate(date)}
                      >
                        <div className="text-sm font-medium">{date.getDate()}</div>
                        <div className="space-y-1">
                          {getLecturesForDate(date).slice(0, 2).map((lecture: any, i: number) => (
                            <div key={i} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              {lecture.subject}
                            </div>
                          ))}
                          {getLecturesForDate(date).length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{getLecturesForDate(date).length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedCalendarDate && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedCalendarDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getLecturesForDate(selectedCalendarDate).map((lecture: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{lecture.time}</Badge>
                            <div>
                              <h4 className="font-medium">{lecture.subject}</h4>
                              <p className="text-sm text-gray-600">{lecture.faculty}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{lecture.room}</span>
                          </div>
                        </div>
                      ))}
                      {getLecturesForDate(selectedCalendarDate).length === 0 && (
                        <p className="text-gray-500 text-center py-4">No lectures scheduled for this day</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Calendar Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="academic-calendar-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                  onChange={handleAcademicCalendarUpload}
                  className="hidden"
                />
                <label htmlFor="academic-calendar-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload Academic Calendar
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload academic calendar for events, holidays, and important dates
                  </p>
                </label>
              </div>
              
              {academicCalendars.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Uploaded Academic Calendars</h3>
                  {academicCalendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{calendar.name}</h4>
                          <p className="text-sm text-gray-600">
                            Academic Year: {calendar.academicYear}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Extraction Results Dialog */}
      <Dialog open={showExtractionDialog} onOpenChange={setShowExtractionDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Extraction Complete
            </DialogTitle>
          </DialogHeader>
          {extractionResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {extractionResults.metadata.totalLectures}
                  </div>
                  <div className="text-sm text-gray-600">Total Lectures</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {extractionResults.metadata.subjects.length}
                  </div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {extractionResults.metadata.faculty.length}
                  </div>
                  <div className="text-sm text-gray-600">Faculty</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {extractionResults.metadata.rooms.length}
                  </div>
                  <div className="text-sm text-gray-600">Rooms</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Extracted Subjects:</h4>
                <div className="flex flex-wrap gap-2">
                  {extractionResults.metadata.subjects.map((subject: string, index: number) => (
                    <Badge key={index} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowExtractionDialog(false)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
