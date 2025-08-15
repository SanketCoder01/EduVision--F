import { createClient } from '@/lib/supabase/server';
import { getConversations, getFacultyByDepartment } from '@/app/actions/chat-actions';
import { redirect } from 'next/navigation';
import { ChatLayout } from '@/components/chat-layout';

export default async function QueriesPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  // Fetch student profile to get their department
  const { data: studentProfile, error: profileError } = await supabase
    .from('students')
    .select('department')
    .eq('id', user.id)
    .single();

  if (profileError || !studentProfile) {
    console.error('Error fetching student profile:', profileError);
    // Redirect or show an error message if profile is not found
    return <div>Error: Could not load your profile. Please try again later.</div>;
  }

  // Fetch conversations and faculty list in parallel
  const [conversationsResult, facultyResult] = await Promise.all([
    getConversations(user.id),
    getFacultyByDepartment(studentProfile.department)
  ]);

  if (!conversationsResult.success || !facultyResult.success) {
    return <div>Error loading chat data. Please try again.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ChatLayout
        user={user}
        initialConversations={conversationsResult.data || []}
        facultyDirectory={facultyResult.data || []}
      />
    </div>
  );
}
