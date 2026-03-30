"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, BookOpen, CheckCircle, Calendar, Code, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

interface DeptAnalytics {
  name: string
  code: string
  students: number
  faculty: number
  assignments: number
  events: number
  hackathons: number
  passRate: number
  attendanceSessions: number
  avgAttendance: number
}

export default function DepartmentAnalyticsModule({ dean }: { dean: any }) {
  const [analytics, setAnalytics] = useState<DeptAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchAnalytics()

    channelRef.current = supabase
      .channel("dean-dept-analytics-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "faculty" }, fetchAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" }, fetchAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_sessions" }, fetchAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_results" }, fetchAnalytics)
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const depts = Object.keys(DEPT_MAP)

      // Fetch faculty, assignments, attendance, events, hackathons in parallel
      const [facRes, assignRes, sessRes, evRes, hackRes] = await Promise.all([
        supabase.from('faculty').select('id, department'),
        supabase.from('assignments').select('id, department, faculty_id'),
        supabase.from('attendance_sessions').select('id, faculty_id, status, department'),
        supabase.from('dean_events').select('id, department'),
        supabase.from('hackathons').select('id, department'),
      ])

      const allFaculty = facRes.data || []
      const allAssignments = assignRes.data || []
      const allSessions = sessRes.data || []
      const allEvents = evRes.data || []
      const allHackathons = hackRes.data || []

      const result: DeptAnalytics[] = await Promise.all(
        depts.map(async (dept) => {
          const deptKey = DEPT_MAP[dept]

          // Real student count
          let students = 0
          let totalPresent = 0
          let totalPossible = 0
          for (const yr of YEAR_KEYS) {
            const { count } = await supabase
              .from(`students_${deptKey}_${yr}_year`)
              .select('*', { count: 'exact', head: true })
            students += (count || 0)
          }

          // Faculty
          const deptFaculty = allFaculty.filter(f => f.department === dept)
          const facultyIds = new Set(deptFaculty.map(f => f.id))

          // Assignments by faculty in this dept
          const assignments = allAssignments.filter(a => {
            const aDept = (a.department || '').toLowerCase()
            const dKey = deptKey.toLowerCase()
            // match by faculty_id OR by department string
            return facultyIds.has(a.faculty_id) || aDept === dKey || aDept === dept.toLowerCase()
          }).length

          // Attendance sessions
          const deptSessions = allSessions.filter(s => facultyIds.has(s.faculty_id) || s.department === dept)
          const attendanceSessions = deptSessions.filter(s => s.status === 'completed').length

          // Events: all departments OR specific dept
          const events = allEvents.filter(e => e.department === dept || e.department === 'All Departments').length
          const hackathons = allHackathons.filter(h => h.department === dept || h.department === 'All Departments').length

          // Pass rate
          const { data: res } = await supabase
            .from('student_results')
            .select('status')
            .eq('department', dept)
            .limit(200)
          const passed = res?.filter(r => r.status === 'Pass').length || 0
          const totalRes = res?.length || 0
          const passRate = totalRes > 0 ? Math.round((passed / totalRes) * 100) : 0

          // Avg attendance
          if (students > 0) {
            // Count sessions for this dept
            const sessionIds = deptSessions.map(s => s.id)
            if (sessionIds.length > 0) {
              const { count: presentCount } = await supabase
                .from('attendance_records')
                .select('*', { count: 'exact', head: true })
                .in('session_id', sessionIds)
                .eq('status', 'present')
              totalPresent = presentCount || 0
              totalPossible = students * sessionIds.length
            }
          }
          const avgAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0

          return {
            name: dept,
            code: DEPT_CODES[dept],
            students,
            faculty: deptFaculty.length,
            assignments,
            events,
            hackathons,
            passRate,
            attendanceSessions,
            avgAttendance,
          }
        })
      )
      setAnalytics(result)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real department analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Department & Subject Analytics</h2>
          <p className="text-gray-600 mt-1">Real-time data from Supabase across all departments</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border border-green-200 px-3 py-1">
          🔴 Live
        </Badge>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: analytics.reduce((a, d) => a + d.students, 0), icon: <Users className="w-5 h-5 text-blue-600" />, color: "text-blue-600" },
          { label: "Total Faculty", value: analytics.reduce((a, d) => a + d.faculty, 0), icon: <BookOpen className="w-5 h-5 text-green-600" />, color: "text-green-600" },
          { label: "Total Assignments", value: analytics.reduce((a, d) => a + d.assignments, 0), icon: <CheckCircle className="w-5 h-5 text-purple-600" />, color: "text-purple-600" },
          { label: "Events + Hackathons", value: analytics.reduce((a, d) => a + d.events + d.hackathons, 0), icon: <Calendar className="w-5 h-5 text-orange-600" />, color: "text-orange-600" },
        ].map(({ label, value, icon, color }) => (
          <Card key={label} className="border-0 shadow-md bg-white/80">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.map((dept) => (
          <Card key={dept.name} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{dept.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">{dept.code}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${dept.passRate > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {dept.passRate > 0 ? `${dept.passRate}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Students", value: dept.students, icon: <Users className="w-4 h-4 text-blue-500" /> },
                  { label: "Faculty", value: dept.faculty, icon: <BookOpen className="w-4 h-4 text-green-500" /> },
                  { label: "Assignments", value: dept.assignments, icon: <CheckCircle className="w-4 h-4 text-purple-500" /> },
                  { label: "Events", value: dept.events, icon: <Calendar className="w-4 h-4 text-orange-500" /> },
                  { label: "Hackathons", value: dept.hackathons, icon: <Code className="w-4 h-4 text-pink-500" /> },
                  { label: "Sessions", value: dept.attendanceSessions, icon: <TrendingUp className="w-4 h-4 text-indigo-500" /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {icon}
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-bold text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Attendance</span>
                  <span className={`font-semibold ${dept.avgAttendance === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {dept.students === 0 ? 'No students' : dept.avgAttendance === 0 ? '0% – No sessions' : `${dept.avgAttendance}%`}
                  </span>
                </div>
                <Progress value={dept.avgAttendance} className="h-2" />
              </div>

              {/* Pass Rate Bar */}
              {dept.passRate > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pass Rate</span>
                    <span className="font-semibold text-green-600">{dept.passRate}%</span>
                  </div>
                  <Progress value={dept.passRate} className="h-2 [&>div]:bg-green-500" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
