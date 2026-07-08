create table if not exists public.family_books (
  family_id uuid not null references public.families(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 120),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (family_id, author_id)
);

create index if not exists family_books_family_updated_idx
  on public.family_books (family_id, updated_at desc);

alter table public.family_books enable row level security;

drop policy if exists "Family members can read family books" on public.family_books;
create policy "Family members can read family books"
  on public.family_books for select to authenticated
  using (public.is_family_member(family_id));

revoke insert, update, delete on public.family_books from anon, authenticated;
grant select on public.family_books to authenticated;
