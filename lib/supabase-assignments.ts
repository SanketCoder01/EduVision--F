import { supabase } from './supabase'
import { toast } from '@/hooks/use-toast'

export interface Assignment {
  id: string
  title: string
  description: string
  department: string
  target_years: string[]
  assignment_type: 'file_upload' | 'text_based' | 'quiz' | 'coding' | 'normal' | 'ai'
  due_date: string
  max_marks: number
  faculty_id: string
  status: 'draft' | 'published' | 'closed'
  questions?: string
  submission_guidelines?: string
  allowed_file_types?: string[]
  enable_plagiarism_check?: boolean
  allow_late_submission?: boolean
  allow_resubmission?: boolean
  allow_group_submission?: boolean
  visibility?: boolean
  difficulty?: string
  estimated_time?: number
  ai_prompt?: string
  created_at: string
  updated_at: string
  faculty?: {
    name: string
    email: string
  }
  // Legacy fields for compatibility
  subject?: string
  year?: string
  total_marks?: number
  instructions?: string
  resources?: any[]
}

export interface AssignmentResource {
  id: string
  assignment_id: string
  name: string
  file_type: string
  file_url: string
  file_size?: number
  created_at: string
}

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  content?: string
  file_urls: string[]
  file_names: string[]
  status: 'submitted' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  submitted_at: string
  graded_at?: string
  graded_by?: string
}

export class SupabaseAssignmentService {
  // Check if assignment title already exists for faculty
  static async checkDuplicateTitle(title: string, facultyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id')
        .eq('title', title)
        .eq('faculty_id', facultyId)
        .limit(1)

      if (error) {
        console.error('Error checking duplicate title:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Error in checkDuplicateTitle:', error)
      return false
    }
  }


