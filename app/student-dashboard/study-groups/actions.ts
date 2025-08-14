"use server"

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface StudentStudyGroup {
  id: string;
  name: string;
  description: string;
  department: string;
  year: string;
  subject: string;
  max_size: number;
  current_size: number;
  status: 'open' | 'forming' | 'active' | 'completed';
  created_at: string;
  faculty_name?: string;
  is_member: boolean;
  member_role?: 'leader' | 'member';
  member_status?: 'pending' | 'accepted' | 'active';
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'faculty' | 'student';
  message: string;
  sent_at: string;
}

export interface GroupTask {
  id: string;
  group_id: string;
  title: string;
  description: string;
  due_date: string;
  max_grade: number;
  status: 'assigned' | 'submitted' | 'graded';
  created_at: string;
  submission?: TaskSubmission;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  group_id: string;
  submitted_by: string;
  submission_text: string;
  file_url?: string;
  file_name?: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

export async function getStudentStudyGroups() {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('department, year')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { error: { message: 'Student profile not found' } };
    }

    // Get all study groups for student's department and year
    const { data: groups, error: groupsError } = await supabase
      .from('study_groups')
      .select(`
        *,
        group_members!inner (
          id,
          student_id,
          role,
          status
        )
      `)
      .eq('department', profile.department)
      .eq('year', profile.year)
      .order('created_at', { ascending: false });

    if (groupsError) {
      return { error: { message: groupsError.message } };
    }

    // Also get groups where student is not a member but could join
    const { data: availableGroups, error: availableError } = await supabase
      .from('study_groups')
      .select('*')
      .eq('department', profile.department)
      .eq('year', profile.year)
      .eq('status', 'forming')
      .order('created_at', { ascending: false });

    if (availableError) {
      return { error: { message: availableError.message } };
    }

    // Combine and format the results
    const formattedGroups = (groups || []).map(group => {
      const membership = group.group_members?.find((m: any) => m.student_id === user.id);
      return {
        ...group,
        is_member: !!membership,
        member_role: membership?.role,
        member_status: membership?.status
      };
    });

    return { data: formattedGroups || [] };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to fetch study groups' } };
  }
}

export async function acceptGroupInvitation(groupId: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    // Update member status to accepted
    const { error } = await supabase
      .from('group_members')
      .update({ status: 'accepted' })
      .eq('group_id', groupId)
      .eq('student_id', user.id);

    if (error) {
      return { error: { message: error.message } };
    }

    revalidatePath('/student-dashboard/study-groups');
    return { data: { message: 'Group invitation accepted successfully' } };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to accept invitation' } };
  }
}

export async function getGroupMessages(groupId: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        sender:sender_id (
          name
        )
      `)
      .eq('group_id', groupId)
      .order('sent_at', { ascending: true });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: data || [] };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to fetch messages' } };
  }
}

export async function sendStudentMessage(groupId: string, message: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        sender_id: user.id,
        sender_type: 'student',
        message,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    revalidatePath('/student-dashboard/study-groups');
    return { data };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to send message' } };
  }
}

export async function getGroupTasks(groupId: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const { data, error } = await supabase
      .from('group_tasks')
      .select(`
        *,
        task_submissions (
          id,
          submission_text,
          file_url,
          file_name,
          grade,
          feedback,
          submitted_at,
          graded_at
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: data || [] };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to fetch tasks' } };
  }
}

export async function submitTask(formData: FormData) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const taskId = formData.get('taskId') as string;
    const groupId = formData.get('groupId') as string;
    const submissionText = formData.get('submissionText') as string;
    const file = formData.get('file') as File;

    let fileUrl = null;
    let fileName = null;

    // Upload file if provided
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('task-submissions')
        .upload(filePath, file);

      if (uploadError) {
        return { error: { message: uploadError.message } };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
      fileName = file.name;
    }

    const { data, error } = await supabase
      .from('task_submissions')
      .insert({
        task_id: taskId,
        group_id: groupId,
        submitted_by: user.id,
        submission_text: submissionText,
        file_url: fileUrl,
        file_name: fileName,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    // Update task status
    const { error: taskError } = await supabase
      .from('group_tasks')
      .update({ status: 'submitted' })
      .eq('id', taskId);

    if (taskError) {
      console.error('Error updating task status:', taskError);
    }

    revalidatePath('/student-dashboard/study-groups');
    return { data };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to submit task' } };
  }
}

export async function generateGroupReport(groupId: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    // Get group details with members, tasks, and submissions
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select(`
        *,
        group_members (
          id,
          student_name,
          student_email,
          role,
          status,
          joined_at
        ),
        group_tasks (
          id,
          title,
          description,
          due_date,
          max_grade,
          status,
          created_at,
          task_submissions (
            id,
            submission_text,
            file_name,
            grade,
            feedback,
            submitted_at,
            graded_at
          )
        )
      `)
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return { error: { message: 'Group not found' } };
    }

    // Generate report data
    const reportData = {
      group: {
        name: group.name,
        subject: group.subject,
        department: group.department,
        year: group.year,
        status: group.status,
        created_at: group.created_at
      },
      members: group.group_members || [],
      tasks: group.group_tasks || [],
      summary: {
        total_members: group.current_size,
        total_tasks: (group.group_tasks || []).length,
        completed_tasks: (group.group_tasks || []).filter((t: any) => t.status === 'graded').length,
        average_grade: 0 // Calculate based on submissions
      }
    };

    // Calculate average grade
    const gradedSubmissions = (group.group_tasks || [])
      .flatMap((task: any) => task.task_submissions || [])
      .filter((sub: any) => sub.grade !== null);

    if (gradedSubmissions.length > 0) {
      const totalGrade = gradedSubmissions.reduce((sum: number, sub: any) => sum + (sub.grade || 0), 0);
      reportData.summary.average_grade = totalGrade / gradedSubmissions.length;
    }

    return { data: reportData };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to generate report' } };
  }
}
