"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Info,
  X,
  Move,
  Save,
  BookMarked,
  Target,
  Zap
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
  const [isDragOver, setIsDragOver] = useState(false)
  const [academicEvents, setAcademicEvents] = useState<any[]>([])
  const [draggedEvent, setDraggedEvent] = useState<any>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", type: "", date: "", time: "", description: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const academicFileInputRef = useRef<HTMLInputElement>(null)

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
    const savedEvents = localStorage.getItem("academicEvents")
    
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
    
    if (savedEvents) {
      try {
        setAcademicEvents(JSON.parse(savedEvents))
      } catch (error) {
        console.error("Error parsing events:", error)
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

  // Enhanced AI extraction with automatic academic calendar integration
  const simulateAIExtraction = (file: File) => {
    // Simulate AI extraction based on file type with enhanced analysis
    const mockSchedule = [
      {
        day: "Monday",
        lectures: [
          { time: "09:00-10:00", subject: "Data Structures", room: "CS-101", faculty: "Dr. Smith", type: "lecture" },
          { time: "10:00-11:00", subject: "Algorithms", room: "CS-102", faculty: "Dr. Johnson", type: "lecture" },
          { time: "11:15-12:15", subject: "Database Systems Lab", room: "CS-103", faculty: "Dr. Brown", type: "practical" },
          { time: "14:00-15:00", subject: "Software Engineering", room: "CS-104", faculty: "Dr. Davis", type: "lecture" }
        ]
      },
      {
        day: "Tuesday",
        lectures: [
          { time: "09:00-10:00", subject: "Machine Learning", room: "AI-201", faculty: "Dr. Wilson", type: "lecture" },
          { time: "10:00-11:00", subject: "Computer Networks", room: "CS-105", faculty: "Dr. Miller", type: "lecture" },
          { time: "11:15-12:15", subject: "OS Lab", room: "CS-106", faculty: "Dr. Taylor", type: "practical" }
        ]
      },
      {
        day: "Wednesday",
        lectures: [
          { time: "09:00-10:00", subject: "Web Development", room: "CS-107", faculty: "Dr. Anderson", type: "lecture" },
          { time: "10:00-11:00", subject: "Mobile Computing Lab", room: "CS-108", faculty: "Dr. Thomas", type: "practical" },
          { time: "14:00-15:00", subject: "Cyber Security", room: "CS-109", faculty: "Dr. Jackson", type: "lecture" }
        ]
      },
      {
        day: "Thursday",
        lectures: [
          { time: "09:00-10:00", subject: "Artificial Intelligence", room: "AI-202", faculty: "Dr. White", type: "lecture" },
          { time: "10:00-11:00", subject: "Data Mining Lab", room: "AI-203", faculty: "Dr. Harris", type: "practical" },
          { time: "11:15-12:15", subject: "Cloud Computing", room: "CS-110", faculty: "Dr. Martin", type: "lecture" }
        ]
      },
      {
        day: "Friday",
        lectures: [
          { time: "09:00-10:00", subject: "Project Work", room: "CS-111", faculty: "Dr. Garcia", type: "project" },
          { time: "10:00-11:00", subject: "Technical Seminar", room: "CS-112", faculty: "Dr. Rodriguez", type: "seminar" }
        ]
      }
    ]
    
    // Auto-generate academic events based on extracted schedule
    const autoEvents = generateAcademicEvents(mockSchedule)
    
    return {
      schedule: mockSchedule,
      academicEvents: autoEvents,
      metadata: {
        totalLectures: mockSchedule.reduce((acc, day) => acc + day.lectures.length, 0),
        subjects: [...new Set(mockSchedule.flatMap(day => day.lectures.map(l => l.subject)))],
        faculty: [...new Set(mockSchedule.flatMap(day => day.lectures.map(l => l.faculty)))],
        rooms: [...new Set(mockSchedule.flatMap(day => day.lectures.map(l => l.room)))],
        practicals: mockSchedule.flatMap(day => day.lectures.filter(l => l.type === 'practical')).length,
        projects: mockSchedule.flatMap(day => day.lectures.filter(l => l.type === 'project')).length
      }
    }
  }

  // Generate academic events automatically from timetable
  const generateAcademicEvents = (schedule: any[]) => {
    const events = []
    const today = new Date()
    
    // Generate CIA exams for each subject
    const subjects = [...new Set(schedule.flatMap(day => day.lectures.map((l: any) => l.subject)))]
    subjects.forEach((subject, index) => {
      const ciaDate = new Date(today)
      ciaDate.setDate(today.getDate() + (index + 1) * 14) // Spread CIA exams every 2 weeks
      
      events.push({
        id: `cia-${index}`,
        title: `${subject} - CIA Exam`,
        type: 'exam',
        date: ciaDate.toISOString().split('T')[0],
        time: '10:00-12:00',
        description: `Continuous Internal Assessment for ${subject}`,
        color: 'bg-red-100 text-red-800'
      })
    })
    
    // Generate practical exams
    const practicals = schedule.flatMap(day => day.lectures.filter((l: any) => l.type === 'practical'))
    practicals.forEach((practical, index) => {
      const examDate = new Date(today)
      examDate.setDate(today.getDate() + (index + 1) * 21) // Practical exams every 3 weeks
      
      events.push({
        id: `practical-${index}`,
        title: `${practical.subject} - Practical Exam`,
        type: 'practical',
        date: examDate.toISOString().split('T')[0],
        time: practical.time,
        description: `Practical examination for ${practical.subject}`,
        color: 'bg-blue-100 text-blue-800'
      })
    })
    
    // Generate semester end exams
    const semesterEndDate = new Date(today)
    semesterEndDate.setMonth(today.getMonth() + 4) // 4 months from now
    
    subjects.forEach((subject, index) => {
      const examDate = new Date(semesterEndDate)
      examDate.setDate(semesterEndDate.getDate() + index)
      
      events.push({
        id: `semester-${index}`,
        title: `${subject} - Semester Exam`,
        type: 'semester',
        date: examDate.toISOString().split('T')[0],
        time: '10:00-13:00',
        description: `End semester examination for ${subject}`,
        color: 'bg-purple-100 text-purple-800'
      })
    })
    
    return events
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file && selectedDepartment && selectedYear) {
      processFileUpload(file)
    }
  }, [selectedDepartment, selectedYear])

  const processFileUpload = (file: File) => {
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

    // Enhanced AI extraction process
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
      
      // Auto-add academic events
      const updatedEvents = [...academicEvents, ...extractionResult.academicEvents]
      setAcademicEvents(updatedEvents)
      localStorage.setItem("academicEvents", JSON.stringify(updatedEvents))
      
      setExtractionResults(extractionResult)
      setShowExtractionDialog(true)
      setIsExtracting(false)
      
      toast({
        title: "Smart Timetable Analysis Complete!",
        description: `Extracted ${extractionResult.metadata.totalLectures} lectures and auto-generated ${extractionResult.academicEvents.length} academic events.`
      })
    }, 3000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedDepartment && selectedYear) {
      processFileUpload(file)
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
    const daySchedule = extractedSchedule.find(s => 
      s.day === dayName && 
      s.department === selectedDepartment && 
      s.year === selectedYear
    )
    return daySchedule?.lectures || []
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return academicEvents.filter(event => event.date === dateStr)
  }

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return assignments.filter(a => a.dueDate?.startsWith(dateStr))
  }

  // Event management functions
  const addNewEvent = () => {
    if (newEvent.title && newEvent.type && newEvent.date) {
      const event = {
        id: Date.now().toString(),
        ...newEvent,
        color: getEventColor(newEvent.type)
      }
      
      const updatedEvents = [...academicEvents, event]
      setAcademicEvents(updatedEvents)
      localStorage.setItem("academicEvents", JSON.stringify(updatedEvents))
      
      setNewEvent({ title: "", type: "", date: "", time: "", description: "" })
      setShowEventDialog(false)
      
      toast({
        title: "Event Added",
        description: `${event.title} has been added to the academic calendar.`
      })
    }
  }

  const getEventColor = (type: string) => {
    const colors = {
      'exam': 'bg-red-100 text-red-800',
      'practical': 'bg-blue-100 text-blue-800',
      'semester': 'bg-purple-100 text-purple-800',
      'assignment': 'bg-green-100 text-green-800',
      'holiday': 'bg-yellow-100 text-yellow-800',
      'event': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const handleEventDragStart = (event: any) => {
    setDraggedEvent(event)
  }

  const handleEventDrop = (date: Date) => {
    if (draggedEvent) {
      const dateStr = date.toISOString().split('T')[0]
      const updatedEvents = academicEvents.map(event => 
        event.id === draggedEvent.id 
          ? { ...event, date: dateStr }
          : event
      )
      
      setAcademicEvents(updatedEvents)
      localStorage.setItem("academicEvents", JSON.stringify(updatedEvents))
      setDraggedEvent(null)
      
      toast({
        title: "Event Moved",
        description: `${draggedEvent.title} has been moved to ${date.toLocaleDateString()}.`
      })
    }
  }

  const deleteEvent = (eventId: string) => {
    const updatedEvents = academicEvents.filter(event => event.id !== eventId)
    setAcademicEvents(updatedEvents)
    localStorage.setItem("academicEvents", JSON.stringify(updatedEvents))
    
    toast({
      title: "Event Deleted",
      description: "Event has been removed from the calendar."
    })
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
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
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
              <div className={`transition-all duration-300 ${
                isDragOver ? 'scale-110' : 'scale-100'
              }`}>
                <Upload className={`h-12 w-12 mx-auto mb-4 ${
                  isDragOver ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragOver ? 'Drop timetable here' : 'Drag & drop or click to upload timetable'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Images, Excel, Word files (Max 10MB)
                </p>
                {isDragOver && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-blue-600 font-medium"
                  >
                    <Zap className="h-4 w-4 inline mr-1" />
                    AI will analyze and extract schedule automatically
                  </motion.div>
                )}
              </div>
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
                  <div 
                    key={index} 
                    className="min-h-[120px] border rounded p-1"
                    onDrop={(e) => {
                      e.preventDefault()
                      if (date) handleEventDrop(date)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {date && (
                      <div
                        className={`cursor-pointer p-1 rounded transition-colors ${
                          selectedCalendarDate?.toDateString() === date.toDateString()
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCalendarDate(date)}
                      >
                        <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                        <div className="space-y-1">
                          {/* Display lectures */}
                          {getLecturesForDate(date).slice(0, 1).map((lecture: any, i: number) => (
                            <div key={`lecture-${i}`} className="text-xs bg-blue-100 text-blue-800 px-1 rounded truncate" title={`${lecture.subject} - ${lecture.time}`}>
                              📚 {lecture.subject}
                            </div>
                          ))}
                          
                          {/* Display academic events */}
                          {getEventsForDate(date).slice(0, 2).map((event: any, i: number) => (
                            <div 
                              key={`event-${i}`} 
                              className={`text-xs px-1 rounded truncate cursor-move ${event.color}`}
                              draggable
                              onDragStart={() => handleEventDragStart(event)}
                              title={`${event.title} - ${event.time}`}
                            >
                              {event.type === 'exam' && '📝'}
                              {event.type === 'practical' && '🔬'}
                              {event.type === 'semester' && '📋'}
                              {event.type === 'assignment' && '📄'}
                              {event.type === 'holiday' && '🎉'}
                              {event.type === 'event' && '📅'}
                              {' '}{event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                            </div>
                          ))}
                          
                          {/* Show count if more items */}
                          {(getLecturesForDate(date).length + getEventsForDate(date).length) > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{(getLecturesForDate(date).length + getEventsForDate(date).length) - 3} more
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {selectedCalendarDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </CardTitle>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setNewEvent({ ...newEvent, date: selectedCalendarDate.toISOString().split('T')[0] })
                          setShowEventDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="lectures" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="lectures">📚 Lectures ({getLecturesForDate(selectedCalendarDate).length})</TabsTrigger>
                        <TabsTrigger value="events">📅 Events ({getEventsForDate(selectedCalendarDate).length})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="lectures" className="space-y-3">
                        {getLecturesForDate(selectedCalendarDate).map((lecture: any, index: number) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                lecture.type === 'practical' ? 'bg-blue-100' :
                                lecture.type === 'project' ? 'bg-green-100' :
                                lecture.type === 'seminar' ? 'bg-purple-100' :
                                'bg-gray-100'
                              }`}>
                                {lecture.type === 'practical' && '🔬'}
                                {lecture.type === 'project' && '💻'}
                                {lecture.type === 'seminar' && '🎤'}
                                {lecture.type === 'lecture' && '📚'}
                              </div>
                              <div>
                                <h4 className="font-medium">{lecture.subject}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  {lecture.faculty}
                                  <Badge variant="outline" className="ml-2">{lecture.type}</Badge>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">{lecture.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{lecture.room}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {getLecturesForDate(selectedCalendarDate).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No lectures scheduled for this day</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="events" className="space-y-3">
                        {getEventsForDate(selectedCalendarDate).map((event: any, index: number) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            draggable
                            onDragStart={() => handleEventDragStart(event)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${event.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                                {event.type === 'exam' && '📝'}
                                {event.type === 'practical' && '🔬'}
                                {event.type === 'semester' && '📋'}
                                {event.type === 'assignment' && '📄'}
                                {event.type === 'holiday' && '🎉'}
                                {event.type === 'event' && '📅'}
                              </div>
                              <div>
                                <h4 className="font-medium">{event.title}</h4>
                                <p className="text-sm text-gray-600">{event.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{event.time}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteEvent(event.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                        {getEventsForDate(selectedCalendarDate).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No events scheduled for this day</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setNewEvent({ ...newEvent, date: selectedCalendarDate.toISOString().split('T')[0] })
                                setShowEventDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Event
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Enhanced Academic Calendar
                </CardTitle>
                <Button onClick={() => setShowEventDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Academic Calendar Upload */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const files = Array.from(e.dataTransfer.files)
                  const file = files[0]
                  if (file) {
                    const event = { target: { files: [file] } } as any
                    handleAcademicCalendarUpload(event)
                  }
                }}
              >
                <input
                  ref={academicFileInputRef}
                  type="file"
                  id="academic-calendar-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                  onChange={handleAcademicCalendarUpload}
                  className="hidden"
                />
                <label htmlFor="academic-calendar-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag & Drop or Upload Academic Calendar
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload academic calendar for automatic event extraction
                  </p>
                </label>
              </div>
              
              {/* Event Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {academicEvents.filter(e => e.type === 'exam').length}
                  </div>
                  <p className="text-sm text-gray-600">📝 Exams</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {academicEvents.filter(e => e.type === 'practical').length}
                  </div>
                  <p className="text-sm text-gray-600">🔬 Practicals</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {academicEvents.filter(e => e.type === 'semester').length}
                  </div>
                  <p className="text-sm text-gray-600">📋 Semester Exams</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {academicEvents.filter(e => e.type === 'assignment').length}
                  </div>
                  <p className="text-sm text-gray-600">📄 Assignments</p>
                </Card>
              </div>
              
              {/* Upcoming Events */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Upcoming Events (Next 30 Days)
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {academicEvents
                    .filter(event => {
                      const eventDate = new Date(event.date)
                      const today = new Date()
                      const thirtyDaysFromNow = new Date()
                      thirtyDaysFromNow.setDate(today.getDate() + 30)
                      return eventDate >= today && eventDate <= thirtyDaysFromNow
                    })
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        draggable
                        onDragStart={() => handleEventDragStart(event)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${event.color}`}>
                            {event.type === 'exam' && '📝'}
                            {event.type === 'practical' && '🔬'}
                            {event.type === 'semester' && '📋'}
                            {event.type === 'assignment' && '📄'}
                            {event.type === 'holiday' && '🎉'}
                            {event.type === 'event' && '📅'}
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  {academicEvents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No academic events scheduled</p>
                      <p className="text-sm">Upload a timetable to auto-generate events</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Uploaded Academic Calendars */}
              {academicCalendars.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Uploaded Academic Calendars
                  </h3>
                  {academicCalendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{calendar.name}</h4>
                          <p className="text-sm text-gray-600">
                            Academic Year: {calendar.academicYear} • Uploaded: {new Date(calendar.uploadedAt).toLocaleDateString()}
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
                    {extractionResults.academicEvents?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Auto Events</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {extractionResults.metadata.practicals + extractionResults.metadata.projects}
                  </div>
                  <div className="text-sm text-gray-600">Practicals</div>
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
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Auto-Generated Academic Events</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {extractionResults.academicEvents?.length || 0} events automatically added to academic calendar including CIA exams, practical exams, and semester exams.
                </p>
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

      {/* Add Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add Academic Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Event Type *</label>
              <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">📝 Exam</SelectItem>
                  <SelectItem value="practical">🔬 Practical</SelectItem>
                  <SelectItem value="semester">📋 Semester Exam</SelectItem>
                  <SelectItem value="assignment">📄 Assignment</SelectItem>
                  <SelectItem value="holiday">🎉 Holiday</SelectItem>
                  <SelectItem value="event">📅 General Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="e.g., 10:00-12:00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addNewEvent} disabled={!newEvent.title || !newEvent.type || !newEvent.date}>
              <Save className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
