CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'timetable', 'assignment', 'announcement'
    link TEXT, -- e.g., '/student-dashboard/timetable'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (e.g., mark as read)" 
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Function to notify on new notification
CREATE OR REPLACE FUNCTION public.handle_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_notification', json_build_object('id', NEW.id, 'user_id', NEW.user_id, 'title', NEW.title, 'message', NEW.message, 'link', NEW.link, 'type', NEW.type)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new notifications
CREATE TRIGGER on_new_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_notification();

-- Add table to Supabase realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
