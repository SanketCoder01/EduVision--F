import { useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useRealtimeStudyGroups(
  department: string,
  year: string,
  onStudyGroup: (studyGroup: any) => void
) {
  useEffect(() => {
    if (!department || !year) return;
    
    const channel = supabase
      .channel('study_groups')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'study_groups',
          filter: `department=eq.${department} AND year=eq.${year}`
        },
        payload => {
          onStudyGroup(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [department, year, onStudyGroup]);
}

export function useRealtimeStudyGroupTasks(
  groupId: string,
  onTask: (task: any) => void
) {
  useEffect(() => {
    if (!groupId) return;
    
    const channel = supabase
      .channel('study_group_tasks')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'study_group_tasks',
          filter: `group_id=eq.${groupId}`
        },
        payload => {
          onTask(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, onTask]);
} 