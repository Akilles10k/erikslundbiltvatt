# Bokningssystem + admin (Erikslund)

Kundbokning → `POST /api/booking` → Supabase (filtrerat på `site_id`) → mejl. Admin på `/admin`.

Alla tre sajter (Eskilstuna, Erikslund, Skövde) ska använda **samma** Supabase-projekt men **olika** `BOOKING_SITE_ID`, SMTP/inbox och admin-lösenord. Se projektets guide: multi-tenant-docs hos Cursor Project "Supabase".

## Env-variabler (Vercel)

Sätt dessa under **Project → Settings → Environment Variables** (Production + Preview):

| Variabel | Krävs | Beskrivning |
|----------|-------|-------------|
| `SUPABASE_URL` | Ja | Shared Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Ja | Service role key (endast server – aldrig `NEXT_PUBLIC_`) |
| `BOOKING_SITE_ID` | Ja | Måste vara `erikslund` för denna sajt |
| `ADMIN_PASSWORD` | Ja | Lösenord till `/admin` (eget per sajt) |
| `ADMIN_SESSION_SECRET` | Ja | Hemlig nyckel för HMAC-sessioncookie (≥ 32 tecken, eget per sajt) |
| `SMTP_USER` | Rekommenderas | Gmail för **denna** sajt endast |
| `SMTP_PASS` | Rekommenderas | Gmail App Password |
| `SMTP_HOST` | Nej | Default `smtp.gmail.com` |
| `SMTP_PORT` | Nej | Default `587` |
| `BOOKING_OWNER_EMAIL` | Nej | Default `glansigbilvarderikslund@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | Ja (SEO) | Publik sajt-URL |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Nej | Extra fallback |

Generera session-secret lokalt:

```bash
openssl rand -base64 48
```

## Kör SQL i Supabase

1. Öppna [supabase.com](https://supabase.com) → **ett** projekt (Free-tier: behåll bara detta)  
2. **SQL Editor** → kör `supabase/migrations/001_bookings.sql` om tabellen saknas  
3. Kör `supabase/migrations/002_multi_tenant_site_id.sql`  
4. Om befintliga rader tillhörde Eskilstuna i stället för Erikslund, backfilla manuellt **före** du sätter `NOT NULL` / eller kör:

```sql
update public.bookings set site_id = 'eskilstuna' where site_id = 'erikslund' and /* your filter */;
```

5. Table Editor: `bookings.site_id` ska finnas  
6. RLS på; `anon`/`authenticated` ska sakna läs/skriv

## Testa end-to-end

1. Deploya till Vercel med env-variablerna ovan (`BOOKING_SITE_ID=erikslund`)  
2. Boka via `/tjanster` → raden i Supabase ska ha `site_id = erikslund`  
3. Öppna `/admin` → bara Erikslund-bokningar syns  
4. Avboka / omboka – tiden frigörs vid `cancelled` **inom samma site_id**

## Isolering (hårt krav)

- Webbläsaren skickar **aldrig** `site_id` – servern sätter det från `BOOKING_SITE_ID`  
- Kalender, adminlista och stats filtrerar alltid `.eq('site_id', …)`  
- Unikt tidsslot-index är per `(site_id, booking_date, start_time)`  
- SMTP / `BOOKING_OWNER_EMAIL` / FormSubmit är per Vercel-projekt (separata inkorgar)

## API-översikt

- `GET /api/availability?date=YYYY-MM-DD` – lediga tider (denna sajt)  
- `POST /api/booking` – spara i Supabase + skicka mejl  
- `POST /api/admin/login|logout`  
- `GET /api/admin/session`  
- `GET /api/admin/bookings` · `PATCH /api/admin/bookings/[id]`  
- `GET /api/admin/stats?year=&month=`  

Inga publika Supabase-anrop från webbläsaren till `bookings`.
