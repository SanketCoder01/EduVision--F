"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, GraduationCap, BookOpen, LogOut, BarChart3, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { getAllStudents, getAllFaculty } from "@/lib/supabase"
import StudentManagement from "./StudentManagement"
import FacultyManagement from "./FacultyManagement"

interface UniversityDashboardProps {
  adminData?: {
    id: string
    name: string
    email: string
    role: string
  }
  onLogout: () => void
}

export default function UniversityDashboard({ adminData, onLogout }: UniversityDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeAssignments: 0,
    departments: 4,
  })
  const [loading, setLoading] = useState(true)

  // Default admin data if not provided
  const defaultAdminData = {
    id: "admin-1",
    name: "University Administrator",
    email: "admin@university.edu",
    role: "University Admin",
  }

  const currentAdminData = adminData || defaultAdminData

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [students, faculty] = await Promise.all([getAllStudents(), getAllFaculty()])

      const departments = new Set([...students.map((s) => s.department), ...faculty.map((f) => f.department)]).size || 4

      setStats({
        totalStudents: students.length,
        totalFaculty: faculty.length,
        activeAssignments: 0, // This would come from assignments table
        departments,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem("university_admin")
    localStorage.removeItem("faculty_session")
    localStorage.removeItem("student_session")

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    onLogout()
  }

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <StudentManagement onStatsUpdate={loadStats} />
      case "faculty":
        return <FacultyManagement onStatsUpdate={loadStats} />
      case "dashboard":
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white"
            >
              <h1 className="text-2xl font-bold mb-2">Welcome back, {currentAdminData.name}!</h1>
              <p className="text-emerald-100">
                Manage your university's academic operations from this comprehensive dashboard.
              </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Active enrollments</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : stats.totalFaculty}</div>
                    <p className="text-xs text-muted-foreground">Teaching staff</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Departments</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : stats.departments}</div>
                    <p className="text-xs text-muted-foreground">Academic divisions</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : stats.activeAssignments}</div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks and bulk operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setActiveTab("students")}
                      className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Manage Students
                    </Button>
                    <Button
                      onClick={() => setActiveTab("faculty")}
                      className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Manage Faculty
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">University Portal</h1>
              <p className="text-sm text-gray-600">Administrative Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentAdminData.name}</p>
              <p className="text-xs text-gray-600">{currentAdminData.email}</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              {currentAdminData.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboard"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Students
          </button>
          <button
            onClick={() => setActiveTab("faculty")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "faculty"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <GraduationCap className="h-4 w-4 inline mr-2" />
            Faculty
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">{renderContent()}</main>
    </div>
  )
}
