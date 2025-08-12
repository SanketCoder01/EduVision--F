import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Assignment {
  id?: string;
  title: string;
  description: string;
  department: string;
  year: string;
  due_date: string;
  faculty_id: string;
  faculty_name: string;
  faculty_email: string;
  attachment_url?: string;
  created_at?: string;
  // Required fields from database schema
  assignment_type: 'file_upload' | 'text_based' | 'quiz' | 'coding';
  max_marks: number;
  status?: 'draft' | 'published' | 'closed';
  // Optional fields from schema
  start_date?: string;
  visibility?: boolean;
  allow_late_submission?: boolean;
  allow_resubmission?: boolean;
  enable_plagiarism_check?: boolean;
  allow_group_submission?: boolean;
  allowed_file_types?: string[];
}

export interface AssignmentSubmission {
  id?: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  submission_text?: string;
  attachment_url?: string;
  submitted_at?: string;
  grade?: number;
  feedback?: string;
}

// Faculty: Publish assignment
// Internal: sanitize UI payload to DB columns
function buildAssignmentInsertPayload(input: any) {
  const {
    // UI-only fields to drop
    faculty_name,
    faculty_email,
    attachment_url,
    question,
    rules,
    instructions,
    allowed_formats,
    allow_plagiarism,
    // keep the rest
    ...rest
  } = input || {};

  // Map allowed_formats object -> allowed_file_types string[]
  const allowed_file_types = Array.isArray(rest.allowed_file_types)
    ? rest.allowed_file_types
    : (allowed_formats
        ? Object.entries(allowed_formats)
            .filter(([_, v]) => Boolean(v))
            .map(([k]) => String(k))
        : undefined);

  // Map allow_plagiarism -> enable_plagiarism_check if provided
  const enable_plagiarism_check =
    typeof allow_plagiarism === 'boolean'
      ? allow_plagiarism
      : rest.enable_plagiarism_check;

  // Ensure status/visibility defaults if not present
  const status = rest.status ?? 'published';
  const visibility = typeof rest.visibility === 'boolean' ? rest.visibility : true;

  // Return only DB columns
  return {
    title: rest.title,
    description: rest.description,
    faculty_id: rest.faculty_id,
    department: rest.department,
    year: rest.year,
    assignment_type: rest.assignment_type,
    allowed_file_types,
    max_marks: rest.max_marks,
    due_date: rest.due_date,
    start_date: rest.start_date,
    visibility,
    allow_late_submission: rest.allow_late_submission,
    allow_resubmission: rest.allow_resubmission,
    enable_plagiarism_check,
    allow_group_submission: rest.allow_group_submission,
    status
  };
}

// Faculty: Publish assignment
export async function publishAssignment(assignment: Assignment | any, accessToken?: string) {
  try {
    // First, ensure we have a proper UUID for faculty_id
    let facultyUUID = assignment.faculty_id;
    
    // If faculty_id is not a UUID, try to find or create the user in Supabase
    if (!isValidUUID(facultyUUID)) {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', assignment.faculty_email)
        .eq('user_type', 'faculty')
        .single();
      
      if (existingUser) {
        facultyUUID = existingUser.id;
      } else {
        // Create new faculty user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: assignment.faculty_email,
            name: assignment.faculty_name,
            user_type: 'faculty',
            department: assignment.department
          })
          .select('id')
          .single();
        
        if (newUser) {
          facultyUUID = newUser.id;
        } else {
          console.error('Failed to create faculty user:', createError);
          // Fallback to localStorage
          const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
          const newAssignment = { ...assignment, id: Date.now().toString() };
          assignments.push(newAssignment);
          localStorage.setItem('assignments', JSON.stringify(assignments));
          return { data: newAssignment, error: null };
        }
      }
    }
    
    const payload = buildAssignmentInsertPayload({ ...assignment, faculty_id: facultyUUID });
    
    if (accessToken) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const client = createClient(supabaseUrl, supabaseKey, {
        global: { 
          headers: { 
            Authorization: `Bearer ${accessToken}` 
          } 
        }
      });
      return client.from('assignments').insert(payload);
    }
    
    const result = await supabase.from('assignments').insert(payload);
    
    if (result.error) {
      console.error('Supabase insert error:', result.error);
      // Fallback to localStorage
      const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const newAssignment = { ...assignment, id: Date.now().toString() };
      assignments.push(newAssignment);
      localStorage.setItem('assignments', JSON.stringify(assignments));
      return { data: newAssignment, error: null };
    }
    
    return result;
  } catch (error) {
    console.error('Assignment publishing error:', error);
    // Fallback to localStorage
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const newAssignment = { ...assignment, id: Date.now().toString() };
    assignments.push(newAssignment);
    localStorage.setItem('assignments', JSON.stringify(assignments));
    return { data: newAssignment, error: null };
  }
}

// Helper function to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Faculty: Get assignments by faculty
export async function getFacultyAssignments(facultyIdentifier: string) {
  // First try to find by email, then by faculty_id
  const { data: userByEmail, error: emailError } = await supabase
    .from('users')
    .select('id')
    .eq('email', facultyIdentifier)
    .eq('user_type', 'faculty')
    .single();

  if (userByEmail && !emailError) {
    // Found user by email, use their UUID
    return supabase
      .from('assignments')
      .select('*')
      .eq('faculty_id', userByEmail.id)
      .order('created_at', { ascending: false });
  }

  // If not found by email, try direct faculty_id (in case it's already a UUID)
  if (facultyIdentifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    return supabase
      .from('assignments')
      .select('*')
      .eq('faculty_id', facultyIdentifier)
      .order('created_at', { ascending: false });
  }

  // If neither works, return empty result
  return { data: [], error: null };
}

// Student: Get assignments by department and year
export async function getStudentAssignments(department: string, year: string) {
  return supabase
    .from('assignments')
    .select('*')
    .eq('department', department)
    .eq('year', year)
    .eq('status', 'published')
    .eq('visibility', true)
    .order('created_at', { ascending: false });
}

// Student: Submit assignment
export async function submitAssignment(submission: AssignmentSubmission) {
  return supabase.from('assignment_submissions').insert(submission);
}

// Faculty: Get submissions for an assignment
export async function getAssignmentSubmissions(assignmentId: string) {
  return supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });
}

// Student: Get their submissions
export async function getStudentSubmissions(studentId: string) {
  return supabase
    .from('assignment_submissions')
    .select(`
      *,
      assignments (*)
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });
}

// Faculty: Grade submission
export async function gradeSubmission(submissionId: string, grade: number, feedback: string) {
  return supabase
    .from('assignment_submissions')
    .update({ grade, feedback })
    .eq('id', submissionId);
}