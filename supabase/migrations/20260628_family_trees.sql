create table if not exists public.family_trees (
  family_id uuid primary key references public.families(id) on delete cascade,
  nodes jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists family_trees_updated_idx
  on public.family_trees (updated_at desc);

alter table public.family_trees enable row level security;

drop policy if exists "Family members can read family trees" on public.family_trees;
create policy "Family members can read family trees"
  on public.family_trees for select to authenticated
  using (public.is_family_member(family_id));

revoke insert, update, delete on public.family_trees from anon, authenticated;
grant select on public.family_trees to authenticated;
