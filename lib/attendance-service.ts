// Attendance Service for auto-closing sessions and managing attendance records

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

  private checkAndCloseExpiredSessions() {
    try {
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]");
      const now = new Date();
      let hasUpdates = false;

      const updatedRecords = records.map((record: AttendanceRecord) => {
        if (record.status === "active" && record.autoCloseAt) {
          const closeTime = new Date(record.autoCloseAt);
          
          if (now >= closeTime) {
            // Auto-close the attendance session
            const closedRecord: AttendanceRecord = {
              ...record,
              status: "completed" as const,
              closedAt: now.toISOString(),
              autoClosedBy: "system"
            };

            // Generate attendance report for absent students
            this.generateAbsentStudentsList(closedRecord);
            hasUpdates = true;
            
            return closedRecord;
          }
        }
        return record;
      });

      if (hasUpdates) {
        localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords));
        
        // Notify about auto-closed sessions
        this.notifyAutoClosedSessions(updatedRecords.filter((r: AttendanceRecord) => r.autoClosedBy === "system"));
      }
    } catch (error) {
      console.error("Error in auto-close check:", error);
    }
  }

  private generateAbsentStudentsList(record: AttendanceRecord) {
    try {
      // Get all students for the class
      const classes = JSON.parse(localStorage.getItem("study_classes") || "[]");
      const targetClass = classes.find((cls: any) => cls.id === record.className);
      
      if (targetClass && targetClass.students) {
        const presentStudentIds = record.students?.map((s: any) => s.studentId) || [];
        const absentStudents = targetClass.students.filter((student: any) => 
          !presentStudentIds.includes(student.id)
        ).map((student: any) => ({
          studentId: student.id,
          studentName: student.name,
          status: "absent",
          markedAt: record.autoCloseAt,
          autoMarked: true
        }));

        // Update the record with absent students
        const updatedRecord = {
          ...record,
          students: [...(record.students || []), ...absentStudents],
          absentCount: absentStudents.length,
          presentCount: record.students?.length || 0
        };

        // Save updated record
        const allRecords = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]");
        const updatedRecords = allRecords.map((r: AttendanceRecord) => 
          r.id === record.id ? updatedRecord : r
        );
        localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords));
      }
    } catch (error) {
      console.error("Error generating absent students list:", error);
    }
  }

  private notifyAutoClosedSessions(closedSessions: AttendanceRecord[]) {
    if (closedSessions.length > 0) {
      // Create notifications for faculty
      const notifications = closedSessions.map(session => ({
        id: `auto_close_${session.id}_${Date.now()}`,
        type: "attendance_closed",
        title: "Attendance Session Auto-Closed",
        message: `${session.className || session.subject || 'Attendance session'} has been automatically closed`,
        attendanceId: session.id,
        createdAt: new Date().toISOString(),
        read: false
      }));

      const existingNotifications = JSON.parse(localStorage.getItem("faculty_notifications") || "[]");
      const updatedNotifications = [...existingNotifications, ...notifications];
      localStorage.setItem("faculty_notifications", JSON.stringify(updatedNotifications));
    }
  }

  public stopAutoCloseCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Manual method to close attendance session
  public closeAttendanceSession(attendanceId: string) {
    try {
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]");
      const updatedRecords = records.map((record: any) => {
        if (record.id === attendanceId && record.status === "active") {
          const closedRecord = {
            ...record,
            status: "completed",
            closedAt: new Date().toISOString(),
            autoClosedBy: "manual"
          };
          
          this.generateAbsentStudentsList(closedRecord);
          return closedRecord;
        }
        return record;
      });

      localStorage.setItem("faculty_attendance_records", JSON.stringify(updatedRecords));
      return true;
    } catch (error) {
      console.error("Error closing attendance session:", error);
      return false;
    }
  }

  // Export attendance data to XLSX format
  public exportToXLSX(attendanceId: string) {
    try {
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]");
      const record = records.find((r: any) => r.id === attendanceId);
      
      if (!record) {
        throw new Error("Attendance record not found");
      }

      // Create CSV content (can be opened in Excel)
      const csvContent = [
        ["Attendance Report"],
        ["Subject", record.subject],
        ["Department", record.department],
        ["Year", record.studyingYear],
        ["Date", new Date(record.date).toLocaleDateString()],
        ["Time", record.timing],
        ["Location", `Floor ${record.floor}, Room ${record.classroom}`],
        ["Total Students", record.totalStudents],
        ["Present", record.presentCount || 0],
        ["Absent", record.absentCount || 0],
        ["Attendance Rate", `${record.totalStudents > 0 ? ((record.presentCount || 0) / record.totalStudents * 100).toFixed(1) : 0}%`],
        [],
        ["Student Name", "Student ID", "Status", "Marked At", "Face Verified"],
        ...(record.students || []).map((student: any) => [
          student.studentName,
          student.studentId,
          student.status,
          new Date(student.markedAt).toLocaleString(),
          student.faceVerified ? "Yes" : "No"
        ])
      ].map(row => row.join(",")).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${record.subject.replace(/\s+/g, "_")}_${new Date(record.date).toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      return false;
    }
  }

  // Export attendance data to PDF format
  public exportToPDF(attendanceId: string) {
    try {
      const records = JSON.parse(localStorage.getItem("faculty_attendance_records") || "[]");
      const record = records.find((r: any) => r.id === attendanceId);
      
      if (!record) {
        throw new Error("Attendance record not found");
      }

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
            <h2>${record.subject}</h2>
          </div>
          
          <table class="info-table">
            <tr><td><strong>Department:</strong></td><td>${record.department}</td></tr>
            <tr><td><strong>Year:</strong></td><td>${record.studyingYear}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${new Date(record.date).toLocaleDateString()}</td></tr>
            <tr><td><strong>Time:</strong></td><td>${record.timing}</td></tr>
            <tr><td><strong>Location:</strong></td><td>Floor ${record.floor}, Room ${record.classroom}</td></tr>
            <tr><td><strong>Total Students:</strong></td><td>${record.totalStudents}</td></tr>
            <tr><td><strong>Present:</strong></td><td>${record.presentCount || 0}</td></tr>
            <tr><td><strong>Absent:</strong></td><td>${record.absentCount || 0}</td></tr>
            <tr><td><strong>Attendance Rate:</strong></td><td>${record.totalStudents > 0 ? ((record.presentCount || 0) / record.totalStudents * 100).toFixed(1) : 0}%</td></tr>
          </table>

          <h3>Student Details</h3>
          <table class="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Status</th>
                <th>Marked At</th>
                <th>Face Verified</th>
              </tr>
            </thead>
            <tbody>
              ${(record.students || []).map((student: any) => `
                <tr>
                  <td>${student.studentName}</td>
                  <td>${student.studentId}</td>
                  <td class="${student.status}">${student.status.toUpperCase()}</td>
                  <td>${new Date(student.markedAt).toLocaleString()}</td>
                  <td>${student.faceVerified ? "Yes" : "No"}</td>
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
