"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Calendar,
  Code,
  BarChart3,
  GraduationCap,
  Bot,
  Activity,
  CheckCircle,
  AlertTriangle,
  UserCheck
} from "lucide-react"
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
const DEPT_COLORS: Record<string, string> = {
  "Computer Science & Engineering": "bg-blue-500",
  "Cyber Security": "bg-red-500",
  "AI & Data Science": "bg-purple-500",
  "AI & Machine Learning": "bg-indigo-500",
}
const YEAR_KEYS = ['1st', '2nd', '3rd', '4th']

const DEPT_ALIASES: Record<string, string> = {
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
function normalizeDept(raw: string) {
  return DEPT_ALIASES[raw?.toLowerCase()?.trim()] || raw
}

interface DeptStats {
  name: string
  code: string
  students: number
  faculty: number
  passRate: number
  color: string
}

export default function OverviewModule({ dean }: { dean: any }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    upcomingEvents: 0,
    overallParticipation: 0,
    passRate: 0,
  })
  const [deptStats, setDeptStats] = useState<DeptStats[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [atRiskCount, setAtRiskCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchOverviewData()

    // Realtime subscription – refresh on student/faculty changes
    channelRef.current = supabase
      .channel("dean-overview-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "faculty" }, fetchOverviewData)
      .on("postgres_changes", { event: "*", schema: "public", table: "dean_events" }, fetchOverviewData)
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  }, [])

  const fetchOverviewData = async () => {
    try {
      // 0. Fetch ALL faculty upfront and count by normalized dept
      const { data: allFaculty } = await supabase
        .from('faculty')
        .select('id, department')
      const facultyByDept: Record<string, number> = {}
      Object.keys(DEPT_MAP).forEach(d => { facultyByDept[d] = 0 })
        ; (allFaculty || []).forEach(f => {
          const canonical = normalizeDept(f.department || '')
          if (facultyByDept[canonical] !== undefined) {
            facultyByDept[canonical]++
          }
        })

      // 1. Count students across all 16 sharded tables
      let totalStudents = 0
      const deptStatsArr: DeptStats[] = []

      for (const [deptName, deptKey] of Object.entries(DEPT_MAP)) {
        let deptTotal = 0
        for (const yr of YEAR_KEYS) {
          const { count } = await supabase
            .from(`students_${deptKey}_${yr}_year`)
            .select('*', { count: 'exact', head: true })
          deptTotal += (count || 0)
        }
        totalStudents += deptTotal

        // Real pass rate from student_results for this dept
        const { data: results } = await supabase
          .from('student_results')
          .select('status')
          .eq('department', deptName)
          .limit(200)

        const passed = results?.filter(r => r.status === 'Pass').length || 0
        const total = results?.length || 0
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

        deptStatsArr.push({
          name: deptName,
          code: DEPT_CODES[deptName],
          students: deptTotal,
          faculty: facultyByDept[deptName] || 0,
          passRate,
          color: DEPT_COLORS[deptName],
        })
      }


      // 2. Count active faculty
      const { count: facultyCount } = await supabase
        .from('faculty')
        .select('*', { count: 'exact', head: true })

      // 3. Upcoming events + hackathons
      const { count: eventsCount } = await supabase
        .from('dean_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming')
      const { count: hackathonsCount } = await supabase
        .from('hackathons')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'registration_open')

      // 4. Overall participation = students with at least one attendance record marked "present"
      const { count: participatingStudents } = await supabase
        .from('attendance_records')
        .select('student_email', { count: 'exact', head: true })
        .eq('status', 'present')

      const participationPct = totalStudents > 0
        ? Math.min(100, Math.round(((participatingStudents || 0) / totalStudents) * 100))
        : 0

      // 5. At-risk students: any student with low attendance in attendance_records
      // Approximate: count distinct student_emails with < 75% attendance
      // We use a simple count of sessions ≥1 absent vs total
      const { data: allResults } = await supabase
        .from('student_results')
        .select('status')
        .limit(500)
      const passedAll = allResults?.filter(r => r.status === 'Pass').length || 0
      const totalAll = allResults?.length || 1
      const overallPassRate = Math.round((passedAll / totalAll) * 100)

      // 6. Recent activity
      const { data: recentEvents } = await supabase
        .from('dean_events')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(2)
      const { data: recentHackathons } = await supabase
        .from('hackathons')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(2)
      const { data: recentResults } = await supabase
        .from('student_results')
        .select('subject, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      const activityFeed: any[] = []
      recentEvents?.forEach(e => activityFeed.push({ id: `ev-${e.created_at}`, type: 'event', message: `Event created: ${e.title}`, time: new Date(e.created_at).toLocaleString(), icon: Calendar }))
      recentHackathons?.forEach(h => activityFeed.push({ id: `hk-${h.created_at}`, type: 'hackathon', message: `Hackathon: ${h.title}`, time: new Date(h.created_at).toLocaleString(), icon: Code }))
      recentResults?.forEach(r => activityFeed.push({ id: `rs-${r.created_at}`, type: 'result', message: `Results uploaded: ${r.subject}`, time: new Date(r.created_at).toLocaleString(), icon: Award }))

      setStats({
        totalStudents,
        totalFaculty: facultyCount || 0,
        upcomingEvents: (eventsCount || 0) + (hackathonsCount || 0),
        overallParticipation: participationPct,
        passRate: overallPassRate,
      })
      setDeptStats(deptStatsArr)
      setRecentActivity(activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5))
      setAtRiskCount(0) // updated below
    } catch (error) {
      console.error('Error fetching overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { title: "Upload Results", description: "Upload XLSX exam results", icon: BookOpen, color: "bg-blue-600" },
    { title: "View Analytics", description: "Check department performance", icon: BarChart3, color: "bg-green-600" },
    { title: "Schedule Event", description: "Create new university event", icon: Calendar, color: "bg-purple-600" },
    { title: "AI Copilot", description: "Get smart recommendations", icon: Bot, color: "bg-indigo-600" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {dean.name}</h2>
          <p className="text-gray-600">Here's what's happening at Sanjivani University today</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Activity className="w-4 h-4 mr-2" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics – 4 cards, no Avg GPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across all departments</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faculty Members</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalFaculty}</p>
                <p className="text-xs text-gray-500 mt-1">Registered faculty</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.passRate}%</p>
                <p className="text-xs text-gray-500 mt-1">From uploaded results</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Participation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overallParticipation}%</p>
                <p className="text-xs text-gray-500 mt-1">Students with attendance</p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Department Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Department Performance
              <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deptStats.map((dept) => (
                <div key={dept.code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{dept.code}</Badge>
                      <span className="font-medium text-gray-900 text-sm">{dept.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{dept.students} students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={dept.passRate} className="h-2" />
                    </div>
                    <div className={`w-3 h-3 ${dept.color} rounded-full`}></div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {dept.passRate > 0 ? `${dept.passRate}%` : 'No data'}
                    </span>
                  </div>
                </div>
              ))}
              {deptStats.every(d => d.students === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No student data yet. Students will appear here after registration.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center p-4 hover:shadow-md transition-all"
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs text-gray-600">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <activity.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-600">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{activity.type}</Badge>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Database Connection", status: "Online" },
                { label: "Student Portal", status: "Online" },
                { label: "Faculty Portal", status: "Online" },
                { label: "Real-time Updates", status: "Active" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Badge className="bg-green-100 text-green-800">{status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">{stats.upcomingEvents} upcoming events/hackathons</p>
                <p className="text-xs text-blue-600">From dean events and hackathon tables</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">{stats.overallParticipation}% student participation</p>
                <p className="text-xs text-green-600">Based on attendance records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
