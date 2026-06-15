-- Phase 1 Migration: Catalog & Voice AI Support

-- 1. Create Catalog Categories Table
create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

alter table public.catalog_categories enable row level security;

create policy "Users can view own catalog categories" on public.catalog_categories
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = catalog_categories.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert own catalog categories" on public.catalog_categories
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = catalog_categories.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can update own catalog categories" on public.catalog_categories
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = catalog_categories.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can delete own catalog categories" on public.catalog_categories
  for delete using (
    exists (
      select 1 from public.companies
      where companies.id = catalog_categories.company_id
      and companies.user_id = auth.uid()
    )
  );


-- 2. Create Catalog Items Table
create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.catalog_categories(id) on delete set null,
  type text not null check (type in ('product', 'service')),
  name text not null,
  description text,
  price numeric(10, 2),
  image_url text,
  pdf_url text,
  external_link text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.catalog_items enable row level security;

create policy "Users can view own catalog items" on public.catalog_items
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = catalog_items.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert own catalog items" on public.catalog_items
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = catalog_items.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can update own catalog items" on public.catalog_items
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = catalog_items.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can delete own catalog items" on public.catalog_items
  for delete using (
    exists (
      select 1 from public.companies
      where companies.id = catalog_items.company_id
      and companies.user_id = auth.uid()
    )
  );


-- 3. Modify Messages Table for Voice Support
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='type') then
    alter table public.messages add column type text default 'text';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='media_url') then
    alter table public.messages add column media_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='transcript') then
    alter table public.messages add column transcript text;
  end if;
end $$;
