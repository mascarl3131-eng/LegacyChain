create table if not exists public.premium_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'refunded', 'revoked')),
  product_code text not null default 'legacychain_lifetime',
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  purchased_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.premium_entitlements enable row level security;

drop policy if exists "Users can read their premium entitlement" on public.premium_entitlements;
create policy "Users can read their premium entitlement"
on public.premium_entitlements
for select
to authenticated
using (auth.uid() = user_id);

revoke insert, update, delete on public.premium_entitlements from anon, authenticated;
grant select on public.premium_entitlements to authenticated;
