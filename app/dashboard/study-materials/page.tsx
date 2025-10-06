"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Upload,
  Download,
  FileText,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  File,
  Image,
  FileSpreadsheet,
  FileVideo,
  Folder,
  Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function FacultyStudyMaterialsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    department: "",
    year: "",
    file: null as File | null
  })

  useEffect(() => {
    const facultySession = localStorage.getItem("facultySession")
    const currentUserData = localStorage.getItem("currentUser")

    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
        setSelectedDepartment(user.department || "")
        setUploadForm(prev => ({ ...prev, department: user.department || "" }))
      } catch (error) {
        console.error("Error parsing faculty session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
        setSelectedDepartment(user.department || "")
        setUploadForm(prev => ({ ...prev, department: user.department || "" }))
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }

    // Load study materials from localStorage
    const savedMaterials = localStorage.getItem("studyMaterials")
    if (savedMaterials) {
      try {
        setStudyMaterials(JSON.parse(savedMaterials))
      } catch (error) {
        console.error("Error parsing study materials:", error)
      }
    }
  }, [])

  const departments = [
    "Computer Science Engineering",
    "Artificial Intelligence & Data Science", 
    "Artificial Intelligence & Machine Learning",
    "Cyber Security"
  ]

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year"]

  const subjects = [
    "Data Structures",
    "Database Management",
    "Programming",
    "Computer Networks",
    "Operating Systems",
    "Software Engineering",
    "Machine Learning",
    "Artificial Intelligence",
    "Cyber Security Fundamentals",
    "Mathematics",
    "Physics",
    "Chemistry"
  ]

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadForm(prev => ({ ...prev, file }))
    }
  }

  const handleUploadSubmit = () => {
    if (uploadForm.file && uploadForm.title && uploadForm.subject && uploadForm.department && uploadForm.year) {
      const newMaterial = {
        id: Date.now().toString(),
        title: uploadForm.title,
        description: uploadForm.description,
        subject: uploadForm.subject,
        department: uploadForm.department,
        year: uploadForm.year,
        type: getFileType(uploadForm.file.name),
        fileName: uploadForm.file.name,
        uploadedBy: currentUser?.name || "Faculty",
        uploadedAt: new Date().toISOString(),
        size: uploadForm.file.size
      }

      const updatedMaterials = [...studyMaterials, newMaterial]
      setStudyMaterials(updatedMaterials)
      localStorage.setItem("studyMaterials", JSON.stringify(updatedMaterials))
      
      // Reset form
      setUploadForm({
        title: "",
        description: "",
        subject: "",
        department: currentUser?.department || "",
        year: "",
        file: null
      })
      setIsUploadDialogOpen(false)
    }
  }

  const deleteMaterial = (id: string) => {
    const updatedMaterials = studyMaterials.filter(m => m.id !== id)
    setStudyMaterials(updatedMaterials)
    localStorage.setItem("studyMaterials", JSON.stringify(updatedMaterials))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredMaterials = studyMaterials.filter(material => 
    (!selectedDepartment || material.department === selectedDepartment) &&
    (!selectedYear || material.year === selectedYear) &&
    (!selectedSubject || material.subject === selectedSubject)
  )

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
            <p className="text-purple-100">
              Upload and manage study materials for your students
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Study Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
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
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Year</label>
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
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">File</label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleUploadSubmit}
                    className="w-full"
                    disabled={!uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.year}
                  >
                    Upload Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
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
                const uploadDate = new Date(m.uploadedAt)
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
            Study Materials ({filteredMaterials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No study materials uploaded yet</p>
              <p className="text-sm">Upload your first material to get started</p>
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
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(material.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{material.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <Badge variant="secondary">{material.subject}</Badge>
                          <Badge variant="outline">{material.department}</Badge>
                          <Badge variant="outline">{material.year}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(material.uploadedAt).toLocaleDateString()}
                          </span>
                          <span>{formatFileSize(material.size)}</span>
                          <span>{material.fileName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMaterial(material.id)}
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
