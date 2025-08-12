'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateDistance } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export interface AttendanceSession {
  id: string;
  class_id: string;
  faculty_id: string;
  session_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location_latitude?: number;
  location_longitude?: number;
  geo_fence_radius: number;
  require_face_recognition: boolean;
  require_geo_fencing: boolean;
  require_liveness_detection: boolean;
  status: 'active' | 'paused' | 'ended';
  created_at: string;
  updated_at: string;
}

export interface StudentAttendance {
  id: string;
  session_id: string;
  student_id: string;
  attendance_status: 'present' | 'absent' | 'late' | 'excused';
  marked_at: string;
  face_verified: boolean;
  geo_location_verified: boolean;
  liveness_verified: boolean;
  latitude?: number;
  longitude?: number;
  distance_from_center?: number;
  face_confidence_score?: number;
  liveness_score?: number;
  device_info?: any;
  ip_address?: string;
}

export interface FacultyAttendance {
  id: string;
  session_id: string;
  faculty_id: string;
  attendance_status: 'present' | 'absent' | 'late';
  marked_at: string;
  face_verified: boolean;
  geo_location_verified: boolean;
  latitude?: number;
  longitude?: number;
  distance_from_center?: number;
  device_info?: any;
  ip_address?: string;
}

// Create a new attendance session
export async function createAttendanceSession(data: {
  class_id: string;
  faculty_id: string;
  session_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location_latitude?: number;
  location_longitude?: number;
  geo_fence_radius?: number;
  require_face_recognition?: boolean;
  require_geo_fencing?: boolean;
  require_liveness_detection?: boolean;
}) {
  const supabase = createClient();

  const {
    data: session,
    error
  } = await supabase
    .from('attendance_sessions')
    .insert({
      ...data,
      geo_fence_radius: data.geo_fence_radius || 100,
      require_face_recognition: data.require_face_recognition ?? true,
      require_geo_fencing: data.require_geo_fencing ?? true,
      require_liveness_detection: data.require_liveness_detection ?? true,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating attendance session:', error);
    throw new Error('Failed to create attendance session');
  }

  revalidatePath('/dashboard/attendance');
  return session;
}

// Get attendance sessions for a faculty
export async function getFacultyAttendanceSessions(faculty_id: string) {
  const supabase = createClient();

  const { data: sessions, error } = await supabase
    .from('attendance_sessions')
    .select(`
      *,
      classes (
        id,
        name,
        description
      )
    `)
    .eq('faculty_id', faculty_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching attendance sessions:', error);
    throw new Error('Failed to fetch attendance sessions');
  }

  return sessions;
}

// Get attendance sessions for a student (based on their class)
export async function getStudentAttendanceSessions(student_id: string) {
  const supabase = createClient();

  // First get the student's class
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('class_id')
    .eq('id', student_id)
    .single();

  if (studentError || !student?.class_id) {
    throw new Error('Student not found or not assigned to a class');
  }

  // Get active attendance sessions for the student's class
  const { data: sessions, error } = await supabase
    .from('attendance_sessions')
    .select(`
      *,
      classes (
        id,
        name,
        description
      ),
      faculty (
        id,
        name,
        department
      )
    `)
    .eq('class_id', student.class_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student attendance sessions:', error);
    throw new Error('Failed to fetch attendance sessions');
  }

  return sessions;
}

// Mark student attendance with face recognition and geo-fencing
export async function markStudentAttendance(data: {
  session_id: string;
  student_id: string;
  attendance_status: 'present' | 'absent' | 'late' | 'excused';
  face_verified?: boolean;
  geo_location_verified?: boolean;
  liveness_verified?: boolean;
  latitude?: number;
  longitude?: number;
  distance_from_center?: number;
  face_confidence_score?: number;
  liveness_score?: number;
  device_info?: any;
  ip_address?: string;
}) {
  const supabase = createClient();

  // Check if attendance already exists
  const { data: existingAttendance } = await supabase
    .from('student_attendance')
    .select('id')
    .eq('session_id', data.session_id)
    .eq('student_id', data.student_id)
    .single();

  if (existingAttendance) {
    // Update existing attendance
    const { data: attendance, error } = await supabase
      .from('student_attendance')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAttendance.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student attendance:', error);
      throw new Error('Failed to update attendance');
    }

    return attendance;
  } else {
    // Create new attendance record
    const { data: attendance, error } = await supabase
      .from('student_attendance')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error marking student attendance:', error);
      throw new Error('Failed to mark attendance');
    }

    return attendance;
  }
}

