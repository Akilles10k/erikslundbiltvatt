# Glansig Bilvård

Webbplats för Glansig Bilvård – biltvätt & bilrekond i Erikslund.

## Lokal utveckling

```bash
npm install
npm run dev
```

Öppna [http://localhost:3003](http://localhost:3003)

## Bokning + admin

Live-bokning via Supabase och adminpanel på `/admin` (samma modell som Eskilstuna).

Se **[BOOKING_SETUP.md](./BOOKING_SETUP.md)** för SQL-migration, Vercel-env och teststeg.

## Deploy (Vercel)

Se **[DEPLOY.md](./DEPLOY.md)** – använd Vercel, inte GitHub Pages.

Snabbväg:

1. [vercel.com/new](https://vercel.com/new) → importera detta repo
2. Sätt `NEXT_PUBLIC_SITE_URL=https://glansigbilvarderikslundlivli.se`
3. Lägg till `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` för bokningsmail
4. Koppla domänen under **Settings → Domains**
5. Avpublicera GitHub Pages så DNS inte krockar
