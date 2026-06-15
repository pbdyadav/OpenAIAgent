-- Create Call Sessions Table
CREATE TABLE IF NOT EXISTS public.call_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    call_summary TEXT,
    lead_name TEXT,
    lead_phone TEXT,
    lead_requirement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Call Messages Table (Transcripts)
CREATE TABLE IF NOT EXISTS public.call_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.call_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_messages ENABLE ROW LEVEL SECURITY;

-- Call Sessions Policies
CREATE POLICY "Users can view their company call sessions" 
    ON public.call_sessions FOR SELECT 
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Call Messages Policies
CREATE POLICY "Users can view their company call messages" 
    ON public.call_messages FOR SELECT 
    USING (
        session_id IN (
            SELECT id FROM public.call_sessions WHERE company_id IN (
                SELECT id FROM public.companies WHERE user_id = auth.uid()
            )
        )
    );
