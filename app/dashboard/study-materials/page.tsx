"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Upload,
  Download,
  FileText,
  Calendar,
  Plus,
  Trash2,
  Eye,
  Search,
  File,
  Image,
  FileSpreadsheet,
  FileVideo,
  Folder,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  MapPin,
  Users,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

const MAX_FILE_SIZE = 70 * 1024 * 1024 // 70MB

export default function FacultyStudyMaterialsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [showSummaryPreview, setShowSummaryPreview] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [summarizingMaterialId, setSummarizingMaterialId] = useState<string | null>(null)
  
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    year: "",
    file: null as File | null
  })

  const facultyDepartment = currentUser?.department || ""
  
  const years = [
    { value: "1st", label: "1st Year" },
    { value: "2nd", label: "2nd Year" },
    { value: "3rd", label: "3rd Year" },
    { value: "4th", label: "4th Year" }
  ]

  useEffect(() => {
    loadFacultyData()
    
    return () => {
      // Cleanup subscription on unmount
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadStudyMaterials()
      loadAssignedSubjects()
      setupRealtimeSubscription()
    }
  }, [currentUser])

  const setupRealtimeSubscription = () => {
    if (!currentUser?.id) return
    
    // Subscribe to study_materials changes
    const channel = supabase
      .channel('study-materials-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_materials',
          filter: `faculty_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Study material change:', payload)
          if (payload.eventType === 'INSERT') {
            setStudyMaterials(prev => [payload.new as any, ...prev])
            toast({
              title: "Material Added",
              description: "New study material uploaded successfully"
            })
          } else if (payload.eventType === 'DELETE') {
            setStudyMaterials(prev => prev.filter(m => m.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setStudyMaterials(prev => 
              prev.map(m => m.id === payload.new.id ? payload.new as any : m)
            )
          }
        }
      )
      .subscribe()
    
    setSubscription(channel)
  }

  const loadFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // First try to find by ID
        const { data: faculty, error } = await supabase
          .from('faculty')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (faculty && !error) {
          setCurrentUser(faculty)
          return
        }
        
        // If not found by ID, try to find by email and update the ID
        if (error?.code === 'PGRST116') {
          const { data: existingFaculty } = await supabase
            .from('faculty')
            .select('*')
            .eq('email', user.email)
            .single()
          
          if (existingFaculty) {
            // Update the existing record with the correct auth ID
            const { data: updatedFaculty, error: updateError } = await supabase
              .from('faculty')
              .update({ id: user.id })
              .eq('email', user.email)
              .select()
              .single()
            
            if (updatedFaculty && !updateError) {
              setCurrentUser(updatedFaculty)
              console.log('Updated faculty record with correct ID:', updatedFaculty)
            } else {
              // If update fails, use existing faculty data
              setCurrentUser(existingFaculty)
            }
          } else {
            // No existing record, create new one
            const newFaculty = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Faculty',
              department: user.user_metadata?.department || '',
              created_at: new Date().toISOString()
            }
            
            const { data: createdFaculty, error: createError } = await supabase
              .from('faculty')
              .insert(newFaculty)
              .select()
              .single()
            
            if (createdFaculty && !createError) {
              setCurrentUser(createdFaculty)
              console.log('Created new faculty record:', createdFaculty)
            } else {
              console.error('Failed to create faculty record:', createError)
            }
          }
        } else {
          console.error('Error loading faculty:', error)
        }
      }
    } catch (error) {
      console.error('Error loading faculty data:', error)
    }
  }

  const loadStudyMaterials = async () => {
    if (!currentUser) return
    
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('faculty_id', currentUser.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setStudyMaterials(data)
      } else {
        console.log('No study materials found:', error)
        setStudyMaterials([])
      }
    } catch (error) {
      console.error('Error loading study materials:', error)
      setStudyMaterials([])
    }
  }

  const loadAssignedSubjects = async () => {
    if (!facultyDepartment) return
    
    try {
      // Load subjects assigned by dean for this department
      const { data, error } = await supabase
        .from('assigned_subjects')
        .select('*')
        .eq('department', facultyDepartment)
        .eq('status', 'active')
        .order('subject_name')
      
      if (!error && data && data.length > 0) {
        setAssignedSubjects(data)
      } else {
        console.log('No assigned subjects found for department:', facultyDepartment)
        setAssignedSubjects([])
      }
    } catch (error) {
      console.error('Error loading assigned subjects:', error)
      setAssignedSubjects([])
    }
  }

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "pdf": return <FileText className="h-6 w-6 text-red-600" />
      case "video": return <FileVideo className="h-6 w-6 text-purple-600" />
      case "image": return <Image className="h-6 w-6 text-green-600" />
      case "spreadsheet": return <FileSpreadsheet className="h-6 w-6 text-blue-600" />
      default: return <File className="h-6 w-6 text-gray-600" />
    }
  }

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'PDF'
      case 'doc':
      case 'docx': return 'Document'
      case 'xls':
      case 'xlsx': return 'Spreadsheet'
      case 'ppt':
      case 'pptx': return 'Presentation'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image'
      case 'mp4':
      case 'avi':
      case 'mov': return 'Video'
      default: return 'File'
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      // File is larger than 70MB - need to summarize
      toast({
        title: "Large File Detected",
        description: `File is ${formatFileSize(file.size)}. We'll create an AI summary for students.`,
      })
      
      setIsSummarizing(true)
      setUploadForm(prev => ({ ...prev, file }))
      
      // Summarize using Groq
      await summarizeFile(file)
    } else {
      setUploadForm(prev => ({ ...prev, file }))
      toast({
        title: "File Selected",
        description: `${file.name} (${formatFileSize(file.size)})`,
      })
    }
  }

  const summarizeFile = async (file: File) => {
    try {
      // Call Groq API for summarization
      const response = await fetch('/api/groq/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          context: uploadForm.title || 'Study Material',
          subject: uploadForm.subject
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setShowSummaryPreview(true)
      } else {
        // Generate a basic summary
        setSummary(`This study material covers ${uploadForm.subject || 'the subject'}. File: ${file.name}. Please refer to the original document for detailed content.`)
        setShowSummaryPreview(true)
      }
    } catch (error) {
      console.error('Error summarizing file:', error)
      setSummary(`Study material for ${uploadForm.subject || 'the subject'}. Original file: ${file.name}`)
      setShowSummaryPreview(true)
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleUploadSubmit = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.year) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const file = uploadForm.file
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const filePath = `${facultyDepartment}/${uploadForm.year}/${fileName}`

      // Upload to Supabase Storage
      setUploadProgress(20)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      setUploadProgress(40)
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Auto-summarize PDF files
      let summaryText = null
      let summaryUrl = null
      let summaryFileName = null

      const isPdf = file.name.toLowerCase().endsWith('.pdf') || uploadForm.file?.type === 'application/pdf'
      
      if (isPdf) {
        setUploadProgress(50)
        toast({
          title: "Generating AI Summary...",
          description: "Please wait while we summarize your PDF",
        })
        
        try {
          const summarizeResponse = await fetch('/api/study-materials/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              materialId: 'temp', // Will be updated after insert
              fileUrl: publicUrl,
              fileName: file.name,
              fileType: 'PDF',
              facultyId: currentUser.id,
              department: facultyDepartment,
              year: uploadForm.year,
              title: uploadForm.title
            })
          })

          if (summarizeResponse.ok) {
            const summaryData = await summarizeResponse.json()
            summaryText = summaryData.summary
            summaryUrl = summaryData.summaryUrl
            summaryFileName = summaryData.summaryFileName
            setUploadProgress(80)
          }
        } catch (summarizeError) {
          console.error('Auto-summarize failed:', summarizeError)
          // Continue without summary if summarization fails
        }
      }

      setUploadProgress(85)
      
      // Save to database with summary info
      const { data: insertedData, error: dbError } = await supabase
        .from('study_materials')
        .insert({
          faculty_id: currentUser.id,
          title: uploadForm.title,
          description: uploadForm.description,
          subject: uploadForm.subject,
          department: facultyDepartment,
          year: uploadForm.year,
          file_name: file.name,
          file_url: publicUrl,
          file_type: getFileType(file.name),
          file_size: file.size,
          summary: summaryText,
          has_summary: !!summaryText,
          summary_url: summaryUrl,
          summary_file_name: summaryFileName
        })
        .select()
        .single()

      if (dbError) throw dbError

      // If we have summary but need to update the material ID reference
      if (summaryUrl && insertedData) {
        // The summary was already uploaded, just need to ensure DB is consistent
        await supabase
          .from('study_materials')
          .update({
            summary: summaryText,
            has_summary: true,
            summary_url: summaryUrl,
            summary_file_name: summaryFileName
          })
          .eq('id', insertedData.id)
      }

      setUploadProgress(95)

      // Send notification to students
      await supabase
        .from('notifications')
        .insert({
          user_type: 'student',
          content_type: 'study_material',
          content_id: insertedData?.id,
          department: facultyDepartment,
          target_years: [uploadForm.year],
          title: 'New Study Material',
          message: `${uploadForm.title} uploaded${summaryText ? ' with AI Summary' : ''}`,
          created_by: currentUser.id
        })

      setUploadProgress(100)
      
      toast({
        title: "Upload Successful!",
        description: summaryText 
          ? "Study material uploaded with AI summary. Students can view both files."
          : "Study material uploaded and students notified",
      })

      // Reset form
      setUploadForm({
        title: "",
        description: "",
        subject: "",
        year: "",
        file: null
      })
      setSummary(null)
      setShowSummaryPreview(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      loadStudyMaterials()

    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload study material",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const deleteMaterial = async (id: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/study-materials/')
      const filePath = urlParts[1] || ''

      // Delete from storage
      if (filePath) {
        await supabase.storage
          .from('study-materials')
          .remove([filePath])
      }

      // Delete from database
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id)

      if (!error) {
        setStudyMaterials(prev => prev.filter(m => m.id !== id))
        toast({
          title: "Material Deleted",
          description: "Study material removed successfully"
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const summarizeMaterial = async (material: any) => {
    setSummarizingMaterialId(material.id)
    
    try {
      // Call new API that extracts content from actual file
      const response = await fetch('/api/study-materials/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: material.id,
          fileUrl: material.file_url,
          fileName: material.file_name,
          fileType: material.file_type,
          facultyId: currentUser.id,
          department: material.department,
          year: material.year,
          title: material.title
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Update local state with new summary info
        setStudyMaterials(prev => 
          prev.map(m => m.id === material.id 
            ? { 
                ...m, 
                summary: data.summary, 
                has_summary: true,
                summary_url: data.summaryUrl,
                summary_file_name: data.summaryFileName
              }
            : m
          )
        )

        toast({
          title: "Summary Generated",
          description: "AI summary created from file content. Students can now view both the original material and download the summary."
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }
    } catch (error: any) {
      console.error('Summarize error:', error)
      toast({
        title: "Summarization Failed",
        description: error.message || "Failed to generate summary",
        variant: "destructive"
      })
    } finally {
      setSummarizingMaterialId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Materials Management</h1>
            <p className="text-purple-100 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Department: <span className="font-semibold">{facultyDepartment}</span>
              <Badge variant="secondary" className="ml-2">Locked</Badge>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-purple-900">
              {studyMaterials.length} Materials
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Upload Section - Inline instead of popup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Study Material
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter material title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter material description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Select 
                    value={uploadForm.subject} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedSubjects.length > 0 ? (
                        assignedSubjects.map((subj) => (
                          <SelectItem key={subj.id} value={subj.subject_name || subj.name}>
                            {subj.subject_name || subj.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-center text-gray-500">
                          <p className="text-sm">No subjects assigned yet</p>
                          <p className="text-xs mt-1">Contact your dean to assign subjects</p>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {assignedSubjects.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Waiting for dean to assign subjects for {facultyDepartment}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Year *</label>
                  <Select 
                    value={uploadForm.year} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, year: value }))}
                  >
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
              
              <div>
                <label className="block text-sm font-medium mb-2">File * (Max 70MB)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                  className="w-full p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Files larger than 70MB will be summarized using AI
                </p>
              </div>
            </div>

            {/* Right side - File Preview & Progress */}
            <div className="space-y-4">
              {/* Selected File Info */}
              {uploadForm.file && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(getFileType(uploadForm.file.name))}
                      <div className="flex-1">
                        <p className="font-medium">{uploadForm.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadForm.file.size)}
                          {uploadForm.file.size > MAX_FILE_SIZE && (
                            <Badge variant="destructive" className="ml-2">Large File - AI Summary</Badge>
                          )}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setUploadForm(prev => ({ ...prev, file: null }))
                          setSummary(null)
                          setShowSummaryPreview(false)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Summary Preview */}
              {showSummaryPreview && summary && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      AI Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700">{summary}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      This summary will be shown to students along with the file
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Summarizing Progress */}
              {isSummarizing && (
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="text-sm">AI is summarizing your large file...</span>
                </div>
              )}

              {/* Upload Button */}
              <Button 
                onClick={handleUploadSubmit}
                className="w-full"
                disabled={!uploadForm.file || !uploadForm.title || !uploadForm.year || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Publish to Students
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Students of {facultyDepartment} - selected year will be notified in real-time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {studyMaterials.length}
            </div>
            <p className="text-sm text-gray-600">Total Materials</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {new Set(studyMaterials.map(m => m.subject)).size}
            </div>
            <p className="text-sm text-gray-600">Subjects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {studyMaterials.filter(m => m.has_summary).length}
            </div>
            <p className="text-sm text-gray-600">AI Summarized</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {studyMaterials.filter(m => {
                const uploadDate = new Date(m.created_at)
                const today = new Date()
                return uploadDate.toDateString() === today.toDateString()
              }).length}
            </div>
            <p className="text-sm text-gray-600">Uploaded Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Uploaded Materials ({studyMaterials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studyMaterials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No study materials uploaded yet</p>
              <p className="text-sm">Upload your first material above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studyMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(material.file_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{material.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <Badge variant="secondary">{material.subject}</Badge>
                          <Badge variant="outline">{material.year} Year</Badge>
                          {material.has_summary && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Summary
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(material.created_at).toLocaleDateString()}
                          </span>
                          <span>{formatFileSize(material.file_size)}</span>
                          <span>{material.file_name}</span>
                        </div>
                        
                        {/* Show summary if available */}
                        {material.summary && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs font-medium text-purple-700 mb-1">AI Summary:</p>
                            <p className="text-xs text-gray-600">{material.summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a')
                          a.href = material.file_url
                          a.download = material.file_name
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMaterial(material.id, material.file_url)}
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
    </div>
  )
}
