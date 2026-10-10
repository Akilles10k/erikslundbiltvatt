import { SITE } from "@/data/site";
import { createBooking } from "@/lib/bookings-db";
import {
  type BookingEmailPayload,
} from "@/lib/booking-message";
import {
  isValidBookingContact,
  isValidCustomerName,
  sanitizeCustomerName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeRegistration,
} from "@/lib/booking-validation";
import { sendBookingEmails } from "@/lib/send-booking-email-server";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

function formatRegistrationDisplay(value: string) {
  const compact = sanitizeRegistration(value).replace(/\s/g, "");
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

function isValidPayload(body: unknown): body is BookingEmailPayload & {
  source?: string;
  customerNotes?: string;
  requireAdvanceDay?: boolean;
} {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;
  return (
    typeof data.customerName === "string" &&
    isValidCustomerName(data.customerName) &&
    typeof data.registration === "string" &&
    typeof data.email === "string" &&
    typeof data.phone === "string" &&
    isValidBookingContact({
      customerName: data.customerName,
      registration: data.registration,
      email: data.email,
      phone: data.phone,
    }) &&
    typeof data.carType === "string" &&
    data.carType.length > 0 &&
    typeof data.date === "string" &&
    typeof data.time === "string" &&
    Array.isArray(data.services) &&
    typeof data.total === "string"
  );
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(
        {
          error: "Bokningsdatabasen är inte konfigurerad ännu.",
          code: "SUPABASE_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    if (!isValidPayload(body)) {
      return Response.json(
        { error: "Ogiltiga bokningsuppgifter.", code: "INVALID" },
        { status: 400 },
      );
    }

    const services = body.services
      .filter(
        (s): s is { name: string; quantity: number; price: string } =>
          Boolean(s) &&
          typeof s === "object" &&
          typeof (s as { name?: unknown }).name === "string",
      )
      .map((s) => ({
        name: String(s.name),
        quantity: Number(s.quantity) > 0 ? Number(s.quantity) : 1,
        price: typeof s.price === "string" ? s.price : "",
      }));

    const source =
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim()
        : "website";

    const requireAdvanceDay =
      body.requireAdvanceDay === true || source === "campaign";

    let booking;
    try {
      booking = await createBooking({
        customerName: sanitizeCustomerName(body.customerName),
        customerEmail: sanitizeEmail(body.email),
        customerPhone: sanitizePhone(body.phone),
        registrationNumber: formatRegistrationDisplay(body.registration),
        carType: body.carType,
        services,
        total: body.total,
        bookingDate: body.date,
        startTime: body.time,
        customerNotes:
          typeof body.customerNotes === "string" ? body.customerNotes : "",
        source,
        status: "confirmed",
        slotPolicy: { requireAdvanceDay },
      });
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      const message =
        error instanceof Error ? error.message : "Kunde inte spara bokningen.";

      if (code === "INVALID") {
        return Response.json({ error: message, code }, { status: 400 });
      }
      if (code === "SLOT_TAKEN") {
        return Response.json({ error: message, code }, { status: 409 });
      }

      throw error;
    }

    const emailPayload: BookingEmailPayload = {
      customerName: booking.customer_name,
      registration: booking.registration_number,
      email: booking.customer_email,
      phone: booking.customer_phone,
      carType: booking.car_type,
      date: booking.booking_date,
      time: booking.start_time,
      services: booking.services,
      total: booking.total,
    };

    const emailResult = await sendBookingEmails(emailPayload);

    return Response.json({
      ok: true,
      id: booking.id,
      emailVia: emailResult.via ?? "none",
      emailOk: emailResult.ok,
      ...(emailResult.ok
        ? {}
        : {
            emailWarning:
              "Bokningen är sparad, men bekräftelsemejlet kunde inte skickas. Ring oss vid behov: " +
              SITE.phone,
          }),
    });
  } catch (error) {
    console.error("[api/booking]", error);
    return Response.json(
      {
        error: "Kunde inte spara bokningen.",
        code: "SAVE_FAILED",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
