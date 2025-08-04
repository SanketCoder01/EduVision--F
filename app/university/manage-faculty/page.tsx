"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Plus, Search, MoreVertical, Edit, Trash2, Eye, Mail, Phone, MapPin, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
  { id: "cy", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS", color: "bg-green-500" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML", color: "bg-orange-500" },
]

export default function ManageFacultyPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [facultyData, setFacultyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load faculty data from localStorage
    const storedFaculty = localStorage.getItem("universityFaculty")
    if (storedFaculty) {
      try {
        setFacultyData(JSON.parse(storedFaculty))
      } catch (error) {
        console.error("Error loading faculty data:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleDeleteFaculty = (facultyId: string) => {
    const updatedFaculty = facultyData.filter((faculty) => faculty.id !== facultyId)
    setFacultyData(updatedFaculty)
    localStorage.setItem("universityFaculty", JSON.stringify(updatedFaculty))
    toast({
      title: "Faculty Deleted",
      description: "Faculty member has been removed successfully.",
    })
  }

  const filteredFaculty = facultyData.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.facultyId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || faculty.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const getDepartmentInfo = (deptId: string) => {
    return departments.find((dept) => dept.id === deptId) || departments[0]
  }

  const getFacultyCountByDepartment = (deptId: string) => {
    return facultyData.filter((faculty) => faculty.department === deptId).length
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
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Faculty</h1>
          <p className="text-gray-600 mt-1">Manage faculty members across all departments</p>
        </div>
        <Link href="/university/manage-faculty/add">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </Link>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-2xl font-bold text-gray-900 mt-2">{getFacultyCountByDepartment(dept.id)}</p>
                    <p className="text-xs text-gray-500">Faculty Members</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search faculty by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedDepartment === "all" ? "default" : "outline"}
                onClick={() => setSelectedDepartment("all")}
                size="sm"
              >
                All Departments
              </Button>
              {departments.map((dept) => (
                <Button
                  key={dept.id}
                  variant={selectedDepartment === dept.id ? "default" : "outline"}
                  onClick={() => setSelectedDepartment(dept.id)}
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  {dept.code}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty List */}
      {filteredFaculty.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Faculty Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedDepartment !== "all"
                ? "No faculty members match your search criteria."
                : "No faculty members have been added yet."}
            </p>
            <Link href="/university/manage-faculty/add">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Faculty
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((faculty, index) => {
            const deptInfo = getDepartmentInfo(faculty.department)
            return (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                          <AvatarImage src={faculty.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {faculty.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
                          <p className="text-sm text-gray-600">{faculty.facultyId}</p>
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
                            <Link href={`/university/manage-faculty/${faculty.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/university/manage-faculty/edit/${faculty.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Faculty
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFaculty(faculty.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Faculty
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
                        <span className="text-sm text-gray-600">{deptInfo.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{faculty.email}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{faculty.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>{faculty.qualification}</span>
                      </div>

                      {faculty.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{faculty.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Added: {new Date(faculty.createdAt).toLocaleDateString()}</span>
                        <Badge variant={faculty.status === "active" ? "default" : "secondary"} className="text-xs">
                          {faculty.status}
                        </Badge>
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
