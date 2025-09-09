"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StudentStudyMaterialsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedType, setSelectedType] = useState("")

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
      // Sample data for demo
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
          year: user?.year || "first"
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
          year: user?.year || "first"
        },
        {
          id: "3",
          title: "Programming Exercises",
          subject: "Programming",
          type: "Document",
          description: "Practice problems and solutions for C++ programming",
          uploadedBy: "Dr. Brown",
          uploadedAt: "2024-01-08",
          size: 1200000,
          department: user?.department || "Computer Science Engineering", 
          year: user?.year || "first"
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
              Access course materials and resources for {currentUser?.department || "your department"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

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

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Available Materials ({filteredMaterials.length})
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
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{material.subject}</span>
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
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
      </div>
    </div>
  )
}
