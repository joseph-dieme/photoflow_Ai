-- Migration: Create Support Chat messages table
CREATE TABLE IF NOT EXISTS public.pf_support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pf_profiles(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.pf_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pf_support_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users and admins can view support messages" ON public.pf_support_messages
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.pf_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Users and admins can insert support messages" ON public.pf_support_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id 
        AND (
            auth.uid() = user_id 
            OR EXISTS (
                SELECT 1 FROM public.pf_profiles 
                WHERE id = auth.uid() AND is_admin = true
            )
        )
    );

CREATE POLICY "Users and admins can update support messages" ON public.pf_support_messages
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.pf_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );
