'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getFacultyAttendanceSessions,
  getAttendanceAnalytics,
  endAttendanceSession,
  type AttendanceSession
} from '@/app/actions/attendance-actions';
import { CreateAttendanceSession } from '@/components/attendance/create-session';
import { AttendanceAnalytics } from '@/components/attendance/attendance-analytics';
import { AttendanceRecords } from '@/components/attendance/attendance-records';
import { useAuth } from '@/contexts/AuthContext';

export default function FacultyAttendancePage() {
  // Mock user data since authentication is disabled
  const user = { id: 'demo-faculty', name: 'Demo Faculty' };
  const authLoading = false;
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!authLoading) {
      loadSessions();
    }
  }, [authLoading]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setSessions([]);
        return;
      }
      const sessionsData = await getFacultyAttendanceSessions(user.id);
      setSessions(sessionsData || []);
    } catch (error) {
      toast.error('Failed to load attendance sessions');
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (session: AttendanceSession) => {
    try {
      setSelectedSession(session);
      const analyticsData = await getAttendanceAnalytics(session.id);
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('Failed to load session details');
      console.error('Error loading session details:', error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endAttendanceSession(sessionId);
      toast.success('Attendance session ended successfully');
      loadSessions();
      setSelectedSession(null);
      setAnalytics(null);
    } catch (error) {
      toast.error('Failed to end attendance session');
      console.error('Error ending session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'ended':
        return <Badge className="bg-gray-100 text-gray-800">Ended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center text-gray-600">
            <p>You're not signed in. Please sign in to manage attendance sessions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-2">Create and manage attendance sessions for your classes</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attendance Sessions
              </CardTitle>
              <CardDescription>
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No attendance sessions created yet</p>
                    <p className="text-sm">Create your first session to get started</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{session.session_name}</h3>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.start_time} - {session.end_time}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedSession.session_name}</CardTitle>
                      <CardDescription>
                        Session details and controls
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  </div>
                </CardContent>
              </Card>

              {analytics && <AttendanceAnalytics analytics={analytics} />}

              <AttendanceRecords sessionId={selectedSession.id} />
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a Session</h3>
                  <p>Choose an attendance session to view details and analytics</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateAttendanceSession
          onCloseAction={() => setShowCreateModal(false)}
          onSuccessAction={() => {
            setShowCreateModal(false);
            loadSessions();
          }}
        />
      )}
    </div>
  );
} 