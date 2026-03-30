import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log("Attempting to login...")
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'sumit@cafe.in',
    password: 'Cafe@123'
  })
  
  if (error) {
    console.error("Login failed:", error.message)
  } else {
    console.log("Login successful! User ID:", data.user?.id)
  }
}

testLogin()
