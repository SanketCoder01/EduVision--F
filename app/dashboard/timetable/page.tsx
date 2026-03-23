"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
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
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  User,
  GraduationCap,
  FileImage,
  Sparkles,
  Bot,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  BookMarked,
  Target,
  Zap,
  Loader2
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
import { supabase } from "@/lib/supabase"

export default function FacultyTimetablePage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadedTimetables, setUploadedTimetables] = useState<any[]>([])
  const [extractedSchedule, setExtractedSchedule] = useState<any[]>([])
  const [academicEvents, setAcademicEvents] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<any>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", type: "", date: "", time: "", description: "" })
  const [extractedText, setExtractedText] = useState("")
  const [showExtractedDialog, setShowExtractedDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const academicFileInputRef = useRef<HTMLInputElement>(null)

  // Department is LOCKED from faculty profile
  const facultyDepartment = currentUser?.department || ""

  useEffect(() => {
    loadFacultyData()
    return () => {
      // Cleanup subscriptions
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadTimetables()
      loadAcademicEvents()
    }
  }, [currentUser])

  const loadFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("No auth user found")
        return
      }

      // Set current user with auth id - we'll use this for faculty_id
      // Also fetch faculty profile data for department
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (facultyData) {
        setCurrentUser({
          ...facultyData,
          id: user.id  // Use auth.users id for foreign key
        })
      } else {
        // Try to find faculty by email
        const { data: facultyByEmail } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (facultyByEmail) {
          setCurrentUser({
            ...facultyByEmail,
            id: user.id  // Use auth.users id for foreign key
          })
        } else {
          // Use auth user data directly
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || "Faculty",
            department: user.user_metadata?.department || "Computer Science Engineering"
          })
        }
      }
    } catch (error) {
      console.error("Error loading faculty:", error)
    }
  }

  const loadTimetables = async () => {
    if (!currentUser) return
    
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('faculty_id', currentUser.id)
      .eq('department', facultyDepartment)
      .order('uploaded_at', { ascending: false })

    if (!error && data) {
      setUploadedTimetables(data)
      
      // Combine all schedule data
      const allSchedules = data.flatMap(t => t.schedule_data || [])
      setExtractedSchedule(allSchedules)
    }
  }

  const loadAcademicEvents = async () => {
    if (!currentUser) return

    const { data, error } = await supabase
      .from('academic_events')
      .select('*')
      .eq('created_by', currentUser.id)
      .order('date', { ascending: true })

    if (!error && data) {
      setAcademicEvents(data)
    }
  }

  const years = [
    { value: "1st", label: "First Year" },
    { value: "2nd", label: "Second Year" },
    { value: "3rd", label: "Third Year" },
    { value: "4th", label: "Fourth Year" }
  ]

  // Groq LLM extraction for timetable
  const extractWithGroq = async (text: string) => {
    try {
      const response = await fetch('/api/groq/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedText: text,
          department: facultyDepartment,
          year: selectedYear
        })
      })

      if (!response.ok) {
        throw new Error('Groq extraction failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Groq extraction error:', error)
      return null
    }
  }

  // Groq LLM extraction for academic calendar
  const extractCalendarWithGroq = async (text: string) => {
    try {
      const response = await fetch('/api/groq/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedText: text,
          department: facultyDepartment
        })
      })

      if (!response.ok) {
        throw new Error('Calendar extraction failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Calendar extraction error:', error)
      return null
    }
  }

  // OCR text extraction from image using Tesseract.js
  const extractTextFromImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          // Import Tesseract.js dynamically
          const Tesseract = (await import('tesseract.js')).default
          
          const result = await Tesseract.recognize(
            e.target?.result as string,
            'eng',
            {
              logger: (m: any) => console.log(m)
            }
          )
          
          resolve(result.data.text)
        } catch (error) {
          console.error('OCR error:', error)
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

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
    
    if (file && selectedYear) {
      processFileUpload(file)
    }
  }, [selectedYear, facultyDepartment])

  const processFileUpload = async (file: File) => {
    if (!selectedYear) {
      toast({ title: "Error", description: "Please select year first", variant: "destructive" })
      return
    }

    setIsExtracting(true)

    try {
      // Step 1: Extract text from file
      let extractedTextContent = ""
      
      if (file.type.startsWith('image/')) {
        // For images, use OCR to extract text first
        toast({ title: "Processing Image", description: "Extracting text from image using OCR..." })
        extractedTextContent = await extractTextFromImage(file)
        
        if (!extractedTextContent || extractedTextContent.trim().length === 0) {
          throw new Error("Could not extract text from image. Please try a clearer image.")
        }
      } else if (file.type === 'application/pdf') {
        // For PDFs, extract text first then use Groq
        toast({ title: "Processing PDF", description: "Extracting text from PDF..." })
        // In production, use pdf.js to extract text
        extractedTextContent = "PDF content would be extracted here"
      } else {
        // For text files, read directly
        extractedTextContent = await file.text()
      }

      // Step 2: Use Groq to extract structured data from the extracted text
      const extractionResult = await extractWithGroq(extractedTextContent)

      if (extractionResult && extractionResult.schedule) {
        await saveTimetableToSupabase(file, extractionResult)
      } else {
        toast({ 
          title: "Extraction Failed", 
          description: "Could not extract timetable data. Please try again or use a clearer image.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({ 
        title: "Upload Failed", 
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const saveTimetableToSupabase = async (file: File, extractionResult: any) => {
    try {
      if (!currentUser || !currentUser.id) {
        toast({ 
          title: "Error", 
          description: "Faculty record not found. Please ensure you're logged in as a faculty member.",
          variant: "destructive"
        })
        return
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `timetables/${currentUser.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('timetables')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('timetables')
        .getPublicUrl(filePath)

      // Save to database
      const { error: dbError } = await supabase
        .from('timetables')
        .insert({
          faculty_id: currentUser.id,
          department: facultyDepartment,
          year: selectedYear,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          schedule_data: extractionResult.schedule
        })

      if (dbError) throw dbError

      toast({
        title: "Timetable Uploaded Successfully!",
        description: `Extracted ${extractionResult.metadata?.totalLectures || 0} lectures for ${facultyDepartment} - ${selectedYear}`
      })

      loadTimetables()
    } catch (error) {
      console.error("Save error:", error)
      toast({ title: "Error", description: "Failed to save timetable", variant: "destructive" })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedYear) {
      await processFileUpload(file)
      event.target.value = ""
    }
  }

  const handleAcademicCalendarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsExtracting(true)

    try {
      // Extract text from file
      let extractedText = ""
      
      if (file.type.startsWith('image/')) {
        // For images, use OCR
        extractedText = await extractTextFromImage(file)
      } else if (file.type === 'application/pdf') {
        // For PDFs, extract text (simplified - in production use pdf.js)
        extractedText = await file.text()
      } else {
        // For text files, read directly
        extractedText = await file.text()
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("Could not extract text from file")
      }

      console.log('Extracted text for academic calendar:', extractedText.substring(0, 200))

      // Extract and process with Groq
      const result = await extractCalendarWithGroq(extractedText)

      if (result && result.events) {
        // Save events to Supabase with correct schema
        const eventsToInsert = result.events.map((event: any) => ({
          department: facultyDepartment,
          year: selectedYear || null,
          title: event.title,
          type: event.type,
          date: event.date,
          time: event.time || null,
          description: event.description || null,
          importance: 'normal',
          created_by: currentUser.id
        }))

        const { error } = await supabase
          .from('academic_events')
          .insert(eventsToInsert)

        if (!error) {
          toast({
            title: "Academic Calendar Imported!",
            description: `Added ${result.events.length} events`
          })
          loadAcademicEvents()
        } else {
          console.error('Error saving events:', error)
          throw new Error('Failed to save events to database')
        }
      } else {
        throw new Error('Failed to extract events from calendar')
      }
    } catch (error) {
      console.error("Calendar upload error:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to process calendar", 
        variant: "destructive" 
      })
    } finally {
      setIsExtracting(false)
      event.target.value = ""
    }
  }

  const deleteTimetable = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/timetables/')
      const filePath = urlParts[1]

      // Delete from storage
      await supabase.storage.from('timetables').remove([`timetables/${filePath}`])

      // Delete from database
      const { error } = await supabase.from('timetables').delete().eq('id', id)

      if (!error) {
        toast({ title: "Deleted", description: "Timetable removed" })
        loadTimetables()
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const getLecturesForDate = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    // Get lectures from all uploaded timetables for this department with case-insensitive matching
    const lectures = uploadedTimetables.flatMap(t => {
      const daySchedule = (t.schedule_data || []).find((s: any) => 
        s.day?.toLowerCase().trim() === dayName.toLowerCase().trim()
      )
      return daySchedule?.lectures || []
    })
    return lectures
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return academicEvents.filter(event => event.date === dateStr)
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

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "lecture": return "bg-blue-100 text-blue-800"
      case "practical":
      case "lab": return "bg-green-100 text-green-800"
      case "project": return "bg-purple-100 text-purple-800"
      case "seminar": return "bg-orange-100 text-orange-800"
      case "tutorial": return "bg-cyan-100 text-cyan-800"
      case "break": return "bg-gray-100 text-gray-600"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      'exam': 'bg-red-100 text-red-800',
      'practical': 'bg-blue-100 text-blue-800',
      'semester': 'bg-purple-100 text-purple-800',
      'assignment': 'bg-green-100 text-green-800',
      'holiday': 'bg-yellow-100 text-yellow-800',
      'event': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const addNewEvent = async () => {
    if (!newEvent.title || !newEvent.type || !newEvent.date) return

    const event = {
      department: facultyDepartment,
      year: selectedYear || null,
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time || null,
      description: newEvent.description || null,
      importance: 'normal',
      created_by: currentUser.id
    }

    const { error } = await supabase.from('academic_events').insert(event)

    if (!error) {
      toast({ title: "Event Added", description: `${event.title} added to calendar` })
      setNewEvent({ title: "", type: "", date: "", time: "", description: "" })
      setShowEventDialog(false)
      loadAcademicEvents()
    } else {
      console.error('Error adding event:', error)
      toast({ title: "Error", description: "Failed to add event", variant: "destructive" })
    }
  }

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('academic_events').delete().eq('id', eventId)
    
    if (!error) {
      toast({ title: "Event Deleted", description: "Event removed from calendar" })
      loadAcademicEvents()
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
              AI-powered timetable extraction for <span className="font-semibold">{facultyDepartment}</span> department
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Bot className="h-4 w-4 mr-1" />
              Groq LLM
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              {facultyDepartment}
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
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Groq LLM Extracting Timetable...</h3>
                    <p className="text-blue-700">Analyzing image and extracting schedule data with AI</p>
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
                {/* Department is LOCKED */}
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <div className="p-3 bg-gray-100 rounded-md border border-gray-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">{facultyDepartment}</span>
                    <Badge variant="outline" className="ml-auto text-xs">Locked</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
                </div>
                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Year *</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
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
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!selectedYear}
                />
                <label
                  htmlFor="timetable-upload"
                  className={`cursor-pointer ${!selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag & drop or click to upload timetable
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF and Images (JPG, PNG) - Max 10MB
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Groq LLM will extract schedule automatically</span>
                  </div>
                </label>
              </div>
              
              {!selectedYear && (
                <p className="text-sm text-orange-600 text-center">
                  Please select year before uploading
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
                  {extractedSchedule.reduce((acc, s) => acc + (s.lectures?.length || 0), 0)}
                </div>
                <p className="text-sm text-gray-600">Total Lectures</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {new Set(extractedSchedule.flatMap(s => s.lectures?.map((l: any) => l.subject) || [])).size}
                </div>
                <p className="text-sm text-gray-600">Subjects</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {academicEvents.length}
                </div>
                <p className="text-sm text-gray-600">Academic Events</p>
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Timetables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Timetables ({facultyDepartment})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedTimetables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No timetables uploaded yet</p>
                  <p className="text-sm">Upload your first timetable to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedTimetables.map((timetable) => (
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
                            <h4 className="font-medium text-gray-900">{timetable.file_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {timetable.year}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(timetable.uploaded_at).toLocaleDateString()}
                              </span>
                              <span>{formatFileSize(timetable.file_size)}</span>
                              <Badge variant="outline" className="text-xs">
                                {timetable.schedule_data?.length || 0} days
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(timetable.file_url, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTimetable(timetable.id, timetable.file_url)}
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
                Daily Schedule View - {facultyDepartment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
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
                  {/* Get lectures for selected day from timetables filtered by year */}
                  {(() => {
                    // Filter timetables by selected year
                    const filteredTimetables = uploadedTimetables.filter(t => t.year === selectedYear)
                    
                    // Get all lectures for the selected day with case-insensitive matching
                    const dayLectures = filteredTimetables.flatMap(t => {
                      const daySchedule = (t.schedule_data || []).find((s: any) => 
                        s.day?.toLowerCase().trim() === selectedDay.toLowerCase().trim()
                      )
                      return daySchedule?.lectures || []
                    })
                    
                    if (dayLectures.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No schedule found for {selectedDay}</p>
                          <p className="text-sm">Upload a timetable for {selectedYear} year to see schedule</p>
                        </div>
                      )
                    }
                    
                    return (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{selectedDay} Schedule - {selectedYear}</h3>
                        <div className="grid gap-3">
                          {dayLectures.map((lecture: any, lectureIndex: number) => (
                            <Card key={lectureIndex} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Badge className={getTypeColor(lecture.type)}>{lecture.time}</Badge>
                                  <div>
                                    <h4 className="font-medium">{lecture.subject}</h4>
                                    <p className="text-sm text-gray-600">{lecture.faculty || 'TBA'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{lecture.room || 'TBA'}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
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
                    className="min-h-[100px] border rounded p-1"
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
                        <div className="space-y-1 overflow-hidden">
                          {getLecturesForDate(date).slice(0, 3).map((lecture: any, i: number) => (
                            <div key={`lecture-${i}`} className="text-xs bg-blue-100 text-blue-800 px-1 rounded truncate" title={`${lecture.subject} - ${lecture.time}`}>
                              <span className="font-medium">{lecture.time?.split('-')[0] || ''}</span> {lecture.subject}
                            </div>
                          ))}
                          {getEventsForDate(date).slice(0, 1).map((event: any, i: number) => (
                            <div 
                              key={`event-${i}`} 
                              className={`text-xs px-1 rounded truncate ${event.color || 'bg-purple-100 text-purple-800'}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {(getLecturesForDate(date).length > 3 || getEventsForDate(date).length > 1) && (
                            <div className="text-xs text-gray-500">+{getLecturesForDate(date).length + getEventsForDate(date).length - 4} more</div>
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
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Lectures</h4>
                        {getLecturesForDate(selectedCalendarDate).length === 0 ? (
                          <p className="text-gray-500 text-sm">No lectures scheduled</p>
                        ) : (
                          <div className="space-y-2">
                            {getLecturesForDate(selectedCalendarDate).map((lecture: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <Badge variant="outline">{lecture.time}</Badge>
                                <span>{lecture.subject}</span>
                                <span className="text-gray-500 text-sm">{lecture.room}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Events</h4>
                        {getEventsForDate(selectedCalendarDate).length === 0 ? (
                          <p className="text-gray-500 text-sm">No events scheduled</p>
                        ) : (
                          <div className="space-y-2">
                            {getEventsForDate(selectedCalendarDate).map((event: any) => (
                              <div key={event.id} className={`flex items-center justify-between p-2 rounded ${event.color}`}>
                                <div>
                                  <span className="font-medium">{event.title}</span>
                                  <span className="text-sm ml-2">{event.time}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Calendar - {facultyDepartment}
                </span>
                <div className="flex gap-2">
                  <input
                    ref={academicFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAcademicCalendarUpload}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => academicFileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Calendar
                  </Button>
                  <Button onClick={() => setShowEventDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {academicEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No academic events</p>
                  <p className="text-sm">Import a calendar or add events manually</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {academicEvents.map((event) => (
                    <div key={event.id} className={`flex items-center justify-between p-4 rounded-lg ${event.color || getEventColor(event.type)}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{new Date(event.date).getDate()}</div>
                          <div className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm opacity-80">{event.description}</p>
                          <p className="text-xs opacity-60">{event.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Academic Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
                <SelectItem value="semester">Semester Exam</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <Input
              placeholder="Time (e.g., 10:00-12:00)"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
            <Button onClick={addNewEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
