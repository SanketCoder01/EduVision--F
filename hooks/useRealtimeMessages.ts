import { useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useRealtimeMessages(userId: string, onMessage: (msg: any) => void) {
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `to_id=eq.${userId}` },
        payload => {
          onMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onMessage]);
}