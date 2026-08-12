import { SITE } from "@/data/site";
import {
  buildBookingEmailHtml,
  buildBookingEmailText,
  buildCustomerConfirmationHtml,
  buildCustomerConfirmationText,
  type BookingEmailPayload,
} from "@/lib/booking-message";
import { isValidBookingContact, isValidCustomerName } from "@/lib/booking-validation";

function isValidPayload(body: unknown): body is BookingEmailPayload {
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

/** Sends owner order + customer confirmation via Gmail SMTP (free). */
async function sendBothViaSmtp(payload: BookingEmailPayload) {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return false;

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  const from = process.env.SMTP_FROM ?? `${SITE.name} <${user}>`;
  const ownerTo = process.env.BOOKING_OWNER_EMAIL ?? SITE.bookingEmail;

  await transporter.sendMail({
    from,
    to: ownerTo,
    replyTo: payload.email,
    subject: `Ny bokning – ${payload.registration} (${payload.customerName})`,
    text: buildBookingEmailText(payload),
    html: buildBookingEmailHtml(payload),
  });

  await transporter.sendMail({
    from,
    to: payload.email,
    replyTo: ownerTo,
    subject: `Bekräftelse – din bokning hos ${SITE.name}`,
    text: buildCustomerConfirmationText(payload),
    html: buildCustomerConfirmationHtml(payload),
  });

  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isValidPayload(body)) {
      return Response.json({ error: "Ogiltiga bokningsuppgifter.", code: "INVALID" }, { status: 400 });
    }

    if (await sendBothViaSmtp(body)) {
      return Response.json({ ok: true, via: "smtp" });
    }

    // No SMTP configured — client will use Web3Forms for the owner.
    return Response.json({ ok: false, code: "NO_SMTP" }, { status: 200 });
  } catch (error) {
    console.error("[api/booking]", error);
    return Response.json(
      {
        error: "Kunde inte skicka mejl via SMTP.",
        code: "SMTP_FAILED",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
