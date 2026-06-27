alter table public.humanity_messages
  add column if not exists unlock_year integer check (unlock_year is null or unlock_year between 1900 and 2300);

drop index if exists humanity_messages_public_created_idx;
create index if not exists humanity_messages_public_created_idx
  on public.humanity_messages (visibility, status, unlock_year, created_at desc);

create or replace function public.humanity_country_counts()
returns table(country text, message_count bigint)
language sql stable security definer set search_path = public as $$
  select hm.country, count(*)::bigint
  from public.humanity_messages hm
  where hm.visibility = 'public'
    and hm.status = 'published'
    and (hm.unlock_year is null or hm.unlock_year <= extract(year from now())::integer)
  group by hm.country
  order by count(*) desc, hm.country asc;
$$;

create or replace function public.humanity_year_counts()
returns table(year integer, message_count bigint)
language sql stable security definer set search_path = public as $$
  select extract(year from hm.created_at)::integer as year, count(*)::bigint as message_count
  from public.humanity_messages hm
  where hm.visibility = 'public'
    and hm.status = 'published'
    and (hm.unlock_year is null or hm.unlock_year <= extract(year from now())::integer)
  group by extract(year from hm.created_at)
  order by extract(year from hm.created_at) desc;
$$;
