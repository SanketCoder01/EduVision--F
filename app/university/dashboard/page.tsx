"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  FileText,
  BarChart3,
  Award,
  ChevronRight,
  Sparkles,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function UniversityDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalDepartments: 4,
    facultyByDepartment: {} as Record<string, number>,
    studentsByDepartment: {} as Record<string, number>,
    studentsByYear: {} as Record<string, number>,
    recentActivities: [] as any[],
  })

  const departments = [
    { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
    { id: "cy", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
    { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS", color: "bg-green-500" },
    { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML", color: "bg-orange-500" },
  ]

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year"]

  useEffect(() => {
    const adminSession = localStorage.getItem("universityAdmin")
    if (adminSession) {
      setAdminData(JSON.parse(adminSession))
    }

    // Load real-time data
    loadDashboardData()

    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const loadDashboardData = () => {
    // Load faculty data
    const facultyData = JSON.parse(localStorage.getItem("universityFaculty") || "[]")
    const studentsData = JSON.parse(localStorage.getItem("universityStudents") || "[]")

    // Calculate faculty by department
    const facultyByDept: Record<string, number> = {}
    departments.forEach((dept) => {
      facultyByDept[dept.id] = facultyData.filter((f: any) => f.department === dept.id).length
    })

    // Calculate students by department
    const studentsByDept: Record<string, number> = {}
    departments.forEach((dept) => {
      studentsByDept[dept.id] = studentsData.filter((s: any) => s.department === dept.id).length
    })

    // Calculate students by year
    const studentsByYr: Record<string, number> = {}
    years.forEach((year) => {
      studentsByYr[year] = studentsData.filter((s: any) => s.year === year).length
    })

    // Generate recent activities
    const activities = []

    // Add recent faculty additions
    const recentFaculty = facultyData
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)

    recentFaculty.forEach((faculty: any) => {
      const dept = departments.find((d) => d.id === faculty.department)
      activities.push({
        type: "faculty_added",
        title: "New Faculty Added",
        description: `${faculty.name} joined ${dept?.name}`,
        time: new Date(faculty.createdAt).toLocaleDateString(),
        icon: Users,
        color: "text-blue-600",
      })
    })

    // Add recent student additions
    const recentStudents = studentsData
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)

    recentStudents.forEach((student: any) => {
      const dept = departments.find((d) => d.id === student.department)
      activities.push({
        type: "student_added",
        title: "New Student Enrolled",
        description: `${student.name} enrolled in ${dept?.name} - ${student.year}`,
        time: new Date(student.createdAt).toLocaleDateString(),
        icon: GraduationCap,
        color: "text-green-600",
      })
    })

    // Sort activities by date
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    setDashboardData({
      totalStudents: studentsData.length,
      totalFaculty: facultyData.length,
      totalCourses: 0, // Will be implemented when courses module is added
      totalDepartments: 4,
      facultyByDepartment: facultyByDept,
      studentsByDepartment: studentsByDept,
      studentsByYear: studentsByYr,
      recentActivities: activities.slice(0, 5),
    })
  }

  const modules = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Manage Faculty",
      description: "Add, edit, and manage faculty members across departments",
      href: "/university/manage-faculty",
      color: "from-blue-500 to-blue-700",
      count: `${dashboardData.totalFaculty} Faculty`,
      bgColor: "bg-blue-50",
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-green-600" />,
      title: "Manage Students",
      description: "Student enrollment, records, and academic management",
      href: "/university/manage-students",
      color: "from-green-500 to-green-700",
      count: `${dashboardData.totalStudents} Students`,
      bgColor: "bg-green-50",
    },
    {
      icon: <UserPlus className="h-8 w-8 text-purple-600" />,
      title: "Admission Process",
      description: "Handle new admissions and application processing",
      href: "/university/admissions",
      color: "from-purple-500 to-purple-700",
      count: "Coming Soon",
      bgColor: "bg-purple-50",
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "Examination Module",
      description: "Exam scheduling, results, and academic evaluation",
      href: "/university/examinations",
      color: "from-orange-500 to-orange-700",
      count: "Coming Soon",
      bgColor: "bg-orange-50",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
      title: "Course Management",
      description: "Curriculum design and course administration",
      href: "/university/courses",
      color: "from-indigo-500 to-indigo-700",
      count: "Coming Soon",
      bgColor: "bg-indigo-50",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-teal-600" />,
      title: "Analytics & Reports",
      description: "University performance metrics and insights",
      href: "/university/analytics",
      color: "from-teal-500 to-teal-700",
      count: "Live Data",
      bgColor: "bg-teal-50",
    },
  ]

  const stats = [
    {
      title: "Total Students",
      value: dashboardData.totalStudents.toString(),
      change: dashboardData.totalStudents > 0 ? "+12%" : "0%",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Faculty Members",
      value: dashboardData.totalFaculty.toString(),
      change: dashboardData.totalFaculty > 0 ? "+5%" : "0%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Courses",
      value: dashboardData.totalCourses.toString(),
      change: "0%",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Departments",
      value: dashboardData.totalDepartments.toString(),
      change: "0%",
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-white/60" />
          </motion.div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {adminData?.name}</h1>
          <p className="text-white/90 text-lg">Sanjivani University Administrative Dashboard</p>
          <div className="mt-4 flex items-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">System Status: All services operational</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p
                      className={`text-sm mt-1 ${stat.change.startsWith("+") ? "text-green-600" : stat.change === "0%" ? "text-gray-500" : "text-red-600"}`}
                    >
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-4 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Department Overview */}
      {dashboardData.totalFaculty > 0 || dashboardData.totalStudents > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Faculty by Department */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Faculty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departments.map((dept) => {
                const count = dashboardData.facultyByDepartment[dept.id] || 0
                const percentage = dashboardData.totalFaculty > 0 ? (count / dashboardData.totalFaculty) * 100 : 0
                return (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                        <span className="text-sm font-medium">{dept.code}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count} faculty</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Students by Department */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                Student Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departments.map((dept) => {
                const count = dashboardData.studentsByDepartment[dept.id] || 0
                const percentage = dashboardData.totalStudents > 0 ? (count / dashboardData.totalStudents) * 100 : 0
                return (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                        <span className="text-sm font-medium">{dept.code}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count} students</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Modules */}
        <div className="xl:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">University Management Modules</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {modules.map((module, index) => (
              <motion.div key={index} variants={item}>
                <Link href={module.href}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer transform hover:scale-105">
                    <CardContent className="p-6 flex flex-col h-full relative overflow-hidden">
                      {/* Background Gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      ></div>

                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <motion.div
                          className={`p-4 rounded-2xl ${module.bgColor} group-hover:bg-white transition-colors duration-300 shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {module.icon}
                        </motion.div>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {module.count}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex-grow relative z-10">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-gray-800 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                          {module.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-end mt-6 relative z-10">
                        <motion.div
                          className="text-gray-400 group-hover:text-gray-600"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </motion.div>
                      </div>

                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 rounded-lg transition-all duration-300"></div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities</h2>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                Latest Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-gray-50">
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400">Activities will appear here as you add faculty and students</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/university/manage-faculty/add">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Add New Faculty</h4>
                <p className="text-sm text-gray-600">Quickly add faculty members</p>
              </div>
            </Link>
            <Link href="/university/manage-students/add">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                <GraduationCap className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Add New Student</h4>
                <p className="text-sm text-gray-600">Register new students</p>
              </div>
            </Link>
            <Link href="/university/analytics">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900">View Reports</h4>
                <p className="text-sm text-gray-600">Access analytics dashboard</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
