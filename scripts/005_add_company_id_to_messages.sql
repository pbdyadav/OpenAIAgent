-- Add company_id to messages so WhatsApp and chat flows can persist company-scoped logs.

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

UPDATE public.messages m
SET company_id = c.company_id
FROM public.conversations c
WHERE m.conversation_id = c.id
  AND m.company_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_company_id ON public.messages(company_id);
