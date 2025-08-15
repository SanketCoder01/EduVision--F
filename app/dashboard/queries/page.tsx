import { createClient } from '@/lib/supabase/server';
import { getConversations } from '@/app/actions/chat-actions';
import { redirect } from 'next/navigation';
import { ChatLayout } from '@/components/chat-layout';

export default async function FacultyQueriesPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  // Fetch all conversations for the faculty member
  const conversationsResult = await getConversations(user.id);

  if (!conversationsResult.success) {
    return <div>Error loading chat data. Please try again.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ChatLayout
        user={user}
        initialConversations={conversationsResult.data || []}
        facultyDirectory={[]}
      />
    </div>
  );
}
