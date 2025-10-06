"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
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
  Home,
  LogOut,
  Menu,
  X,
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Bell,
  Settings,
  Shield
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface DeanUser {
  email: string
  name: string
  role: string
  department: string
  loginTime: string
}

export default function DeanDashboard() {
  const [user, setUser] = useState<DeanUser | null>(null)
  const [activeModule, setActiveModule] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home, color: "text-blue-600" },
    { id: "students", label: "Student Progress", icon: Users, color: "text-green-600" },
    { id: "faculty", label: "Faculty Analytics", icon: TrendingUp, color: "text-purple-600" },
    { id: "results", label: "Result Management", icon: BookOpen, color: "text-orange-600" },
    { id: "events", label: "Event Organizing", icon: Calendar, color: "text-pink-600" },
    { id: "hackathon", label: "Hackathon", icon: Code, color: "text-red-600" },
    { id: "analytics", label: "Department Analytics", icon: BarChart3, color: "text-indigo-600" },
    { id: "curriculum", label: "Curriculum Optimization", icon: GraduationCap, color: "text-teal-600" },
    { id: "ai-copilot", label: "AI Copilot", icon: Bot, color: "text-cyan-600" },
  ]

  const overviewStats = [
    { title: "Total Students", value: "2,847", change: "+5.2%", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Active Faculty", value: "156", change: "+2.1%", icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Pass Rate", value: "87.3%", change: "+3.4%", icon: Award, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Events This Month", value: "23", change: "+12.5%", icon: Calendar, color: "text-purple-600", bgColor: "bg-purple-50" }
  ]

  const recentActivities = [
    { action: "New exam results uploaded", time: "2 hours ago", type: "results" },
    { action: "Faculty performance report generated", time: "4 hours ago", type: "analytics" },
    { action: "Hackathon registration opened", time: "1 day ago", type: "hackathon" },
    { action: "Curriculum optimization completed", time: "2 days ago", type: "curriculum" }
  ]

  useEffect(() => {
    const deanSession = localStorage.getItem("deanSession")
    if (deanSession) {
      try {
        const userData = JSON.parse(deanSession)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing dean session:", error)
        router.push("/deanlogin")
      }
    } else {
      router.push("/deanlogin")
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("deanSession")
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    })
    router.push("/")
  }

  const renderModuleContent = () => {
    switch (activeModule) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-green-600">{stat.change}</p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                    Department Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: "Computer Science", progress: 92, students: 456 },
                      { dept: "Electronics", progress: 88, students: 312 },
                      { dept: "Mechanical", progress: 85, students: 289 },
                      { dept: "Civil", progress: 91, students: 234 }
                    ].map((dept, index) => (
                      <div key={dept.dept} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{dept.dept}</span>
                          <span className="text-sm text-gray-600">{dept.progress}%</span>
                        </div>
                        <Progress value={dept.progress} className="h-2" />
                        <p className="text-xs text-gray-500">{dept.students} students</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "students":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Student Progress Tracking</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1,247</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">324</div>
                  <div className="text-sm text-gray-600">High Performers</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">67</div>
                  <div className="text-sm text-gray-600">At Risk Students</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">8.2</div>
                  <div className="text-sm text-gray-600">Average GPA</div>
                </CardContent>
              </Card>
            </div>

            {/* Department-wise Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Department-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: "Computer Science & Engineering", students: 456, avgGPA: 8.7, passRate: 94, color: "bg-blue-500" },
                      { dept: "Cyber Security", students: 234, avgGPA: 8.4, passRate: 91, color: "bg-red-500" },
                      { dept: "AI & Data Science", students: 312, avgGPA: 8.9, passRate: 96, color: "bg-purple-500" },
                      { dept: "AI & Machine Learning", students: 245, avgGPA: 8.6, passRate: 93, color: "bg-indigo-500" }
                    ].map((dept, index) => (
                      <div key={dept.dept} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{dept.dept}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{dept.students} students</span>
                            <span>{dept.passRate}% pass rate</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Average GPA</span>
                              <span className="font-medium">{dept.avgGPA}</span>
                            </div>
                            <Progress value={(dept.avgGPA / 10) * 100} className="h-2" />
                          </div>
                          <div className={`w-4 h-4 ${dept.color} rounded-full`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Top Performing Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Arjun Patel", dept: "AI & Data Science", gpa: "9.8", rank: 1, status: "Excellent" },
                      { name: "Priya Singh", dept: "Computer Science", gpa: "9.6", rank: 2, status: "Excellent" },
                      { name: "Rahul Kumar", dept: "AI & ML", gpa: "9.4", rank: 3, status: "Excellent" },
                      { name: "Sneha Sharma", dept: "Cyber Security", gpa: "9.2", rank: 4, status: "Excellent" },
                      { name: "Vikram Joshi", dept: "Computer Science", gpa: "9.0", rank: 5, status: "Excellent" }
                    ].map((student, index) => (
                      <div key={student.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">#{student.rank}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.dept}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{student.gpa}</div>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Performance Overview</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Search students..." className="w-64" />
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student ID</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">GPA</th>
                        <th className="text-left p-3">Attendance</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "CS001", name: "Arjun Patel", dept: "Computer Science & Engineering", gpa: "9.2", attendance: "96%", status: "Excellent" },
                        { id: "CS002", name: "Priya Singh", dept: "AI & Data Science", gpa: "8.8", attendance: "94%", status: "Good" },
                        { id: "CY001", name: "Rahul Kumar", dept: "Cyber Security", gpa: "8.5", attendance: "92%", status: "Good" },
                        { id: "AI001", name: "Sneha Sharma", dept: "AI & Machine Learning", gpa: "7.8", attendance: "88%", status: "Average" },
                        { id: "CS003", name: "Vikram Joshi", dept: "Computer Science & Engineering", gpa: "6.9", attendance: "82%", status: "At Risk" }
                      ].map((student, index) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{student.id}</td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3">{student.dept}</td>
                          <td className="p-3">{student.gpa}</td>
                          <td className="p-3">{student.attendance}</td>
                          <td className="p-3">
                            <Badge variant={
                              student.status === "Excellent" ? "default" :
                              student.status === "Good" ? "secondary" :
                              student.status === "Average" ? "outline" : "destructive"
                            }>
                              {student.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "results":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Result Management System</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload XLSX
              </Button>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Upload Exam Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop your XLSX file here</p>
                  <p className="text-gray-600 mb-4">or click to browse files</p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1,087</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">160</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">87.2%</div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Results</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Generate Plans
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Roll No</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Marks</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { roll: "CS001", name: "Arjun Patel", marks: "85/100", status: "Pass" },
                        { roll: "CS002", name: "Priya Singh", marks: "92/100", status: "Pass" },
                        { roll: "CS003", name: "Rahul Kumar", marks: "35/100", status: "Fail" },
                        { roll: "CS004", name: "Sneha Sharma", marks: "78/100", status: "Pass" }
                      ].map((student, index) => (
                        <tr key={student.roll} className="border-b hover:bg-gray-50">
                          <td className="p-3">{student.roll}</td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3">{student.marks}</td>
                          <td className="p-3">
                            <Badge variant={student.status === "Pass" ? "default" : "destructive"}>
                              {student.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View Report
                              </Button>
                              {student.status === "Fail" && (
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                  Assign Plan
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {sidebarItems.find(item => item.id === activeModule)?.icon && 
                  React.createElement(sidebarItems.find(item => item.id === activeModule)!.icon, { className: "w-8 h-8 text-white" })
                }
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {sidebarItems.find(item => item.id === activeModule)?.label} Module
              </h3>
              <p className="text-gray-600">
                This module is under development. Advanced features coming soon!
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dean Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dean Portal</h1>
                <p className="text-xs text-gray-600">Sanjivani University</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeModule === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {sidebarItems.find(item => item.id === activeModule)?.label}
                </h2>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderModuleContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
