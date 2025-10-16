"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from '@/lib/supabase'
import {
  Bell,
  Calendar,
  Clock,
  MapPin,
  Upload,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Eye,
  Users,
  Building,
  GraduationCap,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Department and year configurations
const departments = [
  { id: "cse", name: "Computer Science (CSE)", count: 400 },
  { id: "aids", name: "AI & Data Science (AIDS)", count: 350 },
  { id: "aiml", name: "AI & Machine Learning (AIML)", count: 300 },
  { id: "cyber", name: "Cyber Security", count: 250 },
]

const years = [
  { id: "first", name: "1st Year", count: 100 },
  { id: "second", name: "2nd Year", count: 90 },
  { id: "third", name: "3rd Year", count: 85 },
  { id: "fourth", name: "4th Year", count: 80 },
]

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("create")
  const [currentStep, setCurrentStep] = useState(1)
  const [targetType, setTargetType] = useState("")
  const [selectedTarget, setSelectedTarget] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [venue, setVenue] = useState("")
  const [scheduleForLater, setScheduleForLater] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringType, setRecurringType] = useState("weekly")
  const [poster, setPoster] = useState<string | null>(null)
  const [posterPath, setPosterPath] = useState<string | null>(null)
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Real announcements data from Supabase
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [facultyDepartment, setFacultyDepartment] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  // Mock data backup
  const oldMockAnnouncements = [
    {
      id: 1,
      title: "Mid-Semester Examination Schedule",
      description:
        "The mid-semester examinations for all courses will begin next week. Please check the detailed schedule.",
      date: "2023-10-15",
      time: "10:00",
      venue: "Examination Hall",
      poster: "/placeholder.svg?height=200&width=400",
      targetType: "class",
      target: "FY CSE",
      totalStudents: 120,
      readCount: 85,
      registeredCount: 110,
    },
    {
      id: 2,
      title: "Annual Technical Symposium",
      description: "Join us for the annual technical symposium featuring workshops, talks, and competitions.",
      date: "2023-11-05",
      time: "09:00",
      venue: "Main Auditorium",
      poster: "/placeholder.svg?height=200&width=400",
      targetType: "department",
      target: "Computer Science",
      totalStudents: 335,
      readCount: 210,
      registeredCount: 180,
    },
    {
      id: 3,
      title: "University Foundation Day Celebration",
      description:
        "Celebrating the 25th foundation day of our university with cultural programs and distinguished speakers.",
      date: "2023-12-10",
      time: "18:00",
      venue: "University Ground",
      poster: "/placeholder.svg?height=200&width=400",
      targetType: "university",
      target: "All Students",
      totalStudents: 2500,
      readCount: 1200,
      registeredCount: 800,
    },
  ]

  // Fetch faculty info and announcements on mount
  useEffect(() => {
    fetchFacultyInfo()
    fetchAnnouncements()
  }, [])

  const fetchFacultyInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: faculty } = await supabase
        .from('faculty')
        .select('id, department')
        .eq('email', user.email)
        .single()

      if (faculty) {
        setFacultyId(faculty.id)
        setFacultyDepartment(faculty.department)
      }
    } catch (error) {
      console.error('Error fetching faculty info:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          faculty:faculty_id (
            name,
            department
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handlePosterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, JPEG)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploadingPoster(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Call API route directly
      const response = await fetch('/api/announcements/upload-poster', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.url && result.path) {
        setPoster(result.url)
        setPosterPath(result.path)
        toast({
          title: "Poster Uploaded",
          description: "Announcement poster has been uploaded successfully.",
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload poster",
        variant: "destructive",
      })
    } finally {
      setIsUploadingPoster(false)
    }
  }

  const handleRemovePoster = async () => {
    if (posterPath) {
      try {
        // Call API route directly
        await fetch(`/api/announcements/delete-poster?path=${encodeURIComponent(posterPath)}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting poster:', error)
      }
    }
    setPoster(null)
    setPosterPath(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createAnnouncement = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }

    if (!title || !description || !targetType || !selectedTarget) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (!facultyId) {
      toast({
        title: "Error",
        description: "Faculty information not found",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Determine department and years based on target type
      let dept = null
      let target_years: string[] = []

      if (targetType === "class") {
        // Specific classes: department + specific years
        dept = selectedDepartment
        target_years = selectedYears
      } else if (targetType === "department") {
        // Specific department: all years
        dept = selectedTarget
        target_years = [] // Empty means all years
      } else if (targetType === "university") {
        // University-wide
        dept = null // null means all departments
        target_years = []
      }

      // Call API route directly
      const response = await fetch('/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: description,
          department: dept,
          target_years,
          faculty_id: facultyId,
          priority: 'normal',
          target_audience: 'students',
          poster_url: poster || undefined,
          date: date || undefined,
          time: time || undefined,
          venue: venue || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create announcement')
      }

      // Reset form
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
      setVenue("")
      setTargetType("")
      setSelectedTarget("")
      setSelectedDepartment("")
      setSelectedYears([])
      setScheduleForLater(false)
      setScheduleDate("")
      setIsRecurring(false)
      setRecurringType("weekly")
      setPoster(null)
      setPosterPath(null)
      setCurrentStep(1)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh announcements
      await fetchAnnouncements()

      setActiveTab("manage")

      toast({
        title: "Success",
        description: "Announcement created and students notified!",
      })
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create announcement",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${currentStep >= step ? "bg-purple-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
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
            <h3 className="text-lg font-medium">Select Target Audience</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <RadioGroup value={targetType} onValueChange={setTargetType}>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="class" id="class" />
                      <Label htmlFor="class" className="flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Specific Classes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="department" id="department" />
                      <Label htmlFor="department" className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Department Years
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="university" id="university" />
                      <Label htmlFor="university" className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        All University
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {targetType === "class" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-4 space-y-4"
                  >
                    <div>
                      <Label className="mb-2 block">Select Department</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {departments.map((dept) => (
                          <Button
                            key={dept.id}
                            variant={selectedDepartment === dept.id ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => setSelectedDepartment(dept.id)}
                          >
                            <Building className="h-4 w-4 mr-2" />
                            {dept.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {selectedDepartment && (
                      <div>
                        <Label className="mb-2 block">Select Years (Multiple)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {years.map((year) => (
                            <Button
                              key={year.id}
                              variant={selectedYears.includes(year.id) ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => {
                                if (selectedYears.includes(year.id)) {
                                  setSelectedYears(selectedYears.filter(y => y !== year.id))
                                } else {
                                  setSelectedYears([...selectedYears, year.id])
                                }
                                setSelectedTarget(selectedDepartment)
                              }}
                            >
                              <GraduationCap className="h-4 w-4 mr-2" />
                              {year.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {targetType === "department" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-4"
                  >
                    <Label className="mb-2 block">Select Department (All Years)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {departments.map((dept) => (
                        <Button
                          key={dept.id}
                          variant={selectedTarget === dept.id ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setSelectedTarget(dept.id)}
                        >
                          <Building className="h-4 w-4 mr-2" />
                          {dept.name}
                          <span className="ml-auto text-xs text-gray-500">{dept.count}</span>
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {targetType === "university" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-4"
                  >
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-800 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Your announcement will be visible to all students in the university.
                      </p>
                    </div>
                    <Button className="mt-4" variant="outline" onClick={() => setSelectedTarget("all-university")}>
                      Confirm All University
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={!targetType || !selectedTarget || (targetType === 'class' && selectedYears.length === 0)}
              >
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
            <h3 className="text-lg font-medium">Announcement Details</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Announcement Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter announcement description"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={scheduleForLater}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Enter venue (if applicable)"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scheduleForLater" className="cursor-pointer">
                      Smart Scheduling
                    </Label>
                    <Switch id="scheduleForLater" checked={scheduleForLater} onCheckedChange={setScheduleForLater} />
                  </div>
                  <p className="text-sm text-gray-500">Schedule this announcement for a future date</p>
                </div>

                {scheduleForLater && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="scheduleDate">Schedule Date *</Label>
                      <Input
                        id="scheduleDate"
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isRecurring" className="cursor-pointer">
                          Recurring Announcement
                        </Label>
                        <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                      </div>
                    </div>

                    {isRecurring && (
                      <div className="space-y-2">
                        <Label htmlFor="recurringType">Recurrence Pattern</Label>
                        <select
                          id="recurringType"
                          value={recurringType}
                          onChange={(e) => setRecurringType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!title || !description}>
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
            <h3 className="text-lg font-medium">Upload Poster & Review</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Announcement Poster (Optional)</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {poster ? (
                      <div className="relative">
                        <img
                          src={poster || "/placeholder.svg"}
                          alt="Announcement Poster"
                          className="max-h-[300px] mx-auto rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemovePoster()
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-1">
                          {isUploadingPoster ? "Uploading..." : "Upload Poster"}
                        </h4>
                        <p className="text-gray-500 text-sm mb-4">PNG, JPG, JPEG (Max 5MB)</p>
                        <Button variant="outline" size="sm" disabled={isUploadingPoster}>
                          {isUploadingPoster ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            "Browse Files"
                          )}
                        </Button>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePosterUpload}
                      className="hidden"
                      accept="image/*"
                      disabled={isUploadingPoster}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Announcement Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target:</span>
                      <span className="font-medium">
                        {targetType === "class"
                          ? `${departments.find((d) => d.id === selectedDepartment)?.name} - ${selectedYears.map(y => years.find(yr => yr.id === y)?.name).join(', ')}`
                          : targetType === "department"
                            ? `${departments.find((d) => d.id === selectedTarget)?.name} (All Years)`
                            : "All University"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Title:</span>
                      <span className="font-medium">{title}</span>
                    </div>
                    {(date || scheduleDate) && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">
                          {scheduleForLater ? scheduleDate : date}
                          {isRecurring && scheduleForLater && ` (Recurring ${recurringType})`}
                        </span>
                      </div>
                    )}
                    {time && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium">{time}</span>
                      </div>
                    )}
                    {venue && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Venue:</span>
                        <span className="font-medium">{venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isSubmitting}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={createAnnouncement} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Create Announcement
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const renderManageTab = () => (
    <div className="space-y-6">
      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements Yet</h3>
          <p className="text-gray-500 mb-4">Create your first announcement to get started</p>
          <Button onClick={() => setActiveTab("create")}>Create Announcement</Button>
        </div>
      ) : (
        <div>
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="mb-6">
              <CardContent className="p-0">
                <div className="md:flex">
                  {announcement.poster_url && (
                    <div className="md:w-1/3">
                      <img
                        src={announcement.poster_url}
                        alt={announcement.title}
                        className="w-full h-48 md:h-full object-cover rounded-l-lg"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${announcement.poster_url ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{announcement.title}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          {announcement.date && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {announcement.date}
                            </div>
                          )}
                          {announcement.time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {announcement.time}
                            </div>
                          )}
                          {announcement.venue && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {announcement.venue}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{announcement.content || announcement.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Target</div>
                        <div className="text-lg font-bold">{announcement.target}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Read</div>
                        <div className="text-lg font-bold flex items-center">
                          {announcement.readCount}
                          <span className="text-xs text-gray-500 ml-1">/ {announcement.totalStudents}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({Math.round((announcement.readCount / announcement.totalStudents) * 100)}%)
                          </span>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Registered</div>
                        <div className="text-lg font-bold flex items-center">
                          {announcement.registeredCount}
                          <span className="text-xs text-gray-500 ml-1">/ {announcement.totalStudents}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({Math.round((announcement.registeredCount / announcement.totalStudents) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>
                        {announcement.totalStudents - announcement.readCount} students haven't read this announcement
                        yet
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1
        className="text-2xl font-bold mb-6 flex items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Bell className="inline-block mr-2 h-6 w-6 text-purple-600" />
        Announcements
      </motion.h1>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Announcement
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Bell className="mr-2 h-4 w-4" />
              Manage Announcements
            </motion.div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create">{renderCreateTab()}</TabsContent>
        <TabsContent value="manage">{renderManageTab()}</TabsContent>
      </Tabs>
    </div>
  )
}
