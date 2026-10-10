import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BookingSiteId } from "@/lib/site-id";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingServiceItem = {
  name: string;
  quantity: number;
  price: string;
};

export type BookingRow = {
  id: string;
  site_id: BookingSiteId;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  registration_number: string;
  car_type: string;
  service_type: string;
  services: BookingServiceItem[];
  total: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  customer_notes: string;
  source: string;
  created_at: string;
  updated_at: string;
};

let cached: SupabaseClient | null = null;

export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return { url, serviceRoleKey };
}

export function isSupabaseConfigured() {
  const { url, serviceRoleKey } = getSupabaseEnv();
  return Boolean(url && serviceRoleKey);
}

/** Server-only Supabase client. Never import this into client components. */
export function getSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  if (!cached) {
    cached = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cached;
}
