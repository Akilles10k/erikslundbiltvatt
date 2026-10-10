import {
  availableSlotsForDate,
  endTimeForStart,
  formatIsoDate,
  isOpenDay,
  isValidBookableSlot,
  normalizeTime,
  parseIsoDate,
  startOfTodayLocal,
  type SlotPolicy,
} from "@/lib/booking-hours";
import { getBookingSiteId } from "@/lib/site-id";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  type BookingRow,
  type BookingServiceItem,
  type BookingStatus,
} from "@/lib/supabase-admin";

export type CreateBookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  registrationNumber: string;
  carType: string;
  services: BookingServiceItem[];
  total: string;
  bookingDate: string;
  startTime: string;
  customerNotes?: string;
  source?: string;
  status?: BookingStatus;
  slotPolicy?: SlotPolicy;
};

function serviceTypeFromServices(services: BookingServiceItem[]) {
  if (!services.length) return "Ingen tjänst vald";
  return services
    .map((s) => (s.quantity > 1 ? `${s.quantity}× ${s.name}` : s.name))
    .join(", ");
}

function mapRow(row: Record<string, unknown>): BookingRow {
  const siteId = String(row.site_id ?? getBookingSiteId());
  return {
    id: String(row.id),
    site_id: siteId as BookingRow["site_id"],
    customer_name: String(row.customer_name ?? ""),
    customer_email: String(row.customer_email ?? ""),
    customer_phone: String(row.customer_phone ?? ""),
    registration_number: String(row.registration_number ?? ""),
    car_type: String(row.car_type ?? ""),
    service_type: String(row.service_type ?? ""),
    services: Array.isArray(row.services)
      ? (row.services as BookingServiceItem[])
      : [],
    total: String(row.total ?? ""),
    booking_date: String(row.booking_date ?? ""),
    start_time: String(row.start_time ?? "").slice(0, 5),
    end_time: String(row.end_time ?? "").slice(0, 5),
    status: row.status as BookingStatus,
    customer_notes: String(row.customer_notes ?? ""),
    source: String(row.source ?? "website"),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getBookedTimesForDate(date: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const siteId = getBookingSiteId();
  const { data, error } = await supabase
    .from("bookings")
    .select("start_time")
    .eq("site_id", siteId)
    .eq("booking_date", date)
    .neq("status", "cancelled");

  if (error) throw error;
  return (data ?? []).map((row) => String(row.start_time).slice(0, 5));
}

export async function getAvailabilityForDate(
  date: string,
  options: SlotPolicy = {},
) {
  const parsed = parseIsoDate(date);
  if (!parsed) {
    return { date, open: false, slots: [] as string[], booked: [] as string[] };
  }

  const candidateSlots = availableSlotsForDate(parsed, options);
  let booked: string[] = [];

  if (isSupabaseConfigured() && isOpenDay(parsed)) {
    booked = await getBookedTimesForDate(date);
  }

  const bookedSet = new Set(booked);
  const slots = candidateSlots.filter((slot) => !bookedSet.has(slot));
  const open = isOpenDay(parsed) && candidateSlots.length > 0;

  return {
    date,
    open,
    slots,
    booked,
  };
}

export async function createBooking(input: CreateBookingInput): Promise<BookingRow> {
  const slotCheck = isValidBookableSlot(input.bookingDate, input.startTime, input.slotPolicy);
  if (!slotCheck.ok) {
    throw Object.assign(new Error(slotCheck.error), { code: "INVALID" });
  }

  const availability = await getAvailabilityForDate(slotCheck.date, input.slotPolicy);
  if (!availability.slots.includes(slotCheck.time)) {
    throw Object.assign(new Error("Tiden är redan bokad. Välj en annan tid."), {
      code: "SLOT_TAKEN",
    });
  }

  const supabase = getSupabaseAdmin();
  const siteId = getBookingSiteId();
  const payload = {
    site_id: siteId,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    registration_number: input.registrationNumber,
    car_type: input.carType,
    service_type: serviceTypeFromServices(input.services),
    services: input.services,
    total: input.total,
    booking_date: slotCheck.date,
    start_time: slotCheck.time,
    end_time: slotCheck.endTime,
    status: input.status ?? "confirmed",
    customer_notes: input.customerNotes ?? "",
    source: input.source ?? "website",
  };

  const { data, error } = await supabase.from("bookings").insert(payload).select("*").single();

  if (error) {
    if (error.code === "23505") {
      throw Object.assign(new Error("Tiden är redan bokad. Välj en annan tid."), {
        code: "SLOT_TAKEN",
      });
    }
    throw error;
  }

  return mapRow(data as Record<string, unknown>);
}

export async function listBookings(filters: {
  date?: string;
  status?: string;
  q?: string;
  service?: string;
  limit?: number;
}): Promise<BookingRow[]> {
  const supabase = getSupabaseAdmin();
  const siteId = getBookingSiteId();
  let query = supabase
    .from("bookings")
    .select("*")
    .eq("site_id", siteId)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(filters.limit ?? 500);

  if (filters.date) query = query.eq("booking_date", filters.date);
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.service?.trim()) {
    query = query.ilike("service_type", `%${filters.service.trim()}%`);
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim().replace(/[%_]/g, "");
    query = query.or(
      `customer_name.ilike.%${q}%,registration_number.ilike.%${q}%,customer_email.ilike.%${q}%,customer_phone.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function getBookingById(id: string): Promise<BookingRow | null> {
  const supabase = getSupabaseAdmin();
  const siteId = getBookingSiteId();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export type BookingPatch = {
  status?: BookingStatus;
  booking_date?: string;
  start_time?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  registration_number?: string;
  car_type?: string;
  customer_notes?: string;
  total?: string;
  service_type?: string;
};

export async function updateBooking(id: string, patch: BookingPatch): Promise<BookingRow> {
  const existing = await getBookingById(id);
  if (!existing) {
    throw Object.assign(new Error("Bokningen hittades inte."), { code: "NOT_FOUND" });
  }

  const nextDate = patch.booking_date ?? existing.booking_date;
  const nextTime = patch.start_time
    ? normalizeTime(patch.start_time) ?? existing.start_time
    : existing.start_time;
  const nextStatus = patch.status ?? existing.status;

  const rescheduling =
    Boolean(patch.booking_date || patch.start_time) && nextStatus !== "cancelled";

  if (rescheduling) {
    const slotCheck = isValidBookableSlot(nextDate, nextTime, { requireAdvanceDay: false });
    if (!slotCheck.ok) {
      throw Object.assign(new Error(slotCheck.error), { code: "INVALID" });
    }

    const booked = await getBookedTimesForDate(slotCheck.date);
    const conflict = booked.some((t) => t === slotCheck.time);
    // Allow keeping the same slot on the same booking.
    if (
      conflict &&
      !(existing.booking_date === slotCheck.date && existing.start_time === slotCheck.time)
    ) {
      throw Object.assign(new Error("Tiden är redan bokad. Välj en annan tid."), {
        code: "SLOT_TAKEN",
      });
    }

    patch.booking_date = slotCheck.date;
    patch.start_time = slotCheck.time;
  }

  // Never allow site_id to be changed via patch (hard isolation).
  const updatePayload: Record<string, unknown> = { ...patch };
  delete updatePayload.site_id;
  if (patch.start_time || patch.booking_date) {
    const time = (patch.start_time as string | undefined) ?? existing.start_time;
    updatePayload.end_time = endTimeForStart(time);
  }

  const supabase = getSupabaseAdmin();
  const siteId = getBookingSiteId();
  const { data, error } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("site_id", siteId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw Object.assign(new Error("Tiden är redan bokad. Välj en annan tid."), {
        code: "SLOT_TAKEN",
      });
    }
    throw error;
  }

  return mapRow(data as Record<string, unknown>);
}

export async function getAdminStats(year: number, month: number) {
  const supabase = getSupabaseAdmin();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const from = formatIsoDate(monthStart);
  const to = formatIsoDate(monthEnd);
  const today = formatIsoDate(startOfTodayLocal());

  const siteId = getBookingSiteId();
  const { data, error } = await supabase
    .from("bookings")
    .select("booking_date, status, start_time")
    .eq("site_id", siteId)
    .gte("booking_date", from)
    .lte("booking_date", to)
    .neq("status", "cancelled");

  if (error) throw error;

  const rows = data ?? [];
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const date = String(row.booking_date);
    counts[date] = (counts[date] ?? 0) + 1;
  }

  const { count: upcomingCount, error: upcomingError } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)
    .gte("booking_date", today)
    .neq("status", "cancelled");

  if (upcomingError) throw upcomingError;

  const todayCount = counts[today] ?? 0;
  const monthTotal = rows.length;

  let availableDays = 0;
  const cursor = new Date(year, month, 1);
  const now = startOfTodayLocal();
  while (cursor.getMonth() === month) {
    const day = new Date(cursor);
    day.setHours(0, 0, 0, 0);
    const iso = formatIsoDate(day);
    const isFutureOpen =
      isOpenDay(day) && day >= now && availableSlotsForDate(day).length > 0;
    if (isFutureOpen && !(counts[iso] > 0)) {
      availableDays += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    stats: {
      today: todayCount,
      upcoming: upcomingCount ?? 0,
      monthTotal,
      availableDays,
    },
    counts,
  };
}
