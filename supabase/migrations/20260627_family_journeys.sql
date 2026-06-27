create table if not exists public.family_journeys (
  family_id uuid primary key references public.families(id) on delete cascade,
  cities jsonb not null default '[]'::jsonb,
  cars jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_journeys_updated_idx
  on public.family_journeys (updated_at desc);

alter table public.family_journeys enable row level security;

drop policy if exists "Family members can read family journeys" on public.family_journeys;
create policy "Family members can read family journeys"
  on public.family_journeys for select to authenticated
  using (public.is_family_member(family_id));

revoke insert, update, delete on public.family_journeys from anon, authenticated;
grant select on public.family_journeys to authenticated;
