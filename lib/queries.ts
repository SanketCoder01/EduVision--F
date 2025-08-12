import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

export interface Query {
  id?: string;
  student_id: string;
  student_name: string;
  student_email: string;
  faculty_id: string;
  faculty_name: string;
  faculty_email: string;
  department: string;
  subject: string;
  message: string;
  status: 'pending' | 'answered' | 'closed';
  created_at?: string;
}

export interface QueryResponse {
  id?: string;
  query_id: string;
  responder_id: string;
  responder_name: string;
  responder_role: 'faculty' | 'student';
  message: string;
  created_at?: string;
}

// Student: Send query to faculty
export async function sendQuery(query: Query) {
  return supabase.from('queries').insert(query);
}

// Student: Get their queries
export async function getStudentQueries(studentId: string) {
  return supabase
    .from('queries')
    .select(`
      *,
      query_responses (*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
}

// Faculty: Get queries for their department
export async function getFacultyQueries(facultyId: string) {
  return supabase
    .from('queries')
    .select(`
      *,
      query_responses (*)
    `)
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false });
}

// Faculty: Get all queries in their department
export async function getDepartmentQueries(department: string) {
  return supabase
    .from('queries')
    .select(`
      *,
      query_responses (*)
    `)
    .eq('department', department)
    .order('created_at', { ascending: false });
}

// Respond to query
export async function respondToQuery(response: QueryResponse) {
  return supabase.from('query_responses').insert(response);
}

// Update query status
export async function updateQueryStatus(queryId: string, status: 'pending' | 'answered' | 'closed') {
  return supabase
    .from('queries')
    .update({ status })
    .eq('id', queryId);
}