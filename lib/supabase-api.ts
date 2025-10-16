/**
 * COMPREHENSIVE SUPABASE API SERVICE
 * Real-time data sharing between faculty and students
 * Department-based security implementation
 */

import { supabase } from './supabase';
import { getAccessibleDepartments, canAccessDepartment } from './department-security';

export interface Student {
  id: string;
  name: string;
  email: string;
  prn?: string;
  department: string;
  year: string;
  division?: string;
  registration_completed?: boolean;
  [key: string]: any;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation?: string;
  accessible_departments?: string[];
  [key: string]: any;
}

// ============================================
// ASSIGNMENT MODULE
// ============================================

export const AssignmentAPI = {
  /**
   * Faculty: Create assignment for specific department/year/division
   */
  async createAssignment(facultyId: string, data: {
    title: string;
    description: string;
    subject: string;
    department: string;
    year: string;
    division?: string[];
    assignment_type: string;
    total_marks: number;
    due_date: string;
    attachment_url?: string;
  }) {
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        faculty_id: facultyId,
        ...data,
        target_years: [data.year],
        is_published: true,
        status: 'published'
      })
      .select()
      .single();

    return { data: assignment, error };
  },

  /**
   * Student: Get assignments for their department/year (only if registration completed)
   */
  async getStudentAssignments(studentId: string) {
    // First check if registration is completed
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year, division')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        faculty:faculty_id (
          name,
          department,
          email
        )
      `)
      .eq('department', student.department)
      .contains('target_years', [student.year])
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Faculty: Get assignments they created
   */
  async getFacultyAssignments(facultyId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Student: Submit assignment
   */
  async submitAssignment(assignmentId: string, studentId: string, data: {
    submission_text?: string;
    attachment_url?: string;
  }) {
    const { data: submission, error } = await supabase
      .from('assignment_submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        ...data,
        status: 'submitted'
      })
      .select()
      .single();

    return { data: submission, error };
  },

  /**
   * Faculty: Get all submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        student:student_id (
          name,
          prn,
          email,
          department,
          year
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    return { data, error };
  },

  /**
   * Faculty: Grade submission
   */
  async gradeSubmission(submissionId: string, facultyId: string, marks: number, feedback?: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        marks_obtained: marks,
        feedback: feedback,
        graded_by: facultyId,
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select()
      .single();

    return { data, error };
  }
};

// ============================================
// ATTENDANCE MODULE
// ============================================

export const AttendanceAPI = {
  /**
   * Faculty: Create attendance session
   */
  async createSession(facultyId: string, data: {
    subject: string;
    department: string;
    year: string;
    division?: string;
    session_date: string;
    session_time: string;
    session_type?: string;
    duration_minutes?: number;
  }) {
    const { data: session, error } = await supabase
      .from('attendance_sessions')
      .insert({
        faculty_id: facultyId,
        ...data
      })
      .select()
      .single();

    return { data: session, error };
  },

  /**
   * Faculty: Mark attendance for students
   */
  async markAttendance(sessionId: string, studentId: string, status: 'present' | 'absent' | 'late', facultyId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert({
        session_id: sessionId,
        student_id: studentId,
        status: status,
        marked_by: facultyId
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Student: Get their attendance records
   */
  async getStudentAttendance(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        session:session_id (
          subject,
          session_date,
          session_time,
          department,
          year
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// ============================================
// ANNOUNCEMENTS MODULE
// ============================================

export const AnnouncementAPI = {
  /**
   * Faculty: Create announcement
   */
  async createAnnouncement(facultyId: string, data: {
    title: string;
    content: string;
    department: string;
    year?: string[];
    division?: string[];
    priority?: string;
    attachment_url?: string;
    expires_at?: string;
  }) {
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        faculty_id: facultyId,
        ...data,
        target_years: data.year || [],
        is_published: true
      })
      .select()
      .single();

    return { data: announcement, error };
  },

  /**
   * Student: Get announcements for their department/year
   */
  async getStudentAnnouncements(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        faculty:faculty_id (
          name,
          department
        )
      `)
      .eq('department', student.department)
      .eq('is_published', true)
      .or(`target_years.cs.{},target_years.cs.{${student.year}}`)
      .order('created_at', { ascending: false })
      .limit(50);

    return { data, error };
  },

  /**
   * Student: Mark announcement as read
   */
  async markAsRead(announcementId: string, studentId: string) {
    const { data, error } = await supabase
      .from('announcement_reads')
      .insert({
        announcement_id: announcementId,
        student_id: studentId
      });

    return { data, error };
  }
};

// ============================================
// EVENTS MODULE
// ============================================

