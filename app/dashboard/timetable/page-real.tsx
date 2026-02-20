"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Upload,
  Download,
  FileText,
  Users,
  BookOpen,
  Trash2,
  Eye,
  Clock,
  Bot,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { uploadTimetableToSupabase, getFacultyTimetables, deleteTimetable, type ScheduleDay } from "./actions"
import OCRExtractor from "@/components/timetable/OCRExtractor"

export default function RealTimetablePage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadedTimetables, setUploadedTimetables] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [showOCRDialog, setShowOCRDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [ocrResults, setOcrResults] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const departments = ["CSE", "CYBER", "AIDS", "AIML"]
  const years = ["first", "second", "third", "fourth"]

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      loadTimetables()
      
      // Real-time subscription
      const channel = supabase
        .channel('timetables_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'timetables',
            filter: `faculty_id=eq.${currentUser.id}`
          },
          () => {
            loadTimetables()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [currentUser])

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profile) {
        setCurrentUser({ id: user.id, ...profile })
        setSelectedDepartment(profile.department || "")
      }
    }
  }

  const loadTimetables = async () => {
    if (!currentUser?.id) return
    
    const result = await getFacultyTimetables(currentUser.id)
    if (result.success && result.data) {
      setUploadedTimetables(result.data)
    }
  }

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
      handleFileSelect(file)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedDepartment && selectedYear) {
      handleFileSelect(file)
      event.target.value = ""
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setShowOCRDialog(true)
  }

  const handleOCRComplete = async (extractedData: any) => {
    setOcrResults(extractedData)
  }

  const handleSaveTimetable = async () => {
    if (!selectedFile || !ocrResults || !currentUser?.id) return

    setIsUploading(true)

    try {
      const result = await uploadTimetableToSupabase(
        selectedFile,
        selectedDepartment,
        selectedYear,
        currentUser.id,
        ocrResults.schedule
      )

      if (result.success) {
        toast({
          title: "Success!",
          description: "Timetable uploaded and extracted successfully",
        })
        
        setShowOCRDialog(false)
        setSelectedFile(null)
        setOcrResults(null)
        loadTimetables()
      } else {
        toast({
          title: "Error",
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
        title: "Deleted",
        description: "Timetable deleted successfully"
      })
      loadTimetables()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete timetable",
        variant: "destructive"
      })
    }
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              Real-Time Timetable Management
            </h1>
            <p className="text-blue-100">
              Upload timetables with AI-powered OCR extraction - No static data!
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Bot className="h-4 w-4 mr-1" />
            Real OCR + Supabase
          </Badge>
        </div>
      </motion.div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            Upload Timetable
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
                      {year.charAt(0).toUpperCase() + year.slice(1)} Year
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
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!selectedDepartment || !selectedYear}
            />
            <label
              htmlFor="timetable-upload"
              className={`cursor-pointer ${!selectedDepartment || !selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? 'Drop timetable here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, JPG, PNG (Max 10MB)
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
                const uploadDate = new Date(t.uploaded_at)
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
            Uploaded Timetables (Real Data from Supabase)
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
                          {timetable.schedule_data && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              OCR Extracted
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(timetable.file_url, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
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

      {/* OCR Dialog */}
      <Dialog open={showOCRDialog} onOpenChange={setShowOCRDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI-Powered OCR Extraction
            </DialogTitle>
          </DialogHeader>
          
          {selectedFile && !ocrResults && (
            <OCRExtractor
              file={selectedFile}
              onExtractionComplete={handleOCRComplete}
              onCancel={() => {
                setShowOCRDialog(false)
                setSelectedFile(null)
              }}
            />
          )}

          {ocrResults && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Extraction Complete!</h3>
                </div>
                <p className="text-sm text-green-600">
                  Successfully extracted {ocrResults.schedule?.length || 0} days of schedule data
                </p>
              </div>

              <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto">
                <h4 className="font-semibold mb-3">Extracted Schedule:</h4>
                {ocrResults.schedule?.map((daySchedule: ScheduleDay, idx: number) => (
                  <div key={idx} className="mb-4">
                    <Badge className="mb-2">{daySchedule.day}</Badge>
                    <div className="space-y-2 ml-4">
                      {daySchedule.lectures.map((lecture: any, lecIdx: number) => (
                        <div key={lecIdx} className="text-sm flex gap-3 items-start">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {lecture.time}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium">{lecture.subject}</div>
                            <div className="text-gray-600 text-xs">
                              {lecture.faculty} • {lecture.room} • {lecture.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOCRDialog(false)
                    setSelectedFile(null)
                    setOcrResults(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTimetable}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save to Supabase
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
