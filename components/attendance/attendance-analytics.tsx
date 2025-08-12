'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MapPin, 
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface AttendanceAnalyticsProps {
  analytics: {
    session: any;
    analytics: {
      totalStudents: number;
      presentStudents: number;
      absentStudents: number;
      lateStudents: number;
      attendanceRate: number;
      faceVerified: number;
      geoVerified: number;
      livenessVerified: number;
    };
  };
}

export function AttendanceAnalytics({ analytics }: AttendanceAnalyticsProps) {
  const { session, analytics: stats } = analytics;

  const getAttendanceStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceStatusIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (rate >= 75) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentStudents}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absentStudents}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lateStudents}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Attendance Rate
          </CardTitle>
          <CardDescription>
            Overall attendance percentage for this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getAttendanceStatusIcon(stats.attendanceRate)}
                <span className={`text-2xl font-bold ${getAttendanceStatusColor(stats.attendanceRate)}`}>
                  {Math.round(stats.attendanceRate)}%
                </span>
              </div>
              <Badge 
                variant={stats.attendanceRate >= 90 ? "default" : stats.attendanceRate >= 75 ? "secondary" : "destructive"}
              >
                {stats.attendanceRate >= 90 ? 'Excellent' : stats.attendanceRate >= 75 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            
            <Progress value={stats.attendanceRate} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.presentStudents}</div>
                <div className="text-gray-600">Present</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{stats.absentStudents}</div>
                <div className="text-gray-600">Absent</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-yellow-600">{stats.lateStudents}</div>
                <div className="text-gray-600">Late</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-blue-600" />
              Face Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified</span>
                <span className="font-semibold">{stats.faceVerified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {stats.totalStudents > 0 ? Math.round((stats.faceVerified / stats.totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-600" />
              Location Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified</span>
                <span className="font-semibold">{stats.geoVerified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {stats.totalStudents > 0 ? Math.round((stats.geoVerified / stats.totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-purple-600" />
              Liveness Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified</span>
                <span className="font-semibold">{stats.livenessVerified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {stats.totalStudents > 0 ? Math.round((stats.livenessVerified / stats.totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Requirements</CardTitle>
          <CardDescription>
            Security features enabled for this attendance session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${
              session.require_face_recognition ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Eye className={`w-5 h-5 ${session.require_face_recognition ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">Face Recognition</span>
              </div>
              <p className="text-sm text-gray-600">
                {session.require_face_recognition 
                  ? 'Required for attendance verification' 
                  : 'Not required for this session'
                }
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              session.require_geo_fencing ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`w-5 h-5 ${session.require_geo_fencing ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">Geo-fencing</span>
              </div>
              <p className="text-sm text-gray-600">
                {session.require_geo_fencing 
                  ? `Required within ${session.geo_fence_radius}m radius` 
                  : 'Not required for this session'
                }
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              session.require_liveness_detection ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className={`w-5 h-5 ${session.require_liveness_detection ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">Liveness Detection</span>
              </div>
              <p className="text-sm text-gray-600">
                {session.require_liveness_detection 
                  ? 'Required to prevent photo/video spoofing' 
                  : 'Not required for this session'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 