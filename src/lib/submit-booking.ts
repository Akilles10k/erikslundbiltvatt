import type { BookingEmailPayload } from "@/lib/booking-message";

export const SUPABASE_NOT_CONFIGURED = "SUPABASE_NOT_CONFIGURED";

export type SubmitBookingResult = {
  id: string;
  emailOk?: boolean;
  emailWarning?: string;
};

/** Persist booking via Next.js API (Supabase + mejl). No browser Supabase calls. */
export async function submitBooking(
  payload: BookingEmailPayload & {
    source?: string;
    customerNotes?: string;
    requireAdvanceDay?: boolean;
  },
): Promise<SubmitBookingResult> {
  const response = await fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as {
    ok?: boolean;
    id?: string;
    error?: string;
    code?: string;
    emailOk?: boolean;
    emailWarning?: string;
  } | null;

  if (response.status === 503 && result?.code === "SUPABASE_NOT_CONFIGURED") {
    throw new Error(SUPABASE_NOT_CONFIGURED);
  }

  if (!response.ok || !result?.ok || !result.id) {
    throw new Error(result?.error || "Kunde inte spara bokningen.");
  }

  return {
    id: result.id,
    emailOk: result.emailOk,
    emailWarning: result.emailWarning,
  };
}
