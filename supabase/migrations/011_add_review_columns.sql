-- Add missing review columns to pending_registrations table
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_reviewed_at ON pending_registrations(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
