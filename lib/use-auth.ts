// Auth hook for getting current user from Supabase Auth
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
}

// Hook to get current authenticated user
export function useAuth(): AuthUser {
  const [state, setState] = useState<AuthUser>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: error
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}

// Get user email from Supabase Auth (for use in server components or non-hook contexts)
export async function getAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting auth user:', error)
    return null
  }
  return user
}

// Get user email
export async function getAuthEmail(): Promise<string | null> {
  const user = await getAuthUser()
  return user?.email ?? null
}

// Sign out user
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    return false
  }
  return true
}
