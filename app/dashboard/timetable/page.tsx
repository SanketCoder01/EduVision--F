"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Upload,
  Download,
  FileText,
  Users,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FacultyTimetablePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadedTimetables, setUploadedTimetables] = useState<any[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  useEffect(() => {
    const facultySession = localStorage.getItem("facultySession")
    const currentUserData = localStorage.getItem("currentUser")

    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
        setSelectedDepartment(user.department || "")
      } catch (error) {
        console.error("Error parsing faculty session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
        setSelectedDepartment(user.department || "")
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }

    // Load uploaded timetables from localStorage
    const savedTimetables = localStorage.getItem("uploadedTimetables")
    if (savedTimetables) {
      try {
        setUploadedTimetables(JSON.parse(savedTimetables))
      } catch (error) {
        console.error("Error parsing timetables:", error)
      }
    }
  }, [])

  const departments = [
    "Computer Science Engineering",
    "Artificial Intelligence & Data Science", 
    "Artificial Intelligence & Machine Learning",
    "Cyber Security"
  ]

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year"]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedDepartment && selectedYear) {
      const newTimetable = {
        id: Date.now().toString(),
        name: file.name,
        department: selectedDepartment,
        year: selectedYear,
        uploadedBy: currentUser?.name || "Faculty",
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type
      }

      const updatedTimetables = [...uploadedTimetables, newTimetable]
      setUploadedTimetables(updatedTimetables)
      localStorage.setItem("uploadedTimetables", JSON.stringify(updatedTimetables))
      
      // Reset file input
      event.target.value = ""
    }
  }

  const deleteTimetable = (id: string) => {
    const updatedTimetables = uploadedTimetables.filter(t => t.id !== id)
    setUploadedTimetables(updatedTimetables)
    localStorage.setItem("uploadedTimetables", JSON.stringify(updatedTimetables))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredTimetables = uploadedTimetables.filter(timetable => 
    (!selectedDepartment || timetable.department === selectedDepartment) &&
    (!selectedYear || timetable.year === selectedYear)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Timetable Management</h1>
            <p className="text-blue-100">
              Upload and manage class timetables for your department
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="timetable-upload"
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!selectedDepartment || !selectedYear}
            />
            <label
              htmlFor="timetable-upload"
              className={`cursor-pointer ${!selectedDepartment || !selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click to upload timetable
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, Images, Excel, Word files (Max 10MB)
              </p>
            </label>
          </div>
          
          {(!selectedDepartment || !selectedYear) && (
            <p className="text-sm text-orange-600 text-center">
              Please select both department and year before uploading
            </p>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {uploadedTimetables.length}
            </div>
            <p className="text-sm text-gray-600">Total Timetables</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {new Set(uploadedTimetables.map(t => t.department)).size}
            </div>
            <p className="text-sm text-gray-600">Departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {new Set(uploadedTimetables.map(t => t.year)).size}
            </div>
            <p className="text-sm text-gray-600">Year Groups</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {uploadedTimetables.filter(t => {
                const uploadDate = new Date(t.uploadedAt)
                const today = new Date()
                return uploadDate.toDateString() === today.toDateString()
              }).length}
            </div>
            <p className="text-sm text-gray-600">Uploaded Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Timetables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Timetables
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTimetables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No timetables uploaded yet</p>
              <p className="text-sm">Upload your first timetable to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimetables.map((timetable) => (
                <motion.div
                  key={timetable.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{timetable.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {timetable.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {timetable.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(timetable.uploadedAt).toLocaleDateString()}
                          </span>
                          <span>{formatFileSize(timetable.size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTimetable(timetable.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
