-- Store the active WhatsApp session for each connected phone number.

create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  phone_number text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.whatsapp_sessions enable row level security;

create policy "Users can view own whatsapp sessions" on public.whatsapp_sessions
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = whatsapp_sessions.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert own whatsapp sessions" on public.whatsapp_sessions
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = whatsapp_sessions.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can update own whatsapp sessions" on public.whatsapp_sessions
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = whatsapp_sessions.company_id
      and companies.user_id = auth.uid()
    )
  );

create index if not exists idx_whatsapp_sessions_company_id on public.whatsapp_sessions(company_id);
create index if not exists idx_whatsapp_sessions_phone_number on public.whatsapp_sessions(phone_number);