export const EventAPI = {
  /**
   * Faculty: Create event
   */
  async createEvent(facultyId: string, data: {
    title: string;
    description: string;
    event_type: string;
    department: string;
    year?: string[];
    venue?: string;
    event_date: string;
    event_time?: string;
    duration_minutes?: number;
    max_participants?: number;
    registration_required?: boolean;
    registration_deadline?: string;
  }) {
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        faculty_id: facultyId,
        ...data,
        target_years: data.year || []
      })
      .select()
      .single();

    return { data: event, error };
  },

  /**
   * Student: Get events for their department
   */
  async getStudentEvents(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        faculty:faculty_id (
          name,
          department
        )
      `)
      .eq('department', student.department)
      .order('event_date', { ascending: true });

    return { data, error };
  },

  /**
   * Student: Register for event
   */
  async registerForEvent(eventId: string, studentId: string) {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: studentId
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Faculty: Get event registrations
   */
  async getEventRegistrations(eventId: string) {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        student:student_id (
          name,
          prn,
          email,
          department,
          year
        )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    return { data, error };
  }
};

// ============================================
// STUDY MATERIALS MODULE
// ============================================

export const StudyMaterialAPI = {
  /**
   * Faculty: Upload study material
   */
  async uploadMaterial(facultyId: string, data: {
    title: string;
    description?: string;
    subject: string;
    department: string;
    year: string;
    material_type: string;
    file_url: string;
    file_size_mb?: number;
  }) {
    const { data: material, error } = await supabase
      .from('study_materials')
      .insert({
        faculty_id: facultyId,
        ...data,
        target_years: [data.year]
      })
      .select()
      .single();

    return { data: material, error };
  },

  /**
   * Student: Get study materials for their department/year
   */
  async getStudentMaterials(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('study_materials')
      .select(`
        *,
        faculty:faculty_id (
          name,
          department
        )
      `)
      .eq('department', student.department)
      .contains('target_years', [student.year])
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// ============================================
// TIMETABLE MODULE
// ============================================

export const TimetableAPI = {
  /**
   * Faculty: Create timetable entry
   */
  async createEntry(facultyId: string, data: {
    subject: string;
    department: string;
    year: string;
    division: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room_number?: string;
    lecture_type?: string;
  }) {
    const { data: entry, error } = await supabase
      .from('timetable_entries')
      .insert({
        faculty_id: facultyId,
        ...data
      })
      .select()
      .single();

    return { data: entry, error };
  },

  /**
   * Student: Get their timetable
   */
  async getStudentTimetable(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year, division')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('timetable_entries')
      .select(`
        *,
        faculty:faculty_id (
          name
        )
      `)
      .eq('department', student.department)
      .eq('year', student.year)
      .eq('division', student.division || '')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    return { data, error };
  }
};

// ============================================
// QUIZ MODULE
// ============================================

export const QuizAPI = {
  /**
   * Faculty: Create quiz
   */
  async createQuiz(facultyId: string, data: {
    title: string;
    description?: string;
    subject: string;
    department: string;
    year: string;
    division?: string[];
    duration_minutes: number;
    total_marks: number;
    passing_marks?: number;
    start_time: string;
    end_time: string;
  }) {
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        faculty_id: facultyId,
        ...data,
        is_published: true
      })
      .select()
      .single();

    return { data: quiz, error };
  },

  /**
   * Faculty: Add question to quiz
   */
  async addQuestion(quizId: string, data: {
    question_text: string;
    question_type: string;
    options?: any;
    correct_answer: string;
    marks: number;
    order_number?: number;
  }) {
    const { data: question, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        ...data
      })
      .select()
      .single();

    return { data: question, error };
  },

  /**
   * Student: Get available quizzes
   */
  async getStudentQuizzes(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('department', student.department)
      .eq('year', student.year)
      .eq('is_published', true)
      .order('start_time', { ascending: false });

    return { data, error };
  },

  /**
   * Student: Submit quiz attempt
   */
  async submitQuiz(quizId: string, studentId: string, answers: any) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .upsert({
        quiz_id: quizId,
        student_id: studentId,
        answers: answers,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }
};

// ============================================
// STUDY GROUPS MODULE
// ============================================

export const StudyGroupAPI = {
  /**
   * Student: Create study group
   */
  async createGroup(studentId: string, data: {
    name: string;
    description?: string;
    department: string;
    year: string;
    subject?: string;
    max_members?: number;
  }) {
    const { data: group, error } = await supabase
      .from('study_groups')
      .insert({
        ...data,
        created_by: studentId,
        target_years: [data.year]
      })
      .select()
      .single();

    // Add creator as admin member
    if (group) {
      await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          student_id: studentId,
          role: 'admin'
        });
    }

    return { data: group, error };
  },

  /**
   * Student: Join study group
   */
  async joinGroup(groupId: string, studentId: string) {
    const { data, error } = await supabase
      .from('study_group_members')
      .insert({
        group_id: groupId,
        student_id: studentId,
        role: 'member'
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Student: Post in study group
   */
  async createPost(groupId: string, studentId: string, content: string, attachmentUrl?: string) {
    const { data, error } = await supabase
      .from('study_group_posts')
      .insert({
        group_id: groupId,
        student_id: studentId,
        content: content,
        attachment_url: attachmentUrl
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Student: Get study groups for their department
   */
  async getStudentGroups(studentId: string) {
    const { data: student } = await supabase
      .from('students')
      .select('registration_completed, department, year')
      .eq('id', studentId)
      .single();

    if (!student?.registration_completed) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .eq('department', student.department)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const RealtimeAPI = {
  /**
   * Subscribe to assignments for student
   */
  subscribeToAssignments(department: string, year: string, callback: (payload: any) => void) {
    return supabase
      .channel('assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `department=eq.${department}`
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to announcements
   */
  subscribeToAnnouncements(department: string, callback: (payload: any) => void) {
    return supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `department=eq.${department}`
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to assignment submissions (for faculty)
   */
  subscribeToSubmissions(assignmentId: string, callback: (payload: any) => void) {
    return supabase
      .channel('submissions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${assignmentId}`
        },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  }
};

// Export all APIs
export default {
  Assignment: AssignmentAPI,
  Attendance: AttendanceAPI,
  Announcement: AnnouncementAPI,
  Event: EventAPI,
  StudyMaterial: StudyMaterialAPI,
  Timetable: TimetableAPI,
  Quiz: QuizAPI,
  StudyGroup: StudyGroupAPI,
  Realtime: RealtimeAPI
};

