import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface StudyGroup {
  id?: string;
  name: string;
  description: string;
  department: string;
  year: string;
  faculty_id: string;
  faculty_name: string;
  faculty_email: string;
  max_members?: number;
  created_at?: string;
  study_group_members?: StudyGroupMember[];
  tasks?: StudyGroupTask[];
}

export interface StudyGroupMember {
  id?: string;
  group_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  joined_at?: string;
}

export interface StudyGroupTask {
  id?: string;
  group_id: string;
  title: string;
  description: string;
  due_date: string;
  assigned_by: string;
  assigned_by_name: string;
  created_at?: string;
}

// Faculty: Create study group
export async function createStudyGroup(group: StudyGroup) {
  return supabase.from('study_groups').insert(group);
}

// Faculty: Get study groups by faculty
export async function getFacultyStudyGroups(facultyId: string) {
  return supabase
    .from('study_groups')
    .select(`
      *,
      study_group_members (*)
    `)
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false });
}

// Student: Get study groups by department and year
export async function getStudentStudyGroups(department: string, year: string) {
  return supabase
    .from('study_groups')
    .select(`
      *,
      study_group_members (*)
    `)
    .eq('department', department)
    .eq('year', year)
    .order('created_at', { ascending: false });
}

// Student: Join study group
export async function joinStudyGroup(member: StudyGroupMember) {
  return supabase.from('study_group_members').insert(member);
}

// Student: Leave study group
export async function leaveStudyGroup(groupId: string, studentId: string) {
  return supabase
    .from('study_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('student_id', studentId);
}

// Faculty: Create task for study group
export async function createStudyGroupTask(task: StudyGroupTask) {
  return supabase.from('study_group_tasks').insert(task);
}

// Get tasks for a study group
export async function getStudyGroupTasks(groupId: string) {
  return supabase
    .from('study_group_tasks')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
} 