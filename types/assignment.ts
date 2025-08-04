export interface Assignment {
  id: string
  title: string
  description: string
  faculty_id: string
  class_id: string
  assignment_type: AssignmentType
  allowed_file_types?: string[]
  word_limit?: number
  max_marks: number
  start_date: string
  due_date: string
  visibility: boolean
  allow_late_submission: boolean
  allow_resubmission: boolean
  enable_plagiarism_check: boolean
  allow_group_submission: boolean
  created_at: string
  updated_at?: string
}

export type AssignmentType = "file_upload" | "text_based" | "quiz" | "coding"

export interface AssignmentResource {
  id: string
  assignment_id: string
  name: string
  file_type: string
  file_url: string
  created_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submission_type: "file" | "text"
  content?: string
  status: SubmissionStatus
  submitted_at?: string
  graded_at?: string
  grade?: string
  marks?: number
  feedback?: string
  plagiarism_score?: number
  created_at: string
  updated_at?: string
  files?: SubmissionFile[]
}

export type SubmissionStatus = "draft" | "submitted" | "late" | "graded" | "returned"

export interface SubmissionFile {
  id: string
  submission_id: string
  name: string
  file_type: string
  file_url: string
  file_size: number
  created_at: string
}

export interface Comment {
  id: string
  assignment_id: string
  submission_id?: string
  user_id: string
  user_type: "faculty" | "student"
  content: string
  created_at: string
  updated_at?: string
}

export interface Notification {
  id: string
  assignment_id: string
  recipient_id: string
  type: NotificationType
  content: string
  is_read: boolean
  created_at: string
}

export type NotificationType =
  | "deadline_reminder"
  | "missing_submission"
  | "feedback_available"
  | "resubmission_request"

export interface Rubric {
  id: string
  assignment_id: string
  criteria: RubricCriterion[]
}

export interface RubricCriterion {
  id: string
  rubric_id: string
  criterion: string
  max_score: number
  weight: number
}

export interface ClassInfo {
  id: string
  name: string
  students: number
}
