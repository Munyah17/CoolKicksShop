-- Create storage buckets for image uploads
-- These buckets are used by the admin portal for uploading images

-- Insert storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logo-images', 'logo-images', true, 157286400, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('hero-images', 'hero-images', true, 157286400, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
on conflict (id) do nothing;

-- RLS is already enabled on storage.objects by Supabase; we only manage policies here.

-- Public read access for logo-images bucket
drop policy if exists "Public can read logo images" on storage.objects;
create policy "Public can read logo images"
  on storage.objects for select
  using (bucket_id = 'logo-images');

-- Public read access for hero-images bucket
drop policy if exists "Public can read hero images" on storage.objects;
create policy "Public can read hero images"
  on storage.objects for select
  using (bucket_id = 'hero-images');

-- Admin upload access for logo-images bucket
drop policy if exists "Admin can upload logo images" on storage.objects;
create policy "Admin can upload logo images"
  on storage.objects for insert
  with check (
    bucket_id = 'logo-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );

-- Admin upload access for hero-images bucket
drop policy if exists "Admin can upload hero images" on storage.objects;
create policy "Admin can upload hero images"
  on storage.objects for insert
  with check (
    bucket_id = 'hero-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );

-- Admin delete access for logo-images bucket
drop policy if exists "Admin can delete logo images" on storage.objects;
create policy "Admin can delete logo images"
  on storage.objects for delete
  using (
    bucket_id = 'logo-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );

-- Admin delete access for hero-images bucket
drop policy if exists "Admin can delete hero images" on storage.objects;
create policy "Admin can delete hero images"
  on storage.objects for delete
  using (
    bucket_id = 'hero-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );
