"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, Download, Eye, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getStudentTimetables, getTodaySchedule, type StudentTimetableEntry } from './actions';

export default function StudentTimetablePage() {
  const [timetables, setTimetables] = useState<StudentTimetableEntry[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    const [timetableResult, scheduleResult] = await Promise.all([
      getStudentTimetables(),
      getTodaySchedule()
    ]);

    if (timetableResult.error) {
      setError(timetableResult.error.message);
    } else {
      setTimetables(timetableResult.data || []);
      setStudentInfo(timetableResult.studentProfile);
    }

    if (scheduleResult.error) {
      console.error('Schedule error:', scheduleResult.error.message);
    } else {
      setTodaySchedule(scheduleResult.data || []);
      setCurrentDay(scheduleResult.day || '');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('image')) return 'bg-green-100 text-green-800';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Calendar className="h-8 w-8 text-blue-600" />
          </motion.div>
          <p className="text-gray-600">Loading your timetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          My Timetable
        </h1>
        {studentInfo && (
          <p className="mt-2 text-sm text-gray-600">
            {studentInfo.department} • {studentInfo.year}{studentInfo.year === '1' ? 'st' : studentInfo.year === '2' ? 'nd' : studentInfo.year === '3' ? 'rd' : 'th'} Year
          </p>
        )}
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Today's Schedule Card */}
      {todaySchedule.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {getCurrentTime()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySchedule.map((period, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{period.subject}</p>
                      <p className="text-sm text-gray-500">{period.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {period.room || 'TBA'}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timetable Files */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files" className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            {timetables.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timetables Available</h3>
                  <p className="text-gray-500 text-center text-sm">
                    Your faculty hasn't uploaded any timetables yet. Check back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {timetables.map((timetable, index) => (
                  <motion.div
                    key={timetable.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate text-sm">
                                {timetable.file_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getFileTypeColor(timetable.file_type)} text-xs`}>
                                  {timetable.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(timetable.uploaded_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(timetable.file_url, '_blank')}
                              className="h-8 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = timetable.file_url;
                                link.download = timetable.file_name;
                                link.click();
                              }}
                              className="h-8 px-2"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <WeeklyScheduleView />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Weekly Schedule Component
function WeeklyScheduleView() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Sample schedule data - this would come from parsed timetable files
  const sampleSchedule = {
    monday: [
      { time: '9:00 AM', subject: 'Data Structures', room: 'CS-101', faculty: 'Dr. Smith' },
      { time: '10:00 AM', subject: 'Mathematics', room: 'M-201', faculty: 'Prof. Johnson' },
      { time: '11:00 AM', subject: 'Break', room: '', faculty: '' },
      { time: '12:00 PM', subject: 'Database Systems', room: 'CS-102', faculty: 'Dr. Brown' },
    ],
    tuesday: [
      { time: '9:00 AM', subject: 'Algorithms', room: 'CS-103', faculty: 'Dr. Wilson' },
      { time: '10:00 AM', subject: 'Physics', room: 'P-101', faculty: 'Prof. Davis' },
    ],
    // Add more days as needed
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div className="space-y-4">
      {days.map((day, dayIndex) => {
        const isToday = day.toLowerCase() === today;
        const daySchedule = sampleSchedule[day.toLowerCase() as keyof typeof sampleSchedule] || [];
        
        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: dayIndex * 0.1 }}
          >
            <Card className={`${isToday ? 'border-blue-200 bg-blue-50/50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    {day}
                    {isToday && (
                      <Badge className="bg-blue-600 text-white text-xs">Today</Badge>
                    )}
                  </span>
                  <span className="text-sm text-gray-500 font-normal">
                    {daySchedule.length} periods
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySchedule.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No classes scheduled</p>
                ) : (
                  daySchedule.map((period, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        period.subject === 'Break' 
                          ? 'bg-gray-50 border-gray-200' 
                          : isToday 
                            ? 'bg-white border-blue-100' 
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          period.subject === 'Break' ? 'bg-gray-400' : 'bg-blue-600'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{period.subject}</p>
                          {period.faculty && (
                            <p className="text-xs text-gray-500">{period.faculty}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{period.time}</p>
                        {period.room && (
                          <p className="text-xs text-gray-500">{period.room}</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
