create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  contact_email text,
  category text not null check (category in ('display','login','payment','data','performance','other')),
  severity text not null default 'medium' check (severity in ('low','medium','high','blocking')),
  description text not null check (char_length(description) between 10 and 2000),
  page text,
  browser text,
  viewport text,
  language text not null default 'en',
  status text not null default 'new' check (status in ('new','reviewing','resolved','closed')),
  created_at timestamptz not null default now()
);

create index if not exists bug_reports_status_created_idx
  on public.bug_reports (status, created_at desc);

alter table public.bug_reports enable row level security;

drop policy if exists "Reporters can read their bug reports" on public.bug_reports;
create policy "Reporters can read their bug reports"
  on public.bug_reports for select to authenticated
  using (reporter_id = auth.uid());
