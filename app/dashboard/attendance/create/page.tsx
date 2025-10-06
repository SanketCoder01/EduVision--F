"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, FileText, Save, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface FormData {
  department: string
  year: string
  subject: string
  sessionDate: string
  startTime: string
  endTime: string
  durationMinutes: string
  attendanceExpiryMinutes: string
  studentListId: string
}

interface FormErrors {
  [key: string]: string
}

interface User {
  id: string
  email: string
  name: string
}

// Mock SupabaseAttendanceService (replace with actual implementation if available)
const SupabaseAttendanceService = {
  createAttendanceSession: async (sessionData: any) => {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([sessionData])
      .select()
    
    return {
      success: !error,
      error: error?.message
    }
  }
}

const timeSlots = [
  { start: "10:00", end: "10:50" },
  { start: "10:50", end: "11:40" },
  { start: "11:50", end: "12:40" },
  { start: "12:50", end: "13:40" },
  { start: "13:50", end: "14:40" },
  { start: "14:50", end: "15:40" },
  { start: "15:50", end: "16:40" }
]

const attendanceExpiryOptions = [
  { value: "1", label: "1 minute" },
  { value: "2", label: "2 minutes" },
  { value: "3", label: "3 minutes" },
  { value: "4", label: "4 minutes" },
  { value: "5", label: "5 minutes" },
  { value: "6", label: "6 minutes" },
  { value: "7", label: "7 minutes" },
  { value: "8", label: "8 minutes" },
  { value: "9", label: "9 minutes" },
  { value: "10", label: "10 minutes" }
]

