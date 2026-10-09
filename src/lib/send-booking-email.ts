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
 * Classic FormSubmit POST via hidden iframe (works without API keys).
 * Free auto-reply to the email field when `_autoresponse` is set.
 */
function postViaFormSubmit(values: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve();
      return;
    }

    const iframeName = `formsubmit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://formsubmit.co/${SITE.formSubmitId}`;
    form.target = iframeName;
    form.acceptCharset = "UTF-8";

    for (const [name, value] of Object.entries(values)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    const done = () => {
      window.clearTimeout(timer);
      form.remove();
      iframe.remove();
      resolve();
    };

    const timer = window.setTimeout(done, 4000);
    iframe.addEventListener("load", done, { once: true });
    document.body.appendChild(form);
    form.submit();
  });
}

/** Owner booking notification via FormSubmit (no API key). */
function sendOwnerViaFormSubmit(payload: BookingEmailPayload): Promise<void> {
  const fields = buildWeb3FormsFields(payload);
  return postViaFormSubmit({
    _subject: bookingSubject(payload),
    _template: "table",
    _replyto: payload.email,
    email: payload.email,
    name: payload.customerName,
    phone: payload.phone,
    ...fields,
    message: buildBookingEmailText(payload),
  });
}

/**
 * Customer confirmation via FormSubmit classic form POST (not /ajax/).
 * Free auto-reply to the email field. Requires one-time activation in owner inbox.
 */
function sendCustomerViaFormSubmit(payload: BookingEmailPayload): Promise<void> {
  const fields = buildWeb3FormsFields(payload);
  return postViaFormSubmit({
    _subject: `Kundbekräftelse – ${payload.registration}`,
    _template: "table",
    _autoresponse: buildCustomerConfirmationText(payload),
    _replyto: SITE.bookingEmail,
    email: payload.email,
    name: payload.customerName,
    ...fields,
    message: buildCustomerConfirmationText(payload),
  });
}

/**
 * Prefer SMTP (owner + customer).
 * Fallback: Web3Forms owner + FormSubmit customer (if key set).
 * Otherwise: FormSubmit only (no API keys required).
 */
export async function sendBookingToEmail(payload: BookingEmailPayload): Promise<void> {
  if (await sendViaSmtpApi(payload)) return;

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
  if (accessKey) {
    await sendOwnerViaWeb3Forms(payload);
    await sendCustomerViaFormSubmit(payload);
    return;
  }

  await sendOwnerViaFormSubmit(payload);
  await sendCustomerViaFormSubmit(payload);
}
