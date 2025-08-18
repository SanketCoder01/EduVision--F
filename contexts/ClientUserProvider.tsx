"use client";

import { UserProvider } from './UserContext';
import { type Session } from '@supabase/auth-helpers-nextjs';

interface UserProfile {
  id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  department?: string;
  year?: string;
}

interface ClientUserProviderProps {
  children: React.ReactNode;
  session: Session | null;
  profile: UserProfile | null;
}

export function ClientUserProvider({ children, session, profile }: ClientUserProviderProps) {
  return (
    <UserProvider session={session} profile={profile}>
      {children}
    </UserProvider>
  );
}
