import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "erikslund_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const RATE_WINDOW_MS = 1000 * 60 * 15;
const RATE_MAX_ATTEMPTS = 8;

type RateBucket = { count: number; resetAt: number };
const loginAttempts = new Map<string, RateBucket>();

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || "";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || "";
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function encodeSession(expiresAt: number) {
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token: string): boolean {
  const secret = sessionSecret();
  if (!secret || !token.includes(".")) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminAuthConfigured() {
  return Boolean(adminPassword() && sessionSecret());
}

export function checkLoginRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const key = ip || "unknown";
  const bucket = loginAttempts.get(key);

  if (!bucket || bucket.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }

  if (bucket.count >= RATE_MAX_ATTEMPTS) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export function resetLoginRateLimit(ip: string) {
  loginAttempts.delete(ip || "unknown");
}

export function verifyAdminPassword(password: string) {
  const expected = adminPassword();
  if (!expected || !password) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still do a compare against itself to keep timing flatter for wrong lengths.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function createSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function clearSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function mintAdminSessionToken() {
  return encodeSession(Date.now() + SESSION_TTL_MS);
}

export async function getAdminSessionToken() {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? "";
}

export async function isAdminAuthenticated() {
  if (!isAdminAuthConfigured()) return false;
  const token = await getAdminSessionToken();
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  if (!isAdminAuthConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin är inte konfigurerad.", code: "ADMIN_NOT_CONFIGURED" },
        { status: 503 },
      ),
    };
  }

  if (!(await isAdminAuthenticated())) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Ej inloggad.", code: "UNAUTHORIZED" },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
