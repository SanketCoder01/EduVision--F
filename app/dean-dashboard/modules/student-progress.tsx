"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Users, Award, Eye, ArrowLeft, Search, Download, X, Mail, Phone, Building, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DepartmentData {
  name: string
  code: string
  totalStudents: number
  avgAttendance: number
  passRate: number
}

interface YearData {
  year: string
  displayName: string
  students: number
  avgAttendance: number
}

interface StudentData {
  id: string
  prn: string
  name: string
  email: string
  department: string
  year: string
  phone?: string
  college_name?: string
  photo?: string
  attendance: number           // real %
  attendancePresent: number    // sessions present
  attendanceTotal: number      // total sessions
  status: string
}

const DEPT_MAP: Record<string, string> = {
  "Computer Science & Engineering": "cse",
  "Cyber Security": "cyber",
  "AI & Data Science": "aids",
  "AI & Machine Learning": "aiml",
}
const DEPT_CODES: Record<string, string> = {
  "Computer Science & Engineering": "CSE",
  "Cyber Security": "CY",
  "AI & Data Science": "AIDS",
  "AI & Machine Learning": "AIML",
}
const YEAR_KEYS = ['1st', '2nd', '3rd', '4th']
const YEAR_DISPLAY: Record<string, string> = {
  '1st': 'First Year (FY)', '2nd': 'Second Year (SY)', '3rd': 'Third Year (TY)', '4th': 'Fourth Year (LY)'
}

const departments: DepartmentData[] = Object.keys(DEPT_MAP).map(name => ({
  name, code: DEPT_CODES[name], totalStudents: 0, avgAttendance: 0, passRate: 0
}))

