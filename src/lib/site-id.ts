/**
 * Hard tenant isolation for the shared Supabase project.
 *
 * Each Vercel/Next app MUST set BOOKING_SITE_ID to exactly one of the
 * known site ids. Client requests can never choose or override this.
 */

export const BOOKING_SITE_IDS = ["eskilstuna", "erikslund", "skovde"] as const;

export type BookingSiteId = (typeof BOOKING_SITE_IDS)[number];

/** Default for this codebase (Erikslund). Sister sites override via env. */
export const DEFAULT_BOOKING_SITE_ID: BookingSiteId = "erikslund";

export function isBookingSiteId(value: string): value is BookingSiteId {
  return (BOOKING_SITE_IDS as readonly string[]).includes(value);
}

/**
 * Server-only site id for all booking reads/writes.
 * Never accept site_id from the browser/request body.
 */
export function getBookingSiteId(): BookingSiteId {
  const raw = process.env.BOOKING_SITE_ID?.trim().toLowerCase();
  if (raw && isBookingSiteId(raw)) return raw;
  return DEFAULT_BOOKING_SITE_ID;
}
