create table if not exists public.family_messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 80),
  message text not null check (char_length(message) between 1 and 500),
  emotion text not null check (emotion in ('hope','love','wisdom','memory','warning')),
  message_type text not null default 'standard' check (message_type in ('standard','birth','capsule')),
  unlock_year integer check (unlock_year is null or unlock_year between 1900 and 2300),
  baby_name text,
  adulthood_year integer,
  photo_path text,
  audio_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_messages_family_created_idx
  on public.family_messages (family_id, created_at desc);

alter table public.family_messages enable row level security;

drop policy if exists "Family members can read family messages" on public.family_messages;
create policy "Family members can read family messages"
  on public.family_messages for select to authenticated
  using (public.is_family_member(family_id));

revoke insert, update, delete on public.family_messages from anon, authenticated;
grant select on public.family_messages to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'family-media',
  'family-media',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','image/heic','audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Family members can upload family media" on storage.objects;
create policy "Family members can upload family media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'family-media'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Family members can read family media" on storage.objects;
create policy "Family members can read family media"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'family-media'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Owners can delete their family media" on storage.objects;
create policy "Owners can delete their family media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'family-media'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
    and (storage.foldername(name))[2] = auth.uid()::text
  );
