"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Download, FileText, Search, Eye, Calendar, User,
  File, Image, FileSpreadsheet, FileVideo, ChevronRight,
  ArrowLeft, Sparkles, Mail, Book, Folder, FolderOpen, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

const DEPTS = ['cse', 'cyber', 'cy', 'aids', 'aiml']
const YEARS = ['1st', '2nd', '3rd', '4th']
const DEPT_VARIANTS: Record<string, string[]> = {
  cse: ['cse', 'computer science', 'computer science & engineering', 'cs&e'],
  cyber: ['cyber', 'cy', 'cybersecurity', 'cyber security'],
  aids: ['aids', 'ai & data science', 'ai data science', 'aiandds'],
  aiml: ['aiml', 'ai & machine learning', 'ai machine learning'],
}

// Normalize dept string → short code key
const normalizeDept = (d: string): string => {
  const s = (d || '').toLowerCase().trim()
  for (const [key, variants] of Object.entries(DEPT_VARIANTS)) {
    if (variants.some(v => s === v || s.includes(v))) return key
  }
  return s
}

// Check if two dept strings match (fuzzy)
const deptMatches = (a: string, b: string) => normalizeDept(a) === normalizeDept(b)

const normalizeYear = (y: string): string => {
  if (!y) return '1st'
  if (y.includes('1') || y.toLowerCase().includes('first')) return '1st'
  if (y.includes('2') || y.toLowerCase().includes('second')) return '2nd'
  if (y.includes('3') || y.toLowerCase().includes('third')) return '3rd'
  if (y.includes('4') || y.toLowerCase().includes('fourth')) return '4th'
  return y
}

function getFileIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />
    case "video": return <FileVideo className="h-5 w-5 text-purple-500" />
    case "image": return <Image className="h-5 w-5 text-green-500" />
    case "spreadsheet": return <FileSpreadsheet className="h-5 w-5 text-blue-500" />
    default: return <File className="h-5 w-5 text-gray-500" />
  }
}

function formatSize(bytes: number): string {
  if (!bytes) return ''
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
}

