#!/usr/bin/env bash
# Apply multi-tenant SQL to the Eskilstuna keeper Supabase project.
# Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# Optional: SUPABASE_DB_URL (postgres connection string) for psql
set -euo pipefail
: "${SUPABASE_URL:?Set SUPABASE_URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Keeper project: $SUPABASE_URL"
echo "Running migrations via PostgREST/SQL is not available with service role alone."
echo "Prefer SUPABASE_DB_URL + psql, or paste SQL in Supabase SQL Editor."

if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/001_bookings.sql"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/002_multi_tenant_site_id.sql"
  echo "Migrations applied."
else
  echo "SUPABASE_DB_URL unset — open SQL Editor and run 001 then 002."
  exit 2
fi
