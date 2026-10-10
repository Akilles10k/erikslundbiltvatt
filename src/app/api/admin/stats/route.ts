import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/bookings-db";
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
    const now = new Date();
    const year = Number(searchParams.get("year") ?? now.getFullYear());
    const month = Number(searchParams.get("month") ?? now.getMonth());

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 0 ||
      month > 11
    ) {
      return NextResponse.json({ error: "Ogiltig månad." }, { status: 400 });
    }

    const result = await getAdminStats(year, month);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/admin/stats]", error);
    return NextResponse.json(
      { error: "Kunde inte hämta statistik." },
      { status: 500 },
    );
  }
}
