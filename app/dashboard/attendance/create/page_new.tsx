"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, FileText, MapPin, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { SupabaseAttendanceService } from "@/lib/supabase-attendance"
import { supabase } from "@/lib/supabase"

interface FormData {
  department: string
  year: string
  subject: string
  sessionDate: string
  startTime: string
  endTime: string
  durationMinutes: string
}

interface FormErrors {
  [key: string]: string
}

export default function CreateAttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState<FormData>({
    department: '',
    year: '',
    subject: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    durationMinutes: '60'
  })
  const [errors, setErrors] = useState<FormErrors>({})

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
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (facultyData) {
          setCurrentUser({
            email: user.email,
            name: facultyData.name || user.user_metadata?.name || 'Faculty'
          })
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !currentUser) return

    try {
      setIsSubmitting(true)

      // Calculate expires_at timestamp
      const sessionDateTime = new Date(`${formData.sessionDate}T${formData.startTime}`)
      const expiresAt = new Date(sessionDateTime.getTime() + parseInt(formData.durationMinutes) * 60000)

      // Get faculty ID from faculty table
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', currentUser.email)
        .single()

      if (!facultyData) {
        toast({
          title: "Error",
          description: "Faculty profile not found. Please contact administrator.",
          variant: "destructive",
        })
        return
      }

      // Generate class name
      const className = `${formData.department} ${formData.year}`

      // Prepare session data for Supabase
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
        session_title: `${formData.subject} - ${className}`,
        is_active: true,
        expires_at: expiresAt.toISOString()
      }

      // Create session in Supabase
      const result = await SupabaseAttendanceService.createAttendanceSession(sessionData)

      if (result.success) {
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
      console.error('Error creating session:', error)
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
    <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans">Create Attendance Session</h1>
          <p className="text-gray-600 font-sans">Set up a new attendance session for your class</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/attendance/records')}
          className="font-sans w-full sm:w-auto"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Records
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center font-sans">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Department and Year Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="font-sans text-sm font-medium">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value, year: '', subject: '' }))}
                >
                  <SelectTrigger className="font-sans h-11">
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
                <Label htmlFor="year" className="font-sans text-sm font-medium">Year *</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, year: value, subject: '' }))}
                  disabled={!formData.department}
                >
                  <SelectTrigger className="font-sans h-11">
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
              <Label htmlFor="subject" className="font-sans text-sm font-medium">Subject *</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => handleInputChange("subject", value)}
                disabled={!formData.department || !formData.year}
              >
                <SelectTrigger className="font-sans h-11">
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
                        <BookOpen className="mr-2 h-4 w-4" />
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

            {/* Session Date and Time */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionDate" className="font-sans text-sm font-medium">Session Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="sessionDate"
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => handleInputChange("sessionDate", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="font-sans pl-10 h-11"
                  />
                </div>
                {errors.sessionDate && (
                  <p className="text-sm text-red-600 font-sans">{errors.sessionDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime" className="font-sans text-sm font-medium">Start Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="font-sans pl-10 h-11"
                  />
                </div>
                {errors.startTime && (
                  <p className="text-sm text-red-600 font-sans">{errors.startTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="font-sans text-sm font-medium">End Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="font-sans pl-10 h-11"
                  />
                </div>
                {errors.endTime && (
                  <p className="text-sm text-red-600 font-sans">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationMinutes" className="font-sans text-sm font-medium">
                Attendance Window Duration (minutes) *
              </Label>
              <Select
                value={formData.durationMinutes}
                onValueChange={(value) => handleInputChange("durationMinutes", value)}
              >
                <SelectTrigger className="font-sans h-11">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30" className="font-sans">30 minutes</SelectItem>
                  <SelectItem value="45" className="font-sans">45 minutes</SelectItem>
                  <SelectItem value="60" className="font-sans">1 hour</SelectItem>
                  <SelectItem value="90" className="font-sans">1.5 hours</SelectItem>
                  <SelectItem value="120" className="font-sans">2 hours</SelectItem>
                  <SelectItem value="180" className="font-sans">3 hours</SelectItem>
                </SelectContent>
              </Select>
              {errors.durationMinutes && (
                <p className="text-sm text-red-600 font-sans">{errors.durationMinutes}</p>
              )}
              <p className="text-sm text-gray-500 font-sans">
                How long students can mark their attendance after the session starts
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-sans flex-1 h-11"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Create Attendance Session
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/attendance')}
                className="font-sans sm:w-auto h-11"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
