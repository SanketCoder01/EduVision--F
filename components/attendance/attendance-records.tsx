'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MapPin, 
  Activity,
  Search,
  Download,
  Filter
} from 'lucide-react';
import { getSessionAttendance } from '@/app/actions/attendance-actions';
import { toast } from 'sonner';

interface AttendanceRecordsProps {
  sessionId: string;
}

export function AttendanceRecords({ sessionId }: AttendanceRecordsProps) {
  const [records, setRecords] = useState<any>({ studentAttendance: [], facultyAttendance: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAttendanceRecords();
  }, [sessionId]);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const data = await getSessionAttendance(sessionId);
      setRecords(data);
    } catch (error) {
      toast.error('Failed to load attendance records');
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800">Excused</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getVerificationIcon = (verified: boolean, type: string) => {
    if (verified) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const filteredStudentRecords = records.studentAttendance?.filter((record: any) => {
    const matchesSearch = record.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.students?.prn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.attendance_status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const filteredFacultyRecords = records.facultyAttendance?.filter((record: any) => {
    const matchesSearch = record.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.faculty?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.attendance_status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const exportAttendanceData = () => {
    const data = {
      students: filteredStudentRecords,
      faculty: filteredFacultyRecords,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Attendance records exported successfully');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Attendance Records */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Attendance Records
              </CardTitle>
              <CardDescription>
                {filteredStudentRecords.length} student{filteredStudentRecords.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportAttendanceData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or PRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Student</th>
                  <th className="text-left py-3 px-4 font-medium">PRN</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Marked At</th>
                  <th className="text-left py-3 px-4 font-medium">Verification</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentRecords.length === 0 ? (
                  <>
                    {/* Sample attendance record */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">Demo Student</div>
                          <div className="text-sm text-gray-600">demo@student.edu</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">PRN2024001</td>
                      <td className="py-3 px-4">{getStatusBadge('present')}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date().toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1" title="Face Verified">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs">Face</span>
                          </div>
                          <div className="flex items-center gap-1" title="Location Verified">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs">Geo</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div>19.076090, 72.877426</div>
                          <div className="text-xs text-gray-600">15m from center</div>
                          <div className="text-xs text-blue-600 font-medium mt-1">Workshop - AI/ML Fundamentals</div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-400 text-sm">
                        Sample attendance record shown above
                      </td>
                    </tr>
                  </>
                ) : (
                  filteredStudentRecords.map((record: any) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{record.students?.name}</div>
                          <div className="text-sm text-gray-600">{record.students?.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{record.students?.prn}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.attendance_status)}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(record.marked_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {record.face_verified && (
                            <div className="flex items-center gap-1" title="Face Verified">
                              {getVerificationIcon(record.face_verified, 'face')}
                              <span className="text-xs">Face</span>
                            </div>
                          )}
                          {record.geo_location_verified && (
                            <div className="flex items-center gap-1" title="Location Verified">
                              {getVerificationIcon(record.geo_location_verified, 'geo')}
                              <span className="text-xs">Geo</span>
                            </div>
                          )}
                          {record.liveness_verified && (
                            <div className="flex items-center gap-1" title="Liveness Verified">
                              {getVerificationIcon(record.liveness_verified, 'liveness')}
                              <span className="text-xs">Live</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {record.latitude && record.longitude ? (
                          <div>
                            <div>{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</div>
                            {record.distance_from_center && (
                              <div className="text-xs text-gray-600">
                                {record.distance_from_center}m from center
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Faculty Attendance Records
          </CardTitle>
          <CardDescription>
            {filteredFacultyRecords.length} faculty member{filteredFacultyRecords.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Faculty</th>
                  <th className="text-left py-3 px-4 font-medium">Department</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Marked At</th>
                  <th className="text-left py-3 px-4 font-medium">Verification</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacultyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No faculty attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredFacultyRecords.map((record: any) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{record.faculty?.name}</div>
                          <div className="text-sm text-gray-600">{record.faculty?.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{record.faculty?.department}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.attendance_status)}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(record.marked_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {record.face_verified && (
                            <div className="flex items-center gap-1" title="Face Verified">
                              {getVerificationIcon(record.face_verified, 'face')}
                              <span className="text-xs">Face</span>
                            </div>
                          )}
                          {record.geo_location_verified && (
                            <div className="flex items-center gap-1" title="Location Verified">
                              {getVerificationIcon(record.geo_location_verified, 'geo')}
                              <span className="text-xs">Geo</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {record.latitude && record.longitude ? (
                          <div>
                            <div>{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</div>
                            {record.distance_from_center && (
                              <div className="text-xs text-gray-600">
                                {record.distance_from_center}m from center
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 