export default function CreateAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [studentLists, setStudentLists] = useState<any[]>([])
  const [formData, setFormData] = useState<FormData>({
    department: '',
    year: '',
    subject: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    durationMinutes: '50',
    attendanceExpiryMinutes: '5',
    studentListId: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const departments = ['CSE', 'CYBER', 'AIDS', 'AIML']
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
  
  const subjectsByDepartment: { [key: string]: { [key: string]: string[] } } = {
    'CSE': {
      '1st Year': ['Programming in C', 'Mathematics I', 'Physics', 'Chemistry', 'English'],
      '2nd Year': ['Data Structures', 'Object Oriented Programming', 'Database Management', 'Computer Networks'],
      '3rd Year': ['Software Engineering', 'Operating Systems', 'Computer Graphics', 'Web Technologies'],
      '4th Year': ['Machine Learning', 'Artificial Intelligence', 'Project Work', 'Internship']
    },
    'CYBER': {
      '1st Year': ['Cybersecurity Fundamentals', 'Mathematics I', 'Physics', 'Chemistry', 'English'],
      '2nd Year': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Digital Forensics'],
      '3rd Year': ['Malware Analysis', 'Incident Response', 'Security Auditing', 'Penetration Testing'],
      '4th Year': ['Advanced Cybersecurity', 'Research Project', 'Industry Training', 'Capstone Project']
    },
    'AIDS': {
      '1st Year': ['Programming Fundamentals', 'Mathematics I', 'Statistics', 'Physics', 'English'],
      '2nd Year': ['Data Science', 'Machine Learning', 'Database Systems', 'Python Programming'],
      '3rd Year': ['Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Big Data Analytics'],
      '4th Year': ['Advanced AI', 'Research Methodology', 'Industry Project', 'Thesis Work']
    },
    'AIML': {
      '1st Year': ['AI Fundamentals', 'Mathematics I', 'Statistics', 'Programming', 'English'],
      '2nd Year': ['Machine Learning', 'Data Mining', 'Neural Networks', 'Pattern Recognition'],
      '3rd Year': ['Deep Learning', 'Reinforcement Learning', 'Computer Vision', 'NLP'],
      '4th Year': ['Advanced ML', 'AI Ethics', 'Capstone Project', 'Research Work']
    }
  }

  const availableSubjects = formData.department && formData.year 
    ? subjectsByDepartment[formData.department]?.[formData.year] || []
    : []

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: facultyData, error } = await supabase
            .from('faculty')
            .select('id, email, name')
            .eq('email', user.email)
            .single()
          
          if (error) {
            toast({
              title: "Error",
              description: "Failed to fetch faculty profile",
              variant: "destructive",
            })
            return
          }
          
          if (facultyData) {
            setCurrentUser({
              id: facultyData.id,
              email: user.email!,
              name: facultyData.name || user.user_metadata?.name || 'Faculty'
            })
            
            // Load student lists for this faculty
            await loadStudentLists(user.email!)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initialize user",
          variant: "destructive",
        })
      }
    }
    
    initializeUser()
  }, [toast])

  const loadStudentLists = async (facultyEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('student_lists')
        .select('*')
        .eq('faculty_email', facultyEmail)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudentLists(data || [])
    } catch (error) {
      console.error('Error loading student lists:', error)
    }
  }

  const sendStudentNotifications = async (sessionData: any) => {
    try {
      // Get students from the selected list
      const { data: students, error } = await supabase
        .from('student_list_entries')
        .select('email, full_name')
        .eq('list_id', formData.studentListId)

      if (error) throw error

      // Create notifications for each student
      const notifications = students?.map(student => ({
        type: 'attendance_session',
        title: 'New Attendance Session',
        message: `Attendance session for ${sessionData.subject} is now active. Please mark your attendance.`,
        recipient_email: student.email,
        recipient_type: 'student',
        data: {
          session_id: sessionData.id,
          subject: sessionData.subject,
          class_name: sessionData.class_name,
          expires_at: sessionData.expires_at
        },
        created_at: new Date().toISOString()
      })) || []

      if (notifications.length > 0) {
        await supabase
          .from('notifications')
          .insert(notifications)
      }
    } catch (error) {
      console.error('Error sending student notifications:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (field === 'department' || field === 'year') {
      setFormData(prev => ({ ...prev, subject: '' }))
    }
  }

  const handleTimeSlotChange = (slot: { start: string; end: string }) => {
    setSelectedSlot(slot.start)
    setFormData(prev => ({
      ...prev,
      startTime: slot.start,
      endTime: slot.end,
      durationMinutes: '50'
    }))
    if (errors.startTime || errors.endTime || errors.durationMinutes) {
      setErrors(prev => ({ ...prev, startTime: '', endTime: '', durationMinutes: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.department) newErrors.department = 'Department is required'
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.sessionDate) newErrors.sessionDate = 'Session date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.durationMinutes) newErrors.durationMinutes = 'Duration is required'
    if (!formData.attendanceExpiryMinutes) newErrors.attendanceExpiryMinutes = 'Attendance expiry time is required'
    if (!formData.studentListId) newErrors.studentListId = 'Student list is required'
    if (formData.durationMinutes && isNaN(parseInt(formData.durationMinutes))) {
      newErrors.durationMinutes = 'Duration must be a valid number'
    }
    if (formData.durationMinutes && parseInt(formData.durationMinutes) <= 0) {
      newErrors.durationMinutes = 'Duration must be positive'
    }
    if (formData.sessionDate) {
      const sessionDate = new Date(formData.sessionDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (sessionDate < today) {
        newErrors.sessionDate = 'Session date cannot be in the past'
      }
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const sessionDateTime = new Date(`${formData.sessionDate}T${formData.startTime}`)
      const expiresAt = new Date(sessionDateTime.getTime() + parseInt(formData.durationMinutes) * 60000)

      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', currentUser.email)
        .single()

      if (facultyError || !facultyData) {
        toast({
          title: "Error",
          description: "Faculty profile not found. Please contact administrator.",
          variant: "destructive",
        })
        return
      }

      const className = `${formData.department} ${formData.year}`

      const sessionData = {
        faculty_id: facultyData.id,
        faculty_email: currentUser.email,
        faculty_name: currentUser.name,
        department: formData.department,
        year: formData.year,
        class_name: className,
        subject: formData.subject,
        session_date: formData.sessionDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        duration_minutes: parseInt(formData.durationMinutes),
        attendance_expiry_minutes: parseInt(formData.attendanceExpiryMinutes),
        student_list_id: formData.studentListId,
        session_title: `${formData.subject} - ${className}`,
        is_active: true,
        expires_at: new Date(sessionDateTime.getTime() + parseInt(formData.attendanceExpiryMinutes) * 60000).toISOString(),
        created_at: new Date().toISOString()
      }

      const result = await SupabaseAttendanceService.createAttendanceSession(sessionData)

      if (result.success) {
        // Send real-time notifications to students
        await sendStudentNotifications(sessionData)
        
        toast({
          title: "Success",
          description: "Attendance session created successfully. Students will be notified.",
        })
        router.push("/dashboard/attendance")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create attendance session.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create attendance session.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900">Create Attendance Session</h1>
            <p className="text-gray-600 font-sans mt-1">Set up a new attendance session for your class</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/attendance/records')}
            className="font-sans w-full sm:w-auto border-gray-300 hover:bg-gray-100"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Records
          </Button>
        </div>

        <Card className="w-full border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center font-sans text-xl text-gray-900">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department and Year Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department" className="font-sans text-sm font-medium text-gray-700">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
                  >
                    <SelectTrigger className="font-sans h-11 border-gray-300">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="font-sans">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-600 font-sans">{errors.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="font-sans text-sm font-medium text-gray-700">Year *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleInputChange("year", value)}
                    disabled={!formData.department}
                  >
                    <SelectTrigger className="font-sans h-11 border-gray-300">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year} className="font-sans">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && (
                    <p className="text-sm text-red-600 font-sans">{errors.year}</p>
                  )}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="font-sans text-sm font-medium text-gray-700">Subject *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => handleInputChange("subject", value)}
                  disabled={!formData.department || !formData.year}
                >
                  <SelectTrigger className="font-sans h-11 border-gray-300">
                    <SelectValue placeholder={
                      !formData.department || !formData.year 
                        ? "Select Department & Year first" 
                        : "Select Subject"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject} className="font-sans">
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4 text-gray-500" />
                          {subject}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subject && (
                  <p className="text-sm text-red-600 font-sans">{errors.subject}</p>
                )}
              </div>

              {/* Student List Selection */}
              <div className="space-y-2">
                <Label htmlFor="studentList" className="font-sans text-sm font-medium text-gray-700">Student List *</Label>
                <Select 
                  value={formData.studentListId} 
                  onValueChange={(value) => handleInputChange("studentListId", value)}
                >
                  <SelectTrigger className="font-sans h-11 border-gray-300">
                    <SelectValue placeholder="Select student list" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentLists.map((list) => (
                      <SelectItem key={list.id} value={list.id} className="font-sans">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-500" />
                          {list.name} ({list.student_count} students)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentListId && (
                  <p className="text-sm text-red-600 font-sans">{errors.studentListId}</p>
                )}
                {studentLists.length === 0 && (
                  <p className="text-sm text-blue-600 font-sans">
                    No student lists found. <button 
                      type="button"
                      onClick={() => router.push('/dashboard/attendance/settings')}
                      className="underline hover:text-blue-800"
                    >
                      Upload a student list
                    </button> first.
                  </p>
                )}
              </div>

              {/* Session Date and Time Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionDate" className="font-sans text-sm font-medium text-gray-700">Session Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="sessionDate"
                      type="date"
                      value={formData.sessionDate}
                      onChange={(e) => handleInputChange("sessionDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="font-sans pl-10 h-11 border-gray-300"
                    />
                  </div>
                  {errors.sessionDate && (
                    <p className="text-sm text-red-600 font-sans">{errors.sessionDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-sans text-sm font-medium text-gray-700">Time Slot *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <div key={slot.start} className="flex items-center space-x-2">
                        <Checkbox
                          id={`slot-${slot.start}`}
                          checked={selectedSlot === slot.start}
                          onCheckedChange={() => handleTimeSlotChange(slot)}
                          className="border-gray-300"
                        />
                        <label
                          htmlFor={`slot-${slot.start}`}
                          className="font-sans text-sm text-gray-700"
                        >
                          {slot.start} - {slot.end}
                        </label>
                      </div>
                    ))}
                  </div>
                  {(errors.startTime || errors.endTime) && (
                    <p className="text-sm text-red-600 font-sans">Please select a time slot</p>
                  )}
                </div>
              </div>

              {/* Duration, End Time, and Attendance Expiry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes" className="font-sans text-sm font-medium text-gray-700">Session Duration (minutes) *</Label>
                  <Input
                    id="durationMinutes"
                    type="text"
                    value={formData.durationMinutes}
                    readOnly
                    className="font-sans h-11 bg-gray-50 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 font-sans">Fixed at 50 minutes for selected time slot</p>
                  {errors.durationMinutes && (
                    <p className="text-sm text-red-600 font-sans">{errors.durationMinutes}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="font-sans text-sm font-medium text-gray-700">End Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      readOnly
                      className="font-sans h-11 bg-gray-50 border-gray-300 pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-sans">Automatically set based on time slot</p>
                  {errors.endTime && (
                    <p className="text-sm text-red-600 font-sans">{errors.endTime}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendanceExpiryMinutes" className="font-sans text-sm font-medium text-gray-700">Attendance Link Expiry *</Label>
                  <Select
                    value={formData.attendanceExpiryMinutes}
                    onValueChange={(value) => handleInputChange("attendanceExpiryMinutes", value)}
                  >
                    <SelectTrigger className="font-sans h-11 border-gray-300">
                      <SelectValue placeholder="Select expiry time" />
                    </SelectTrigger>
                    <SelectContent>
                      {attendanceExpiryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="font-sans">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 font-sans">How long students can submit attendance</p>
                  {errors.attendanceExpiryMinutes && (
                    <p className="text-sm text-red-600 font-sans">{errors.attendanceExpiryMinutes}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 font-sans border-gray-300 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 font-sans bg-blue-600 hover:bg-blue-700 text-white"
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}