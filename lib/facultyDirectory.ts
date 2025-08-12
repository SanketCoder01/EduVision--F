import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

/**
 * Fetches a directory of faculty members for a given department.
 * @param department The department to filter faculty by.
 * @returns A Supabase query builder instance.
 */
export async function fetchFacultyDirectory(department: string) {
  return supabase
    .from('faculty')
    .select('id, name, email, profile_pic_url, department, online_status')
    .eq('department', department)
    .order('name', { ascending: true });
}