"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { getAllStudents, deleteStudent, subscribeToTable } from "@/lib/supabase"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
  { id: "cy", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS", color: "bg-green-500" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML", color: "bg-orange-500" },
]

const years = [
  { id: "first", name: "First Year" },
  { id: "second", name: "Second Year" },
  { id: "third", name: "Third Year" },
  { id: "fourth", name: "Fourth Year" },
]

export default function ManageStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [studentsData, setStudentsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load students data from Supabase
  const loadStudents = async () => {
    try {
      setIsRefreshing(true)
      const students = await getAllStudents()
      setStudentsData(students || [])
    } catch (error) {
      console.error("Error loading students:", error)
      toast({
        title: "Error",
        description: "Failed to load students data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadStudents()

    // Subscribe to real-time updates
    const subscription = subscribeToTable("students", (payload) => {
      console.log("Students table changed:", payload)
      loadStudents() // Reload data when changes occur
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteStudent(studentId)
      toast({
        title: "Student Deleted",
        description: `${studentName} has been removed successfully.`,
      })
      loadStudents() // Refresh the list
    } catch (error: any) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.prn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || student.department === selectedDepartment
    const matchesYear = selectedYear === "all" || student.year === selectedYear
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus
    return matchesSearch && matchesDepartment && matchesYear && matchesStatus
  })

  const getDepartmentInfo = (deptId: string) => {
    return departments.find((dept) => dept.id === deptId) || departments[0]
  }

  const getYearInfo = (yearId: string) => {
    return years.find((year) => year.id === yearId) || years[0]
  }

  const getStudentCountByDepartment = (deptId: string) => {
    return studentsData.filter((student) => student.department === deptId).length
  }

  const getStudentCountByYear = (yearId: string) => {
    return studentsData.filter((student) => student.year === yearId).length
  }

  const getStudentCountByStatus = (status: string) => {
    return studentsData.filter((student) => student.status === status).length
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-600 mt-1">
            Manage student enrollment and records • {studentsData.length} total students
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadStudents}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/university/manage-students/add">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Department Stats */}
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? "all" : dept.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {dept.code}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{dept.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{getStudentCountByDepartment(dept.id)}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Year and Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {years.map((year, index) => (
          <motion.div
            key={year.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            <Card
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedYear(selectedYear === year.id ? "all" : year.id)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{year.name}</h3>
                  <p className="text-xl font-bold text-gray-900">{getStudentCountByYear(year.id)}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Active Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-0 shadow-lg bg-green-50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-green-900 text-sm mb-1">Active</h3>
                <p className="text-xl font-bold text-green-900">{getStudentCountByStatus("active")}</p>
                <p className="text-xs text-green-600">Students</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inactive Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="border-0 shadow-lg bg-red-50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-red-900 text-sm mb-1">Inactive</h3>
                <p className="text-xl font-bold text-red-900">{getStudentCountByStatus("inactive")}</p>
                <p className="text-xs text-red-600">Students</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or PRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedDepartment !== "all" || selectedYear !== "all" || selectedStatus !== "all"
                ? "No students match your search criteria."
                : "No students have been added yet."}
            </p>
            <Link href="/university/manage-students/add">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Student
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => {
            const deptInfo = getDepartmentInfo(student.department)
            const yearInfo = getYearInfo(student.year)
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                            {student.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">PRN: {student.prn}</p>
                          <Badge
                            variant={
                              student.status === "active"
                                ? "default"
                                : student.status === "inactive"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs mt-1"
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/university/manage-students/${student.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/university/manage-students/edit/${student.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Student
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${deptInfo.color}`}></div>
                        <Badge variant="secondary" className="text-xs">
                          {deptInfo.code}
                        </Badge>
                        <span className="text-sm text-gray-600">{yearInfo.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{student.email}</span>
                      </div>

                      {student.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{deptInfo.name}</span>
                      </div>

                      {student.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{student.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Enrolled: {new Date(student.created_at).toLocaleDateString()}</span>
                        <span>ID: {student.id.slice(-8)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
