"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Download,
  BookOpen,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { getStudentTimetable, type ScheduleDay } from "@/app/dashboard/timetable/actions"

export default function StudentTimetablePage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [timetable, setTimetable] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState("")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser?.department && currentUser?.year) {
      loadTimetable()
      
      // Real-time subscription
      const channel = supabase
        .channel('student_timetable_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'timetables',
            filter: `department=eq.${currentUser.department},year=eq.${currentUser.year}`
          },
          () => {
            loadTimetable()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [currentUser])

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profile) {
        setCurrentUser(profile)
      }
    }
  }

  const loadTimetable = async () => {
    if (!currentUser?.department || !currentUser?.year) return
    
    setLoading(true)
    const result = await getStudentTimetable(currentUser.department, currentUser.year)
    
    if (result.success && result.data) {
      setTimetable(result.data)
      // Set today's day as default
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      setSelectedDay(today)
    }
    setLoading(false)
  }

  const getTodaysSchedule = () => {
    if (!timetable?.schedule_data) return []
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const daySchedule = timetable.schedule_data.find((d: ScheduleDay) => d.day === today)
    return daySchedule?.lectures || []
  }

  const getScheduleForDay = (day: string) => {
    if (!timetable?.schedule_data) return []
    const daySchedule = timetable.schedule_data.find((d: ScheduleDay) => d.day === day)
    return daySchedule?.lectures || []
  }

  const getLectureTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Lecture': 'bg-blue-100 text-blue-800',
      'Practical': 'bg-green-100 text-green-800',
      'Tutorial': 'bg-purple-100 text-purple-800',
      'Project': 'bg-orange-100 text-orange-800',
      'Seminar': 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your timetable...</p>
        </div>
      </div>
    )
  }

  if (!timetable) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Timetable Available
            </h3>
            <p className="text-gray-500">
              Your faculty hasn't uploaded a timetable for {currentUser?.department} - {currentUser?.year} yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Check back later or contact your faculty.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              My Timetable
            </h1>
            <p className="text-blue-100">
              {currentUser?.department} - {currentUser?.year?.charAt(0).toUpperCase() + currentUser?.year?.slice(1)} Year
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(timetable.file_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Real-Time Data
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getTodaysSchedule().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getTodaysSchedule().map((lecture: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-lg p-3 text-center min-w-[80px]">
                      <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-mono font-semibold text-blue-900">
                        {lecture.time}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lecture.subject}
                        </h3>
                        <Badge className={getLectureTypeColor(lecture.type)}>
                          {lecture.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {lecture.faculty}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {lecture.room}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="grid w-full grid-cols-6">
              {days.map((day) => (
                <TabsTrigger key={day} value={day}>
                  {day.substring(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {days.map((day) => (
              <TabsContent key={day} value={day} className="space-y-3 mt-4">
                {getScheduleForDay(day).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No classes scheduled for {day}</p>
                  </div>
                ) : (
                  getScheduleForDay(day).map((lecture: any, idx: number) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-purple-100 rounded-lg p-3 text-center min-w-[80px]">
                          <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm font-mono font-semibold text-purple-900">
                            {lecture.time}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {lecture.subject}
                            </h3>
                            <Badge className={getLectureTypeColor(lecture.type)}>
                              {lecture.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {lecture.faculty}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {lecture.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Timetable Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Uploaded: {new Date(timetable.uploaded_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Real-time updates enabled
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
