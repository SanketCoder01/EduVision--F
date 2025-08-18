'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/ui/button'
import { FaGoogle } from 'react-icons/fa'

export default function GoogleSignInButton() {
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Button 
      onClick={handleSignIn} 
      className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    >
      <FaGoogle className="mr-2" />
      Sign In with Google
    </Button>
  )
}
