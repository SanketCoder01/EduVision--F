import { createClient } from '@/lib/supabase/server';
import { UserProvider } from './UserContext';

async function fetchUserProfile(supabase: any, user: any) {
  let { data: profileData } = await supabase.from('faculty').select('*').eq('user_id', user.id).single();
  if (profileData) return profileData;

  const departments = ['cse', 'cyber', 'aids', 'aiml'];
  const years = ['1st_year', '2nd_year', '3rd_year', '4th_year'];

  for (const dept of departments) {
    for (const year of years) {
      const { data: studentData, error } = await supabase
        .from(`students_${dept}_${year}`)
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching from students_${dept}_${year}:`, error);
      }
      if (studentData) return studentData;
    }
  }
  return null;
}

export async function ServerUserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  let profile = null;

  if (session?.user) {
    profile = await fetchUserProfile(supabase, session.user);
  }

  return (
    <UserProvider session={session} profile={profile}>
      {children}
    </UserProvider>
  );
}
