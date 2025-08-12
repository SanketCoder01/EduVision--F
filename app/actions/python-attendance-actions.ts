'use server';

const PYTHON_API_BASE_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

export interface PythonAttendanceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_type: 'student' | 'faculty';
  date: string;
  time: string;
  latitude?: number;
  longitude?: number;
  face_confidence: number;
  geo_verified: boolean;
  subject_id?: string;
  time_slot?: string;
}

// Register face for new user (first-time setup)
export async function registerFaceWithPython(
  user_id: string,
  user_type: 'student' | 'faculty',
  image_data: string
): Promise<PythonAttendanceResponse> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/api/register-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        user_type,
        image_data
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering face:', error);
    return {
      success: false,
      message: 'Failed to register face. Please try again.'
    };
  }
}

// Mark attendance for student
export async function markStudentAttendanceWithPython(
  user_id: string,
  image_data: string,
  latitude: number,
  longitude: number,
  subject_id: string,
  time_slot: string,
  date: string
): Promise<PythonAttendanceResponse> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/api/mark-attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        user_type: 'student',
        image_data,
        latitude,
        longitude,
        subject_id,
        time_slot,
        date
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking student attendance:', error);
    return {
      success: false,
      message: 'Failed to mark attendance. Please try again.'
    };
  }
}

// Mark attendance for faculty
export async function markFacultyAttendanceWithPython(
  user_id: string,
  image_data: string,
  latitude: number,
  longitude: number,
  date: string
): Promise<PythonAttendanceResponse> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/api/mark-attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        user_type: 'faculty',
        image_data,
        latitude,
        longitude,
        date
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking faculty attendance:', error);
    return {
      success: false,
      message: 'Failed to mark attendance. Please try again.'
    };
  }
}

// Get attendance records
export async function getAttendanceRecordsWithPython(
  user_id: string,
  user_type: 'student' | 'faculty',
  date?: string
): Promise<PythonAttendanceResponse> {
  try {
    const params = new URLSearchParams({
      user_id,
      user_type
    });
    
    if (date) {
      params.append('date', date);
    }

    const response = await fetch(`${PYTHON_API_BASE_URL}/api/get-attendance?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting attendance records:', error);
    return {
      success: false,
      message: 'Failed to get attendance records. Please try again.'
    };
  }
}

// Get available subjects
export async function getSubjectsWithPython(): Promise<Subject[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/api/subjects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error getting subjects:', error);
    return [];
  }
}

// Get available time slots
export async function getTimeSlotsWithPython(): Promise<TimeSlot[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/api/time-slots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error getting time slots:', error);
    return [];
  }
}

// Check Python API health
export async function checkPythonAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/api/health`, {
      method: 'GET',
    });

    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Python API health check failed:', error);
    return false;
  }
} 