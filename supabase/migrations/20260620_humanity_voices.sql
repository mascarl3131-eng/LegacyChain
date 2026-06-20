create extension if not exists pgcrypto;

create table if not exists public.humanity_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  display_name text not null default 'Anonymous',
  show_profile boolean not null default false,
  country text not null,
  country_code text,
  message text not null check (char_length(message) between 3 and 500),
  emotion text not null check (emotion in ('hope','love','wisdom','peace','warning','memory')),
  audience text not null check (audience in ('future','descendants','humanity','whoever')),
  visibility text not null default 'public' check (visibility in ('public','family')),
  language text not null default 'en',
  status text not null default 'published' check (status in ('published','hidden','review')),
  reaction_count integer not null default 0 check (reaction_count >= 0),
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists humanity_messages_public_created_idx
  on public.humanity_messages (visibility, status, created_at desc);
create index if not exists humanity_messages_country_idx
  on public.humanity_messages (country, created_at desc);
create index if not exists humanity_messages_emotion_idx
  on public.humanity_messages (emotion, created_at desc);

create table if not exists public.humanity_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.humanity_messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  visitor_id text,
  reaction text not null default 'support' check (reaction in ('hope','love','support')),
  created_at timestamptz not null default now(),
  check (user_id is not null or visitor_id is not null)
);

create unique index if not exists humanity_reactions_user_unique
  on public.humanity_reactions (message_id, user_id, reaction)
  where user_id is not null;
create unique index if not exists humanity_reactions_visitor_unique
  on public.humanity_reactions (message_id, visitor_id, reaction)
  where visitor_id is not null;

create table if not exists public.humanity_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.humanity_messages(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  visitor_id text,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now()
);

create unique index if not exists humanity_reports_user_unique
  on public.humanity_reports (message_id, reporter_id)
  where reporter_id is not null;
create unique index if not exists humanity_reports_visitor_unique
  on public.humanity_reports (message_id, visitor_id)
  where visitor_id is not null;

alter table public.humanity_messages enable row level security;
alter table public.humanity_reactions enable row level security;
alter table public.humanity_reports enable row level security;

drop policy if exists "Public voices are readable" on public.humanity_messages;
create policy "Public voices are readable"
  on public.humanity_messages for select
  using (visibility = 'public' and status = 'published');

drop policy if exists "Authors can read family voices" on public.humanity_messages;
create policy "Authors can read family voices"
  on public.humanity_messages for select to authenticated
  using (author_id = auth.uid());

create or replace function public.refresh_humanity_reaction_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_id uuid;
begin
  target_id := coalesce(new.message_id, old.message_id);
  update public.humanity_messages
  set reaction_count = (select count(*) from public.humanity_reactions where message_id = target_id),
      updated_at = now()
  where id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists humanity_reaction_count_trigger on public.humanity_reactions;
create trigger humanity_reaction_count_trigger
after insert or delete on public.humanity_reactions
for each row execute function public.refresh_humanity_reaction_count();

create or replace function public.refresh_humanity_report_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.humanity_messages
  set report_count = (select count(*) from public.humanity_reports where message_id = new.message_id),
      status = case
        when (select count(*) from public.humanity_reports where message_id = new.message_id) >= 3 then 'review'
        else status
      end,
      updated_at = now()
  where id = new.message_id;
  return new;
end;
$$;

drop trigger if exists humanity_report_count_trigger on public.humanity_reports;
create trigger humanity_report_count_trigger
after insert on public.humanity_reports
for each row execute function public.refresh_humanity_report_count();
