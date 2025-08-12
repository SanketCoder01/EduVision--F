import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// IMPORTANT: You will need to create a .env.local file in the root of your project
// and add your Supabase URL and anon key.
// NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

const supabase = createClientComponentClient()

export async function authenticateFaculty(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error authenticating faculty:', error)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

export default supabase
