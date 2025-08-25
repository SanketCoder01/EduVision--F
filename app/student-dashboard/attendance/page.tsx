'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Clock, Calendar, Check, X, ChevronDown, Camera, MapPin, Loader2, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaceAttendanceModal } from '@/components/attendance/face-attendance-modal';
import { toast } from 'sonner';

// Mock data
const SUBJECTS = [
  { id: 'cs101', name: 'Data Structures', code: 'CS101', type: 'theory', total: 30, attended: 22 },
  { id: 'cs102', name: 'Algorithms', code: 'CS102', type: 'theory', total: 30, attended: 25 },
  { id: 'cs103', name: 'Database Systems', code: 'CS103', type: 'theory', total: 30, attended: 28 },
  { id: 'csl101', name: 'DS Lab', code: 'CSL101', type: 'lab', total: 15, attended: 12 },
  { id: 'csl102', name: 'DBMS Lab', code: 'CSL102', type: 'lab', total: 15, attended: 10 },
];

const TIME_SLOTS = [
  '10:00 - 10:50',
  '10:50 - 11:50',
  '12:30 - 13:30',
  '13:30 - 14:30',
  '14:50 - 15:50',
  '15:50 - 16:50',
];

// Mock active sessions
const ACTIVE_SESSIONS = [
  {
    id: 'session-1',
    session_name: 'Data Structures - Lecture',
    subject: 'Data Structures',
    classroom: 'Room 301',
    start_time: '10:00',
    end_time: '10:50',
    session_date: new Date().toISOString().split('T')[0],
    status: 'active',
    require_face_verification: true,
    require_geo_fencing: true,
    require_liveness_detection: true,
    geo_fence_radius: 50,
    center_latitude: 19.076090,
    center_longitude: 72.877426
  },
  {
    id: 'session-2',
    session_name: 'DBMS Lab - Practical',
    subject: 'Database Systems',
    classroom: 'Lab 201',
    start_time: '14:50',
    end_time: '16:50',
    session_date: new Date().toISOString().split('T')[0],
    status: 'active',
    require_face_verification: true,
    require_geo_fencing: true,
    require_liveness_detection: false,
    geo_fence_radius: 30,
    center_latitude: 19.076090,
    center_longitude: 72.877426
  }
];

interface AttendanceRecord {
  sessionId: string;
  sessionName: string;
  subject: string;
  classroom: string;
  timestamp: string;
  status: string;
  faceVerified?: boolean;
  geoVerified?: boolean;
  livenessVerified?: boolean;
}

export default function AttendancePage() {
  const [activeSessions, setActiveSessions] = useState(ACTIVE_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Load attendance history from localStorage or API
    const history = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    setAttendanceHistory(history);
  }, []);

  const handleMarkAttendance = (session: any) => {
    setSelectedSession(session);
    setShowAttendanceModal(true);
  };

  const handleAttendanceComplete = (attendanceData: any) => {
    if (!selectedSession) return;
    
    const newRecord: AttendanceRecord = {
      sessionId: selectedSession.id,
      sessionName: selectedSession.session_name,
      subject: selectedSession.subject,
      classroom: selectedSession.classroom,
      timestamp: new Date().toISOString(),
      status: attendanceData.status,
      faceVerified: attendanceData.faceVerified,
      geoVerified: attendanceData.geoVerified,
      livenessVerified: attendanceData.livenessVerified
    };
    
    const updatedHistory = [...attendanceHistory, newRecord];
    setAttendanceHistory(updatedHistory);
    localStorage.setItem('attendanceHistory', JSON.stringify(updatedHistory));
    
    toast.success('Attendance marked successfully!');
    setShowAttendanceModal(false);
    setSelectedSession(null);
  };

  const getOverallAttendance = () => {
    const totalClasses = SUBJECTS.reduce((sum, subject) => sum + subject.total, 0);
    const totalAttended = SUBJECTS.reduce((sum, subject) => sum + subject.attended, 0);
    return Math.round((totalAttended / totalClasses) * 100);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 border-b border-gray-100 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">My Attendance</h1>
          <Badge className="bg-blue-100 text-blue-800">
            Overall: {getOverallAttendance()}%
          </Badge>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="p-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="w-5 h-5" />
                Active Sessions
              </CardTitle>
              <CardDescription className="text-green-700">
                Mark your attendance for ongoing classes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.session_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {session.classroom}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.start_time} - {session.end_time}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {session.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {session.require_face_verification && (
                        <div className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Face Verify
                        </div>
                      )}
                      {session.require_geo_fencing && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Location
                        </div>
                      )}
                      {session.require_liveness_detection && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Liveness
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleMarkAttendance(session)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto flex-shrink-0"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Attendance History */}
      {attendanceHistory.length > 0 && (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recent Attendance
              </CardTitle>
              <CardDescription>
                Your latest attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendanceHistory.slice(-3).reverse().map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{record.sessionName}</div>
                      <div className="text-xs text-gray-600">
                        {record.classroom} • {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {record.status}
                      </Badge>
                      {record.faceVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {record.geoVerified && <MapPin className="w-4 h-4 text-blue-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects List */}
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Subject-wise Attendance</h2>
        {SUBJECTS.map((subject, i) => {
          const percentage = Math.round((subject.attended / subject.total) * 100);
          
          return (
            <Link href={`/student-dashboard/attendance/${subject.id}`} key={subject.id} className="block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm text-gray-500">{subject.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{percentage}%</div>
                    <div className="text-xs text-gray-500">
                      {subject.attended}/{subject.total} classes
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Face Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <FaceAttendanceModal
          session={selectedSession}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedSession(null);
          }}
          onComplete={handleAttendanceComplete}
        />
      )}
    </div>
  );
}
