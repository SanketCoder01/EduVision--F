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
import { Badge } from "@/components/ui/badge"

// Department and year configurations
const departments = [
  { id: "cse", name: "Computer Science (CSE)" },
  { id: "aids", name: "AI & Data Science (AIDS)" },
  { id: "aiml", name: "AI & Machine Learning (AIML)" },
  { id: "cyber", name: "Cyber Security" },
]

const years = [
  { id: "first", name: "1st Year" },
  { id: "second", name: "2nd Year" },
  { id: "third", name: "3rd Year" },
  { id: "fourth", name: "4th Year" },
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

  // Real student counts from Supabase
  const [departmentCounts, setDepartmentCounts] = useState<Record<string, number>>({})
  const [yearCounts, setYearCounts] = useState<Record<string, number>>({})

  // Fetch faculty info and announcements on mount
  useEffect(() => {
    fetchFacultyInfo()
    fetchAnnouncements()
    fetchStudentCounts()
  }, [])

  const fetchStudentCounts = async () => {
    try {
      // Fetch department counts
      const { data: deptData } = await supabase
        .from('students')
        .select('department')
      
      const deptCounts: Record<string, number> = {}
      if (deptData) {
        deptData.forEach(student => {
          const dept = student.department?.toLowerCase()
          if (dept) {
            deptCounts[dept] = (deptCounts[dept] || 0) + 1
          }
        })
      }
      setDepartmentCounts(deptCounts)

      // Fetch year counts
      const { data: yearData } = await supabase
        .from('students')
        .select('year')
      
      const yearCounts: Record<string, number> = {}
      if (yearData) {
        yearData.forEach(student => {
          const year = student.year?.toLowerCase()
          if (year) {
            yearCounts[year] = (yearCounts[year] || 0) + 1
          }
        })
      }
      setYearCounts(yearCounts)
    } catch (error) {
      console.error('Error fetching student counts:', error)
    }
  }

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
    console.log('DEBUG: File selected:', file?.name, file?.type, file?.size)
    if (!file) {
      console.log('DEBUG: No file selected')
      return
    }

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

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    console.log('DEBUG: Local preview URL:', localPreview)
    setPoster(localPreview)
    setIsUploadingPoster(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('DEBUG: Uploading poster to API...')
      
      // Call API route directly
      const response = await fetch('/api/announcements/upload-poster', {
        method: 'POST',
        body: formData,
      })

      console.log('DEBUG: Response status:', response.status)
      const result = await response.json()
      console.log('DEBUG: Upload result:', result)

      if (result.success && result.url) {
        // Revoke local preview and use server URL
        URL.revokeObjectURL(localPreview)
        console.log('DEBUG: Setting poster URL from server:', result.url)
        setPoster(result.url)
        setPosterPath(result.path || null)
        toast({
          title: "Poster Uploaded",
          description: "Announcement poster has been uploaded successfully.",
        })
      } else {
        // Keep local preview but show error
        setPosterPath(null)
        console.log('DEBUG: Upload failed, keeping local preview')
        throw new Error(result.error || 'Upload failed - using local preview')
      }
    } catch (error) {
      console.error('DEBUG: Upload error:', error)
      toast({
        title: "Upload Warning",
        description: error instanceof Error ? error.message : "Using local preview - save to persist",
        variant: "default",
      })
      // Keep local preview visible even if upload fails
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

      // Year mapping for normalization
      const yearMapping: { [key: string]: string } = {
        '1': 'first', '2': 'second', '3': 'third', '4': 'fourth',
        '1st': 'first', '2nd': 'second', '3rd': 'third', '4th': 'fourth'
      }

      if (targetType === "class") {
        // Specific classes: department + specific years
        dept = selectedDepartment.toLowerCase().trim()
        target_years = selectedYears.map(y => yearMapping[y.toLowerCase()] || y.toLowerCase())
      } else if (targetType === "department") {
        // Specific department: all years
        dept = selectedTarget.toLowerCase().trim()
        target_years = ['first', 'second', 'third', 'fourth'] // All years
      } else if (targetType === "university") {
        // University-wide
        dept = null // null means all departments
        target_years = ['first', 'second', 'third', 'fourth']
      }

      console.log('DEBUG: Creating announcement with dept:', dept, 'target_years:', target_years)
      console.log('DEBUG: Poster URL being sent:', poster)
      console.log('DEBUG: Poster path:', posterPath)

      // Call API route - use /api/announcements which has service role client
      const response = await fetch('/api/announcements', {
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
          poster_url: poster || null,
          date: date || null,
          time: time || null,
          venue: venue || null,
        }),
      })

      const result = await response.json()
      console.log('DEBUG: API response:', result)
      console.log('DEBUG: Saved announcement poster_url:', result.data?.poster_url)

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
                            className="justify-between"
                            onClick={() => setSelectedDepartment(dept.id)}
                          >
                            <span>{dept.name}</span>
                            <Badge variant="secondary">{departmentCounts[dept.id] || 0}</Badge>
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
                          src={poster}
                          alt="Announcement Poster"
                          className="max-h-[300px] mx-auto rounded-md object-contain"
                          onLoad={() => console.log('DEBUG: Announcement poster loaded successfully:', poster)}
                          onError={(e) => {
                            console.error('DEBUG: Announcement poster failed to load:', poster)
                            if (poster.startsWith('blob:')) {
                              console.log('DEBUG: Blob URL may have been revoked prematurely')
                            }
                          }}
                        />
                        {isUploadingPoster && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </div>
                          </div>
                        )}
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
        <div className="grid gap-6">
          {announcements.map((announcement) => {
            // Determine target display
            let targetDisplay = "All University"
            if (announcement.department && announcement.target_years?.length > 0) {
              targetDisplay = `${announcement.department.toUpperCase()} - ${announcement.target_years.map((y: string) => y.charAt(0).toUpperCase() + y.slice(1) + ' Year').join(', ')}`
            } else if (announcement.department) {
              targetDisplay = `${announcement.department.toUpperCase()} (All Years)`
            }
            
            return (
              <Card key={announcement.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="md:flex">
                    {announcement.poster_url && (
                      <div className="md:w-1/3 flex-shrink-0">
                        <img
                          src={announcement.poster_url}
                          alt={announcement.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-6 ${announcement.poster_url ? 'md:w-2/3' : 'w-full'}`}>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h3>
                        <p className="text-gray-600 mb-3">{announcement.content}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          {announcement.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{announcement.date}</span>
                            </div>
                          )}
                          {announcement.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{announcement.time}</span>
                            </div>
                          )}
                          {announcement.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{announcement.venue}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary">{targetDisplay}</Badge>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            {new Date(announcement.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
