import { useEffect } from "react";
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useRealtimeAssignments(
  department: string,
  year: string,
  onAssignment: (assignment: any) => void
) {
  useEffect(() => {
    if (!department || !year) return;
    
    const channel = supabase
      .channel('assignments')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignments',
          filter: `department=eq.${department} AND year=eq.${year}`
        },
        (payload: any) => {
          onAssignment(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [department, year, onAssignment]);
}

export function useRealtimeSubmissions(
  assignmentId: string,
  onSubmission: (submission: any) => void
) {
  useEffect(() => {
    if (!assignmentId) return;
    
    const channel = supabase
      .channel('submissions')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${assignmentId}`
        },
        (payload: any) => {
          onSubmission(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId, onSubmission]);
} 