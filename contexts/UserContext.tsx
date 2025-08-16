"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  // Add other fields for both students and faculty as needed
}

interface UserContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  fetchUserProfile: (user: User) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    // First, check the 'students' table
    let { data: profileData } = await supabase.from('students').select('*').eq('id', user.id).single();
    
    // If not found in students, check 'faculty'
    if (!profileData) {
      ({ data: profileData } = await supabase.from('faculty').select('*').eq('id', user.id).single());
    }

    setProfile(profileData || null);
  };

  useEffect(() => {
    console.log('UserProvider: Initializing');
    const getInitialSession = async () => {
      setIsLoading(true);
      console.log('UserProvider: Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('UserProvider: Initial session object:', session);
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        console.log('UserProvider: Fetching profile for initial user:', currentUser.id);
        await fetchUserProfile(currentUser);
      } else {
        console.log('UserProvider: No initial user found.');
      }
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('UserProvider: Auth state changed. New session:', session);
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        console.log('UserProvider: Fetching profile for user from auth change:', currentUser.id);
        await fetchUserProfile(currentUser);
      } else {
        console.log('UserProvider: No user found after auth change.');
        setProfile(null);
      }
    });

    return () => {
      console.log('UserProvider: Unsubscribing from auth listener.');
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    isLoading,
    fetchUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
