"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Filter,
  Loader2,
  Eye,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { getStudentStudyMaterials } from "@/app/dashboard/study-materials/actions"

export default function StudentStudyMaterialsPage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser?.department && currentUser?.year) {
      loadStudyMaterials()
      
      // Real-time subscription
      const channel = supabase
        .channel('student_study_materials_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_materials',
            filter: `department=eq.${currentUser.department},year=eq.${currentUser.year}`
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
        setCurrentUser(profile)
      }
    }
  }

  const loadStudyMaterials = async () => {
    if (!currentUser?.department || !currentUser?.year) return
    
    setLoading(true)
    const result = await getStudentStudyMaterials(currentUser.department, currentUser.year)
    
    if (result.success && result.data) {
      setStudyMaterials(result.data)
    }
    setLoading(false)
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

  const subjects = [...new Set(studyMaterials.map(m => m.subject))].sort()

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSubject = selectedSubject === "all" || material.subject === selectedSubject
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSubject && matchesSearch
  })

  const groupedBySubject = subjects.reduce((acc, subject) => {
    acc[subject] = filteredMaterials.filter(m => m.subject === subject)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading study materials...</p>
        </div>
      </div>
    )
  }

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
              Study Materials
            </h1>
            <p className="text-purple-100">
              {currentUser?.department} - {currentUser?.year?.charAt(0).toUpperCase() + currentUser?.year?.slice(1)} Year
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <CheckCircle className="h-4 w-4 mr-1" />
            Real-Time Updates
          </Badge>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {subjects.length}
            </div>
            <p className="text-sm text-gray-600">Subjects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {studyMaterials.filter(m => {
                const uploadDate = new Date(m.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return uploadDate >= weekAgo
              }).length}
            </div>
            <p className="text-sm text-gray-600">New This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials by Subject */}
      {studyMaterials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Study Materials Available
            </h3>
            <p className="text-gray-500">
              Your faculty hasn't uploaded any study materials yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Check back later or contact your faculty.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={subjects[0] || "all"} className="space-y-4">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(subjects.length, 6)}, 1fr)` }}>
            {subjects.slice(0, 6).map((subject) => (
              <TabsTrigger key={subject} value={subject}>
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject} value={subject}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    {subject} ({groupedBySubject[subject]?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupedBySubject[subject]?.map((material) => (
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
                                <span>By {material.faculty_name}</span>
                                <span>•</span>
                                <span>{formatFileSize(material.file_size)}</span>
                                <span>•</span>
                                <span>{new Date(material.created_at).toLocaleDateString()}</span>
                                {new Date(material.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    New
                                  </Badge>
                                )}
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
                              size="sm"
                              onClick={() => window.open(material.file_url, '_blank')}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Real-time indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredMaterials.length} of {studyMaterials.length} materials
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Real-time updates enabled
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
