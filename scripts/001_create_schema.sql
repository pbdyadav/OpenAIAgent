-- Multi-tenant AI Agent Platform Schema
-- Companies table to store registered companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  contact_number text,
  website_url text,
  whatsapp_number text,
  whatsapp_verified boolean default false,
  widget_api_key uuid default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Knowledge base documents uploaded by companies
create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size integer,
  content text,
  processed boolean default false,
  created_at timestamp with time zone default now()
);

-- Conversation logs for analytics
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  channel text not null check (channel in ('website', 'whatsapp')),
  visitor_id text,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone
);

-- Individual messages in conversations
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- WhatsApp configuration per company
create table if not exists public.whatsapp_config (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade unique,
  phone_number_id text,
  access_token text,
  webhook_verify_token text default gen_random_uuid()::text,
  is_active boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.companies enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.whatsapp_config enable row level security;

-- RLS Policies for companies
create policy "Users can view own companies" on public.companies
  for select using (auth.uid() = user_id);

create policy "Users can insert own companies" on public.companies
  for insert with check (auth.uid() = user_id);

create policy "Users can update own companies" on public.companies
  for update using (auth.uid() = user_id);

create policy "Users can delete own companies" on public.companies
  for delete using (auth.uid() = user_id);

-- RLS Policies for knowledge_documents
create policy "Users can view own documents" on public.knowledge_documents
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = knowledge_documents.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert own documents" on public.knowledge_documents
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = knowledge_documents.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can delete own documents" on public.knowledge_documents
  for delete using (
    exists (
      select 1 from public.companies
      where companies.id = knowledge_documents.company_id
      and companies.user_id = auth.uid()
    )
  );

-- RLS Policies for conversations
create policy "Users can view own conversations" on public.conversations
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = conversations.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Anyone can insert conversations" on public.conversations
  for insert with check (true);

-- RLS Policies for messages
create policy "Users can view own messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations
      join public.companies on companies.id = conversations.company_id
      where conversations.id = messages.conversation_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Anyone can insert messages" on public.messages
  for insert with check (true);

-- RLS Policies for whatsapp_config
create policy "Users can view own whatsapp config" on public.whatsapp_config
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = whatsapp_config.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert own whatsapp config" on public.whatsapp_config
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = whatsapp_config.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can update own whatsapp config" on public.whatsapp_config
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = whatsapp_config.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index if not exists idx_companies_user_id on public.companies(user_id);
create index if not exists idx_knowledge_documents_company_id on public.knowledge_documents(company_id);
create index if not exists idx_conversations_company_id on public.conversations(company_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
