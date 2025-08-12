import { useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useRealtimeQueries(
  facultyId: string,
  onQuery: (query: any) => void
) {
  useEffect(() => {
    if (!facultyId) return;
    
    const channel = supabase
      .channel('queries')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'queries',
          filter: `faculty_id=eq.${facultyId}`
        },
        payload => {
          onQuery(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [facultyId, onQuery]);
}

export function useRealtimeQueryResponses(
  queryId: string,
  onResponse: (response: any) => void
) {
  useEffect(() => {
    if (!queryId) return;
    
    const channel = supabase
      .channel('query_responses')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'query_responses',
          filter: `query_id=eq.${queryId}`
        },
        payload => {
          onResponse(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryId, onResponse]);
} 