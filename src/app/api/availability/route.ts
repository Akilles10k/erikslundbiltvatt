import { NextResponse } from "next/server";
import { getAvailabilityForDate } from "@/lib/bookings-db";
import { normalizeBookingDate } from "@/lib/booking-hours";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("date") ?? "";
    const date = normalizeBookingDate(raw);

    if (!date) {
      return NextResponse.json(
        { error: "Ange datum som YYYY-MM-DD.", code: "INVALID" },
        { status: 400 },
      );
    }

    const requireAdvanceDay = searchParams.get("advance") === "1";
    const result = await getAvailabilityForDate(date, { requireAdvanceDay });

    return NextResponse.json({
      ...result,
      supabase: isSupabaseConfigured(),
    });
  } catch (error) {
    console.error("[api/availability]", error);
    return NextResponse.json(
      { error: "Kunde inte hämta tillgänglighet." },
      { status: 500 },
    );
  }
}
