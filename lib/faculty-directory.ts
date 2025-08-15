import { createClient } from '@/lib/supabase/server';

export interface FacultyDirectory {
  id: string;
  name: string;
  email: string;
  department: string;
  designation?: string;
  phone?: string;
}

// Get faculty by department for students
export async function getFacultyByDepartment(department: string) {
  const supabase = createClient();
  return supabase
    .from('faculty')
    .select('id, name, email, department, designation, phone')
    .eq('department', department)
    .order('name', { ascending: true });
}

// Get all faculty for university admin
export async function getAllFaculty() {
  const supabase = createClient();
  return supabase
    .from('faculty')
    .select('*')
    .order('department', { ascending: true })
    .order('name', { ascending: true });
}