export default function StudentProgressModule({ dean }: { dean: any }) {
  const [view, setView] = useState<'departments' | 'years' | 'students'>('departments')
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [deptData, setDeptData] = useState<DepartmentData[]>(departments)
  const [yearData, setYearData] = useState<YearData[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchDepartmentData()

    channelRef.current = supabase
      .channel("dean-student-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, () => {
        fetchDepartmentData()
        if (selectedDept && selectedYear) fetchStudentsByYear(selectedDept.name, selectedYear)
        else if (selectedDept) fetchYearData(selectedDept.name)
      })
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  }, [])

  // Fetch real attendance % for a list of student emails
  const fetchAttendanceForStudents = async (emails: string[], dept: string, year: string) => {
    if (emails.length === 0) return {}

    // Get total sessions for this dept/year
    const { data: sessions } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('department', dept)
      .eq('year', year)

    const totalSessions = sessions?.length || 0
    if (totalSessions === 0) return {}

    const sessionIds = sessions!.map(s => s.id)

    // Get attendance records for these students in these sessions
    const { data: records } = await supabase
      .from('attendance_records')
      .select('student_email, status, session_id')
      .in('session_id', sessionIds)
      .in('student_email', emails)

    // Build a map of email -> { present, total }
    const map: Record<string, { present: number; total: number }> = {}
    emails.forEach(e => { map[e] = { present: 0, total: totalSessions } })
    records?.forEach(r => {
      if (!map[r.student_email]) map[r.student_email] = { present: 0, total: totalSessions }
      if (r.status === 'present') map[r.student_email].present++
    })
    return map
  }

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)

      const updatedDepts = await Promise.all(
        departments.map(async (dept) => {
          const deptKey = DEPT_MAP[dept.name]
          let total = 0
          let totalPresent = 0
          let totalPossible = 0

          for (const yr of YEAR_KEYS) {
            const { data: studs } = await supabase
              .from(`students_${deptKey}_${yr}_year`)
              .select('email')
            const count = studs?.length || 0
            total += count

            if (count > 0) {
              const emails = studs!.map(s => s.email).filter(Boolean)
              const attMap = await fetchAttendanceForStudents(emails, dept.name, yr)
              Object.values(attMap).forEach(({ present, total: t }) => {
                totalPresent += present
                totalPossible += t
              })
            }
          }

          const avgAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0

          // Real pass rate
          const { data: results } = await supabase
            .from('student_results')
            .select('status')
            .eq('department', dept.name)
            .limit(100)
          const passed = results?.filter(r => r.status === 'Pass').length || 0
          const totalRes = results?.length || 0
          const passRate = totalRes > 0 ? Math.round((passed / totalRes) * 100) : 0

          return { ...dept, totalStudents: total, avgAttendance, passRate }
        })
      )
      setDeptData(updatedDepts)
    } catch (error) {
      console.error('Error fetching department data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchYearData = async (department: string) => {
    try {
      setLoading(true)
      const deptKey = DEPT_MAP[department]

      const yearStats = await Promise.all(
        YEAR_KEYS.map(async (yr) => {
          const { data: studs } = await supabase
            .from(`students_${deptKey}_${yr}_year`)
            .select('email')
          const count = studs?.length || 0

          let avgAttendance = 0
          if (count > 0) {
            const emails = studs!.map(s => s.email).filter(Boolean)
            const attMap = await fetchAttendanceForStudents(emails, department, yr)
            const vals = Object.values(attMap)
            if (vals.length > 0) {
              const totalPct = vals.reduce((acc, { present, total }) => acc + (total > 0 ? (present / total) * 100 : 0), 0)
              avgAttendance = Math.round(totalPct / vals.length)
            }
          }

          return { year: yr, displayName: YEAR_DISPLAY[yr], students: count, avgAttendance }
        })
      )
      setYearData(yearStats)
      setView('years')
    } catch (error) {
      console.error('Error fetching year data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsByYear = async (department: string, year: string) => {
    try {
      setLoading(true)
      const deptKey = DEPT_MAP[department]
      const tableName = `students_${deptKey}_${year}_year`

      const { data: studentsData, error } = await supabase
        .from(tableName)
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      const emails = (studentsData || []).map(s => s.email).filter(Boolean)
      const attMap = await fetchAttendanceForStudents(emails, department, year)

      const studentsWithStats: StudentData[] = (studentsData || []).map(student => {
        const att = attMap[student.email] || { present: 0, total: 0 }
        const attendancePct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0
        return {
          ...student,
          attendance: attendancePct,
          attendancePresent: att.present,
          attendanceTotal: att.total,
        }
      })

      setStudents(studentsWithStats)
      setView('students')
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeptClick = (dept: DepartmentData) => {
    setSelectedDept(dept)
    fetchYearData(dept.name)
  }

  const handleYearClick = (year: string) => {
    if (selectedDept) {
      setSelectedYear(year)
      fetchStudentsByYear(selectedDept.name, year)
    }
  }

  const handleBack = () => {
    if (view === 'students') { setView('years'); setSelectedYear(null) }
    else if (view === 'years') { setView('departments'); setSelectedDept(null) }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAttBadge = (pct: number, total: number) => {
    if (total === 0) return <Badge className="bg-gray-100 text-gray-600">No Data</Badge>
    if (pct >= 85) return <Badge className="bg-green-100 text-green-700">Excellent</Badge>
    if (pct >= 75) return <Badge className="bg-yellow-100 text-yellow-700">Good</Badge>
    return <Badge className="bg-red-100 text-red-700">At Risk</Badge>
  }

  if (loading && view === 'departments') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real student data...</p>
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
            <h2 className="text-3xl font-bold text-gray-900">Student Progress Tracking</h2>
            <p className="text-gray-600 mt-1">
              {view === 'departments' && 'Select a department to view details'}
              {view === 'years' && `${selectedDept?.name} – Select a year`}
              {view === 'students' && `${selectedDept?.name} – ${selectedYear?.toUpperCase()} Year Students`}
            </p>
          </div>
        </div>
        {view === 'students' && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Department Cards */}
        {view === 'departments' && (
          <motion.div
            key="departments"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {deptData.map((dept, index) => (
              <motion.div key={dept.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-blue-50"
                  onClick={() => handleDeptClick(dept)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">{dept.code}</Badge>
                    </div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{dept.totalStudents}</p>
                        <p className="text-xs text-gray-600">Total Students</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${dept.passRate > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {dept.passRate > 0 ? `${dept.passRate}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">Pass Rate</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Attendance</span>
                        <span className={`font-semibold ${dept.avgAttendance === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                          {dept.avgAttendance}%
                        </span>
                      </div>
                      <Progress
                        value={dept.avgAttendance}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Year Cards */}
        {view === 'years' && (
          <motion.div
            key="years"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {yearData.map((year, index) => (
              <motion.div key={year.year} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-purple-50"
                  onClick={() => handleYearClick(year.year)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">{year.year.toUpperCase()}</Badge>
                    </div>
                    <CardTitle className="text-lg">{year.displayName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{year.students}</p>
                      <p className="text-sm text-gray-600">Students enrolled</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Attendance</span>
                        <span className={`font-semibold ${year.avgAttendance === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                          {year.students === 0 ? 'No students' : `${year.avgAttendance}%`}
                        </span>
                      </div>
                      <Progress
                        value={year.avgAttendance}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Students List */}
        {view === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name, PRN, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">PRN</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sessions</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.prn || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={student.attendance}
                                className={`h-2 w-20 ${student.attendance === 0 ? '[&>div]:bg-red-500' : ''}`}
                              />
                              <span className={`text-sm font-semibold ${student.attendanceTotal === 0 ? 'text-gray-400' : student.attendance < 75 ? 'text-red-600' : 'text-gray-900'}`}>
                                {student.attendance}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {student.attendanceTotal > 0
                              ? `${student.attendancePresent}/${student.attendanceTotal}`
                              : <span className="text-gray-400 text-xs">No sessions</span>
                            }
                          </td>
                          <td className="px-6 py-4">
                            {getAttBadge(student.attendance, student.attendanceTotal)}
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No students found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {selectedStudent && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/40 bg-white/20 flex items-center justify-center">
                    {selectedStudent.photo ? (
                      <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white">{selectedStudent.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-blue-100 text-sm">PRN: {selectedStudent.prn || 'N/A'}</p>
                    <Badge className="mt-1 bg-white/20 text-white border border-white/30 text-xs">Student</Badge>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Email", value: selectedStudent.email, icon: <Mail className="h-4 w-4 text-blue-500" /> },
                  { label: "Phone", value: selectedStudent.phone || selectedStudent.phone_number, icon: <Phone className="h-4 w-4 text-green-500" /> },
                  { label: "College", value: selectedStudent.college_name, icon: <Building className="h-4 w-4 text-orange-500" /> },
                  { label: "PRN", value: selectedStudent.prn, icon: <CreditCard className="h-4 w-4 text-purple-500" /> },
                  {
                    label: "Attendance",
                    value: selectedStudent.attendanceTotal > 0
                      ? `${selectedStudent.attendance}% (${selectedStudent.attendancePresent}/${selectedStudent.attendanceTotal} sessions)`
                      : '0% – No sessions recorded',
                  },
                ].map(({ label, value, icon }: any) =>
                  value ? (
                    <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {icon && icon}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
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
