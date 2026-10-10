import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { updateBooking, type BookingPatch } from "@/lib/bookings-db";
import { isSupabaseConfigured, type BookingStatus } from "@/lib/supabase-admin";

const STATUSES = new Set<BookingStatus>([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase är inte konfigurerad.", code: "SUPABASE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Saknar id." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
    }

    const patch: BookingPatch = {};

    if (typeof body.status === "string") {
      if (!STATUSES.has(body.status as BookingStatus)) {
        return NextResponse.json({ error: "Ogiltig status." }, { status: 400 });
      }
      patch.status = body.status as BookingStatus;
    }
    if (typeof body.booking_date === "string") patch.booking_date = body.booking_date;
    if (typeof body.start_time === "string") patch.start_time = body.start_time;
    if (typeof body.customer_name === "string") patch.customer_name = body.customer_name;
    if (typeof body.customer_email === "string") patch.customer_email = body.customer_email;
    if (typeof body.customer_phone === "string") patch.customer_phone = body.customer_phone;
    if (typeof body.registration_number === "string") {
      patch.registration_number = body.registration_number;
    }
    if (typeof body.car_type === "string") patch.car_type = body.car_type;
    if (typeof body.customer_notes === "string") patch.customer_notes = body.customer_notes;
    if (typeof body.total === "string") patch.total = body.total;
    if (typeof body.service_type === "string") patch.service_type = body.service_type;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Inget att uppdatera." }, { status: 400 });
    }

    const booking = await updateBooking(id, patch);
    return NextResponse.json({ booking });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    const message =
      error instanceof Error ? error.message : "Kunde inte spara.";

    if (code === "NOT_FOUND") {
      return NextResponse.json({ error: message, code }, { status: 404 });
    }
    if (code === "INVALID" || code === "SLOT_TAKEN") {
      return NextResponse.json({ error: message, code }, { status: 409 });
    }

    console.error("[api/admin/bookings/id]", error);
    return NextResponse.json({ error: "Kunde inte spara." }, { status: 500 });
  }
}
