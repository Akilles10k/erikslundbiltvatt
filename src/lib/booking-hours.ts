/** Shared opening hours + slot logic for Erikslund (matches site display + existing forms). */

export const WEEKDAY_LABELS = ["mån", "tis", "ons", "tor", "fre", "lör", "sön"] as const;

/** Base weekday slots 08:00–17:00 every 30 minutes (existing BookingForm). */
export const BASE_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 17) slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
})();

const SLOT_MINUTES = 30;

export function startOfTodayLocal(now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Earliest bookable calendar day for campaign popup / Eskilstuna-style admin greens. */
export function earliestAdvanceDate(now = new Date()) {
  const d = startOfTodayLocal(now);
  d.setDate(d.getDate() + 1);
  return d;
}

export function formatIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Normalize client date (YYYY-MM-DD or ISO) to YYYY-MM-DD in local calendar sense. */
export function normalizeBookingDate(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatIsoDate(parsed);
}

export function normalizeTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function endTimeForStart(startTime: string) {
  return addMinutesToTime(startTime, SLOT_MINUTES);
}

export function getMondayOffset(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function getMonthDays(year: number, month: number) {
  const days: Date[] = [];
  const cursor = new Date(year, month, 1);
  while (cursor.getMonth() === month) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Open Mon–Sat; closed Sundays (existing site rule). */
export function isOpenDay(date: Date) {
  return date.getDay() !== 0;
}

/** Slots for a calendar day before subtracting bookings / past times. */
export function slotsForOpenDay(date: Date): string[] {
  if (!isOpenDay(date)) return [];
  // Saturday opens 10:00 (site opening hours + OfferPopup).
  if (date.getDay() === 6) {
    return BASE_TIME_SLOTS.filter((slot) => slot >= "10:00");
  }
  return [...BASE_TIME_SLOTS];
}

function stockholmNowParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export type SlotPolicy = {
  /** If true, today is not bookable (campaign / Eskilstuna). Default false for main form. */
  requireAdvanceDay?: boolean;
};

/**
 * Available slots for a date before subtracting occupied bookings.
 * Filters past times when booking today (main form).
 */
export function availableSlotsForDate(
  date: Date,
  options: SlotPolicy & { now?: Date } = {},
): string[] {
  const now = options.now ?? new Date();
  const today = startOfTodayLocal(now);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  if (!isOpenDay(day)) return [];
  if (day < today) return [];
  if (options.requireAdvanceDay && day < earliestAdvanceDate(now)) return [];

  let slots = slotsForOpenDay(day);
  const iso = formatIsoDate(day);
  const stockholm = stockholmNowParts(now);

  if (iso === stockholm.date) {
    slots = slots.filter((slot) => slot > stockholm.time);
  }

  return slots;
}

export function isValidBookableSlot(
  dateStr: string,
  timeStr: string,
  options: SlotPolicy & { now?: Date } = {},
): { ok: true; date: string; time: string; endTime: string } | { ok: false; error: string } {
  const date = normalizeBookingDate(dateStr);
  const time = normalizeTime(timeStr);
  if (!date || !time) {
    return { ok: false, error: "Ogiltigt datum eller tid." };
  }

  const parsed = parseIsoDate(date);
  if (!parsed) return { ok: false, error: "Ogiltigt datum." };

  if (!isOpenDay(parsed)) {
    return { ok: false, error: "Vi har stängt på söndagar." };
  }

  const now = options.now ?? new Date();
  const today = startOfTodayLocal(now);
  const day = startOfTodayLocal(parsed);

  if (day < today) {
    return { ok: false, error: "Kan inte boka i det förflutna." };
  }

  if (options.requireAdvanceDay && day < earliestAdvanceDate(now)) {
    return { ok: false, error: "Bokning måste göras minst en dag i förväg." };
  }

  const allowed = availableSlotsForDate(parsed, options);
  if (!allowed.includes(time)) {
    if (day.getTime() === today.getTime() && slotsForOpenDay(parsed).includes(time)) {
      return { ok: false, error: "Den tiden har redan passerat." };
    }
    return { ok: false, error: "Tiden ligger utanför öppettiderna." };
  }

  return { ok: true, date, time, endTime: endTimeForStart(time) };
}
