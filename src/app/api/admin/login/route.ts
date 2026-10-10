import { NextResponse } from "next/server";
import {
  checkLoginRateLimit,
  clientIp,
  createSessionCookieOptions,
  isAdminAuthConfigured,
  mintAdminSessionToken,
  resetLoginRateLimit,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json(
        {
          error: "Admin är inte konfigurerad. Sätt ADMIN_PASSWORD och ADMIN_SESSION_SECRET.",
          code: "ADMIN_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const ip = clientIp(request);
    const rate = checkLoginRateLimit(ip);
    if (!rate.ok) {
      return NextResponse.json(
        {
          error: "För många försök. Vänta en stund och försök igen.",
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      password?: unknown;
    } | null;
    const password = typeof body?.password === "string" ? body.password : "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Fel lösenord.", code: "INVALID" },
        { status: 401 },
      );
    }

    resetLoginRateLimit(ip);
    const token = mintAdminSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(createSessionCookieOptions(token));
    return response;
  } catch (error) {
    console.error("[api/admin/login]", error);
    return NextResponse.json(
      { error: "Kunde inte logga in." },
      { status: 500 },
    );
  }
}
