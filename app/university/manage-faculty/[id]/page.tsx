"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Clock,
  Briefcase,
  Award,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
  { id: "cy", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS", color: "bg-green-500" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML", color: "bg-orange-500" },
]

export default function FacultyDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [faculty, setFaculty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load faculty data from localStorage
    const storedFaculty = localStorage.getItem("universityFaculty")
    if (storedFaculty) {
      try {
        const facultyList = JSON.parse(storedFaculty)
        const foundFaculty = facultyList.find((f: any) => f.id === params.id)
        if (foundFaculty) {
          setFaculty(foundFaculty)
        }
      } catch (error) {
        console.error("Error loading faculty data:", error)
      }
    }
    setIsLoading(false)
  }, [params.id])

  const getDepartmentInfo = (deptId: string) => {
    return departments.find((dept) => dept.id === deptId) || departments[0]
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Not Found</h1>
        </div>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Faculty Not Found</h3>
            <p className="text-gray-600 mb-6">The faculty member you are looking for does not exist.</p>
            <Button
              onClick={() => router.push("/university/manage-faculty")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Go Back to Faculty List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deptInfo = getDepartmentInfo(faculty.department)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{faculty.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${deptInfo.color}`}></div>
              <Badge variant="secondary" className="text-xs">
                {deptInfo.code}
              </Badge>
              <span className="text-sm text-gray-600">{deptInfo.name}</span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/university/manage-faculty/edit/${faculty.id}`)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Faculty
        </Button>
      </div>

      {/* Faculty Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-32 w-32 ring-4 ring-gray-200 mb-4">
                <AvatarImage src={faculty.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                  {faculty.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-gray-900">{faculty.name}</h2>
              <p className="text-gray-600">{faculty.designation || "Professor"}</p>
              <Badge className="mt-2" variant={faculty.status === "active" ? "default" : "secondary"}>
                {faculty.status}
              </Badge>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Faculty ID</p>
                  <p className="font-medium">{faculty.facultyId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{faculty.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{faculty.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(faculty.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Detailed Info */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Faculty Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Qualification
              </h3>
              <p className="text-gray-700">{faculty.qualification}</p>
            </div>

            {faculty.address && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Address
                </h3>
                <p className="text-gray-700">{faculty.address}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Department
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${deptInfo.color}`}></div>
                <span className="font-medium">{deptInfo.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {deptInfo.code}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Account Status
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={faculty.status === "active" ? "default" : "secondary"}
                  className={faculty.status === "active" ? "bg-green-500" : ""}
                >
                  {faculty.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {faculty.status === "active" ? "Currently Active" : "Currently Inactive"}
                </span>
              </div>
            </div>

            {/* Additional sections can be added here */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
