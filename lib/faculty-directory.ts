import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

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
  return supabase
    .from('faculty')
    .select('id, name, email, department, designation, phone')
    .eq('department', department)
    .order('name', { ascending: true });
}

// Get all faculty for university admin
export async function getAllFaculty() {
  return supabase
    .from('faculty')
    .select('*')
    .order('department', { ascending: true })
    .order('name', { ascending: true });
} 