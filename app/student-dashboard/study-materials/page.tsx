"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Folder,
  File,
  Image,
  FileSpreadsheet,
  FileVideo,
  Star,
  Clock,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function StudentStudyMaterialsPage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [viewMode, setViewMode] = useState<'subjects' | 'materials'>('subjects')
  const [currentSubject, setCurrentSubject] = useState<string>("")

  useEffect(() => {
    const studentSession = localStorage.getItem("studentSession")
    const currentUserData = localStorage.getItem("currentUser")

    let user = null
    if (studentSession) {
      try {
        user = JSON.parse(studentSession)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
      }
    } else if (currentUserData) {
      try {
        user = JSON.parse(currentUserData)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }

    // Load study materials from localStorage
    const savedMaterials = localStorage.getItem("studyMaterials")
    if (savedMaterials) {
      try {
        const materials = JSON.parse(savedMaterials)
        // Filter materials for current user's department and year
        const userMaterials = materials.filter((material: any) => 
          material.department === user?.department &&
          material.year === user?.year
        )
        setStudyMaterials(userMaterials)
      } catch (error) {
        console.error("Error parsing study materials:", error)
      }
    } else {
      // Enhanced sample data with more subjects
      const sampleMaterials = [
        {
          id: "1",
          title: "Data Structures - Lecture Notes",
          subject: "Data Structures",
          type: "PDF",
          description: "Complete lecture notes covering arrays, linked lists, stacks, and queues",
          uploadedBy: "Dr. Smith",
          uploadedAt: "2024-01-15",
          size: 2500000,
          department: user?.department || "Computer Science Engineering",
          year: user?.year || "first",
          fileUrl: "/sample-files/data-structures-notes.pdf"
        },
        {
          id: "2", 
          title: "Database Design Tutorial",
          subject: "Database Management",
          type: "Video",
          description: "Step-by-step tutorial on database design principles",
          uploadedBy: "Prof. Johnson",
          uploadedAt: "2024-01-10",
          size: 15000000,
          department: user?.department || "Computer Science Engineering",
          year: user?.year || "first",
          fileUrl: "/sample-files/database-tutorial.mp4"
        },
        {
          id: "3",
          title: "Programming Exercises",
          subject: "Java Programming",
          type: "Document",
          description: "Practice problems and solutions for Java programming",
          uploadedBy: "Dr. Brown",
          uploadedAt: "2024-01-08",
          size: 1200000,
          department: user?.department || "Computer Science Engineering", 
          year: user?.year || "first",
          fileUrl: "/sample-files/java-exercises.docx"
        },
        {
          id: "4",
          title: "Network Protocols Guide",
          subject: "Computer Networks",
          type: "PDF",
          description: "Comprehensive guide to TCP/IP, HTTP, and other network protocols",
          uploadedBy: "Prof. Wilson",
          uploadedAt: "2024-01-12",
          size: 3200000,
          department: user?.department || "Computer Science Engineering",
          year: user?.year || "first",
          fileUrl: "/sample-files/network-protocols.pdf"
        },
        {
          id: "5",
          title: "Python Basics Tutorial",
          subject: "Python Programming",
          type: "Video",
          description: "Introduction to Python programming with examples",
          uploadedBy: "Dr. Davis",
          uploadedAt: "2024-01-09",
          size: 12000000,
          department: user?.department || "Computer Science Engineering",
          year: user?.year || "first",
          fileUrl: "/sample-files/python-basics.mp4"
        },
        {
          id: "6",
          title: "Operating System Concepts",
          subject: "Operating Systems",
          type: "PDF",
          description: "Process management, memory management, and file systems",
          uploadedBy: "Prof. Miller",
          uploadedAt: "2024-01-11",
          size: 4100000,
          department: user?.department || "Computer Science Engineering",
          year: user?.year || "first",
          fileUrl: "/sample-files/os-concepts.pdf"
        },
        {
          id: "7",
          title: "Web Development Lab Manual",
          subject: "Web Development",
          type: "Document",
          description: "HTML, CSS, JavaScript lab exercises and projects",
          uploadedBy: "Dr. Taylor",
          uploadedAt: "2024-01-13",
          size: 2800000,
          department: user?.department || "Computer Science Engineering",
          year: user?.year || "first",
          fileUrl: "/sample-files/web-dev-manual.docx"
        }
      ]
      setStudyMaterials(sampleMaterials)
      localStorage.setItem("studyMaterials", JSON.stringify(sampleMaterials))
    }
  }, [])

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return <FileText className="h-6 w-6 text-red-600" />
      case "video": return <FileVideo className="h-6 w-6 text-purple-600" />
      case "image": return <Image className="h-6 w-6 text-green-600" />
      case "spreadsheet": return <FileSpreadsheet className="h-6 w-6 text-blue-600" />
      default: return <File className="h-6 w-6 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const subjects = [...new Set(studyMaterials.map(material => material.subject))]
  const types = [...new Set(studyMaterials.map(material => material.type))]

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || selectedSubject === "all" || material.subject === selectedSubject
    const matchesType = !selectedType || selectedType === "all" || material.type === selectedType
    
    return matchesSearch && matchesSubject && matchesType
  })

  const getSubjectMaterials = (subject: string) => {
    return studyMaterials.filter(material => material.subject === subject)
  }

  const handleViewMaterial = (material: any) => {
    // Open material in new tab
    const viewUrl = material.fileUrl || `#view-${material.id}`
    window.open(viewUrl, '_blank')
    
    toast({
      title: "Opening Material",
      description: `Opening ${material.title} in new tab`,
    })
  }

  const handleDownloadMaterial = (material: any) => {
    // Simulate download
    const link = document.createElement('a')
    link.href = material.fileUrl || `#download-${material.id}`
    link.download = `${material.title}.${material.type.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download Started",
      description: `Downloading ${material.title}`,
    })
  }

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'computer networks':
      case 'computer network':
        return '🌐'
      case 'java programming':
      case 'java':
        return '☕'
      case 'python programming':
      case 'python':
        return '🐍'
      case 'data structures':
        return '📊'
      case 'database management':
        return '🗄️'
      case 'operating systems':
        return '💻'
      case 'web development':
        return '🌍'
      default:
        return '📚'
    }
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
            <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
            <p className="text-purple-100">
              {viewMode === 'subjects' ? 'Browse materials by subject' : `Materials for ${currentSubject}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {viewMode === 'materials' && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setViewMode('subjects')
                  setCurrentSubject('')
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subjects
              </Button>
            )}
            <Button variant="secondary" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters - Only show in materials view */}
      {viewMode === 'materials' && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {studyMaterials.length}
            </div>
            <p className="text-sm text-gray-600">Total Materials</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {subjects.length}
            </div>
            <p className="text-sm text-gray-600">Subjects</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {studyMaterials.filter(m => m.type === "PDF").length}
            </div>
            <p className="text-sm text-gray-600">PDF Documents</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {studyMaterials.filter(m => m.type === "Video").length}
            </div>
            <p className="text-sm text-gray-600">Video Materials</p>
          </div>
        </div>
      </div>

      {/* Subject View or Materials List */}
      <AnimatePresence mode="wait">
        {viewMode === 'subjects' ? (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-lg shadow-lg"
          >
            <div className="p-6 pb-0">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Browse by Subject ({subjects.length} subjects)
              </h3>
            </div>
            <div className="p-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => {
                  const subjectMaterials = getSubjectMaterials(subject)
                  return (
                    <motion.div
                      key={subject}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setCurrentSubject(subject)
                        setViewMode('materials')
                        setSelectedSubject(subject)
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{getSubjectIcon(subject)}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{subject}</h4>
                          <p className="text-sm text-gray-500">
                            {subjectMaterials.length} material{subjectMaterials.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {subjectMaterials.filter(m => m.type === 'PDF').length} PDFs
                        </div>
                        <div className="flex items-center gap-1">
                          <FileVideo className="h-3 w-3" />
                          {subjectMaterials.filter(m => m.type === 'Video').length} Videos
                        </div>
                        <div className="flex items-center gap-1">
                          <File className="h-3 w-3" />
                          {subjectMaterials.filter(m => m.type === 'Document').length} Docs
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="materials"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-lg shadow-lg"
          >
            <div className="p-6 pb-0">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Folder className="h-5 w-5" />
                {currentSubject} Materials ({filteredMaterials.length})
              </h3>
            </div>
            <div className="p-6 pt-2">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No study materials found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
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
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <Badge variant="secondary" className="text-xs">
                                {material.type}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {material.uploadedBy}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(material.uploadedAt).toLocaleDateString()}
                              </span>
                              <span>{formatFileSize(material.size)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMaterial(material)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadMaterial(material)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
