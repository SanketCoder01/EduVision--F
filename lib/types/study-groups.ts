// Study Groups Types and Interfaces

export interface StudyGroup {
  id: string
  name: string
  description: string
  objectives: string
  faculty_id: string
  department: string
  year: string
  class_section?: string
  target_selection: 'specific_class' | 'let_students_decide'
  start_date: string
  end_date: string
  max_members: number
  task_frequency: 'daily' | 'weekly' | 'monthly'
  requires_submission: boolean
  submission_details?: string
  materials_allowed: boolean
  status: 'draft' | 'published' | 'active' | 'completed'
  created_at: string
  updated_at: string
  faculty: {
    name: string
    email: string
    department: string
  }
}

export interface StudentGroup {
  id: string
  study_group_id: string
  group_name: string
  leader_id: string
  members: string[]
  status: 'forming' | 'active' | 'completed'
  created_at: string
  updated_at: string
  member_details: {
    id: string
    name: string
    prn: string
    email: string
    role: 'leader' | 'member'
  }[]
}

export interface GroupTask {
  id: string
  study_group_id: string
  student_group_id?: string
  title: string
  description: string
  task_type: 'daily' | 'weekly' | 'monthly' | 'activity'
  due_date: string
  assigned_date: string
  materials: GroupMaterial[]
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed'
  faculty_id: string
  created_at: string
}

export interface GroupMaterial {
  id: string
  name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
}

export interface GroupSubmission {
  id: string
  task_id: string
  student_group_id: string
  submitted_by: string
  content?: string
  files: GroupMaterial[]
  submission_date: string
  status: 'submitted' | 'reviewed' | 'approved' | 'needs_revision'
  faculty_feedback?: string
  grade?: number
}

export interface GroupMessage {
  id: string
  study_group_id: string
  student_group_id?: string
  sender_id: string
  sender_type: 'faculty' | 'student'
  message: string
  attachments?: GroupMaterial[]
  sent_at: string
  read_by: string[]
}

export interface GroupNotification {
  id: string
  study_group_id: string
  student_group_id?: string
  type: 'new_group' | 'task_assigned' | 'submission_due' | 'message' | 'group_update'
  title: string
  message: string
  target_audience: 'all_students' | 'specific_class' | 'group_members' | 'faculty'
  target_class?: string
  target_department?: string
  target_year?: string
  created_at: string
  read_by: string[]
}

// Form interfaces for creating study groups
export interface CreateStudyGroupForm {
  name: string
  description: string
  objectives: string
  department: string
  year: string
  class_section?: string
  target_selection: 'specific_class' | 'let_students_decide'
  start_date: string
  end_date: string
  max_members: number
  task_frequency: 'daily' | 'weekly' | 'monthly'
  requires_submission: boolean
  submission_details?: string
  materials_allowed: boolean
  daily_tasks?: string[]
  weekly_tasks?: string[]
  monthly_tasks?: string[]
}

export interface JoinGroupForm {
  study_group_id: string
  group_name: string
  selected_members: string[]
  leadership_preference: 'leader' | 'member'
}

// Constants
export const DEPARTMENTS = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'AIDS (Artificial Intelligence & Data Science)',
  'Cyber Security'
] as const

export const YEARS = [
  'First Year',
  'Second Year', 
  'Third Year',
  'Fourth Year'
] as const

export const CLASS_SECTIONS = [
  'A', 'B', 'C', 'D'
] as const

export const TASK_FREQUENCIES = [
  { value: 'daily', label: 'Daily Tasks', description: 'Students submit work every day' },
  { value: 'weekly', label: 'Weekly Tasks', description: 'Students submit work every week' },
  { value: 'monthly', label: 'Monthly Tasks', description: 'Students submit work every month' }
] as const
