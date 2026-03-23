// Attendance Service for auto-closing sessions and managing attendance records
// Uses Supabase for data persistence

import { supabase } from './supabase'

interface AttendanceRecord {
  id: string;
  className: string;
  department: string;
  studyingYear: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  createdAt: string;
  status: 'active' | 'closed' | 'completed';
  autoCloseAt?: string;
  closedAt?: string;
  autoClosedBy?: string;
  subject?: string;
  students?: Array<{
    id: string;
    name: string;
    prn: string;
    status: 'present' | 'absent';
    markedAt?: string;
    faceVerified?: boolean;
  }>;
  presentCount?: number;
  absentCount?: number;
}

class AttendanceService {
  private static instance: AttendanceService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoCloseCheck();
  }

  public static getInstance(): AttendanceService {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }
    return AttendanceService.instance;
  }

  private startAutoCloseCheck() {
    // Check every minute for attendance sessions that need to be closed
    this.checkInterval = setInterval(() => {
      this.checkAndCloseExpiredSessions();
    }, 60000); // 60 seconds
  }

  private async checkAndCloseExpiredSessions() {
    try {
      const now = new Date().toISOString();
      
      // Fetch active sessions that have expired
      const { data: expiredSessions, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('status', 'active')
        .lt('auto_close_at', now)
      
      if (error) {
        console.error('Error fetching expired sessions:', error)
        return
      }
      
      if (expiredSessions && expiredSessions.length > 0) {
        for (const session of expiredSessions) {
          await this.closeSessionInDatabase(session.id, 'system')
        }
      }
    } catch (error) {
      console.error("Error in auto-close check:", error);
    }
  }

  private async closeSessionInDatabase(sessionId: string, closedBy: string) {
    try {
      // Update session status
      const { error: updateError } = await supabase
        .from('attendance_sessions')
        .update({
          status: 'completed',
          closed_at: new Date().toISOString(),
          auto_closed_by: closedBy
        })
        .eq('id', sessionId)
      
      if (updateError) {
        console.error('Error closing session:', updateError)
        return
      }
      
      // Mark absent students
      await this.markAbsentStudents(sessionId)
      
      // Create notification
      await this.createNotification(sessionId, closedBy)
    } catch (error) {
      console.error('Error in closeSessionInDatabase:', error)
    }
  }

  private async markAbsentStudents(sessionId: string) {
    try {
      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      
      if (sessionError || !session) return
      
      // Get students who are present
      const { data: presentRecords } = await supabase
        .from('attendance_records')
        .select('student_id')
        .eq('session_id', sessionId)
        .eq('status', 'present')
      
      const presentStudentIds = (presentRecords || []).map(r => r.student_id)
      
      // Get all students in the class from student_list_entries
      const { data: classStudents } = await supabase
        .from('student_list_entries')
        .select('id, name')
        .eq('student_list_id', session.student_list_id)
      
      if (classStudents) {
        const absentStudents = classStudents.filter(s => !presentStudentIds.includes(s.id))
        
        // Mark absent students
        for (const student of absentStudents) {
          await supabase
            .from('attendance_records')
            .insert({
              session_id: sessionId,
              student_id: student.id,
              status: 'absent',
              marked_at: new Date().toISOString(),
              auto_marked: true
            })
        }
      }
    } catch (error) {
      console.error('Error marking absent students:', error)
    }
  }

  private async createNotification(sessionId: string, closedBy: string) {
    try {
      const { data: session } = await supabase
        .from('attendance_sessions')
        .select('*, faculty:faculty_id(name)')
        .eq('id', sessionId)
        .single()
      
      if (session) {
        await supabase
          .from('notifications')
          .insert({
            type: 'attendance_closed',
            title: 'Attendance Session Auto-Closed',
            message: `${session.subject || 'Attendance session'} has been automatically closed`,
            user_id: session.faculty_id,
            data: { session_id: sessionId, auto_closed: true },
            created_at: new Date().toISOString(),
            read: false
          })
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  public stopAutoCloseCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Manual method to close attendance session
  public async closeAttendanceSession(attendanceId: string): Promise<boolean> {
    try {
      await this.closeSessionInDatabase(attendanceId, 'manual')
      return true
    } catch (error) {
      console.error("Error closing attendance session:", error);
      return false;
    }
  }

  // Export attendance data to CSV format
  public async exportToCSV(sessionId: string): Promise<boolean> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*, faculty:faculty_id(name)')
        .eq('id', sessionId)
        .single()
      
      if (sessionError || !session) {
        throw new Error("Attendance session not found");
      }

      const { data: records } = await supabase
        .from('attendance_records')
        .select('*, student:student_id(name, prn)')
        .eq('session_id', sessionId)

      const presentCount = records?.filter(r => r.status === 'present').length || 0
      const totalCount = records?.length || 0

      // Create CSV content
      const csvContent = [
        ["Attendance Report"],
        ["Subject", session.subject || ''],
        ["Department", session.department],
        ["Year", session.year],
        ["Date", new Date(session.date).toLocaleDateString()],
        ["Time", session.start_time + ' - ' + session.end_time],
        ["Location", session.location || ''],
        ["Total Students", totalCount],
        ["Present", presentCount],
        ["Absent", totalCount - presentCount],
        [],
        ["Student Name", "PRN", "Status", "Marked At", "Face Verified"],
        ...(records || []).map((record: any) => [
          record.student?.name || 'Unknown',
          record.student?.prn || 'N/A',
          record.status,
          record.marked_at ? new Date(record.marked_at).toLocaleString() : 'N/A',
          record.face_verified ? "Yes" : "No"
        ])
      ].map(row => row.join(",")).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${session.subject?.replace(/\s+/g, "_") || 'session'}_${new Date(session.date).toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      return false;
    }
  }

  // Export attendance data to PDF format
  public async exportToPDF(sessionId: string): Promise<boolean> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*, faculty:faculty_id(name)')
        .eq('id', sessionId)
        .single()
      
      if (sessionError || !session) {
        throw new Error("Attendance session not found");
      }

      const { data: records } = await supabase
        .from('attendance_records')
        .select('*, student:student_id(name, prn)')
        .eq('session_id', sessionId)

      const presentCount = records?.filter(r => r.status === 'present').length || 0
      const absentCount = records?.filter(r => r.status === 'absent').length || 0
      const totalCount = records?.length || 0

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-table { width: 100%; margin-bottom: 20px; }
            .info-table td { padding: 5px; border-bottom: 1px solid #ddd; }
            .students-table { width: 100%; border-collapse: collapse; }
            .students-table th, .students-table td { 
              border: 1px solid #ddd; padding: 8px; text-align: left; 
            }
            .students-table th { background-color: #f2f2f2; }
            .present { color: green; font-weight: bold; }
            .absent { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <h2>${session.subject || 'Attendance Session'}</h2>
          </div>
          
          <table class="info-table">
            <tr><td><strong>Department:</strong></td><td>${session.department}</td></tr>
            <tr><td><strong>Year:</strong></td><td>${session.year}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${new Date(session.date).toLocaleDateString()}</td></tr>
            <tr><td><strong>Time:</strong></td><td>${session.start_time} - ${session.end_time}</td></tr>
            <tr><td><strong>Location:</strong></td><td>${session.location || 'N/A'}</td></tr>
            <tr><td><strong>Total Students:</strong></td><td>${totalCount}</td></tr>
            <tr><td><strong>Present:</strong></td><td>${presentCount}</td></tr>
            <tr><td><strong>Absent:</strong></td><td>${absentCount}</td></tr>
            <tr><td><strong>Attendance Rate:</strong></td><td>${totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0}%</td></tr>
          </table>

          <h3>Student Details</h3>
          <table class="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>PRN</th>
                <th>Status</th>
                <th>Marked At</th>
                <th>Face Verified</th>
              </tr>
            </thead>
            <tbody>
              ${(records || []).map((record: any) => `
                <tr>
                  <td>${record.student?.name || 'Unknown'}</td>
                  <td>${record.student?.prn || 'N/A'}</td>
                  <td class="${record.status}">${record.status.toUpperCase()}</td>
                  <td>${record.marked_at ? new Date(record.marked_at).toLocaleString() : 'N/A'}</td>
                  <td>${record.face_verified ? "Yes" : "No"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Open in new window for printing/saving as PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      return true;
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      return false;
    }
  }
}

// Initialize the service
if (typeof window !== "undefined") {
  AttendanceService.getInstance();
}

export default AttendanceService
