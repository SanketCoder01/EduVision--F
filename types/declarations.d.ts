// types/declarations.d.ts

declare module '@supabase/supabase-js' {
  interface RealtimeChannel {}
}

declare module '@supabase/ssr' {
  import { SupabaseClient } from '@supabase/supabase-js';

  export function createBrowserClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string
  ): SupabaseClient<Database>;
}

