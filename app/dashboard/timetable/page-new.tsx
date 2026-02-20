"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Upload,
  Download,
  FileText,
  Users,
  BookOpen,
  Trash2,
  Eye,
  CalendarDays,
  MapPin,
  User,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import OCRExtractor from "@/components/timetable/OCRExtractor"
import { uploadTimetableToSupabase, getFacultyTimetables, deleteTimetable } from "./actions"
import { createClient } from "@/lib/supabase/client"

interface TimetableData {
  id: string
  faculty_id: string
  department: string
  year: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
  schedule_data: any[]
}

export default function FacultyTimetablePage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadedTimetables, setUploadedTimetables] = useState<TimetableData[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showOCRDialog, setShowOCRDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [viewTimetable, setViewTimetable] = useState<TimetableData | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: facultyData } = await supabase
          .from("faculty")
          .select("*")
          .eq("email", user.email)
          .single()
        
        if (facultyData) {
          setCurrentUser(facultyData)
          setSelectedDepartment(facultyData.department || "")
          loadTimetables(facultyData.id)
        }
      }
    }
    
    fetchUser()
  }, [])

  const loadTimetables = async (facultyId: string) => {
    const result = await getFacultyTimetables(facultyId)
    if (result.success && result.data) {
      setUploadedTimetables(result.data)
    }
  }

  const departments = [
    "Computer Science Engineering",
    "Artificial Intelligence & Data Science", 
    "Artificial Intelligence & Machine Learning",
    "Cyber Security"
  ]

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year"]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file && selectedDepartment && selectedYear) {
      processFile(file)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedDepartment && selectedYear) {
      processFile(file)
      event.target.value = ""
    }
  }

  const processFile = (file: File) => {
    // Check if file is an image (for OCR)
    if (file.type.startsWith("image/")) {
      setSelectedFile(file)
      setShowOCRDialog(true)
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG) for OCR extraction.",
        variant: "destructive"
      })
    }
  }

  const handleOCRComplete = async (extractedData: any) => {
    if (!selectedFile || !currentUser) return

    setIsUploading(true)
    setShowOCRDialog(false)

    try {
      const result = await uploadTimetableToSupabase(
        selectedFile,
        selectedDepartment,
        selectedYear,
        currentUser.id,
        extractedData.schedule
      )

      if (result.success) {
        toast({
          title: "Timetable Uploaded Successfully!",
          description: `Timetable for ${selectedDepartment} - ${selectedYear} has been saved.`
        })
        
        // Reload timetables
        await loadTimetables(currentUser.id)
        setSelectedFile(null)
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload timetable",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return

    const result = await deleteTimetable(id, fileUrl)
    
    if (result.success) {
      toast({
        title: "Timetable Deleted",
        description: "Timetable has been removed successfully."
      })
      
      if (currentUser) {
        await loadTimetables(currentUser.id)
      }
    } else {
      toast({
        title: "Delete Failed",
        description: result.error || "Failed to delete timetable",
        variant: "destructive"
      })
    }
  }

  const handleViewTimetable = (timetable: TimetableData) => {
    setViewTimetable(timetable)
    setShowViewDialog(true)
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

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "lecture": return "bg-blue-100 text-blue-800"
      case "practical": return "bg-green-100 text-green-800"
      case "tutorial": return "bg-purple-100 text-purple-800"
      case "project": return "bg-orange-100 text-orange-800"
      case "seminar": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
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
              Timetable Management with OCR
            </h1>
            <p className="text-blue-100">
              Upload timetable images and extract schedule data using AI-powered OCR
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <ImageIcon className="h-4 w-4 mr-1" />
              OCR Enabled
            </Badge>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Extract
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manage Timetables
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                Upload Timetable Image for OCR Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Department *</label>
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
                  <label className="block text-sm font-medium mb-2">Year *</label>
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
                  accept="image/*"
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
                    <ImageIcon className={`h-16 w-16 mx-auto mb-4 ${
                      isDragOver ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isDragOver ? 'Drop timetable image here' : 'Drag & drop or click to upload timetable image'}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Supports JPG, PNG, JPEG images
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
                      <p className="text-sm text-blue-800 font-medium">
                        📸 OCR will automatically extract schedule data from your image
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              
              {(!selectedDepartment || !selectedYear) && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Please select both department and year before uploading
                  </p>
                </div>
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
                    const uploadDate = new Date(t.uploaded_at)
                    const today = new Date()
                    return uploadDate.toDateString() === today.toDateString()
                  }).length}
                </div>
                <p className="text-sm text-gray-600">Uploaded Today</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Timetables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredTimetables.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No timetables uploaded yet</p>
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
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{timetable.file_name}</h4>
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
                                {new Date(timetable.uploaded_at).toLocaleDateString()}
                              </span>
                              <span>{formatFileSize(timetable.file_size)}</span>
                            </div>
                            {timetable.schedule_data && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {timetable.schedule_data.length} days extracted
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewTimetable(timetable)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Schedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(timetable.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(timetable.id, timetable.file_url)}
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
      </Tabs>

      {/* OCR Extraction Dialog */}
      <Dialog open={showOCRDialog} onOpenChange={setShowOCRDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              OCR Timetable Extraction
            </DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <OCRExtractor
              file={selectedFile}
              onExtractionComplete={handleOCRComplete}
              onCancel={() => {
                setShowOCRDialog(false)
                setSelectedFile(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Timetable Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Timetable Schedule - {viewTimetable?.department} ({viewTimetable?.year})
            </DialogTitle>
          </DialogHeader>
          {viewTimetable?.schedule_data && (
            <div className="space-y-6">
              {viewTimetable.schedule_data.map((daySchedule: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    {daySchedule.day}
                  </h3>
                  <div className="space-y-3">
                    {daySchedule.lectures?.map((lecture: any, lecIdx: number) => (
                      <div key={lecIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge className={getTypeColor(lecture.type)}>
                            {lecture.type || "Lecture"}
                          </Badge>
                          <div>
                            <h4 className="font-medium">{lecture.subject}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {lecture.faculty}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {lecture.room}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Clock className="h-4 w-4" />
                          {lecture.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Progress Dialog */}
      <Dialog open={isUploading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Uploading Timetable...
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-gray-600">Please wait while we save your timetable to the database.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
