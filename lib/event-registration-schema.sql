-- Enhanced Event Registration System Schema

-- Update events table to include registration deadline
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20) DEFAULT 'open';

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  student_department VARCHAR(100) NOT NULL,
  student_year VARCHAR(20) NOT NULL,
  student_prn VARCHAR(50),
  student_mobile VARCHAR(15),
  registration_data JSONB, -- Store form field responses
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  attendance_status VARCHAR(20) DEFAULT 'absent',
  attendance_marked_at TIMESTAMP WITH TIME ZONE,
  attendance_marked_by UUID REFERENCES faculty(id),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- Create event attendance sessions table
CREATE TABLE IF NOT EXISTS event_attendance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  session_name VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  venue VARCHAR(255),
  total_registered INTEGER DEFAULT 0,
  total_present INTEGER DEFAULT 0,
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, ongoing, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- 'student' or 'faculty'
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  timetable_reminders BOOLEAN DEFAULT true,
  assignment_updates BOOLEAN DEFAULT true,
  event_updates BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, user_type)
);

-- Create push notification tokens table for mobile/browser notifications
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  token VARCHAR(500) NOT NULL,
  device_type VARCHAR(50), -- 'web', 'android', 'ios'
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faculty directory table for student queries
CREATE TABLE IF NOT EXISTS faculty_directory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  specialization VARCHAR(255),
  office_hours VARCHAR(255),
  office_location VARCHAR(255),
  consultation_mode VARCHAR(50) DEFAULT 'both', -- 'online', 'offline', 'both'
  is_available_for_queries BOOLEAN DEFAULT true,
  max_queries_per_day INTEGER DEFAULT 10,
  response_time_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(faculty_id)
);

-- Create encrypted messages table for faculty-student communication
CREATE TABLE IF NOT EXISTS encrypted_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'student' or 'faculty'
  receiver_id UUID NOT NULL,
  receiver_type VARCHAR(20) NOT NULL,
  conversation_id UUID NOT NULL, -- Group messages by conversation
  encrypted_content TEXT NOT NULL, -- AES encrypted message content
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'file', 'image'
  file_url VARCHAR(500), -- For file attachments
  file_name VARCHAR(255),
  file_size INTEGER,
  encryption_key_id VARCHAR(100) NOT NULL, -- Reference to encryption key
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create conversation metadata table
CREATE TABLE IF NOT EXISTS message_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived', 'blocked'
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  student_unread_count INTEGER DEFAULT 0,
  faculty_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, faculty_id)
);

-- Create timetable notifications table
CREATE TABLE IF NOT EXISTS timetable_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'class_reminder', 'lab_reminder', 'schedule_change'
  class_name VARCHAR(255) NOT NULL,
  class_type VARCHAR(20) NOT NULL, -- 'lecture', 'lab', 'practical'
  room_number VARCHAR(50),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_department_year ON event_registrations(student_department, student_year);
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_conversation ON encrypted_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_sender ON encrypted_messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_receiver ON encrypted_messages(receiver_id, receiver_type);
CREATE INDEX IF NOT EXISTS idx_timetable_notifications_user ON timetable_notifications(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_timetable_notifications_time ON timetable_notifications(notification_time);

-- Enable RLS (Row Level Security)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_directory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event registrations
CREATE POLICY "Students can view their own registrations" ON event_registrations
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Faculty can view registrations for their events" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_registrations.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can register for events" ON event_registrations
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- RLS Policies for encrypted messages
CREATE POLICY "Users can view their own messages" ON encrypted_messages
  FOR SELECT USING (
    (sender_id = auth.uid()) OR (receiver_id = auth.uid())
  );

CREATE POLICY "Users can send messages" ON encrypted_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for conversations
CREATE POLICY "Students can view their conversations" ON message_conversations
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Faculty can view their conversations" ON message_conversations
  FOR SELECT USING (faculty_id = auth.uid());

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_registration_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update event registration count
  UPDATE events 
  SET registered_students = (
    SELECT COUNT(*) FROM event_registrations 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for registration count updates
DROP TRIGGER IF EXISTS trigger_update_registration_counts ON event_registrations;
CREATE TRIGGER trigger_update_registration_counts
  AFTER INSERT OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_registration_counts();

-- Function to update conversation metadata
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last message time and unread counts
  UPDATE message_conversations 
  SET 
    last_message_at = NEW.sent_at,
    student_unread_count = CASE 
      WHEN NEW.receiver_type = 'student' THEN student_unread_count + 1 
      ELSE student_unread_count 
    END,
    faculty_unread_count = CASE 
      WHEN NEW.receiver_type = 'faculty' THEN faculty_unread_count + 1 
      ELSE faculty_unread_count 
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversation updates
DROP TRIGGER IF EXISTS trigger_update_conversation_metadata ON encrypted_messages;
CREATE TRIGGER trigger_update_conversation_metadata
  AFTER INSERT ON encrypted_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_metadata();
