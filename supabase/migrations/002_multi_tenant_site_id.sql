-- Multi-tenant isolation for three booking sites in ONE Supabase project.
-- Safe to re-run. Does not merge businesses: each row belongs to exactly one site_id.
--
-- Sites:
--   eskilstuna  = Glansig Biltvätt Eskilstuna (glansigbiltvatteskilstunaab.se)
--   erikslund   = Glansig Bilvård Erikslund   (glansigbilvarderikslundlivli.se)
--   skovde      = Glansig Bilvård Skövde
--
-- BEFORE running on a project that already has bookings from a single site:
--   1. Decide which site owns the existing rows in THIS project.
--   2. Change the backfill value below if it is not 'erikslund'.
--   3. After this migration, import the other sites' bookings with their site_id.

-- 1) Column
alter table public.bookings
  add column if not exists site_id text;

-- 2) Backfill existing rows (keeper project default = erikslund).
--    If this Supabase project was Eskilstuna's, run instead:
--      update public.bookings set site_id = 'eskilstuna' where site_id is null;
update public.bookings
set site_id = 'erikslund'
where site_id is null or btrim(site_id) = '';

-- 3) Constrain + require
alter table public.bookings
  alter column site_id set not null;

alter table public.bookings
  drop constraint if exists bookings_site_id_check;

alter table public.bookings
  add constraint bookings_site_id_check
  check (site_id in ('eskilstuna', 'erikslund', 'skovde'));

-- 4) Slot uniqueness is PER SITE (cancelled frees the slot).
drop index if exists public.bookings_active_slot_uidx;

create unique index if not exists bookings_active_slot_per_site_uidx
  on public.bookings (site_id, booking_date, start_time)
  where status <> 'cancelled';

-- 5) Query helpers
create index if not exists bookings_site_id_idx
  on public.bookings (site_id);

create index if not exists bookings_site_date_idx
  on public.bookings (site_id, booking_date);

-- 6) Optional reference table (documentation + future admin tooling)
create table if not exists public.booking_sites (
  id text primary key check (id in ('eskilstuna', 'erikslund', 'skovde')),
  display_name text not null,
  notes text not null default ''
);

insert into public.booking_sites (id, display_name, notes) values
  ('eskilstuna', 'Glansig Biltvätt Eskilstuna', 'Separate Vercel app + inbox'),
  ('erikslund', 'Glansig Bilvård Erikslund', 'Separate Vercel app + inbox'),
  ('skovde', 'Glansig Bilvård Skövde', 'Separate Vercel app + inbox')
on conflict (id) do update
set display_name = excluded.display_name;

alter table public.booking_sites enable row level security;

drop policy if exists "deny_all_anon_booking_sites" on public.booking_sites;
create policy "deny_all_anon_booking_sites"
  on public.booking_sites
  for all
  to anon, authenticated
  using (false)
  with check (false);

grant all on public.booking_sites to service_role;
revoke all on public.booking_sites from anon, authenticated;

-- 7) Keep public roles locked out of bookings (service role only via Next.js).
--    service_role bypasses RLS; isolation is enforced by each app setting
--    BOOKING_SITE_ID and always filtering/writing that site_id.
alter table public.bookings enable row level security;

drop policy if exists "deny_all_anon" on public.bookings;
create policy "deny_all_anon"
  on public.bookings
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on public.bookings from anon, authenticated;
grant all on public.bookings to service_role;
