import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

export interface ServiceRequest {
  id?: string;
  student_id: string;
  student_name: string;
  student_email: string;
  service_type: 'grievance' | 'maintenance' | 'lost_found' | 'document_request' | 'health' | 'counseling' | 'housing' | 'library' | 'leave' | 'certificate' | 'background_verification' | 'career' | 'event_desk' | 'suggestion' | 'recommendation';
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  attachment_urls?: string[];
  created_at?: string;
}

export interface ServiceResponse {
  id?: string;
  request_id: string;
  responder_id: string;
  responder_name: string;
  responder_role: 'university_admin' | 'faculty';
  message: string;
  created_at?: string;
}

// Student: Submit service request
export async function submitServiceRequest(request: ServiceRequest) {
  return supabase.from('service_requests').insert(request);
}

// Student: Get their service requests
export async function getStudentServiceRequests(studentId: string) {
  return supabase
    .from('service_requests')
    .select(`
      *,
      service_responses (*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
}

// University: Get all service requests
export async function getAllServiceRequests() {
  return supabase
    .from('service_requests')
    .select(`
      *,
      service_responses (*)
    `)
    .order('created_at', { ascending: false });
}

// University: Get service requests by type
export async function getServiceRequestsByType(serviceType: string) {
  return supabase
    .from('service_requests')
    .select(`
      *,
      service_responses (*)
    `)
    .eq('service_type', serviceType)
    .order('created_at', { ascending: false });
}

// Respond to service request
export async function respondToServiceRequest(response: ServiceResponse) {
  return supabase.from('service_responses').insert(response);
}

// Update service request status
export async function updateServiceRequestStatus(requestId: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected') {
  return supabase
    .from('service_requests')
    .update({ status })
    .eq('id', requestId);
} 