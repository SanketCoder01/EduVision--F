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
  Clock,
  ChevronDown,
  ChevronRight,
  Printer
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { FileUploader } from "@/components/file-uploader"

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
  
  const [summaryReportMaterial, setSummaryReportMaterial] = useState<any>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    year: "",
    files: [] as any[]
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
      // Map short code to full department name (as stored in department_subjects)
      const CODE_TO_FULL: Record<string, string> = {
        'CSE': 'Computer Science & Engineering',
        'CYBER': 'Cyber Security',
        'CY': 'Cyber Security',
        'AIDS': 'AI & Data Science',
        'AIML': 'AI & Machine Learning',
      }
      const deptFull = CODE_TO_FULL[facultyDepartment.toUpperCase()] || facultyDepartment

      // Load subjects assigned by dean for this department
      let { data, error } = await supabase
        .from('department_subjects')
        .select('*')
        .eq('department', deptFull)
        .order('subject_name')

      // Fallback: try raw dept value if nothing returned
      if ((!data || data.length === 0) && deptFull !== facultyDepartment) {
        const fb = await supabase
          .from('department_subjects')
          .select('*')
          .eq('department', facultyDepartment)
          .order('subject_name')
        if (!fb.error && fb.data && fb.data.length > 0) data = fb.data
      }

      if (!error && data && data.length > 0) {
        setAssignedSubjects(data)
      } else {
        console.log('No subjects found for department:', deptFull)
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

  // Removed single native file upload, replaced by FileUploader directly in JSX

  const formatAIResponse = (text: string) => {
    // Strip markdown chars and formulate to paragraphs
    let safe = text.replace(/[*#`_]/g, '')
    // Auto-split newlines
    const paragraphs = safe.split('\n').filter(p => p.trim() !== '')
    return paragraphs
  }

  const handleUploadSubmit = async () => {
    if (uploadForm.files.length === 0 || !uploadForm.title || !uploadForm.year) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields and select at least one file",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      let isFirstPdfSummarized = false
      let summaryText = null
      let summaryUrl = null
      let summaryFileName = null

      const totalFiles = uploadForm.files.length
      let fileCount = 0

      for (const res of uploadForm.files) {
        const file = res.file
        if (!file) continue
        fileCount++

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const filePath = `${facultyDepartment}/${uploadForm.year}/${fileName}`

        // Upload to Supabase Storage
        setUploadProgress(10 + (80 * fileCount) / totalFiles)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('study-materials')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('study-materials')
          .getPublicUrl(filePath)

        const publicUrl = urlData.publicUrl

        // Auto-summarize ONLY the first PDF file found
        const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
        if (isPdf && !isFirstPdfSummarized) {
          isFirstPdfSummarized = true
          toast({
            title: "Generating AI Summary...",
            description: "Please wait while we generate a summary for your PDF",
          })
          
          try {
            const summarizeResponse = await fetch('/api/study-materials/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                materialId: 'temp', 
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
            }
          } catch (summarizeError) {
            console.error('Auto-summarize failed:', summarizeError)
          }
        }

        // Save to database
        const normalizeDeptCode = (d: string) => {
          const s = (d || '').toLowerCase().trim()
          if (s === 'cse' || s.includes('computer science')) return 'cse'
          if (s === 'aiml' || s.includes('machine learning')) return 'aiml'
          if (s === 'aids' || s.includes('data science')) return 'aids'
          if (s === 'cyber' || s === 'cy' || s.includes('cyber') || s.includes('security')) return 'cyber'
          return s
        }
        await supabase
          .from('study_materials')
          .insert({
            faculty_id: currentUser.id,
            faculty_name: currentUser.name || currentUser.email?.split('@')[0] || 'Faculty',
            faculty_email: currentUser.email || '',
            title: uploadForm.title,
            description: uploadForm.description,
            subject: uploadForm.subject,
            department: normalizeDeptCode(facultyDepartment),
            year: uploadForm.year,
            file_name: file.name,
            file_url: publicUrl,
            file_type: getFileType(file.name),
            file_size: file.size,
            summary: summaryText,
            has_summary: !!summaryText,
            summary_url: summaryUrl,
            summary_file_name: summaryFileName,
            batch_id: uploadForm.title
          })
      }

      setUploadProgress(95)

      // Send notification to students
      await supabase
        .from('notifications')
        .insert({
          user_type: 'student',
          content_type: 'study_material',
          content_id: uploadForm.title,
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
        files: []
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

  // Group materials by batch_id or title
  const groupedMaterials = studyMaterials.reduce((acc, material) => {
    const key = material.batch_id || material.title || material.id
    if (!acc[key]) {
      acc[key] = {
        title: material.title,
        subject: material.subject,
        year: material.year,
        description: material.description,
        created_at: material.created_at,
        has_summary: material.has_summary,
        summary: material.summary,
        materials: []
      }
    }
    acc[key].materials.push(material)
    return acc
  }, {})

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
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
                <FileUploader
                  files={uploadForm.files}
                  onFilesChange={(files) => setUploadForm(prev => ({ ...prev, files }))}
                  label="Upload Materials (Max 50 Files)"
                  maxFiles={50}
                  allowedTypes={['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov']}
                  emptyState={
                    <div className="border border-dashed rounded-md p-6 text-center">
                      <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-medium text-purple-900 mb-2">Drag & Drop Resources</h3>
                      <p className="text-gray-500 text-sm mb-4">You can drop up to 50 study materials here.</p>
                      <Button variant="outline" type="button" onClick={() => {}}>Select Files</Button>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Right side - Progress & Actions */}
            <div className="space-y-4 flex flex-col justify-end">

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
                className="w-full h-12 text-md mt-4"
                disabled={uploadForm.files.length === 0 || !uploadForm.title || !uploadForm.year || isUploading}
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
              {Object.entries(groupedMaterials).map(([key, group]: [string, any]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 bg-white transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => toggleGroup(key)}>
                      <div className="p-2 border rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                        {expandedGroups[key] ? (
                           <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                           <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{group.title}</h4>
                          <Badge variant="secondary" className="ml-2 font-mono">{group.materials.length} resources</Badge>
                          {group.has_summary && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Summary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <Badge variant="outline">{group.subject || 'General'}</Badge>
                          <Badge variant="outline">{group.year} Year</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(group.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {group.has_summary && group.summary && (
                        <Button 
                          variant="default"
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 max-sm:px-2 max-sm:text-xs text-white shadow-sm flex items-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSummaryReportMaterial(group)
                          }}
                        >
                          <BookOpen className="h-4 w-4 mr-2 max-sm:mr-0" />
                          <span className="hidden sm:inline">View Summary Report</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Collapsible Children Files */}
                  {expandedGroups[key] && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2 mb-2">Attached Materials</p>
                      {group.materials.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 border border-gray-100">
                          <div className="flex items-center gap-3">
                            {getFileIcon(m.file_type)}
                            <div>
                              <p className="text-sm font-medium text-gray-800">{m.file_name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(m.file_size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => window.open(m.file_url, '_blank')}>
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="sm" onClick={() => {
                               const a = document.createElement('a'); a.href = m.file_url; a.download = m.file_name; a.click();
                             }}>
                               <Download className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="sm" onClick={() => deleteMaterial(m.id, m.file_url)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Report Modal */}
      <Dialog open={!!summaryReportMaterial} onOpenChange={(open) => !open && setSummaryReportMaterial(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none bg-white">
          <DialogHeader className="print:hidden border-b pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                AI Summary Report
              </DialogTitle>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="ml-auto flex items-center gap-1 bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100">
                <Printer className="h-4 w-4" /> Print PDF
              </Button>
            </div>
          </DialogHeader>

          {/* PDF Layout Content */}
          <div className="p-6 pt-2 text-black font-sans leading-relaxed print:p-0 print:block">
            {/* Header Block */}
            <div className="border-b-2 border-indigo-600 pb-4 mb-6">
              <h1 className="text-3xl font-black text-indigo-900 uppercase tracking-tight mb-2">
                {summaryReportMaterial?.title || "Study Material Report"}
              </h1>
              <div className="flex w-full justify-between items-end mt-4">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800">Faculty: <span className="font-normal text-gray-600">{currentUser?.name}</span></p>
                  <p className="font-semibold text-gray-800">Email: <span className="font-normal text-gray-600">{currentUser?.email}</span></p>
                  <p className="font-semibold text-gray-800">Department: <span className="font-normal text-gray-600">{currentUser?.department}</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-semibold text-gray-800">Subject: <span className="font-normal text-gray-600">{summaryReportMaterial?.subject || 'N/A'}</span></p>
                  <p className="font-semibold text-gray-800">Year: <span className="font-normal text-gray-600">{summaryReportMaterial?.year}</span></p>
                  <p className="font-semibold text-gray-800">Date: <span className="font-normal text-gray-600">{new Date(summaryReportMaterial?.created_at).toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>

            {/* Generated Content Block */}
            <div className="prose prose-sm md:prose-base max-w-none text-gray-800 prose-headings:text-indigo-900 prose-headings:font-bold prose-headings:mb-3 prose-p:mb-4">
              <h2 className="text-xl font-bold text-indigo-800 border-b pb-1 inline-block mb-4 mt-2">Executive Summary</h2>
              {(() => {
                const parts = formatAIResponse(summaryReportMaterial?.summary || "")
                const conclusionIdx = parts.findIndex(p => p.toLowerCase().includes('conclusion'))
                
                const summaryPoints = conclusionIdx >= 0 ? parts.slice(0, conclusionIdx) : parts
                const conclusionStr = conclusionIdx >= 0 ? parts.slice(conclusionIdx).join(' ') : null
                
                return (
                  <>
                    <p className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 text-gray-700 italic">
                      This document presents a unified abstract and critical findings compiled from the submitted study material batch. Please refer to the source attachments for intensive study.
                    </p>
                    
                    <h3 className="text-lg font-bold text-indigo-800 mt-6 mb-3">Important Points</h3>
                    <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500 bg-white">
                      {summaryPoints.map((point, idx) => {
                         // remove potential list markers that survived
                         const clean = point.replace(/^[\d\.\-\*]+\s*/, '').trim()
                         if (!clean) return null
                         return <li key={idx} className="text-gray-700 leading-snug">{clean}</li>
                      })}
                    </ul>

                    {conclusionStr && (
                      <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-200">
                         <h3 className="text-lg font-bold text-indigo-800 mb-3">Conclusion</h3>
                         <p className="text-gray-700 leading-relaxed font-semibold">
                           {conclusionStr.replace(/^conclusion:?\s*/i, '')}
                         </p>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
