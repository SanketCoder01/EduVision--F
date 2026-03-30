"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Users, Eye, ArrowLeft, Search, Download, CheckCircle, X, Mail, Phone, Building, GraduationCap, BookOpen, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DepartmentData {
  name: string
  code: string
  totalFaculty: number
  classesCompleted: number
  assignmentsGiven: number
  facultyList: any[]
}

const DEPT_NAMES = [
  "Computer Science & Engineering",
  "Cyber Security",
  "AI & Data Science",
  "AI & Machine Learning",
]
const DEPT_CODES: Record<string, string> = {
  "Computer Science & Engineering": "CSE",
  "Cyber Security": "CY",
  "AI & Data Science": "AIDS",
  "AI & Machine Learning": "AIML",
}

// All possible ways faculty.department might store dept names
const DEPT_ALIASES: Record<string, string> = {
  // full name → canonical
  "computer science & engineering": "Computer Science & Engineering",
  "computer science and engineering": "Computer Science & Engineering",
  "cse": "Computer Science & Engineering",
  "cyber security": "Cyber Security",
  "cybersecurity": "Cyber Security",
  "cyber": "Cyber Security",
  "cy": "Cyber Security",
  "ai & data science": "AI & Data Science",
  "ai and data science": "AI & Data Science",
  "aids": "AI & Data Science",
  "ai & machine learning": "AI & Machine Learning",
  "ai and machine learning": "AI & Machine Learning",
  "aiml": "AI & Machine Learning",
}

function normalizeDept(raw: string): string {
  if (!raw) return raw
  return DEPT_ALIASES[raw.toLowerCase().trim()] || raw
}

