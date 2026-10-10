# Deploy to Vercel

This is a Next.js app. Host it on **Vercel**, not GitHub Pages.

Full booking/admin setup: see **[BOOKING_SETUP.md](./BOOKING_SETUP.md)**.

## 1. Deploy from GitHub (easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import this repo
4. Framework preset: **Next.js** (auto-detected)
5. Add environment variables:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | Your public site URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `ADMIN_SESSION_SECRET` | Long random secret (≥ 32 chars) |
| `SMTP_USER` | `glansigbilvarderikslund@gmail.com` |
| `SMTP_PASS` | Gmail App Password |
| `BOOKING_OWNER_EMAIL` | `glansigbilvarderikslund@gmail.com` |

6. Run SQL migration `supabase/migrations/001_bookings.sql` in Supabase SQL Editor  
7. Click **Deploy** on Vercel

### Booking emails

Bookings are saved in Supabase first, then emails are sent via Gmail SMTP (`SMTP_USER` / `SMTP_PASS`).

## 2. Connect your domain

1. In the Vercel project → **Settings → Domains**
2. Add your domain and `www`
3. At your domain registrar, set DNS as Vercel shows
4. Wait for DNS, then enable HTTPS in Vercel (automatic)

## 3. After deploy

- Site URL: your domain
- Bookings: `/tjanster` → boka tid
- Admin: `/admin` with `ADMIN_PASSWORD`
