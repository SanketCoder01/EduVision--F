'use server';

import { createClient } from '@/lib/supabase/server';
import { Grievance } from '@/lib/types';
import { revalidatePath } from 'next/cache';


export async function submitGrievance(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to submit a grievance.' };
  }

  // Get student's department and year for proper filtering
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('department, year')
    .eq('id', user.id)
    .single();

  if (studentError || !student) {
    return { error: 'Unable to fetch student information.' };
  }

  const grievanceData = {
    student_id: user.id,
    student_department: student.department,
    student_year: student.year,
    subject: formData.get('subject') as string,
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    is_private: true, // Grievances are always private
    status: 'Pending',
  };

  const { error } = await supabase.from('grievances').insert(grievanceData);

  if (error) {
    console.error('Error submitting grievance:', error);
    return { error: 'Failed to submit grievance. Please try again.' };
  }

  revalidatePath('/dashboard/other-services/grievance');
  return { success: 'Grievance submitted successfully.' };
}

export async function getGrievances(): Promise<Grievance[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Check if the user is a faculty member and get their department
  const { data: faculty, error: facultyError } = await supabase
    .from('faculty')
    .select('department')
    .eq('id', user.id)
    .single();

  let query = supabase.from('grievances').select(`
    id,
    student_id,
    subject,
    category,
    description,
    status,
    submitted_at,
    is_private,
    students (
      full_name,
      department,
      year
    )
  `);

  // If the user is a faculty member, filter by their department
  if (faculty && faculty.department) {
    query = query.eq('student_department', faculty.department);
  } else {
    // If not a faculty or no department, assume student and show only their own
    query = query.eq('student_id', user.id);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching grievances:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    studentId: item.student_id,
    // @ts-ignore
    studentName: item.students?.full_name || 'N/A',
    // @ts-ignore
    studentDepartment: item.students?.department || 'N/A',
    // @ts-ignore
    studentYear: item.students?.year || 'N/A',
    subject: item.subject,
    category: item.category,
    description: item.description,
    status: item.status,
    submittedAt: new Date(item.submitted_at),
    isPrivate: item.is_private,
  }));
}
