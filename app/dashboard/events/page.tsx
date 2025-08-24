"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  Upload,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Users,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SeatAssignmentInterface from "@/components/seat-assignment/SeatAssignmentInterface"
import RealtimeSeatUpdates from "@/components/seat-assignment/RealtimeSeatUpdates"
import { createEvent, getFacultyEvents, createSeatAssignment, updateSeatAssignment, deleteSeatAssignment, getEventRegistrations } from "./actions"
import { createClient } from "@/lib/supabase/client"

// Standardized departments
const departments = [
  "Computer Science and Engineering",
  "Cyber Security", 
  "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Machine Learning"
]

// Venue configurations
const venueConfigs = {
  "seminar-hall": {
    name: "Seminar Hall",
    totalSeats: 160,
    rows: 10,
    seatsPerRow: 16,
    hasGenderSeparation: false,
  },
  "solar-shade": {
    name: "Solar Shade",
    totalSeats: 250,
    rows: 15,
    seatsPerRow: 17,
    hasGenderSeparation: false,
  },
}

export default function EventsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("create")
  const [currentStep, setCurrentStep] = useState(1)
  const [eventType, setEventType] = useState("")
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [enablePayment, setEnablePayment] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(false)
  const [registrationFields, setRegistrationFields] = useState("")
  const [showAttendance, setShowAttendance] = useState(false)
  const [showSeatSelection, setShowSeatSelection] = useState(false)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<string>("")
  const [genderSeparation, setGenderSeparation] = useState("")
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [currentAssignClass, setCurrentAssignClass] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGeneratingForm, setIsGeneratingForm] = useState(false)
  const [generatedFormFields, setGeneratedFormFields] = useState<any[]>([])
  const [registrationStart, setRegistrationStart] = useState("")
  const [registrationEnd, setRegistrationEnd] = useState("")

  const handleViewRegistrations = async (event: any) => {
    setSelectedEventForRegistrations(event)
    const result = await getEventRegistrations(event.id)
    if (result.success && result.data) {
      setRegistrations(result.data)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to fetch registrations.",
        variant: "destructive",
      })
    }
    setShowRegistrations(true)
  }

  // Seat assignment types aligned with components
  interface SeatAssignment {
    id: string
    department: string
    year: string
    gender?: string
    seat_numbers: number[]
    row_numbers: number[]
    venue_type: string
  }

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [venue, setVenue] = useState("")
  const [maxParticipants, setMaxParticipants] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [poster, setPoster] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Events state - load from Supabase on mount
  const [events, setEvents] = useState<any[]>([])
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[]>([])
  const [currentEventForSeats, setCurrentEventForSeats] = useState<string | null>(null)
  const supabase = createClient()

  // Load events from Supabase on component mount
  useEffect(() => {
    const loadEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const result = await getFacultyEvents(user.id)
        if (result.success && result.data) {
          setEvents(result.data)
        }
      }
    }
    loadEvents()
  }, [])

  // Remove localStorage usage - all data persists in Supabase
  // Events are automatically loaded from database on mount

  // Mock students data for attendance
  const [registrations, setRegistrations] = useState<any[]>([])
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<any>(null)

  // Mock students data for attendance
  const [students, setStudents] = useState([
    { id: 1, name: "Rahul Sharma", prn: "PRN2023001", class: "FY-CSE", present: false, paid: true },
    { id: 2, name: "Priya Patel", prn: "PRN2023002", class: "FY-CSE", present: false, paid: true },
    { id: 3, name: "Amit Kumar", prn: "PRN2023003", class: "SY-CSE", present: false, paid: false },
    { id: 4, name: "Sneha Gupta", prn: "PRN2023004", class: "SY-CSE", present: false, paid: true },
    { id: 5, name: "Vikram Singh", prn: "PRN2023005", class: "TY-CSE", present: false, paid: true },
    { id: 6, name: "Neha Verma", prn: "PRN2023006", class: "FY-IT", present: false, paid: false },
    { id: 7, name: "Raj Malhotra", prn: "PRN2023007", class: "SY-IT", present: false, paid: true },
    { id: 8, name: "Ananya Desai", prn: "PRN2023008", class: "TY-IT", present: false, paid: true },
    { id: 9, name: "Rohan Joshi", prn: "PRN2023009", class: "SY-AIML", present: false, paid: true },
    { id: 10, name: "Kavita Reddy", prn: "PRN2023010", class: "SY-AIML", present: false, paid: true },
  ])

  // Available classes for seat assignment
  const availableClasses = [
    "FY-CSE",
    "SY-CSE",
    "TY-CSE",
    "FY-IT",
    "SY-IT",
    "TY-IT",
    "FY-AIML",
    "SY-AIML",
    "TY-AIML",
    "FY-AIDS",
    "SY-AIDS",
    "TY-AIDS",
  ]

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]))
  }

  const handlePosterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      })
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `event-poster-${Date.now()}.${fileExt}`
    const filePath = `posters/${fileName}`

    try {
      const { error } = await supabase.storage.from('event-assets').upload(filePath, file)

      if (error) {
        toast({
          title: "Error uploading poster",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      const { data } = supabase.storage.from('event-assets').getPublicUrl(filePath)
      setPoster(data.publicUrl)
      toast({
        title: "Poster Uploaded",
        description: "Event poster has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading poster:", error)
    }
  }

  const generateRegistrationForm = async () => {
    if (!registrationFields.trim()) {
      toast({
        title: "Error",
        description: "Please specify what information you want to collect from students",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingForm(true)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Create a registration form with these fields: ${registrationFields}. Return only a JSON array of field objects with properties: name, label, type, required, placeholder. Common field types: text, email, tel, select. For class/department fields, use select type.`,
        }),
      })

      const data = await response.json()

      // Parse the generated form fields
      const fields = parseFormFields(registrationFields)
      setGeneratedFormFields(fields)

      toast({
        title: "Success",
        description: "Registration form generated successfully!",
      })
    } catch (error) {
      console.error("Error generating form:", error)
      // Fallback form generation
      const fields = parseFormFields(registrationFields)
      setGeneratedFormFields(fields)

      toast({
        title: "Form Generated",
        description: "Registration form created with default templates.",
      })
    } finally {
      setIsGeneratingForm(false)
    }
  }

  const parseFormFields = (fieldsText: string) => {
    const commonFields = fieldsText
      .toLowerCase()
      .split(/[,\n]+/)
      .map((field) => field.trim())
    const fields: any[] = []

    commonFields.forEach((field: string) => {
      if (field.includes("name")) {
        fields.push({
          name: "name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Enter your full name",
        })
      } else if (field.includes("prn")) {
        fields.push({ name: "prn", label: "PRN Number", type: "text", required: true, placeholder: "Enter your PRN" })
      } else if (field.includes("email")) {
        fields.push({
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "Enter your email",
        })
      } else if (field.includes("mobile") || field.includes("phone")) {
        fields.push({
          name: "mobile",
          label: "Mobile Number",
          type: "tel",
          required: true,
          placeholder: "Enter your mobile number",
        })
      } else if (field.includes("class") || field.includes("department")) {
        fields.push({
          name: "class",
          label: "Class/Department",
          type: "select",
          required: true,
          options: ["FY-CSE", "SY-CSE", "TY-CSE", "FY-IT", "SY-IT", "TY-IT", "FY-AIML", "SY-AIML", "TY-AIML"],
        })
      } else if (field.includes("year")) {
        fields.push({
          name: "year",
          label: "Academic Year",
          type: "select",
          required: true,
          options: ["First Year", "Second Year", "Third Year", "Fourth Year"],
        })
      } else {
        fields.push({
          name: field,
          label: field.charAt(0).toUpperCase() + field.slice(1),
          type: "text",
          required: false,
          placeholder: `Enter ${field}`,
        })
      }
    })

    return fields
  }

  const handleSeatAssignment = () => {
    if (!selectedVenue) {
      toast({
        title: "Select Venue",
        description: "Please select a venue type first",
        variant: "destructive",
      })
      return
    }

    // For now, we'll use a placeholder event ID. In a real implementation,
    // this would be set when creating/editing an existing event
    setCurrentEventForSeats('temp-event-id')
    setShowSeatSelection(true)
  }

  const toggleAttendance = (id: number) => {
    setStudents(students.map((student) => (student.id === id ? { ...student, present: !student.present } : student)))
  }

  const submitAttendance = () => {
    const attendedCount = students.filter((s) => s.present).length
    setEvents(events.map((event) => (event.id === 1 ? { ...event, attendedStudents: attendedCount } : event)))
    setShowAttendance(false)
    toast({
      title: "Attendance Submitted",
      description: `Attendance marked for ${attendedCount} students.`,
    })
  }

  const downloadAttendanceExcel = () => {
    // Create CSV content
    const csvContent = [
      ["Student Name", "Class", "PRN", "Fee Status", "Attendance"],
      ...students.map((student) => [
        student.name,
        student.class,
        student.prn,
        student.paid ? "Paid" : "Unpaid",
        student.present ? "Present" : "Absent",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Download Complete",
      description: "Attendance sheet downloaded successfully.",
    })
  }

  const handleSeatSelection = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber))
    } else {
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  const assignSeatsToClass = () => {
    // Legacy helper no longer used with array-based assignments
    toast({
      title: "Seat Assignment",
      description: "Use the Assign Seats button in the dialog to create assignments.",
    })
  }

  const isSeatAssigned = (seatNumber: number) => {
    return seatAssignments.some((assignment) => assignment.seat_numbers.includes(seatNumber))
  }

  const getSeatClass = (seatNumber: number) => {
    for (const assignment of seatAssignments) {
      if (assignment.seat_numbers.includes(seatNumber)) {
        return `${assignment.department} • ${assignment.year}`
      }
    }
    return null
  }

  const getFilteredStudents = () => {
    let filtered = [...students]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.prn.toLowerCase().includes(query) ||
          student.class.toLowerCase().includes(query),
      )
    }
    return filtered
  }

  const handleCreateEvent = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    if (!title || !description || !date || !time || !venue || !poster || selectedDepartments.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // fetch faculty meta for name and department
    let faculty_name = ""
    let faculty_department = ""
    try {
      const { data: facultyRow } = await supabase
        .from('faculty')
        .select('name, department')
        .eq('id', user.id)
        .single()
      faculty_name = facultyRow?.name || ""
      faculty_department = facultyRow?.department || ""
    } catch {}

    const eventData = {
      title,
      description,
      event_type: eventType,
      date,
      time,
      venue,
      poster_url: poster,
      max_participants: maxParticipants ? Number.parseInt(maxParticipants) : undefined,
      target_departments: selectedDepartments,
      target_years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      enable_payment: enablePayment,
      payment_amount: paymentAmount ? Number.parseFloat(paymentAmount) : undefined,
      allow_registration: allowRegistration,
      registration_start: registrationStart || undefined,
      registration_end: registrationEnd || new Date(`${date}T${time}`).toISOString(),
      registration_fields: generatedFormFields,
      venue_type: selectedVenue,
      created_by: user.id,
      faculty_name,
      faculty_department
    }

    const result = await createEvent(eventData)
    
    if (result.success) {
      // Reset form
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
      setVenue("")
      setMaxParticipants("")
      setSelectedDepartments([])
      setEnablePayment(false)
      setAllowRegistration(false)
      setRegistrationFields("")
      setGeneratedFormFields([])
      setPaymentAmount("")
      setPoster(null)
      setCurrentStep(1)
      setEventType("")
      setSeatAssignments([])
      setSelectedVenue("")
      setGenderSeparation("")
      setRegistrationStart("")
      setRegistrationEnd("")

      // Refresh events list
      const eventsResult = await getFacultyEvents(user.id)
      if (eventsResult.success && eventsResult.data) {
        setEvents(eventsResult.data)
      }

      setActiveTab("manage")

      toast({
        title: "Success",
        description: "Event created successfully!",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create event",
        variant: "destructive",
      })
    }
  }

  const eventTypes = [
    { id: "workshop", title: "Workshop", icon: "W" },
    { id: "sports", title: "Sports Event", icon: "S" },
    { id: "cultural", title: "Cultural Event", icon: "C" },
    { id: "training", title: "Training", icon: "T" },
    { id: "technical", title: "Technical", icon: "Te" },
    { id: "other", title: "Other", icon: "O" },
  ]

  const renderSeatMap = () => {
    if (!selectedVenue) return null

    const config = venueConfigs[selectedVenue as keyof typeof venueConfigs]
    const seats = []

    for (let row = 0; row < config.rows; row++) {
      const rowSeats = []
      for (let seat = 0; seat < config.seatsPerRow; seat++) {
        const seatNumber = row * config.seatsPerRow + seat + 1
        if (seatNumber <= config.totalSeats) {
          const isSelected = selectedSeats.includes(seatNumber)
          const isAssigned = isSeatAssigned(seatNumber)
          const assignedClass = getSeatClass(seatNumber)

          rowSeats.push(
            <div
              key={seatNumber}
              className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer border text-xs ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-700"
                  : isAssigned
                    ? "bg-gray-800 text-white border-gray-900"
                    : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => !isAssigned && handleSeatSelection(seatNumber)}
              title={assignedClass ? `Assigned to ${assignedClass}` : ""}
            >
              {seatNumber}
            </div>,
          )
        }
      }
      seats.push(
        <div key={row} className="flex justify-center space-x-1 mb-2">
          {rowSeats}
        </div>,
      )
    }

    return (
      <div className="space-y-2">
        <div className="text-center mb-4 p-2 bg-gray-100 rounded">
          <div className="text-lg font-bold">STAGE / FRONT</div>
        </div>
        {seats}
        <div className="text-center text-sm text-gray-500 mt-4">
          {config.name} - {config.totalSeats} Total Seats
          {config.hasGenderSeparation && genderSeparation && (
            <div className="mt-1 text-blue-600">
              Arrangement: {genderSeparation === "girls" ? "Girls Section" : "Boys Section"}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${currentStep >= step ? "bg-purple-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500">Step {currentStep} of 4</div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Select Event Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {eventTypes.map((type) => (
                <motion.div key={type.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      eventType === type.id ? "border-2 border-purple-600" : ""
                    }`}
                    onClick={() => setEventType(type.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-purple-600 font-bold">{type.icon}</span>
                      </div>
                      <h3 className="font-medium">{type.title}</h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setCurrentStep(2)} disabled={!eventType}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Event Details</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter event description"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Enter event venue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="Enter max participants (optional)"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!title || !description || !date || !time || !venue}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Target Audience & Poster</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Target Audience *</Label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map((dept) => (
                      <Button
                        key={dept}
                        variant={selectedDepartments.includes(dept) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDepartment(dept)}
                      >
                        {dept}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Event Poster *</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {poster ? (
                      <div className="relative">
                        <img
                          src={poster || "/placeholder.svg"}
                          alt="Event Poster"
                          className="max-h-[300px] mx-auto rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPoster(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-1">Upload Poster</h4>
                        <p className="text-gray-500 text-sm mb-4">PNG, JPG, JPEG</p>
                        <Button variant="outline" size="sm">
                          Browse Files
                        </Button>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handlePosterUpload(e)}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seatAssignment" className="cursor-pointer">
                      Configure Seat Assignments
                    </Label>
                    <Button variant="outline" size="sm" onClick={handleSeatAssignment}>
                      Assign Seats
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Venue Type</Label>
                    <Select value={selectedVenue} onValueChange={(value: string) => setSelectedVenue(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose venue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seminar-hall">Seminar Hall (160 seats)</SelectItem>
                        <SelectItem value="solar-shade">Solar Shade (250 seats)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {seatAssignments.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Current Seat Assignments:</h4>
                      <div className="space-y-1">
                        {seatAssignments.map((assignment) => (
                          <div key={assignment.id} className="flex justify-between text-sm">
                            <span className="font-medium">{assignment.department} • {assignment.year}</span>
                            <span>{assignment.seat_numbers.length} seats</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(4)} disabled={selectedDepartments.length === 0 || !poster}>
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Payment & Registration</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enablePayment">Enable Online Payment</Label>
                    <p className="text-sm text-gray-500">Allow students to pay online for this event</p>
                  </div>
                  <Switch id="enablePayment" checked={enablePayment} onCheckedChange={setEnablePayment} />
                </div>
                {enablePayment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-2"
                  >
                    <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="paymentAmount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="pl-10"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="allowRegistration">Allow Student Registration</Label>
                    <p className="text-sm text-gray-500">Enable custom registration form for students</p>
                  </div>
                  <Switch id="allowRegistration" checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                </div>

                {allowRegistration && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="regStart">Registration Start</Label>
                        <Input
                          id="regStart"
                          type="datetime-local"
                          value={registrationStart}
                          onChange={(e) => setRegistrationStart(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regEnd">Registration End</Label>
                        <Input
                          id="regEnd"
                          type="datetime-local"
                          value={registrationEnd}
                          onChange={(e) => setRegistrationEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationFields">Registration Information Required</Label>
                      <Textarea
                        id="registrationFields"
                        value={registrationFields}
                        onChange={(e) => setRegistrationFields(e.target.value)}
                        placeholder="Specify what information you want to collect from students (e.g., name, prn, email, mobile, class, department, year)"
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={generateRegistrationForm}
                      disabled={isGeneratingForm || !registrationFields.trim()}
                      variant="outline"
                    >
                      {isGeneratingForm ? (
                        <>
                          <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating Form...
                        </>
                      ) : (
                        "Generate Registration Form"
                      )}
                    </Button>

                    {generatedFormFields.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Generated Registration Form Preview:</h4>
                        <div className="space-y-2">
                          {generatedFormFields.map((field, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{field.label}</span>
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                              <span className="text-gray-500 ml-2">({field.type})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Event Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event Type:</span>
                      <span className="font-medium">
                        {eventTypes.find((t) => t.id === eventType)?.title || eventType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Title:</span>
                      <span className="font-medium">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date & Time:</span>
                      <span className="font-medium">
                        {date} at {time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Venue:</span>
                      <span className="font-medium">{venue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Audience:</span>
                      <span className="font-medium">{selectedDepartments.join(", ")}</span>
                    </div>
                    {selectedVenue && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Venue Type:</span>
                        <span className="font-medium">
                          {venueConfigs[selectedVenue as keyof typeof venueConfigs]?.name} ({venueConfigs[selectedVenue as keyof typeof venueConfigs]?.totalSeats} seats)
                        </span>
                      </div>
                    )}
                    {enablePayment && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Amount:</span>
                        <span className="font-medium">₹{paymentAmount}</span>
                      </div>
                    )}
                    {allowRegistration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registration:</span>
                        <span className="font-medium">Enabled ({generatedFormFields.length} fields)</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleCreateEvent} disabled={enablePayment && !paymentAmount}>
                <Check className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seat Assignment Dialog */}
      <Dialog open={showSeatSelection} onOpenChange={setShowSeatSelection}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <div className="py-4">
            {currentEventForSeats && (
              <RealtimeSeatUpdates
                eventId={currentEventForSeats}
                onAssignmentChangeAction={(assignments: any[]) => setSeatAssignments(assignments)}
              >
                <SeatAssignmentInterface
                  eventId={currentEventForSeats}
                  venueType={selectedVenue as 'seminar-hall' | 'solar-shade'}
                  assignments={seatAssignments}
                  onAssignmentCreateAction={async (assignment: any) => {
                    const result = await createSeatAssignment({
                      ...assignment,
                      event_id: currentEventForSeats,
                      venue_type: selectedVenue as 'seminar-hall' | 'solar-shade',
                    })
                    if (!result.success) {
                      throw new Error(result.error || 'Failed to create assignment')
                    }
                  }}
                  onAssignmentUpdateAction={async (assignmentId: string, seatNumbers: number[]) => {
                    const result = await updateSeatAssignment(assignmentId, seatNumbers)
                    if (!result.success) {
                      throw new Error(result.error || 'Failed to update assignment')
                    }
                  }}
                  onAssignmentDeleteAction={async (assignmentId: string) => {
                    const result = await deleteSeatAssignment(assignmentId)
                    if (!result.success) {
                      throw new Error(result.error || 'Failed to delete assignment')
                    }
                  }}
                />
              </RealtimeSeatUpdates>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderManageTab = () => (
    <div className="space-y-6">
      {(() => {
        const groups: Record<string, any[]> = {}
        registrations.forEach((r: any) => {
          const key = `${r.students.department} • ${r.students.year}`
          groups[key] = groups[key] || []
          groups[key].push(r)
        })
        const entries = Object.entries(groups)
        return entries.length === 0 ? (
          <div className="text-sm text-gray-600">No registrations yet.</div>
        ) : (
          <div className="space-y-6">
            {entries.map(([group, regs]) => (
              <div key={group}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{group} <span className="text-gray-500">({(regs as any[]).length})</span></h5>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-7 bg-gray-100 p-3 text-sm font-medium">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Dept</div>
                    <div>Year</div>
                    <div>Status</div>
                    <div>Attendance</div>
                  </div>
                  {(regs as any[]).map((registration: any) => (
                    <div key={registration.id} className="grid grid-cols-7 p-3 text-sm border-t">
                      <div>{registration.students.name}</div>
                      <div>{registration.students.email}</div>
                      <div>{registration.students.phone || '-'}</div>
                      <div>{registration.students.department}</div>
                      <div>{registration.students.year}</div>
                      <div>
                        <Badge className={registration.status === 'registered' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}>
                          {registration.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const { data: { user } } = await supabase.auth.getUser()
                            if (!user) return
                            const res = await (await import('./actions')).markEventAttendance(event.id, registration.student_id, 'present', user.id)
                            if (res.success) {
                              toast({ title: 'Marked present' })
                            } else {
                              toast({ title: 'Error', description: res.error, variant: 'destructive' })
                            }
                          }}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const { data: { user } } = await supabase.auth.getUser()
                            if (!user) return
                            const res = await (await import('./actions')).markEventAttendance(event.id, registration.student_id, 'absent', user.id)
                            if (res.success) {
                              toast({ title: 'Marked absent' })
                            } else {
                              toast({ title: 'Error', description: res.error, variant: 'destructive' })
                            }
                          }}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Event Management</h1>
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Event</TabsTrigger>
          <TabsTrigger value="manage">Manage Events</TabsTrigger>
        </TabsList>
        <TabsContent value="create">{renderCreateTab()}</TabsContent>
        <TabsContent value="manage">{renderManageTab()}</TabsContent>
      </Tabs>
    </div>
  )
}
