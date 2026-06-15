-- Phase 2 Migration: Catalog Assets Storage Bucket

-- 1. Create the Storage Bucket (Public so users can view images and download PDFs)
insert into storage.buckets (id, name, public)
values ('catalog_assets', 'catalog_assets', true)
on conflict (id) do nothing;

-- 2. Storage Object Policies
-- Allow anyone to view objects in the bucket
create policy "Public Access to Catalog Assets"
on storage.objects for select
using ( bucket_id = 'catalog_assets' );

-- Allow authenticated users (companies) to upload objects
create policy "Authenticated users can upload catalog assets"
on storage.objects for insert
with check ( bucket_id = 'catalog_assets' and auth.role() = 'authenticated' );

-- Allow authenticated users to update their objects
create policy "Authenticated users can update catalog assets"
on storage.objects for update
using ( bucket_id = 'catalog_assets' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete their objects
create policy "Authenticated users can delete catalog assets"
on storage.objects for delete
using ( bucket_id = 'catalog_assets' and auth.role() = 'authenticated' );
