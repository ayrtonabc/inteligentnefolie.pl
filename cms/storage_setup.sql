insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public, name = excluded.name;

drop policy if exists "Public read blog-images" on storage.objects;
create policy "Public read blog-images"
on storage.objects
for select
using (bucket_id = 'blog-images');

drop policy if exists "Authenticated upload blog-images" on storage.objects;
create policy "Authenticated upload blog-images"
on storage.objects
for insert
with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update blog-images" on storage.objects;
create policy "Authenticated update blog-images"
on storage.objects
for update
using (bucket_id = 'blog-images' and auth.role() = 'authenticated')
with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete blog-images" on storage.objects;
create policy "Authenticated delete blog-images"
on storage.objects
for delete
using (bucket_id = 'blog-images' and auth.role() = 'authenticated');
