"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Plus,
  Filter,
  Download,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function StudentTimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const studentSession = localStorage.getItem("studentSession")
    const currentUserData = localStorage.getItem("currentUser")

    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }
  }, [])

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ]

  // Sample timetable data - in real app, this would come from API
  const timetableData = {
    Monday: [
      { time: "9:00 AM", subject: "Data Structures", faculty: "Dr. Smith", room: "CS-101", type: "Lecture" },
      { time: "11:00 AM", subject: "Database Management", faculty: "Prof. Johnson", room: "CS-102", type: "Practical" },
      { time: "2:00 PM", subject: "Computer Networks", faculty: "Dr. Brown", room: "CS-103", type: "Lecture" },
    ],
    Tuesday: [
      { time: "10:00 AM", subject: "Operating Systems", faculty: "Dr. Wilson", room: "CS-104", type: "Lecture" },
      { time: "1:00 PM", subject: "Software Engineering", faculty: "Prof. Davis", room: "CS-105", type: "Practical" },
      { time: "3:00 PM", subject: "Machine Learning", faculty: "Dr. Miller", room: "CS-106", type: "Lecture" },
    ],
    Wednesday: [
      { time: "9:00 AM", subject: "Data Structures", faculty: "Dr. Smith", room: "CS-101", type: "Practical" },
      { time: "11:00 AM", subject: "Web Development", faculty: "Prof. Taylor", room: "CS-107", type: "Practical" },
      { time: "2:00 PM", subject: "Algorithms", faculty: "Dr. Anderson", room: "CS-108", type: "Lecture" },
    ],
    Thursday: [
      { time: "10:00 AM", subject: "Database Management", faculty: "Prof. Johnson", room: "CS-102", type: "Lecture" },
      { time: "12:00 PM", subject: "Computer Networks", faculty: "Dr. Brown", room: "CS-103", type: "Practical" },
      { time: "3:00 PM", subject: "Project Work", faculty: "Multiple", room: "CS-109", type: "Project" },
    ],
    Friday: [
      { time: "9:00 AM", subject: "Operating Systems", faculty: "Dr. Wilson", room: "CS-104", type: "Practical" },
      { time: "11:00 AM", subject: "Machine Learning", faculty: "Dr. Miller", room: "CS-106", type: "Practical" },
      { time: "2:00 PM", subject: "Seminar", faculty: "Guest Speaker", room: "Auditorium", type: "Seminar" },
    ],
    Saturday: [],
    Sunday: []
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 text-blue-800"
      case "Practical": return "bg-green-100 text-green-800"
      case "Project": return "bg-purple-100 text-purple-800"
      case "Seminar": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const todayClasses = timetableData[days[selectedDay] as keyof typeof timetableData] || []

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
            <h1 className="text-3xl font-bold mb-2">Class Timetable</h1>
            <p className="text-blue-100">
              {currentUser?.department || "Computer Science Engineering"} • {currentUser?.year || "First"} Year
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="secondary" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Weekly Schedule</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-4">Current Week</span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {days.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDay(index)}
                className="flex flex-col items-center p-3 h-auto"
              >
                <span className="text-xs font-medium">{day.slice(0, 3)}</span>
                <span className="text-lg font-bold">{new Date().getDate() + index - new Date().getDay()}</span>
              </Button>
            ))}
          </div>

          {/* Today's Classes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {days[selectedDay]}'s Classes
            </h3>
            
            {todayClasses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No classes scheduled for {days[selectedDay]}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {todayClasses.map((classItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getTypeColor(classItem.type)}>
                                {classItem.type}
                              </Badge>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {classItem.time}
                              </span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {classItem.subject}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {classItem.faculty}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {classItem.room}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Button variant="outline" size="sm">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Materials
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Object.values(timetableData).flat().length}
            </div>
            <p className="text-sm text-gray-600">Total Classes This Week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Object.values(timetableData).flat().filter(c => c.type === "Practical").length}
            </div>
            <p className="text-sm text-gray-600">Practical Sessions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {new Set(Object.values(timetableData).flat().map(c => c.subject)).size}
            </div>
            <p className="text-sm text-gray-600">Different Subjects</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
