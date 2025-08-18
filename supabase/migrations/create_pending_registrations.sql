-- Create pending_registrations table for admin approval workflow
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'faculty')),
    department TEXT NOT NULL,
    year TEXT,
    mobile_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'face_captured', 'approved', 'rejected')),
    face_registered BOOLEAN DEFAULT FALSE,
    face_url TEXT,
    photo TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own pending registration
CREATE POLICY "Users can view own pending registration" ON public.pending_registrations
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own pending registration (for face capture)
CREATE POLICY "Users can update own pending registration" ON public.pending_registrations
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can insert their own pending registration
CREATE POLICY "Users can insert own pending registration" ON public.pending_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all pending registrations
CREATE POLICY "Admins can view all pending registrations" ON public.pending_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.faculty 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy: Admins can update all pending registrations (for approval/rejection)
CREATE POLICY "Admins can update all pending registrations" ON public.pending_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.faculty 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_id ON public.pending_registrations(user_id);
