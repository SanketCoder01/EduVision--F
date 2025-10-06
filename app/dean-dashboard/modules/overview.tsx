"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle
} from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function OverviewModule({ dean }: { dean: any }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeCourses: 0,
    upcomingEvents: 0,
    passRate: 0,
    avgGPA: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      // Fetch students count
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      // Fetch faculty count
      const { count: facultyCount } = await supabase
        .from('faculty')
        .select('*', { count: 'exact', head: true })

      // Fetch courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      // Mock recent activity data
      const mockActivity = [
        { id: 1, type: 'assignment', message: 'New assignment posted in Data Structures', time: '2 hours ago', icon: BookOpen },
        { id: 2, type: 'result', message: 'Mid-term results uploaded for CS students', time: '4 hours ago', icon: Award },
        { id: 3, type: 'event', message: 'Hackathon registration deadline approaching', time: '6 hours ago', icon: Calendar },
        { id: 4, type: 'student', message: '5 new students enrolled in AI & Data Science', time: '1 day ago', icon: Users },
        { id: 5, type: 'faculty', message: 'Faculty performance review completed', time: '2 days ago', icon: TrendingUp }
      ]

      setStats({
        totalStudents: studentsCount || 1247,
        totalFaculty: facultyCount || 45,
        activeCourses: coursesCount || 28,
        upcomingEvents: 8,
        passRate: 94.6,
        avgGPA: 8.2
      })
      
      setRecentActivity(mockActivity)
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

  const departmentPerformance = [
    { name: "Computer Science & Engineering", students: 456, passRate: 96, color: "bg-blue-500" },
    { name: "AI & Data Science", students: 312, passRate: 95, color: "bg-purple-500" },
    { name: "AI & Machine Learning", students: 245, passRate: 94, color: "bg-indigo-500" },
    { name: "Cyber Security", students: 234, passRate: 93, color: "bg-red-500" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          All Systems Operational
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</p>
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
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average GPA</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgGPA}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{dept.name}</span>
                    <span className="text-sm text-gray-600">{dept.students} students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={dept.passRate} className="h-2" />
                    </div>
                    <div className={`w-4 h-4 ${dept.color} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-900">{dept.passRate}%</span>
                  </div>
                </div>
              ))}
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
              {quickActions.map((action, index) => (
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
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <activity.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-600">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
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
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Portal</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Faculty Portal</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Updates</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">67 students at risk</p>
                <p className="text-xs text-orange-600">Review performance and assign improvement plans</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">3 events this week</p>
                <p className="text-xs text-blue-600">Hackathon, Guest lecture, and Student orientation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
