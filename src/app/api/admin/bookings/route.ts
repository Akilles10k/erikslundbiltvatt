import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listBookings } from "@/lib/bookings-db";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase är inte konfigurerad.", code: "SUPABASE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const bookings = await listBookings({
      date: searchParams.get("date") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      service: searchParams.get("service") ?? undefined,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[api/admin/bookings]", error);
    return NextResponse.json(
      { error: "Kunde inte hämta bokningar." },
      { status: 500 },
    );
  }
}
