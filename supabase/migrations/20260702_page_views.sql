create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text,
  path text not null default '/',
  source text,
  referrer text,
  user_agent text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx
  on public.page_views (created_at desc);

create index if not exists page_views_source_idx
  on public.page_views (source, created_at desc);

alter table public.page_views enable row level security;

revoke all on public.page_views from anon, authenticated;
