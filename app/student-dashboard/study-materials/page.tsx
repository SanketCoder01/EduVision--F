"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Download,
  FileText,
  Search,
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
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function StudentStudyMaterialsPage() {
  const { toast } = useToast()
  const subscriptionsRef = useRef<{ unsubscribe: () => void } | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [viewMode, setViewMode] = useState<'subjects' | 'materials'>('subjects')
  const [currentSubject, setCurrentSubject] = useState<string>("")

  useEffect(() => {
    fetchStudentData()
    
    return () => {
      if (subscriptionsRef.current) {
        subscriptionsRef.current.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchStudyMaterials()
      setupRealtimeSubscriptions()
    }
  }, [currentUser])

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try to find student in department tables
      const departments = ['cse', 'cyber', 'aids', 'aiml']
      const years = ['1st', '2nd', '3rd', '4th']
      
      for (const dept of departments) {
        for (const year of years) {
          const { data } = await supabase
            .from(`students_${dept}_${year}_year`)
            .select('*')
            .eq('email', user.email)
            .single()
          
          if (data) {
            // Normalize department to lowercase for consistent matching
            const normalizedData = {
              ...data,
              department: data.department?.toLowerCase() || dept,
              year: data.year || year
            }
            console.log('Student found:', normalizedData)
            setCurrentUser(normalizedData)
            return
          }
        }
      }
      
      console.log('No student found for email:', user.email)
    } catch (error) {
      console.error('Error fetching student data:', error)
    }
  }

  const fetchStudyMaterials = async () => {
    if (!currentUser) return
    
    try {
      console.log('Fetching materials for:', currentUser.department, currentUser.year)
      
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .ilike('department', currentUser.department) // Case-insensitive match
        .eq('year', currentUser.year)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Materials fetched:', data?.length || 0)
      setStudyMaterials(data || [])
    } catch (error) {
      console.error('Error fetching study materials:', error)
      setStudyMaterials([])
    }
  }

  const setupRealtimeSubscriptions = () => {
    if (!currentUser) return
    
    // Clean up previous subscriptions
    if (subscriptionsRef.current) {
      subscriptionsRef.current.unsubscribe()
    }
    
    const deptLower = currentUser.department?.toLowerCase()
    
    // Subscribe to study materials with department + year filtering
    const channel = supabase
      .channel('student-study-materials')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_materials'
        },
        (payload) => {
          const newMaterial = payload.new as any
          // Filter by department (case-insensitive) and year
          if (newMaterial.department?.toLowerCase() === deptLower && 
              newMaterial.year === currentUser.year) {
            console.log('New study material:', newMaterial)
            setStudyMaterials(prev => [newMaterial, ...prev])
            
            toast({
              title: "New Study Material Uploaded",
              description: `${newMaterial.title} for ${newMaterial.subject || 'General'}`,
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'study_materials'
        },
        (payload) => {
          const updatedMaterial = payload.new as any
          // Filter by department (case-insensitive) and year
          if (updatedMaterial.department?.toLowerCase() === deptLower && 
              updatedMaterial.year === currentUser.year) {
            console.log('Study material updated:', updatedMaterial)
            
            // Update the material in state
            setStudyMaterials(prev => 
              prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m)
            )
            
            // Show notification if summary was added
            if (updatedMaterial.has_summary && !payload.old?.has_summary) {
              toast({
                title: "AI Summary Available",
                description: `Summary added for "${updatedMaterial.title}"`,
              })
            }
          }
        }
      )
      .subscribe()
    
    subscriptionsRef.current = channel
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

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const subjects = [...new Set(studyMaterials.map(material => material.subject))]
  const types = [...new Set(studyMaterials.map(material => material.file_type))]

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || selectedSubject === "all" || material.subject === selectedSubject
    const matchesType = !selectedType || selectedType === "all" || material.file_type === selectedType
    
    return matchesSearch && matchesSubject && matchesType
  })

  const getSubjectMaterials = (subject: string) => {
    return studyMaterials.filter(material => material.subject === subject)
  }

  const handleViewMaterial = (material: any) => {
    window.open(material.file_url, '_blank')
    
    toast({
      title: "Opening Material",
      description: `Opening ${material.title} in new tab`,
    })
  }

  const handleDownloadMaterial = (material: any) => {
    const link = document.createElement('a')
    link.href = material.file_url
    link.download = material.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download Started",
      description: `Downloading ${material.file_name}`,
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
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
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
            <Badge variant="secondary" className="text-purple-900">
              {studyMaterials.length} Materials
            </Badge>
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
              {studyMaterials.filter(m => m.file_type === "PDF").length}
            </div>
            <p className="text-sm text-gray-600">PDF Documents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {studyMaterials.filter(m => m.has_summary).length}
            </div>
            <p className="text-sm text-gray-600">AI Summarized</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject View or Materials List */}
      <AnimatePresence mode="wait">
        {viewMode === 'subjects' ? (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {subjects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No Study Materials Yet</h3>
                  <p className="text-gray-500">Your faculty hasn't uploaded any study materials for your department and year.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Browse by Subject ({subjects.length} subjects)
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                              {subjectMaterials.filter(m => m.file_type === 'PDF').length} PDFs
                            </div>
                            {subjectMaterials.some(m => m.has_summary) && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Summary
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="materials"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {currentSubject} Materials ({filteredMaterials.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                              {getFileIcon(material.file_type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{material.title}</h4>
                                {material.has_summary && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Summary
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <Badge variant="secondary" className="text-xs">
                                  {material.file_type}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(material.created_at).toLocaleDateString()}
                                </span>
                                <span>{formatFileSize(material.file_size)}</span>
                                <span>{material.file_name}</span>
                              </div>
                              
                              {/* Show AI Summary if available */}
                              {material.has_summary && material.summary && (
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    <span className="text-xs font-medium text-purple-700">AI Generated Summary</span>
                                  </div>
                                  <p className="text-xs text-gray-700 whitespace-pre-line">{material.summary}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleViewMaterial(material)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Original PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadMaterial(material)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Original
                            </Button>
                            {material.has_summary && material.summary_url && (
                              <Button 
                                variant="default" 
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => {
                                  const a = document.createElement('a')
                                  a.href = material.summary_url
                                  a.download = material.summary_file_name || 'summary.txt'
                                  a.click()
                                }}
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Download AI Summary
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
