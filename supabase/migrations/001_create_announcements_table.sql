-- Create the announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    author_id UUID REFERENCES public.faculty(id),
    department VARCHAR(255),
    is_university_wide BOOLEAN DEFAULT false
);

-- Enable Row-Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Allow all access to admin" ON public.announcements
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow faculty to manage their announcements" ON public.announcements
    FOR ALL
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow students to view relevant announcements" ON public.announcements
    FOR SELECT
    USING (
        is_university_wide = true OR
        department = (SELECT department FROM public.students WHERE id = auth.uid())
    );
