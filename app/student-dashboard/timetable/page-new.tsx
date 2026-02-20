"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  Eye,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStudentTimetable } from "@/app/dashboard/timetable/actions"
import { createClient } from "@/lib/supabase/client"

interface TimetableData {
  id: string
  faculty_id: string
  department: string
  year: string
  file_name: string
  file_url: string
  schedule_data: any[]
  uploaded_at: string
}

export default function StudentTimetablePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("weekly")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [weekStartDate, setWeekStartDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Try to get student data from the appropriate table
        const studentTables = [
          'students_cse_1st_year', 'students_cse_2nd_year', 'students_cse_3rd_year', 'students_cse_4th_year',
          'students_cyber_1st_year', 'students_cyber_2nd_year', 'students_cyber_3rd_year', 'students_cyber_4th_year',
          'students_aids_1st_year', 'students_aids_2nd_year', 'students_aids_3rd_year', 'students_aids_4th_year',
          'students_aiml_1st_year', 'students_aiml_2nd_year', 'students_aiml_3rd_year', 'students_aiml_4th_year'
        ]

        for (const table of studentTables) {
          const { data: studentData } = await supabase
            .from(table)
            .select("*")
            .eq("email", user.email)
            .single()
          
          if (studentData) {
            setCurrentUser(studentData)
            loadTimetable(studentData.department, studentData.year)
            break
          }
        }
      }
    }
    
    fetchUser()

    // Initialize week start date
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    setWeekStartDate(startOfWeek)
  }, [])

  const loadTimetable = async (department: string, year: string) => {
    setLoading(true)
    const result = await getStudentTimetable(department, year)
    
    if (result.success && result.data) {
      setTimetableData(result.data)
    }
    setLoading(false)
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "lecture": return "bg-blue-100 text-blue-800"
      case "practical": return "bg-green-100 text-green-800"
      case "tutorial": return "bg-purple-100 text-purple-800"
      case "project": return "bg-orange-100 text-orange-800"
      case "seminar": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getLecturesForDate = (date: Date) => {
    if (!timetableData?.schedule_data) return []
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const daySchedule = timetableData.schedule_data.find((s: any) => s.day === dayName)
    return daySchedule?.lectures || []
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekStartDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() + 7)
      }
      return newDate
    })
  }

  const getWeekDates = () => {
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate)
      date.setDate(weekStartDate.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const formatWeekRange = () => {
    const weekDates = getWeekDates()
    const startDate = weekDates[0]
    const endDate = weekDates[6]
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`
    } else {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`
    }
  }

  const getTodayClasses = () => {
    const today = getWeekDates()[selectedDay]
    return getLecturesForDate(today)
  }

  const todayClasses = getTodayClasses()

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
            <h1 className="text-3xl font-bold mb-2">My Timetable</h1>
            <p className="text-blue-100">
              View your weekly schedule and class timings
            </p>
            {currentUser && (
              <p className="text-sm text-blue-200 mt-2">
                {currentUser.department} - {currentUser.year}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Today</div>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading timetable...</p>
          </CardContent>
        </Card>
      ) : !timetableData ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Timetable Available</h3>
            <p className="text-gray-600">
              Your faculty hasn't uploaded a timetable for {currentUser?.department} - {currentUser?.year} yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Weekly Schedule
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          {/* Weekly Schedule Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Weekly Schedule</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-4 min-w-[200px] text-center">
                      {formatWeekRange()}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Day Selector */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {getWeekDates().map((date, index) => (
                    <Button
                      key={index}
                      variant={selectedDay === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(index)}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <span className="text-xs font-medium">{days[index].slice(0, 3)}</span>
                      <span className="text-lg font-bold">{date.getDate()}</span>
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
                      {todayClasses.map((classItem: any, index: number) => (
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
                                      {classItem.type || "Lecture"}
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
                    {timetableData.schedule_data.reduce((acc: number, day: any) => acc + (day.lectures?.length || 0), 0)}
                  </div>
                  <p className="text-sm text-gray-600">Total Classes This Week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {timetableData.schedule_data.reduce((acc: number, day: any) => 
                      acc + (day.lectures?.filter((l: any) => l.type?.toLowerCase() === "practical").length || 0), 0
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Practical Sessions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {new Set(
                      timetableData.schedule_data.flatMap((day: any) => 
                        day.lectures?.map((l: any) => l.subject) || []
                      )
                    ).size}
                  </div>
                  <p className="text-sm text-gray-600">Different Subjects</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendar View
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="outline" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-xl font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button variant="outline" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    if (!date) {
                      return <div key={index} className="p-2 h-24"></div>
                    }

                    const lectures = getLecturesForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isSelected = selectedCalendarDate?.toDateString() === date.toDateString()

                    return (
                      <motion.div
                        key={date.toISOString()}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          p-2 h-24 border rounded cursor-pointer transition-colors
                          ${isToday ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}
                          ${isSelected ? 'bg-blue-200 border-blue-400' : ''}
                          hover:bg-gray-50
                        `}
                        onClick={() => setSelectedCalendarDate(date)}
                      >
                        <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                        <div className="space-y-1">
                          {lectures.slice(0, 2).map((lecture: any, idx: number) => (
                            <div key={idx} className="text-xs bg-blue-100 text-blue-800 px-1 rounded truncate">
                              {lecture.subject}
                            </div>
                          ))}
                          {lectures.length > 2 && (
                            <div className="text-xs text-gray-500">+{lectures.length - 2} more</div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Selected Date Details */}
                {selectedCalendarDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {selectedCalendarDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    
                    {getLecturesForDate(selectedCalendarDate).length > 0 ? (
                      <div className="space-y-2">
                        {getLecturesForDate(selectedCalendarDate).map((lecture: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm p-2 bg-white rounded">
                            <Badge className={getTypeColor(lecture.type)}>{lecture.type || "Lecture"}</Badge>
                            <span className="font-medium">{lecture.subject}</span>
                            <span className="text-gray-500">{lecture.time}</span>
                            <span className="text-gray-500">{lecture.room}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No classes scheduled for this day.</p>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Timetable Info */}
      {timetableData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Uploaded: {new Date(timetableData.uploaded_at).toLocaleDateString()}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(timetableData.file_url, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Original
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
