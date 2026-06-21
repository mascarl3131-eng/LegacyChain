create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','child')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  invited_email text,
  role text not null default 'member' check (role in ('admin','member','child')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists family_members_user_idx on public.family_members (user_id);
create index if not exists family_invitations_family_idx on public.family_invitations (family_id, expires_at desc);

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invitations enable row level security;

create or replace function public.is_family_member(target_family_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family_id and user_id = auth.uid()
  );
$$;

drop policy if exists "Members can read their families" on public.families;
create policy "Members can read their families" on public.families
for select to authenticated using (public.is_family_member(id));

drop policy if exists "Members can read family membership" on public.family_members;
create policy "Members can read family membership" on public.family_members
for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.families from anon, authenticated;
revoke insert, update, delete on public.family_members from anon, authenticated;
revoke all on public.family_invitations from anon, authenticated;
grant select on public.families, public.family_members to authenticated;
