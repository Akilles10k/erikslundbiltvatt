-- Shared bookings table (used by Eskilstuna / Erikslund / Skövde apps).
-- Run this in Supabase SQL Editor (or via CLI migration).
-- Then run 002_multi_tenant_site_id.sql for hard per-site isolation.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum (
      'pending',
      'confirmed',
      'completed',
      'cancelled'
    );
  end if;
end$$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  registration_number text not null,
  car_type text not null default '',
  service_type text not null default '',
  services jsonb not null default '[]'::jsonb,
  total text not null default '',
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status public.booking_status not null default 'confirmed',
  customer_notes text not null default '',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_end_after_start check (end_time > start_time),
  constraint bookings_services_is_array check (jsonb_typeof(services) = 'array')
);

create index if not exists bookings_booking_date_idx
  on public.bookings (booking_date);

create index if not exists bookings_status_idx
  on public.bookings (status);

create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);

create index if not exists bookings_registration_idx
  on public.bookings (registration_number);

create index if not exists bookings_customer_name_idx
  on public.bookings (customer_name);

-- One active booking per date + start time (cancelled frees the slot).
create unique index if not exists bookings_active_slot_uidx
  on public.bookings (booking_date, start_time)
  where status <> 'cancelled';

create or replace function public.set_bookings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row
  execute function public.set_bookings_updated_at();

alter table public.bookings enable row level security;

-- Public visitors must not read or write bookings directly.
-- All access goes through Next.js API routes with the service role key.
drop policy if exists "deny_all_anon" on public.bookings;
create policy "deny_all_anon"
  on public.bookings
  for all
  to anon, authenticated
  using (false)
  with check (false);

grant usage on schema public to anon, authenticated, service_role;
grant all on public.bookings to service_role;
revoke all on public.bookings from anon, authenticated;
