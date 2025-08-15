import { createClient } from '@/lib/supabase/server';
import { GeneratedForm, FormField } from "@/lib/ai-form-generator";

export interface ApplicationSubmission {
  id?: string;
  form_id: string;
  student_name: string;
  student_email: string;
  form_data: Record<string, any>;
  submitted_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  university_notes?: string;
}

// Save generated form to database
export async function saveGeneratedForm(form: GeneratedForm) {
  const supabase = createClient();
  return supabase.from('application_forms').insert(form);
}

// Get all application forms
export async function getAllApplicationForms() {
  const supabase = createClient();
  return supabase
    .from('application_forms')
    .select('*')
    .order('created_at', { ascending: false });
}

// Get application form by ID
export async function getApplicationForm(formId: string) {
  const supabase = createClient();
  return supabase
    .from('application_forms')
    .select('*')
    .eq('id', formId)
    .single();
}

// Submit application
export async function submitApplication(submission: ApplicationSubmission) {
  const supabase = createClient();
  return supabase.from('application_submissions').insert(submission);
}

// Get all submissions for a form
export async function getFormSubmissions(formId: string) {
  const supabase = createClient();
  return supabase
    .from('application_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });
}

// Get all submissions for university admin
export async function getAllSubmissions() {
  const supabase = createClient();
  return supabase
    .from('application_submissions')
    .select(`
      *,
      application_forms (*)
    `)
    .order('submitted_at', { ascending: false });
}

// Update submission status
export async function updateSubmissionStatus(submissionId: string, status: 'pending' | 'approved' | 'rejected', notes?: string) {
  const supabase = createClient();
  return supabase
    .from('application_submissions')
    .update({ status, university_notes: notes })
    .eq('id', submissionId);
}

// Delete application form
export async function deleteApplicationForm(formId: string) {
  const supabase = createClient();
  return supabase
    .from('application_forms')
    .delete()
    .eq('id', formId);
}