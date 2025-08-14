"use server"

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface StudyGroup {
  id: string;
  faculty_id: string;
  name: string;
  description: string;
  department: string;
  year: string;
  subject: string;
  max_size: number;
  current_size: number;
  status: 'open' | 'forming' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  role: 'leader' | 'member';
  joined_at: string;
  status: 'pending' | 'accepted' | 'active';
}

export interface GroupTask {
  id: string;
  group_id: string;
  faculty_id: string;
  title: string;
  description: string;
  due_date: string;
  max_grade: number;
  status: 'assigned' | 'submitted' | 'graded';
  created_at: string;
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

export async function createStudyGroup(formData: FormData) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const department = formData.get('department') as string;
    const year = formData.get('year') as string;
    const subject = formData.get('subject') as string;
    const maxSize = parseInt(formData.get('maxSize') as string);

    if (!name || !department || !year || !subject || !maxSize) {
      return { error: { message: 'All fields are required' } };
    }

    const { data, error } = await supabase
      .from('study_groups')
      .insert({
        faculty_id: user.id,
        name,
        description,
        department,
        year,
        subject,
        max_size: maxSize,
        current_size: 0,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    revalidatePath('/dashboard/study-groups');
    return { data };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to create study group' } };
  }
}

export async function getFacultyStudyGroups() {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        group_members (
          id,
          student_id,
          student_name,
          student_email,
          role,
          status,
          joined_at
        ),
        group_tasks (
          id,
          title,
          status,
          due_date,
          created_at
        )
      `)
      .eq('faculty_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: data || [] };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to fetch study groups' } };
  }
}

export async function randomlyAssignStudents(groupId: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    // Get the study group details
    const { data: group, error: groupError } = await supabase
      .from('study_groups')
      .select('*')
      .eq('id', groupId)
      .eq('faculty_id', user.id)
      .single();

    if (groupError || !group) {
      return { error: { message: 'Study group not found' } };
    }

    // Get available students from the same department and year
    const { data: students, error: studentsError } = await supabase
      .from('student_profiles')
      .select('id, name, email')
      .eq('department', group.department)
      .eq('year', group.year);

    if (studentsError) {
      return { error: { message: studentsError.message } };
    }

    if (!students || students.length === 0) {
      return { error: { message: 'No students found for this department and year' } };
    }

    // Randomly shuffle and select students
    const shuffled = students.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, group.max_size);

    // Randomly assign one as leader
    const leaderIndex = Math.floor(Math.random() * selected.length);
    
    const membersToInsert = selected.map((student, index) => ({
      group_id: groupId,
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      role: index === leaderIndex ? 'leader' : 'member',
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('group_members')
      .insert(membersToInsert);

    if (insertError) {
      return { error: { message: insertError.message } };
    }

    // Update group status and current size
    const { error: updateError } = await supabase
      .from('study_groups')
      .update({
        status: 'forming',
        current_size: selected.length
      })
      .eq('id', groupId);

    if (updateError) {
      return { error: { message: updateError.message } };
    }

    revalidatePath('/dashboard/study-groups');
    return { data: { message: 'Students assigned successfully', count: selected.length } };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to assign students' } };
  }
}

export async function createGroupTask(formData: FormData) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const groupId = formData.get('groupId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const maxGrade = parseInt(formData.get('maxGrade') as string);

    if (!groupId || !title || !description || !dueDate || !maxGrade) {
      return { error: { message: 'All fields are required' } };
    }

    const { data, error } = await supabase
      .from('group_tasks')
      .insert({
        group_id: groupId,
        faculty_id: user.id,
        title,
        description,
        due_date: dueDate,
        max_grade: maxGrade,
        status: 'assigned'
      })
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    revalidatePath('/dashboard/study-groups');
    return { data };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to create task' } };
  }
}

export async function gradeTaskSubmission(submissionId: string, grade: number, feedback: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const { data, error } = await supabase
      .from('task_submissions')
      .update({
        grade,
        feedback,
        graded_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    // Update task status to graded
    const { error: taskError } = await supabase
      .from('group_tasks')
      .update({ status: 'graded' })
      .eq('id', data.task_id);

    if (taskError) {
      console.error('Error updating task status:', taskError);
    }

    revalidatePath('/dashboard/study-groups');
    return { data };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to grade submission' } };
  }
}

export async function sendGroupMessage(groupId: string, message: string) {
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
        sender_type: 'faculty',
        message,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    revalidatePath('/dashboard/study-groups');
    return { data };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to send message' } };
  }
}

export async function deleteStudyGroup(groupId: string) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: { message: 'Authentication required' } };
    }

    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', groupId)
      .eq('faculty_id', user.id);

    if (error) {
      return { error: { message: error.message } };
    }

    revalidatePath('/dashboard/study-groups');
    return { data: { message: 'Study group deleted successfully' } };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to delete study group' } };
  }
}
