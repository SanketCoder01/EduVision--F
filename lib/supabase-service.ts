import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using the service role key for privileged operations
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


