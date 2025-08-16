-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_conversation UNIQUE (student_id, faculty_id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT,
    attachment_url TEXT,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- 3. Create a trigger to update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NOW(),
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- 4. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for conversations
CREATE POLICY "Allow access to own conversations" ON public.conversations
FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = faculty_id);

CREATE POLICY "Allow creation of own conversations" ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- 6. Create RLS policies for messages
CREATE POLICY "Allow access to messages in own conversations" ON public.messages
FOR SELECT
USING (
    conversation_id IN (
        SELECT id FROM public.conversations WHERE auth.uid() = student_id OR auth.uid() = faculty_id
    )
);

CREATE POLICY "Allow insertion of messages in own conversations" ON public.messages
FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
        SELECT id FROM public.conversations WHERE auth.uid() = student_id OR auth.uid() = faculty_id
    )
);

-- 7. Create Storage Bucket for Chat Attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Create Storage Policies for Chat Attachments
CREATE POLICY "Allow authenticated users to upload attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat_attachments');

CREATE POLICY "Allow participants to view attachments" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'chat_attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.conversations WHERE auth.uid() = student_id OR auth.uid() = faculty_id
    )
);
