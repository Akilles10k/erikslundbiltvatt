import { SITE } from "@/data/site";
import {
  buildBookingEmailHtml,
  buildBookingEmailText,
  buildCustomerConfirmationHtml,
  buildCustomerConfirmationText,
  type BookingEmailPayload,
} from "@/lib/booking-message";

export type EmailSendResult = {
  ok: boolean;
  via?: "smtp" | "none";
  error?: string;
};

/** Sends owner order + customer confirmation via Gmail SMTP (server-side). */
export async function sendBookingEmails(
  payload: BookingEmailPayload,
): Promise<EmailSendResult> {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) {
    return { ok: false, via: "none", error: "SMTP saknas" };
  }

  try {
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

    return { ok: true, via: "smtp" };
  } catch (error) {
    console.error("[send-booking-email-server]", error);
    return {
      ok: false,
      via: "none",
      error: error instanceof Error ? error.message : "SMTP_FAILED",
    };
  }
}