export default function FacultyAnalyticsModule({ dean }: { dean: any }) {
  const [view, setView] = useState<'departments' | 'faculty'>('departments')
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null)
  const [deptData, setDeptData] = useState<DepartmentData[]>([])
  const [faculty, setFaculty] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchDepartmentData()

    channelRef.current = supabase
      .channel("dean-faculty-realtime-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "faculty" }, () => {
        fetchDepartmentData()
        if (selectedDept) fetchFacultyByDept(selectedDept)
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_sessions" }, () => {
        if (selectedDept) fetchFacultyByDept(selectedDept)
        fetchDepartmentData()
      })
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  }, [])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)

      // Fetch ALL faculty without any filter – normalize department after
      const { data: allFaculty, error } = await supabase
        .from('faculty')
        .select('id, name, department, email, designation, face_image, photo_url')

      if (error) throw error

      // Fetch sessions and assignments in parallel
      const [sessRes, assignRes] = await Promise.all([
        supabase.from('attendance_sessions').select('faculty_id, status'),
        supabase.from('assignments').select('faculty_id'),
      ])

      const sessionsData = sessRes.data || []
      const assignmentsData = assignRes.data || []

      // Group faculty by canonical department name
      const grouped: Record<string, any[]> = {}
      DEPT_NAMES.forEach(n => { grouped[n] = [] })

      ;(allFaculty || []).forEach(f => {
        const canonical = normalizeDept(f.department || '')
        if (grouped[canonical] !== undefined) {
          grouped[canonical].push(f)
        } else {
          // Put unmatched under their raw name for display if you want, or skip
          // Skip for now - only show known departments
        }
      })

      const updatedDepts: DepartmentData[] = DEPT_NAMES.map(deptName => {
        const deptFaculty = grouped[deptName] || []
        const facultyIds = new Set(deptFaculty.map((f: any) => f.id))

        const deptSessions = sessionsData.filter(s => facultyIds.has(s.faculty_id))
        const classesCompleted = deptSessions.filter(s => s.status === 'completed').length

        const assignmentsGiven = assignmentsData.filter(a => facultyIds.has(a.faculty_id)).length

        return {
          name: deptName,
          code: DEPT_CODES[deptName],
          totalFaculty: deptFaculty.length,
          classesCompleted,
          assignmentsGiven,
          facultyList: deptFaculty,
        }
      })

      setDeptData(updatedDepts)
    } catch (error) {
      console.error('Error fetching department data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFacultyByDept = async (dept: DepartmentData) => {
    try {
      setLoading(true)

      // Fetch all faculty and filter by normalized dept name
      const { data: allFaculty, error } = await supabase
        .from('faculty')
        .select('*')
        .order('name')

      if (error) throw error

      const deptFaculty = (allFaculty || []).filter(f => normalizeDept(f.department || '') === dept.name)
      const deptFacultyIds = deptFaculty.map(f => f.id)

      const [sessRes, assignRes] = await Promise.all([
        deptFacultyIds.length > 0
          ? supabase.from('attendance_sessions').select('faculty_id, status').in('faculty_id', deptFacultyIds)
          : Promise.resolve({ data: [], error: null }),
        deptFacultyIds.length > 0
          ? supabase.from('assignments').select('faculty_id').in('faculty_id', deptFacultyIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      const sessionsData = sessRes.data || []
      const assignmentsData = assignRes.data || []

      const facultyWithStats = deptFaculty.map(f => {
        const sessions = sessionsData.filter(s => s.faculty_id === f.id)
        const classesCompleted = sessions.filter(s => s.status === 'completed').length
        const attendanceSubmitted = sessions.length
        const assignmentsGiven = assignmentsData.filter(a => a.faculty_id === f.id).length

        return {
          ...f,
          department: normalizeDept(f.department || ''),
          classesCompleted,
          attendanceSubmitted,
          assignmentsGiven,
        }
      })

      setFaculty(facultyWithStats)
      setView('faculty')
    } catch (error) {
      console.error('Error fetching faculty:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeptClick = (dept: DepartmentData) => {
    setSelectedDept(dept)
    fetchFacultyByDept(dept)
  }

  const handleBack = () => {
    setView('departments')
    setSelectedDept(null)
    setSearchTerm("")
  }

  const filteredFaculty = faculty.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalFaculty = deptData.reduce((a, d) => a + d.totalFaculty, 0)

  if (loading && deptData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real faculty data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view !== 'departments' && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Faculty Analytics</h2>
            <p className="text-gray-600 mt-1">
              {view === 'departments' && `${totalFaculty} faculty members across all departments — Click a department to view details`}
              {view === 'faculty' && `${selectedDept?.name} — ${faculty.length} faculty members`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-700 border border-green-200 px-3 py-1">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          {view === 'faculty' && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Department Cards */}
        {view === 'departments' && (
          <motion.div
            key="departments"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {deptData.map(dept => (
                <Card key={dept.code} className="border-0 shadow-sm bg-white/80 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDeptClick(dept)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{dept.code}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">{dept.totalFaculty}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{dept.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deptData.map((dept, index) => (
                <motion.div key={dept.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card
                    className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-green-50"
                    onClick={() => handleDeptClick(dept)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{dept.name}</CardTitle>
                            <Badge className="bg-green-100 text-green-700 text-xs mt-1">{dept.code}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">{dept.totalFaculty}</p>
                          <p className="text-xs text-gray-500">Faculty Members</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-500">Assignments</span>
                          </div>
                          <p className="text-xl font-bold text-blue-700">{dept.assignmentsGiven}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-gray-500">Sessions</span>
                          </div>
                          <p className="text-xl font-bold text-purple-700">{dept.classesCompleted}</p>
                        </div>
                      </div>

                      {/* Faculty avatars */}
                      {dept.facultyList.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Faculty Members</p>
                          <div className="flex flex-wrap gap-2">
                            {dept.facultyList.slice(0, 6).map((f: any) => (
                              <div key={f.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-[8px] font-bold overflow-hidden">
                                  {f.face_image || f.photo_url ? (
                                    <img src={f.face_image || f.photo_url} alt={f.name} className="w-full h-full object-cover rounded-full" />
                                  ) : f.name?.charAt(0)}
                                </div>
                                <span className="text-xs text-gray-700 max-w-[80px] truncate">{f.name}</span>
                              </div>
                            ))}
                            {dept.facultyList.length > 6 && (
                              <span className="text-xs text-gray-400 self-center">+{dept.facultyList.length - 6} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {dept.totalFaculty === 0 && (
                        <p className="text-sm text-gray-400 text-center py-2">No faculty registered yet</p>
                      )}

                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View All Details →
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Faculty Detail List */}
        {view === 'faculty' && (
          <motion.div
            key="faculty"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Faculty Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFaculty.map((f) => (
                <motion.div key={f.id} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-all bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-green-200 flex-shrink-0">
                          {f.face_image || f.photo_url ? (
                            <img src={f.face_image || f.photo_url} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                              {f.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{f.name}</h3>
                          <p className="text-sm text-gray-500">{f.designation || 'Faculty'}</p>
                          <Badge className="bg-green-100 text-green-700 text-xs mt-1">{selectedDept?.code}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{f.email}</span>
                        </div>
                        {f.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            <span>{f.phone}</span>
                          </div>
                        )}
                        {f.employee_id && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <span>ID: {f.employee_id}</span>
                          </div>
                        )}
                        {f.experience_years && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <GraduationCap className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                            <span>{f.experience_years} years exp.</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{f.assignmentsGiven}</p>
                          <p className="text-[10px] text-gray-400">Assignments</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{f.classesCompleted}</p>
                          <p className="text-[10px] text-gray-400">Sessions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{f.attendanceSubmitted}</p>
                          <p className="text-[10px] text-gray-400">Attendance</p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setSelectedFaculty(f)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredFaculty.length === 0 && !loading && (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No faculty found in {selectedDept?.name}</p>
                <p className="text-gray-400 text-sm mt-1">Faculty will appear here after completing their profile setup.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Faculty Detail Modal */}
      <Dialog open={!!selectedFaculty} onOpenChange={() => setSelectedFaculty(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          {selectedFaculty && (
            <div>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white relative">
                <button onClick={() => setSelectedFaculty(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 bg-white/20 flex items-center justify-center">
                    {selectedFaculty.face_image || selectedFaculty.photo_url ? (
                      <img src={selectedFaculty.face_image || selectedFaculty.photo_url} alt={selectedFaculty.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{selectedFaculty.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFaculty.name}</h2>
                    <p className="text-green-100">{selectedFaculty.designation || "Faculty"}</p>
                    <Badge className="mt-1 bg-white/20 text-white border border-white/30">Faculty Member</Badge>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { label: "Employee ID", value: selectedFaculty.employee_id },
                  { label: "Email", value: selectedFaculty.email, icon: <Mail className="h-4 w-4 text-blue-500" /> },
                  { label: "Phone", value: selectedFaculty.phone, icon: <Phone className="h-4 w-4 text-green-500" /> },
                  { label: "Department", value: selectedFaculty.department, icon: <Building className="h-4 w-4 text-purple-500" /> },
                  { label: "College", value: selectedFaculty.college_name, icon: <GraduationCap className="h-4 w-4 text-orange-500" /> },
                  { label: "Qualification", value: selectedFaculty.qualification },
                  { label: "Experience", value: selectedFaculty.experience_years ? `${selectedFaculty.experience_years} years` : undefined },
                  { label: "Assignments Given", value: `${selectedFaculty.assignmentsGiven} assignments` },
                  { label: "Classes Completed", value: `${selectedFaculty.classesCompleted} sessions` },
                  { label: "Attendance Submitted", value: `${selectedFaculty.attendanceSubmitted} records` },
                ].map(({ label, value, icon }: any) =>
                  value ? (
                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {icon && <div className="mt-0.5">{icon}</div>}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
