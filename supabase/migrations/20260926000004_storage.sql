-- Buckets de imágenes: lectura pública (URLs /object/public), escritura solo admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('team-avatars', 'team-avatars', true, 1048576, array['image/webp', 'image/jpeg', 'image/png']),
  ('tournament-media', 'tournament-media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "cedros_media_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id in ('team-avatars', 'tournament-media') and (select public.is_admin()));

create policy "cedros_media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('team-avatars', 'tournament-media') and (select public.is_admin()));

create policy "cedros_media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('team-avatars', 'tournament-media') and (select public.is_admin()))
  with check (bucket_id in ('team-avatars', 'tournament-media') and (select public.is_admin()));

create policy "cedros_media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('team-avatars', 'tournament-media') and (select public.is_admin()));
