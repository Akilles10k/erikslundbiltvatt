# Bokningssystem + admin (Eskilstuna)

Kundbokning → `POST /api/booking` → Supabase (`site_id=eskilstuna`) → mejl till Eskilstuna-inkorg. Admin på `/admin`.

**Krav:** samma Supabase-projekt som Erikslund/Skövde, men egna SMTP/admin-env. Sätt alltid `BOOKING_SITE_ID=eskilstuna`.

## Env (Vercel)

| Variabel | Värde |
|----------|--------|
| `SUPABASE_URL` | Shared project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Shared service role |
| `BOOKING_SITE_ID` | `eskilstuna` |
| `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` | Egna för Eskilstuna |
| `SMTP_USER` / `BOOKING_OWNER_EMAIL` | `glansbiltvatt@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://glansigbiltvatteskilstunaab.se` |

## SQL

Kör i keeper-projektet: `supabase/migrations/001_bookings.sql` (om behövs) sedan `002_multi_tenant_site_id.sql`.
