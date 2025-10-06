"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, Award, Eye, Edit, Filter, BarChart3, GraduationCap } from "lucide-react"

interface Student {
  id: string
  name: string
  department: string
  gpa: number
  attendance: number
  status: "Excellent" | "Good" | "Average" | "At Risk"
  rank?: number
}

const departments = [
  { name: "Computer Science & Engineering", code: "CSE", students: 456, avgGPA: 8.7, passRate: 94 },
  { name: "Cyber Security", code: "CY", students: 234, avgGPA: 8.4, passRate: 91 },
  { name: "AI & Data Science", code: "AI", students: 312, avgGPA: 8.9, passRate: 96 },
  { name: "AI & Machine Learning", code: "ML", students: 245, avgGPA: 8.6, passRate: 93 }
]

const topStudents: Student[] = [
  { id: "AI001", name: "Arjun Patel", department: "AI & Data Science", gpa: 9.8, attendance: 98, status: "Excellent", rank: 1 },
  { id: "CS001", name: "Priya Singh", department: "Computer Science & Engineering", gpa: 9.6, attendance: 96, status: "Excellent", rank: 2 },
  { id: "ML001", name: "Rahul Kumar", department: "AI & Machine Learning", gpa: 9.4, attendance: 94, status: "Excellent", rank: 3 },
  { id: "CY001", name: "Sneha Sharma", department: "Cyber Security", gpa: 9.2, attendance: 92, status: "Excellent", rank: 4 },
  { id: "CS002", name: "Vikram Joshi", department: "Computer Science & Engineering", gpa: 9.0, attendance: 90, status: "Excellent", rank: 5 }
]

export default function StudentProgressModule({ dean }: { dean: any }) {
  const [selectedDept, setSelectedDept] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

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
        <h2 className="text-3xl font-bold text-gray-900">Student Progress Tracking</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Users className="h-5 w-5 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats Overview */}
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

      {/* Department Performance & Top Students */}
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
              {departments.map((dept, index) => (
                <div key={dept.code} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{dept.name}</h4>
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
                    <div className={`w-4 h-4 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-red-500' : index === 2 ? 'bg-purple-500' : 'bg-indigo-500'} rounded-full`}></div>
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
              {topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">#{student.rank}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.department}</p>
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

      {/* Student Performance Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Student Performance Overview</CardTitle>
            <div className="flex gap-2">
              <Input 
                placeholder="Search students..." 
                className="w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                ].filter(student => 
                  searchTerm === "" || 
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.dept.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((student, index) => (
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
    </motion.div>
  )
}
