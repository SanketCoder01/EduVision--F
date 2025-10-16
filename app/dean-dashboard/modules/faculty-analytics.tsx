"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, Award, Eye, ArrowLeft, Search, Download, Calendar, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DepartmentData {
  name: string
  code: string
  totalFaculty: number
  avgRating: number
  classesCompleted: number
  attendanceSubmitted: number
}

interface FacultyData {
  id: string
  employee_id: string
  name: string
  email: string
  department: string
  designation: string
  experience_years: number
  status: string
  classesCompleted?: number
  attendanceSubmitted?: number
  rating?: number
}

const departments: DepartmentData[] = [
  { name: "Computer Science & Engineering", code: "CSE", totalFaculty: 0, avgRating: 0, classesCompleted: 0, attendanceSubmitted: 0 },
  { name: "Cyber Security", code: "CY", totalFaculty: 0, avgRating: 0, classesCompleted: 0, attendanceSubmitted: 0 },
  { name: "AI & Data Science", code: "AIDS", totalFaculty: 0, avgRating: 0, classesCompleted: 0, attendanceSubmitted: 0 },
  { name: "AI & Machine Learning", code: "AIML", totalFaculty: 0, avgRating: 0, classesCompleted: 0, attendanceSubmitted: 0 }
]

export default function FacultyAnalyticsModule({ dean }: { dean: any }) {
  const [view, setView] = useState<'departments' | 'faculty'>('departments')
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null)
  const [deptData, setDeptData] = useState<DepartmentData[]>(departments)
  const [faculty, setFaculty] = useState<FacultyData[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartmentData()
  }, [])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)
      
      // Fetch all faculty grouped by department
      const { data: facultyData, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('status', 'active')

      if (error) throw error

      // Fetch attendance sessions created by faculty
      const { data: sessionsData } = await supabase
        .from('attendance_sessions')
        .select('faculty_id, status')

      // Calculate department statistics
      const updatedDepts = departments.map(dept => {
        const deptFaculty = facultyData?.filter(f => f.department === dept.name) || []
        const facultyIds = deptFaculty.map(f => f.id)
        const deptSessions = sessionsData?.filter(s => facultyIds.includes(s.faculty_id)) || []
        const completedSessions = deptSessions.filter(s => s.status === 'completed').length
        
        return {
          ...dept,
          totalFaculty: deptFaculty.length,
          avgRating: 4.2 + Math.random() * 0.7, // Mock rating - replace with real data
          classesCompleted: completedSessions,
          attendanceSubmitted: completedSessions
        }
      })

      setDeptData(updatedDepts)
    } catch (error) {
      console.error('Error fetching department data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFacultyByDept = async (department: string) => {
    try {
      setLoading(true)
      
      const { data: facultyData, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('department', department)
        .eq('status', 'active')
        .order('name')

      if (error) throw error

      // Fetch attendance sessions for each faculty
      const facultyIds = facultyData?.map(f => f.id) || []
      const { data: sessionsData } = await supabase
        .from('attendance_sessions')
        .select('faculty_id, status')
        .in('faculty_id', facultyIds)

      // Calculate stats for each faculty
      const facultyWithStats = facultyData?.map(f => {
        const sessions = sessionsData?.filter(s => s.faculty_id === f.id) || []
        const completedSessions = sessions.filter(s => s.status === 'completed').length
        
        return {
          ...f,
          classesCompleted: sessions.length,
          attendanceSubmitted: completedSessions,
          rating: 4.0 + Math.random() * 1.0 // Mock rating
        }
      }) || []

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
    fetchFacultyByDept(dept.name)
  }

  const handleBack = () => {
    setView('departments')
    setSelectedDept(null)
  }

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && view === 'departments') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty data...</p>
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
            <h2 className="text-3xl font-bold text-gray-900">Faculty Analytics & Attendance</h2>
            <p className="text-gray-600 mt-1">
              {view === 'departments' && 'Select a department to view faculty details'}
              {view === 'faculty' && `${selectedDept?.name} - Faculty Members`}
            </p>
          </div>
        </div>
        {view === 'faculty' && (
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
                  className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-green-50"
                  onClick={() => handleDeptClick(dept)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700">{dept.code}</Badge>
                    </div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{dept.totalFaculty}</p>
                        <p className="text-xs text-gray-600">Total Faculty</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {dept.avgRating.toFixed(1)} ⭐
                        </p>
                        <p className="text-xs text-gray-600">Avg Rating</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Classes Completed</span>
                        <span className="font-semibold">{dept.classesCompleted}</span>
                      </div>
                      <Progress value={(dept.classesCompleted / (dept.totalFaculty * 20)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Attendance Submitted</span>
                        <span className="font-semibold">{dept.attendanceSubmitted}</span>
                      </div>
                      <Progress value={(dept.attendanceSubmitted / (dept.totalFaculty * 20)) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Faculty List View */}
        {view === 'faculty' && (
          <motion.div
            key="faculty"
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
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Faculty Table */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Faculty Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Experience</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Classes</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredFaculty.map((f) => (
                        <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{f.employee_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{f.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{f.designation}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{f.experience_years} years</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-semibold">{f.classesCompleted || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Progress value={((f.attendanceSubmitted || 0) / (f.classesCompleted || 1)) * 100} className="h-2 w-20" />
                              <span className="text-sm font-semibold">{f.attendanceSubmitted || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold">{f.rating?.toFixed(1) || 'N/A'}</span>
                              <span className="text-yellow-500">⭐</span>
                            </div>
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
                  {filteredFaculty.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No faculty found</p>
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
