"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, Award, Eye, ArrowLeft, Search, Download, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DepartmentData {
  name: string
  code: string
  totalStudents: number
  avgAttendance: number
  avgCGPA: number
  passRate: number
}

interface YearData {
  year: string
  displayName: string
  students: number
  avgAttendance: number
  avgCGPA: number
}

interface StudentData {
  id: string
  prn: string
  name: string
  email: string
  department: string
  year: string
  cgpa?: number
  attendance?: number
  status: string
}

const departments: DepartmentData[] = [
  { name: "Computer Science & Engineering", code: "CSE", totalStudents: 0, avgAttendance: 0, avgCGPA: 0, passRate: 0 },
  { name: "Cyber Security", code: "CY", totalStudents: 0, avgAttendance: 0, avgCGPA: 0, passRate: 0 },
  { name: "AI & Data Science", code: "AIDS", totalStudents: 0, avgAttendance: 0, avgCGPA: 0, passRate: 0 },
  { name: "AI & Machine Learning", code: "AIML", totalStudents: 0, avgAttendance: 0, avgCGPA: 0, passRate: 0 }
]

export default function StudentProgressModule({ dean }: { dean: any }) {
  const [view, setView] = useState<'departments' | 'years' | 'students'>('departments')
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [deptData, setDeptData] = useState<DepartmentData[]>(departments)
  const [yearData, setYearData] = useState<YearData[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartmentData()
  }, [])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)
      
      // Fetch all students grouped by department
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')

      if (error) throw error

      // Calculate department statistics
      const updatedDepts = departments.map(dept => {
        const deptStudents = studentsData?.filter(s => s.department === dept.name) || []
        return {
          ...dept,
          totalStudents: deptStudents.length,
          avgAttendance: 85 + Math.random() * 10, // Mock data - replace with real attendance
          avgCGPA: 7.5 + Math.random() * 1.5,
          passRate: 90 + Math.random() * 8
        }
      })

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
      
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('department', department)
        .eq('status', 'active')

      if (error) throw error

      const years = [
        { year: 'first', displayName: 'First Year (FY)' },
        { year: 'second', displayName: 'Second Year (SY)' },
        { year: 'third', displayName: 'Third Year (TY)' },
        { year: 'fourth', displayName: 'Fourth Year (FY)' }
      ]

      const yearStats = years.map(y => {
        const yearStudents = studentsData?.filter(s => s.year === y.year) || []
        return {
          ...y,
          students: yearStudents.length,
          avgAttendance: 85 + Math.random() * 10,
          avgCGPA: 7.5 + Math.random() * 1.5
        }
      })

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
      
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('department', department)
        .eq('year', year)
        .eq('status', 'active')
        .order('name')

      if (error) throw error

      // Fetch attendance data for these students
      const studentIds = studentsData?.map(s => s.id) || []
      const { data: attendanceRecords } = await supabase
        .from('attendance_records')
        .select('student_id, status')
        .in('student_id', studentIds)

      // Calculate attendance percentage for each student
      const studentsWithAttendance = studentsData?.map(student => {
        const records = attendanceRecords?.filter(r => r.student_id === student.id) || []
        const presentCount = records.filter(r => r.status === 'present').length
        const attendance = records.length > 0 ? (presentCount / records.length) * 100 : 0
        
        return {
          ...student,
          attendance: Math.round(attendance),
          cgpa: 7.0 + Math.random() * 2.5 // Mock CGPA - replace with real data
        }
      }) || []

      setStudents(studentsWithAttendance)
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
    if (view === 'students') {
      setView('years')
      setSelectedYear(null)
    } else if (view === 'years') {
      setView('departments')
      setSelectedDept(null)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && view === 'departments') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
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
              {view === 'years' && `${selectedDept?.name} - Select a year`}
              {view === 'students' && `${selectedDept?.name} - ${selectedYear?.toUpperCase()} Year Students`}
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
        {/* Department Cards View */}
        {view === 'departments' && (
          <motion.div
            key="departments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {deptData.map((dept, index) => (
              <motion.div
                key={dept.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
                        <p className="text-2xl font-bold text-green-600">{dept.passRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Pass Rate</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Attendance</span>
                        <span className="font-semibold">{dept.avgAttendance.toFixed(1)}%</span>
                      </div>
                      <Progress value={dept.avgAttendance} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg CGPA</span>
                        <span className="font-semibold">{dept.avgCGPA.toFixed(2)}</span>
                      </div>
                      <Progress value={(dept.avgCGPA / 10) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Year Cards View */}
        {view === 'years' && (
          <motion.div
            key="years"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {yearData.map((year, index) => (
              <motion.div
                key={year.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Attendance</span>
                        <span className="font-semibold">{year.avgAttendance.toFixed(1)}%</span>
                      </div>
                      <Progress value={year.avgAttendance} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg CGPA</span>
                        <span className="font-semibold">{year.avgCGPA.toFixed(2)}</span>
                      </div>
                      <Progress value={(year.avgCGPA / 10) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Students List View */}
        {view === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, PRN, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Students Table */}
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
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">CGPA</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.prn}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Progress value={student.attendance || 0} className="h-2 w-20" />
                              <span className="text-sm font-semibold">{student.attendance || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {student.cgpa?.toFixed(2) || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              (student.attendance || 0) >= 85 && (student.cgpa || 0) >= 8 
                                ? 'bg-green-100 text-green-700'
                                : (student.attendance || 0) >= 75 && (student.cgpa || 0) >= 7
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }>
                              {(student.attendance || 0) >= 85 && (student.cgpa || 0) >= 8 
                                ? 'Excellent'
                                : (student.attendance || 0) >= 75 && (student.cgpa || 0) >= 7
                                ? 'Good'
                                : 'At Risk'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No students found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
