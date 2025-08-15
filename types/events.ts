export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  venue: string;
  poster_url?: string;
  max_participants?: number;
  target_departments: string[];
  target_years?: string[];
  enable_payment: boolean;
  payment_amount?: number;
  allow_registration: boolean;
  registration_start?: string;
  registration_end: string;
  event_registrations?: { student_id: string; status: string }[];
  created_at: string;
}