// Group materials by faculty  
function groupByFaculty(materials: any[]): Record<string, any[]> {
  const g: Record<string, any[]> = {}
  for (const m of materials) {
    // Group by ID if available, otherwise fallback name
    const key = m.faculty_id || m.faculty_name || 'unknown_faculty'
    if (!g[key]) g[key] = []
    g[key].push(m)
  }
  return g
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

export default function StudentStudyMaterialsPage() {
  const { toast } = useToast()
  const channelRef = useRef<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studyMaterials, setStudyMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  // View: 'faculty-list' | 'materials'
  const [view, setView] = useState<'faculty-list' | 'materials'>('faculty-list')
  const [selectedFacultyKey, setSelectedFacultyKey] = useState("")

  useEffect(() => {
    fetchStudentData()
    return () => { channelRef.current?.unsubscribe() }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchStudyMaterials()
      setupRealtime()
    }
  }, [currentUser])

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Search every dept × year table
      for (const dept of DEPTS) {
        for (const yr of YEARS) {
          const tbl = `students_${dept}_${yr}_year`
          const { data } = await supabase.from(tbl as any).select('*').eq('email', user.email).maybeSingle()
          if (data) {
            setCurrentUser({ ...data, department: dept, year: normalizeYear(data.year || yr) })
            return
          }
        }
      }
      // Fallback: try user metadata
      if (user.user_metadata?.department) {
        setCurrentUser({ id: user.id, email: user.email, name: user.user_metadata?.name, department: normalizeDept(user.user_metadata.department), year: normalizeYear(user.user_metadata?.year || '1st') })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchStudyMaterials = async () => {
    if (!currentUser) return
    try {
      // Fetch all faculty to map IDs to names for older materials
      const { data: facultyData } = await supabase.from('faculty').select('*')
      const facultyMap: Record<string, any> = {}
      if (facultyData) {
        facultyData.forEach(f => { facultyMap[f.id] = f })
      }

      // Fetch ALL study materials
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) { console.error('study_materials error:', error); return }

      const myDept = normalizeDept(currentUser.department)
      const myYear = normalizeYear(currentUser.year)

      // Map older materials that lack faculty_name
      const enhancedData = (data || []).map(m => {
        if (!m.faculty_name && m.faculty_id && facultyMap[m.faculty_id]) {
          return { ...m, faculty_name: facultyMap[m.faculty_id].name, faculty_email: facultyMap[m.faculty_id].email }
        }
        return m
      })

      // Only show materials posted by faculty (must have faculty_id)
      const filtered = enhancedData.filter(m => {
        const mDept = normalizeDept(m.department || '')
        const mYear = normalizeYear(m.year || '')
        // We match if the material's department matches the student's department, or if material was uploaded across all depts/years.
        const matchesDept = !mDept || mDept === 'all' || mDept === myDept
        const matchesYear = !mYear || mYear === 'all' || mYear === myYear
        
        // Only show faculty posts - must have faculty_id (exclude cafe owner posts)
        const isFacultyPost = !!m.faculty_id
        
        return matchesDept && matchesYear && isFacultyPost
      })

      setStudyMaterials(filtered)
    } catch (e) { console.error(e) }
  }

  const setupRealtime = () => {
    channelRef.current?.unsubscribe()
    channelRef.current = supabase.channel('student-study-materials-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, (payload) => {
        // Just refetch all on change for simplicity
        fetchStudyMaterials()
      })
      .subscribe()
  }

  const grouped = groupByFaculty(studyMaterials)
  const facultyKeys = Object.keys(grouped)
  const selectedMaterials = selectedFacultyKey ? (grouped[selectedFacultyKey] || []) : []
  const filteredMaterials = selectedMaterials.filter(m =>
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get faculty info from first material in group
  const getFacultyInfo = (key: string) => {
    const first = (grouped[key] || [])[0]
    let name = first?.faculty_name || 'Faculty Member'
    if (isUUID(name)) name = "Faculty Member" // hide raw UUID
    return { name }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-3" /><p className="text-gray-500">Loading study materials...</p></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            {view === 'materials' && (
              <button onClick={() => { setView('faculty-list'); setSearchTerm("") }} className="flex items-center gap-1 text-purple-200 hover:text-white text-sm mb-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Faculty List
              </button>
            )}
            <h1 className="text-2xl font-bold">Study Materials</h1>
            <p className="text-purple-200 text-sm mt-0.5">
              {currentUser ? `${(currentUser.department || '').toUpperCase()} · ${currentUser.year} Year` : 'Loading...'}
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-0">{studyMaterials.length} materials</Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Materials", val: studyMaterials.length, color: "text-purple-600" },
          { label: "Faculty Members", val: facultyKeys.length, color: "text-blue-600" },
          { label: "With AI Summary", val: studyMaterials.filter(m => m.has_summary).length, color: "text-pink-600" },
        ].map(s => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {studyMaterials.length === 0 && (
        <Card><CardContent className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Study Materials Yet</h3>
          <p className="text-gray-400 text-sm">Your faculty will upload materials for{" "}
            <strong>{(currentUser?.department || '').toUpperCase()}</strong> · <strong>{currentUser?.year} Year</strong>
          </p>
        </CardContent></Card>
      )}

      {/* FACULTY LIST VIEW */}
      {studyMaterials.length > 0 && view === 'faculty-list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5 text-purple-500" />Faculty Members ({facultyKeys.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyKeys.map(key => {
                  const info = getFacultyInfo(key)
                  const mats = grouped[key]
                  const hasSummary = mats.some(m => m.has_summary)
                  const subjects = [...new Set(mats.map(m => m.subject).filter(Boolean))]
                  return (
                    <motion.div key={key} whileHover={{ scale: 1.01 }} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-purple-200 bg-white"
                      onClick={() => { setSelectedFacultyKey(key); setView('materials'); setSearchTerm("") }}>
                      {/* Avatar */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                          {info.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{info.name}</h4>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                      {/* Subjects */}
                      {subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {subjects.slice(0, 3).map(s => <span key={s} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                          {subjects.length > 3 && <span className="text-[10px] text-gray-400">+{subjects.length - 3} more</span>}
                        </div>
                      )}
                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Book className="w-3 h-3" />{mats.length} material{mats.length > 1 ? 's' : ''}</span>
                        {hasSummary && <Badge className="bg-purple-100 text-purple-700 text-[10px] border-0"><Sparkles className="w-3 h-3 mr-0.5" />AI Summary</Badge>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* MATERIALS VIEW (after clicking faculty) */}
      {view === 'materials' && selectedFacultyKey && (
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {getFacultyInfo(selectedFacultyKey).name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base">{getFacultyInfo(selectedFacultyKey).name}</CardTitle>
                </div>
              </div>
              {/* Search */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search materials..." className="pl-9 h-9 text-sm" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">No materials found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMaterials.map(material => (
                    <motion.div key={material.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gray-100 rounded-lg flex-shrink-0">{getFileIcon(material.file_type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start flex-wrap gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{material.title}</h4>
                            {material.has_summary && <Badge className="bg-purple-100 text-purple-700 text-[10px] border-0"><Sparkles className="w-3 h-3 mr-0.5" />AI Summary</Badge>}
                          </div>
                          {material.subject && <p className="text-xs text-purple-600 font-medium mb-1">📚 {material.subject}</p>}
                          {material.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{material.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <Badge variant="secondary" className="text-xs">{material.file_type}</Badge>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(material.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            {material.file_size && <span>{formatSize(material.file_size)}</span>}
                          </div>
                          {/* AI Summary */}
                          {material.has_summary && material.summary && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                              <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-500" /><span className="text-xs font-semibold text-purple-700">AI Summary</span></div>
                              <p className="text-xs text-gray-600 whitespace-pre-line">{material.summary}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-8 text-xs px-3" onClick={() => window.open(material.file_url, '_blank')}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => { const a = document.createElement('a'); a.href = material.file_url; a.download = material.file_name; a.click() }}>
                            <Download className="w-3.5 h-3.5 mr-1" /> Download
                          </Button>
                          {material.summary_url && (
                            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 h-8 text-xs px-3" onClick={() => { const a = document.createElement('a'); a.href = material.summary_url; a.download = material.summary_file_name || 'summary.txt'; a.click() }}>
                              <Sparkles className="w-3.5 h-3.5 mr-1" /> Summary
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
    </div>
  )
}