  // Create assignment
  static async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    try {
      // Validate required fields
      if (!assignmentData.title || !assignmentData.faculty_id) {
        throw new Error('Title and faculty ID are required')
      }

      // Check for duplicate title
      const isDuplicate = await this.checkDuplicateTitle(assignmentData.title, assignmentData.faculty_id)
      if (isDuplicate) {
        throw new Error('An assignment with this title already exists for this faculty')
      }

      // Only include fields that exist in the database schema
      const assignmentToCreate = {
        title: assignmentData.title,
        description: assignmentData.description || '',
        faculty_id: assignmentData.faculty_id,
        department: assignmentData.department || '',
        target_years: assignmentData.target_years || [],
        assignment_type: assignmentData.assignment_type || 'file_upload',
        max_marks: assignmentData.max_marks || 100,
        due_date: assignmentData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft' as const // Always create as draft
      }

      const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentToCreate])
        .select('*')
        .single()

      if (error) {
        console.error('Error creating assignment:', error)
        throw new Error(error.message)
      }

      console.log('Assignment created successfully:', data)
      return data
    } catch (error) {
      console.error('Error in createAssignment:', error)
      throw error
    }
  }

  // Securely publish an assignment
  static async publishAssignment(assignmentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('publish_assignment_securely', {
        p_assignment_id: assignmentId
      })

      if (error) {
        console.error('Error publishing assignment:', error)
        return { success: false, message: error.message }
      }

      if (!data || !data.success) {
        return { success: false, message: data?.message || 'Failed to publish assignment' }
      }

      return { success: true, message: 'Assignment published successfully' }
    } catch (error) {
      console.error('Error in publishAssignment:', error)
      return { success: false, message: 'An error occurred while publishing the assignment' }
    }
  }

  // Update an existing assignment
  static async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    try {
      // Remove updated_at from updates since it doesn't exist in database schema
      const { updated_at, ...validUpdates } = updates
      
      const { data, error } = await supabase
        .from('assignments')
        .update(validUpdates)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('Error updating assignment:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error in updateAssignment:', error)
      throw error
    }
  }

  // Get assignments for faculty
  static async getFacultyAssignments(facultyId: string): Promise<Assignment[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching faculty assignments:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error in getFacultyAssignments:', error)
      return []
    }
  }

  // Get assignments for students
  static async getStudentAssignments(studentDepartment: string, studentYear: string): Promise<Assignment[]> {
    try {
      console.log('DEBUG: Fetching assignments for:', { department: studentDepartment, year: studentYear })
      
      // Convert year format to match database format 
      // Database stores: 'first', 'second', 'third', 'fourth'
      // Students might have: '1', '2', '3', '4' or 'first', 'second', etc.
      const yearMapping: { [key: string]: string } = {
        '1': 'first',
        '2': 'second', 
        '3': 'third',
        '4': 'fourth',
        'first': 'first',
        'second': 'second',
        'third': 'third',
        'fourth': 'fourth'
      }
      
      const normalizedYear = yearMapping[studentYear.toLowerCase()] || studentYear
      console.log('DEBUG: Normalized year:', normalizedYear, 'from input:', studentYear)
      
      // First, let's check all assignments without filters to debug
      const { data: allAssignments, error: allError } = await supabase
        .from('assignments')
        .select('id, title, department, target_years, status, faculty_id')
        .order('created_at', { ascending: false })

      console.log('DEBUG: All assignments in database:', allAssignments?.length, allAssignments)

      // Check published assignments for this department
      const { data: deptAssignments, error: deptError } = await supabase
        .from('assignments')
        .select('id, title, department, target_years, status')
        .eq('status', 'published')
        .eq('department', studentDepartment)

      console.log('DEBUG: Published assignments for department:', studentDepartment, deptAssignments?.length, deptAssignments)

      // Now get filtered assignments with proper target_years handling
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          faculty:faculty_id (
            name,
            email
          )
        `)
        .eq('status', 'published')
        .eq('department', studentDepartment)
        .contains('target_years', [normalizedYear])
        .order('created_at', { ascending: false })

      console.log('DEBUG: Final filtered assignments query result:', { 
        data: data?.length, 
        error,
        filters: { 
          status: 'published', 
          department: studentDepartment, 
          target_years_contains: normalizedYear,
          query_used: `target_years.cs.{${normalizedYear}} OR target_years.is.null`
        }
      })

      if (error) {
        console.error('Error fetching student assignments:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error in getStudentAssignments:', error)
      return []
    }
  }

  // Get single assignment by ID
  static async getAssignmentById(id: string): Promise<Assignment | null> {
    try {
      console.log('DEBUG: Fetching assignment by ID:', id)
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          faculty:faculty_id (
            name,
            email
          )
        `)
        .eq('id', id)
        .single()

      console.log('DEBUG: Assignment fetch result:', { data, error })

      if (error) {
        console.error('Error fetching assignment:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getAssignmentById:', error)
      return null
    }
  }

  // Delete assignment
  static async deleteAssignment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting assignment:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in deleteAssignment:', error)
      throw error
    }
  }

  // Upload assignment resource file
  static async uploadAssignmentResource(assignmentId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${assignmentId}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('assignment-resources')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
        throw new Error(error.message)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignment-resources')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadAssignmentResource:', error)
      throw error
    }
  }

  // Create assignment resource record
  static async createAssignmentResource(resourceData: Partial<AssignmentResource>): Promise<AssignmentResource> {
    try {
      const { data, error } = await supabase
        .from('assignment_resources')
        .insert([resourceData])
        .select()
        .single()

      if (error) {
        console.error('Error creating assignment resource:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error in createAssignmentResource:', error)
      throw error
    }
  }

  // Get assignment resources
  static async getAssignmentResources(assignmentId: string): Promise<AssignmentResource[]> {
    try {
      const { data, error } = await supabase
        .from('assignment_resources')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching assignment resources:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error in getAssignmentResources:', error)
      return []
    }
  }

  // Submit assignment
  static async submitAssignment(submissionData: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> {
    try {
      // Get current user to fetch student details
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get student details from user_profiles
      const { data: studentProfile } = await supabase
        .from('user_profiles')
        .select('department, year')
        .eq('email', user.email)
        .single()

      if (!studentProfile) {
        throw new Error('Student profile not found')
      }

      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: submissionData.assignment_id,
          student_id: submissionData.student_id,
          student_email: user.email,
          student_department: studentProfile.department,
          student_year: studentProfile.year,
          submission_text: submissionData.content,
          file_urls: submissionData.file_urls || [],
          file_names: submissionData.file_names || [],
          status: 'submitted'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error submitting assignment:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error in submitAssignment:', error)
      throw error
    }
  }

  // Get student submission for assignment
  static async getStudentSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching submission:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getStudentSubmission:', error)
      return null
    }
  }

  // Get all submissions for an assignment
  static async getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          student:student_id (
            name,
            email,
            prn
          )
        `)
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error fetching assignment submissions:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error in getAssignmentSubmissions:', error)
      return []
    }
  }

  // Upload submission file
  static async uploadSubmissionFile(assignmentId: string, studentId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${assignmentId}/${studentId}/${Date.now()}_${file.name}`
      
      const { data, error } = await supabase.storage
        .from('assignment-submissions')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading submission file:', error)
        throw new Error(error.message)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignment-submissions')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadSubmissionFile:', error)
      throw error
    }
  }

  // Subscribe to assignment changes (real-time)
  static subscribeToAssignments(callback: (payload: any) => void) {
    return supabase
      .channel('assignments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        callback
      )
      .subscribe()
  }

  // Subscribe to submission changes (real-time)
  static subscribeToSubmissions(assignmentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`submissions-${assignmentId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${assignmentId}`
        }, 
        callback
      )
      .subscribe()
  }
}
