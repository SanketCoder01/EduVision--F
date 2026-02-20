"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Upload,
  Download,
  FileText,
  Users,
  Trash2,
  Eye,
  File,
  Loader2,
  CheckCircle,
  Search,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { uploadStudyMaterial, getFacultyStudyMaterials, deleteStudyMaterial } from "./actions"

export default function FacultyStudyMaterialsPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    department: "",
    year: "",
    file: null as File | null
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const departments = ["CSE", "CYBER", "AIDS", "AIML"]
  const years = ["first", "second", "third", "fourth"]
  const subjects = [
    "Data Structures",
    "Database Management",
    "Programming",
    "Computer Networks",
    "Operating Systems",
    "Software Engineering",
    "Machine Learning",
    "Artificial Intelligence",
    "Web Development",
    "Mobile Computing"
  ]

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      loadStudyMaterials()
      
      // Real-time subscription
      const channel = supabase
        .channel('study_materials_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_materials',
            filter: `faculty_id=eq.${currentUser.id}`
          },
          () => {
            loadStudyMaterials()
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
        setUploadForm(prev => ({ 
          ...prev, 
          department: profile.department || "" 
        }))
      }
    }
  }

  const loadStudyMaterials = async () => {
    if (!currentUser?.id) return
    
    const result = await getFacultyStudyMaterials(currentUser.id)
    if (result.success && result.data) {
      setStudyMaterials(result.data)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 25MB",
          variant: "destructive"
        })
        return
      }
      setUploadForm(prev => ({ ...prev, file }))
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.subject || 
        !uploadForm.department || !uploadForm.year || !currentUser?.id) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadStudyMaterial(
        uploadForm.file,
        uploadForm.title,
        uploadForm.description,
        uploadForm.subject,
        uploadForm.department,
        uploadForm.year,
        currentUser.id,
        currentUser.name || "Faculty"
      )

      if (result.success) {
        toast({
          title: "Success!",
          description: "Study material uploaded successfully"
        })
        
        setIsUploadDialogOpen(false)
        setUploadForm({
          title: "",
          description: "",
          subject: "",
          department: currentUser.department || "",
          year: "",
          file: null
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        loadStudyMaterials()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload study material",
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
    if (!confirm("Are you sure you want to delete this study material?")) return

    const result = await deleteStudyMaterial(id, fileUrl)
    
    if (result.success) {
      toast({
        title: "Deleted",
        description: "Study material deleted successfully"
      })
      loadStudyMaterials()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete study material",
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈'
    return '📁'
  }

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesDept = !selectedDepartment || material.department === selectedDepartment
    const matchesYear = !selectedYear || material.year === selectedYear
    const matchesSubject = !selectedSubject || material.subject === selectedSubject
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesDept && matchesYear && matchesSubject && matchesSearch
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              Study Materials Management
            </h1>
            <p className="text-purple-100">
              Upload and manage study materials for your students
            </p>
          </div>
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Material
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
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
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year.charAt(0).toUpperCase() + year.slice(1)} Year
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {new Set(studyMaterials.map(m => m.department)).size}
            </div>
            <p className="text-sm text-gray-600">Departments</p>
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

      {/* Study Materials List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Study Materials ({filteredMaterials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No study materials found</p>
              <p className="text-sm">Upload your first study material to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">
                        {getFileIcon(material.file_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">
                          {material.title}
                        </h4>
                        {material.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {material.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {material.subject}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {material.department}
                          </span>
                          <span>
                            {material.year.charAt(0).toUpperCase() + material.year.slice(1)} Year
                          </span>
                          <span>{formatFileSize(material.file_size)}</span>
                          <span>{new Date(material.created_at).toLocaleDateString()}</span>
                        </div>
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
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(material.id, material.file_url)}
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Upload Study Material
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Data Structures Notes - Chapter 1"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Brief description of the material..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={uploadForm.department} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={uploadForm.year} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, year: value }))}
                >
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

            <div>
              <label className="block text-sm font-medium mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <Select 
                value={uploadForm.subject} 
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                File <span className="text-red-500">*</span>
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: PDF, Word, PowerPoint, Excel (Max 25MB)
              </p>
              {uploadForm.file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
