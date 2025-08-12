import { useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useRealtimeServiceRequests(
  studentId: string,
  onRequest: (request: any) => void
) {
  useEffect(() => {
    if (!studentId) return;
    
    const channel = supabase
      .channel('service_requests')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'service_requests',
          filter: `student_id=eq.${studentId}`
        },
        payload => {
          onRequest(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, onRequest]);
}

export function useRealtimeAllServiceRequests(
  onRequest: (request: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel('all_service_requests')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'service_requests'
        },
        payload => {
          onRequest(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRequest]);
}

export function useRealtimeServiceResponses(
  requestId: string,
  onResponse: (response: any) => void
) {
  useEffect(() => {
    if (!requestId) return;
    
    const channel = supabase
      .channel('service_responses')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'service_responses',
          filter: `request_id=eq.${requestId}`
        },
        payload => {
          onResponse(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, onResponse]);
} 