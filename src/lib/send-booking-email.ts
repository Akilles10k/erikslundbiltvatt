import { SITE } from "@/data/site";
import {
  buildBookingEmailText,
  buildCustomerConfirmationText,
  buildWeb3FormsFields,
  type BookingEmailPayload,
} from "@/lib/booking-message";

export const WEB3FORMS_NOT_CONFIGURED = "WEB3FORMS_NOT_CONFIGURED";

function bookingSubject(payload: BookingEmailPayload) {
  const date = new Date(payload.date);
  const short = Number.isNaN(date.getTime())
    ? payload.date
    : new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(date);
  return `Ny bokning – ${payload.registration} · ${short} ${payload.time}`;
}

function formSubmitAjaxUrl() {
  const id = "formSubmitId" in SITE ? String(SITE.formSubmitId || "").trim() : "";
  if (id) return `https://formsubmit.co/ajax/${id}`;
  return `https://formsubmit.co/ajax/${encodeURIComponent(SITE.bookingEmail)}`;
}

/** Owner + customer via /api/booking (Gmail SMTP). */
async function sendViaSmtpApi(payload: BookingEmailPayload) {
  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      via?: string;
      code?: string;
    } | null;

    return Boolean(response.ok && result?.via === "smtp");
  } catch {
    return false;
  }
}

/** Owner inbox via Web3Forms. */
async function sendOwnerViaWeb3Forms(payload: BookingEmailPayload) {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) {
    throw new Error(WEB3FORMS_NOT_CONFIGURED);
  }

  const formData = new FormData();
  formData.append("access_key", accessKey);
  formData.append("subject", bookingSubject(payload));
  formData.append("from_name", `${SITE.name} – Bokning`);
  formData.append("name", payload.customerName);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("message", buildBookingEmailText(payload));

  for (const [key, value] of Object.entries(buildWeb3FormsFields(payload))) {
    formData.append(key, value);
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { success?: boolean; message?: string };
  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Kunde inte skicka bokningen.");
  }
}

/**
 * FormSubmit AJAX: owner notification + customer autoresponse in one request.
 * Throws if FormSubmit does not confirm success (no more silent iframe "ok").
 */
async function sendViaFormSubmitAjax(
  payload: BookingEmailPayload,
  options: { ownerMessage: boolean },
) {
  const fields = buildWeb3FormsFields(payload);
  const customerText = buildCustomerConfirmationText(payload);
  const body: Record<string, string> = {
    name: payload.customerName,
    email: payload.email,
    phone: payload.phone,
    _subject: options.ownerMessage
      ? bookingSubject(payload)
      : `Kundbekräftelse – ${payload.registration}`,
    _template: "table",
    _captcha: "false",
    _autoresponse: customerText,
    _replyto: options.ownerMessage ? payload.email : SITE.bookingEmail,
    ...fields,
    message: options.ownerMessage
      ? buildBookingEmailText(payload)
      : customerText,
  };

  const response = await fetch(formSubmitAjaxUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as {
    success?: boolean | string;
    message?: string;
  } | null;

  const ok =
    response.ok &&
    (data?.success === true ||
      data?.success === "true" ||
      (typeof data?.message === "string" &&
        /sent|success|thank/i.test(data.message)));

  if (!ok) {
    throw new Error(
      data?.message && data.message.length < 180
        ? data.message
        : "Kunde inte skicka bekräftelsemejl. Kontrollera skräppost eller ring oss.",
    );
  }
}

/**
 * Prefer SMTP (owner + customer HTML).
 * Else: optional Web3Forms for owner + FormSubmit AJAX for customer confirmation
 * (and owner too when Web3Forms is missing).
 */
export async function sendBookingToEmail(payload: BookingEmailPayload): Promise<void> {
  if (await sendViaSmtpApi(payload)) return;

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
  if (accessKey) {
    await sendOwnerViaWeb3Forms(payload);
    await sendViaFormSubmitAjax(payload, { ownerMessage: false });
    return;
  }

  await sendViaFormSubmitAjax(payload, { ownerMessage: true });
}
