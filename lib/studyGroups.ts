import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function createStudyGroup({ faculty_id, department, year, name, description }: { faculty_id: string; department: string; year: string; name: string; description: string; }) {
  return supabase.from('study_groups').insert({
    faculty_id,
    department,
    year,
    name,
    description,
  });
}

export async function getStudyGroups(department: string, year: string) {
  return supabase
    .from('study_groups')
    .select('*')
    .eq('department', department)
    .eq('year', year)
    .order('created_at', { ascending: false });
}

export function useRealtimeStudyGroups(department: string, year: string, onGroup: (group: any) => void) {
  return supabase
    .channel('study_groups')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'study_groups', filter: `department=eq.${department},year=eq.${year}` },
      payload => {
        onGroup(payload.new);
      }
    )
    .subscribe();
}