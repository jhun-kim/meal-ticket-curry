-- Meal Ticket Curry draft schema and RLS contracts.
-- This migration is a planning artifact for issue #5. It is not wired to a live Supabase client.
-- It intentionally omits child/guardian/ticket-user identity tables and checkout/payment credentials.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  auth_user_id uuid unique,
  role text not null check (role in ('store_staff', 'operator')),
  store_id uuid,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_store_staff_store_required
    check ((role = 'store_staff' and store_id is not null) or (role = 'operator' and store_id is null))
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  status text not null check (status in ('pending', 'verified', 'suspended', 'closed')),
  region text not null,
  ticket_unit_amount integer not null default 200 check (ticket_unit_amount > 0),
  currency text not null default 'JPY',
  daily_redemption_limit integer not null check (daily_redemption_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_store_id_fkey
  foreign key (store_id) references public.stores (id);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id),
  amount integer not null check (amount > 0),
  currency text not null default 'JPY',
  ticket_count integer not null check (ticket_count > 0),
  payment_provider text not null,
  payment_reference text unique,
  donor_email text,
  status text not null check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.meal_tickets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id),
  donation_id uuid references public.donations (id),
  status text not null check (status in ('available', 'redeemed', 'expired', 'voided')),
  posted_at timestamptz not null default now(),
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint meal_tickets_status_timestamp_shape check (
    (status = 'available' and redeemed_at is null)
    or (status = 'redeemed' and redeemed_at is not null)
    or (status in ('expired', 'voided') and redeemed_at is null)
  ),
  constraint meal_tickets_id_store_unique unique (id, store_id)
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id),
  ticket_id uuid not null unique,
  staff_profile_id uuid references public.profiles (id),
  redeemed_at timestamptz not null default now(),
  source text not null check (source in ('staff_button', 'qr_staff', 'admin_adjustment')),
  constraint redemptions_ticket_store_fkey
    foreign key (ticket_id, store_id) references public.meal_tickets (id, store_id)
);

create table if not exists public.settlement_reports (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id),
  period_start date not null,
  period_end date not null,
  redeemed_count integer not null check (redeemed_count >= 0),
  gross_amount integer not null check (gross_amount >= 0),
  status text not null check (status in ('draft', 'exported', 'paid', 'adjusted')),
  csv_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settlement_reports_period_order check (period_end >= period_start)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id),
  actor_role text not null,
  store_id uuid references public.stores (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_events (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id),
  redemption_id uuid references public.redemptions (id),
  type text not null check (
    type in ('donor_thanks_viewed', 'store_daily_note', 'anonymous_meal_feedback')
  ),
  rating integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.donations enable row level security;
alter table public.meal_tickets enable row level security;
alter table public.redemptions enable row level security;
alter table public.settlement_reports enable row level security;
alter table public.audit_logs enable row level security;
alter table public.feedback_events enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.current_profile_store_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select store_id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'operator'
$$;

create or replace function public.is_store_staff_for(target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'store_staff'
    and public.current_profile_store_id() = target_store_id
$$;

comment on table public.profiles is
  'Profiles represent store_staff and operator only. No child, guardian, or ticket-user identity profile exists.';
comment on table public.stores is
  'Public may read active stores; store staff are scoped to their own store; operators manage all stores.';
comment on table public.donations is
  'Store-scoped donation records. No payment credentials; donor email is optional and never identifies ticket users.';
comment on table public.meal_tickets is
  'Store-scoped anonymous meal ticket inventory. Tickets do not store child or guardian identity.';
comment on table public.redemptions is
  'One anonymous ticket redemption event per meal ticket. No child or guardian identity fields.';
comment on table public.settlement_reports is
  'Manual store-level settlement reports with aggregate counts only.';
comment on table public.audit_logs is
  'Operator-only audit trail for sensitive store/admin mutations.';
comment on table public.feedback_events is
  'Anonymous fixed-choice store-level events only; no free text, photos, or child identity.';

create policy "profiles self read or operator manage"
  on public.profiles
  for select
  using (auth_user_id = auth.uid() or public.is_operator());

create policy "operators manage profiles"
  on public.profiles
  for all
  using (public.is_operator())
  with check (public.is_operator());

create policy "public reads active stores"
  on public.stores
  for select
  using (status = 'verified' or public.is_store_staff_for(id) or public.is_operator());

create policy "operators manage stores"
  on public.stores
  for all
  using (public.is_operator())
  with check (public.is_operator());

create policy "staff read own store donations"
  on public.donations
  for select
  using (public.is_store_staff_for(store_id) or public.is_operator());

create policy "operators manage donations"
  on public.donations
  for all
  using (public.is_operator())
  with check (public.is_operator());

create policy "staff manage own store meal tickets"
  on public.meal_tickets
  for all
  using (public.is_store_staff_for(store_id) or public.is_operator())
  with check (public.is_store_staff_for(store_id) or public.is_operator());

create policy "staff manage own store redemptions"
  on public.redemptions
  for all
  using (public.is_store_staff_for(store_id) or public.is_operator())
  with check (public.is_store_staff_for(store_id) or public.is_operator());

create policy "staff read own settlement reports"
  on public.settlement_reports
  for select
  using (public.is_store_staff_for(store_id) or public.is_operator());

create policy "operators manage settlement reports"
  on public.settlement_reports
  for all
  using (public.is_operator())
  with check (public.is_operator());

create policy "operators read audit logs"
  on public.audit_logs
  for select
  using (public.is_operator());

create policy "operators write audit logs"
  on public.audit_logs
  for insert
  with check (public.is_operator());

create policy "staff read own feedback events"
  on public.feedback_events
  for select
  using (public.is_store_staff_for(store_id) or public.is_operator());

create policy "staff create own feedback events"
  on public.feedback_events
  for insert
  with check (public.is_store_staff_for(store_id) or public.is_operator());
