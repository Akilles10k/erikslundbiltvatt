# Sister-site packages

Full source tarballs (Eskilstuna + Skövde) are produced by the Cursor agent under Project artifacts:

- `eskilstuna-multi-tenant-source.tgz`
- `skovde-multi-tenant-source.tgz`

This folder only keeps env templates. Apply the same `supabase/migrations/001_bookings.sql` + `002_multi_tenant_site_id.sql` from this repo on the **shared** Supabase project.

| App | `BOOKING_SITE_ID` |
|-----|-------------------|
| Eskilstuna | `eskilstuna` |
| Erikslund (this repo) | `erikslund` |
| Skövde | `skovde` |
