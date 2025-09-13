"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  CalendarDays,
  GraduationCap,
  AlertCircle,
  Info,
  Star,
  Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentTimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("weekly")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [extractedSchedule, setExtractedSchedule] = useState<any[]>([])
  const [academicCalendars, setAcademicCalendars] = useState<any[]>([])
  const [academicEvents, setAcademicEvents] = useState<any[]>([])
  const [viewMode, setViewMode] = useState("month")
  const [weekStartDate, setWeekStartDate] = useState(new Date())

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

    // Initialize week start date to the beginning of current week
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    setWeekStartDate(startOfWeek)
  }, [])

  useEffect(() => {
    // Load faculty-uploaded timetable data
    const savedSchedule = localStorage.getItem("extractedSchedule")
    const savedCalendars = localStorage.getItem("academicCalendars")
    
    if (savedSchedule) {
      try {
        const schedule = JSON.parse(savedSchedule)
        // Filter by student's department and year
        const userDept = currentUser?.department || "Computer Science Engineering"
        const userYear = currentUser?.year || "First Year"
        const filteredSchedule = schedule.filter((s: any) => 
          s.department === userDept && s.year === userYear
        )
        setExtractedSchedule(filteredSchedule)
      } catch (error) {
        console.error("Error parsing schedule:", error)
      }
    }
    
    if (savedCalendars) {
      try {
        setAcademicCalendars(JSON.parse(savedCalendars))
      } catch (error) {
        console.error("Error parsing calendars:", error)
      }
    }

    // Load mock academic events
    const mockEvents = [
      { date: "2025-01-15", title: "Mid-term Exams Begin", type: "exam", importance: "high" },
      { date: "2025-01-26", title: "Republic Day Holiday", type: "holiday", importance: "medium" },
      { date: "2025-02-14", title: "Valentine's Day Event", type: "event", importance: "low" },
      { date: "2025-02-28", title: "Science Exhibition", type: "event", importance: "high" },
      { date: "2025-03-08", title: "Women's Day Celebration", type: "event", importance: "medium" },
      { date: "2025-03-15", title: "Final Exams Begin", type: "exam", importance: "high" },
      { date: "2025-04-14", title: "Summer Break Begins", type: "holiday", importance: "high" }
    ]
    setAcademicEvents(mockEvents)
  }, [currentUser])

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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam": return "bg-red-100 text-red-800"
      case "holiday": return "bg-green-100 text-green-800"
      case "event": return "bg-purple-100 text-purple-800"
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getLecturesForDate = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const daySchedule = extractedSchedule.find(s => s.day === dayName)
    return daySchedule?.lectures || []
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return academicEvents.filter(event => event.date === dateStr)
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
            <h1 className="text-3xl font-bold mb-2">My Timetable & Calendar</h1>
            <p className="text-blue-100">
              View your schedule, upcoming classes, and academic events
            </p>
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

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Academic Events
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
                <div className="flex items-center gap-2">
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  const events = getEventsForDate(date)
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
                        {events.slice(0, 1).map((event: any, idx: number) => (
                          <div key={idx} className={`text-xs px-1 rounded truncate ${getEventTypeColor(event.type)}`}>
                            {event.title}
                          </div>
                        ))}
                        {(lectures.length > 2 || events.length > 1) && (
                          <div className="text-xs text-gray-500">+{lectures.length + events.length - 3} more</div>
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
                  
                  {getLecturesForDate(selectedCalendarDate).length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Classes</h5>
                      <div className="space-y-2">
                        {getLecturesForDate(selectedCalendarDate).map((lecture: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <Badge className={getTypeColor(lecture.type)}>{lecture.type}</Badge>
                            <span className="font-medium">{lecture.subject}</span>
                            <span className="text-gray-500">{lecture.time}</span>
                            <span className="text-gray-500">{lecture.room}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {getEventsForDate(selectedCalendarDate).length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Events</h5>
                      <div className="space-y-2">
                        {getEventsForDate(selectedCalendarDate).map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                            <span className="font-medium">{event.title}</span>
                            {event.importance === 'high' && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {getLecturesForDate(selectedCalendarDate).length === 0 && getEventsForDate(selectedCalendarDate).length === 0 && (
                    <p className="text-sm text-gray-500">No classes or events scheduled for this day.</p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Academic Events & Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {academicEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getEventTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              {event.importance === 'high' && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {event.title}
                            </h4>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {academicEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming academic events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