// Mark faculty attendance
export async function markFacultyAttendance(data: {
  session_id: string;
  faculty_id: string;
  attendance_status: 'present' | 'absent' | 'late';
  face_verified?: boolean;
  geo_location_verified?: boolean;
  latitude?: number;
  longitude?: number;
  distance_from_center?: number;
  device_info?: any;
  ip_address?: string;
}) {
  const supabase = createClient();

  // Check if attendance already exists
  const { data: existingAttendance } = await supabase
    .from('faculty_attendance')
    .select('id')
    .eq('session_id', data.session_id)
    .eq('faculty_id', data.faculty_id)
    .single();

  if (existingAttendance) {
    // Update existing attendance
    const { data: attendance, error } = await supabase
      .from('faculty_attendance')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAttendance.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating faculty attendance:', error);
      throw new Error('Failed to update attendance');
    }

    return attendance;
  } else {
    // Create new attendance record
    const { data: attendance, error } = await supabase
      .from('faculty_attendance')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error marking faculty attendance:', error);
      throw new Error('Failed to mark attendance');
    }

    return attendance;
  }
}

// Get attendance records for a session
export async function getSessionAttendance(session_id: string) {
  const supabase = createClient();

  const { data: studentAttendance, error: studentError } = await supabase
    .from('student_attendance')
    .select(`
      *,
      students (
        id,
        name,
        email,
        prn
      )
    `)
    .eq('session_id', session_id);

  const { data: facultyAttendance, error: facultyError } = await supabase
    .from('faculty_attendance')
    .select(`
      *,
      faculty (
        id,
        name,
        email,
        department
      )
    `)
    .eq('session_id', session_id);

  if (studentError || facultyError) {
    console.error('Error fetching attendance records:', studentError || facultyError);
    throw new Error('Failed to fetch attendance records');
  }

  return {
    studentAttendance: studentAttendance || [],
    facultyAttendance: facultyAttendance || []
  };
}

// Save face data for a student
export async function saveStudentFace(student_id: string, face_encoding: string, face_image_url?: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_faces')
    .upsert({
      student_id,
      face_encoding,
      face_image_url,
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving student face data:', error);
    throw new Error('Failed to save face data');
  }

  return data;
}

// Save face data for a faculty
export async function saveFacultyFace(faculty_id: string, face_encoding: string, face_image_url?: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('faculty_faces')
    .upsert({
      faculty_id,
      face_encoding,
      face_image_url,
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving faculty face data:', error);
    throw new Error('Failed to save face data');
  }

  return data;
}

// Get face data for verification
export async function getFaceData(user_id: string, user_type: 'student' | 'faculty') {
  const supabase = createClient();

  const table = user_type === 'student' ? 'student_faces' : 'faculty_faces';
  const id_field = user_type === 'student' ? 'student_id' : 'faculty_id';

  const { data, error } = await supabase
    .from(table)
    .select('face_encoding, is_verified')
    .eq(id_field, user_id)
    .single();

  if (error) {
    console.error('Error fetching face data:', error);
    return null;
  }

  return data;
}

// Verify geo-fencing
export async function verifyGeoFencing(
  session_id: string,
  user_latitude: number,
  user_longitude: number
): Promise<{ verified: boolean; distance: number }> {
  const supabase = createClient();

  const { data: session, error } = await supabase
    .from('attendance_sessions')
    .select('location_latitude, location_longitude, geo_fence_radius')
    .eq('id', session_id)
    .single();

  if (error || !session?.location_latitude || !session?.location_longitude) {
    return { verified: false, distance: 0 };
  }

  const distance = calculateDistance(
    user_latitude,
    user_longitude,
    session.location_latitude,
    session.location_longitude
  );

  return {
    verified: distance <= session.geo_fence_radius,
    distance: Math.round(distance)
  };
}

// Get attendance analytics
export async function getAttendanceAnalytics(session_id: string) {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('id', session_id)
    .single();

  if (sessionError) {
    throw new Error('Session not found');
  }

  const { data: studentAttendance, error: studentError } = await supabase
    .from('student_attendance')
    .select('attendance_status, face_verified, geo_location_verified, liveness_verified')
    .eq('session_id', session_id);

  if (studentError) {
    throw new Error('Failed to fetch attendance data');
  }

  const totalStudents = studentAttendance?.length || 0;
  const presentStudents = studentAttendance?.filter(a => a.attendance_status === 'present').length || 0;
  const absentStudents = studentAttendance?.filter(a => a.attendance_status === 'absent').length || 0;
  const lateStudents = studentAttendance?.filter(a => a.attendance_status === 'late').length || 0;
  const faceVerified = studentAttendance?.filter(a => a.face_verified).length || 0;
  const geoVerified = studentAttendance?.filter(a => a.geo_location_verified).length || 0;
  const livenessVerified = studentAttendance?.filter(a => a.liveness_verified).length || 0;

  return {
    session,
    analytics: {
      totalStudents,
      presentStudents,
      absentStudents,
      lateStudents,
      attendanceRate: totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0,
      faceVerified,
      geoVerified,
      livenessVerified
    }
  };
}

// End attendance session
export async function endAttendanceSession(session_id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('attendance_sessions')
    .update({
      status: 'ended',
      updated_at: new Date().toISOString()
    })
    .eq('id', session_id);

  if (error) {
    console.error('Error ending attendance session:', error);
    throw new Error('Failed to end attendance session');
  }

  revalidatePath('/dashboard/attendance');
  return true;
} 