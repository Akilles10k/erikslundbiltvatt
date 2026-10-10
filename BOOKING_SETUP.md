# Bokningssystem + admin (Erikslund)

Samma modell som Eskilstuna: kundbokning → `POST /api/booking` → Supabase → mejl. Admin på `/admin`.

## Env-variabler (Vercel)

Sätt dessa under **Project → Settings → Environment Variables** (Production + Preview):

| Variabel | Krävs | Beskrivning |
|----------|-------|-------------|
| `SUPABASE_URL` | Ja | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Ja | Service role key (endast server – aldrig `NEXT_PUBLIC_`) |
| `ADMIN_PASSWORD` | Ja | Lösenord till `/admin` |
| `ADMIN_SESSION_SECRET` | Ja | Hemlig nyckel för HMAC-sessioncookie (≥ 32 tecken) |
| `SMTP_USER` | Rekommenderas | Gmail-adress |
| `SMTP_PASS` | Rekommenderas | Gmail App Password |
| `SMTP_HOST` | Nej | Default `smtp.gmail.com` |
| `SMTP_PORT` | Nej | Default `587` |
| `BOOKING_OWNER_EMAIL` | Nej | Default `glansigbilvarderikslund@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | Ja (SEO) | Publik sajt-URL |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Nej | Extra fallback (används ej i nya sparflödet) |

Generera session-secret lokalt:

```bash
openssl rand -base64 48
```

## Kör SQL i Supabase

1. Öppna [supabase.com](https://supabase.com) → ditt projekt  
2. Gå till **SQL Editor** → **New query**  
3. Klistra in hela filen `supabase/migrations/001_bookings.sql`  
4. Klicka **Run**  
5. Kontrollera under **Table Editor** att tabellen `bookings` finns  
6. Under **Authentication → Policies** ska RLS vara på och publika roller sakna läs/skriv

## Testa end-to-end

1. Deploya till Vercel med env-variablerna ovan  
2. På dator A: öppna `/tjanster`, lägg tjänst i varukorg, boka datum/tid och skicka  
3. Du ska få bekräftelse i UI (“Tack för din bokning…”)  
4. På dator B: öppna `/admin`, logga in med `ADMIN_PASSWORD`  
5. Bokningen syns i kalendern (röd dag) och i listan  
6. Testa avboka / markera klar / omboka – tiden frigörs vid `cancelled`

## API-översikt

- `GET /api/availability?date=YYYY-MM-DD` – lediga tider  
- `POST /api/booking` – spara i Supabase + skicka mejl  
- `POST /api/admin/login|logout`  
- `GET /api/admin/session`  
- `GET /api/admin/bookings` · `PATCH /api/admin/bookings/[id]`  
- `GET /api/admin/stats?year=&month=`  

Inga publika Supabase-anrop från webbläsaren till `bookings`.
