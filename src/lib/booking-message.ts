import { SITE } from "@/data/site";

export type BookingEmailPayload = {
  customerName: string;
  registration: string;
  email: string;
  phone: string;
  carType: string;
  date: string;
  time: string;
  services: { name: string; quantity: number; price: string }[];
  total: string;
};

const BRAND = "#9a231e";
const BRAND_DARK = "#7a1c18";
const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const LINE = "#ebebeb";
const SOFT = "#f7f7f7";
const SOFT_RED = "#faf4f3";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function servicesLines(payload: BookingEmailPayload) {
  if (payload.services.length === 0) return ["Inga tjänster valda"];
  return payload.services.map((service) => {
    const qty = service.quantity > 1 ? `${service.quantity}× ` : "";
    return `${qty}${service.name} — ${service.price}`;
  });
}

function servicesTextBlock(payload: BookingEmailPayload) {
  return servicesLines(payload)
    .map((line) => `  • ${line}`)
    .join("\n");
}

function servicesHtmlRows(payload: BookingEmailPayload) {
  if (payload.services.length === 0) {
    return `<tr><td colspan="2" style="padding:14px 18px;font-size:14px;color:${MUTED};">Inga tjänster valda</td></tr>`;
  }

  return payload.services
    .map((service, index) => {
      const qty =
        service.quantity > 1
          ? `<span style="display:inline-block;margin-right:6px;padding:2px 7px;border-radius:999px;background:${SOFT_RED};color:${BRAND};font-size:12px;font-weight:700;">${service.quantity}×</span>`
          : "";
      const bg = index % 2 === 0 ? "#ffffff" : SOFT;
      return `
        <tr style="background:${bg};">
          <td style="padding:14px 18px;font-size:15px;line-height:1.4;color:${INK};border-top:1px solid ${LINE};">
            ${qty}${escapeHtml(service.name)}
          </td>
          <td style="padding:14px 18px;font-size:15px;color:${MUTED};text-align:right;white-space:nowrap;border-top:1px solid ${LINE};">
            ${escapeHtml(service.price)}
          </td>
        </tr>`;
    })
    .join("");
}

function metaCard(label: string, value: string) {
  return `
    <td width="50%" valign="top" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};border-radius:10px;">
        <tr>
          <td style="padding:14px 16px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${label}</p>
            <p style="margin:0;font-size:16px;font-weight:700;line-height:1.35;color:${INK};">${escapeHtml(value)}</p>
          </td>
        </tr>
      </table>
    </td>`;
}

function contactRow(label: string, value: string, href?: string) {
  const content = href
    ? `<a href="${href}" style="color:${BRAND};text-decoration:none;font-weight:600;">${escapeHtml(value)}</a>`
    : `<span style="color:${INK};font-weight:600;">${escapeHtml(value)}</span>`;

  return `
    <tr>
      <td style="padding:12px 0;width:34%;font-size:14px;color:${MUTED};vertical-align:top;border-bottom:1px solid ${LINE};">${label}</td>
      <td style="padding:12px 0;font-size:15px;vertical-align:top;border-bottom:1px solid ${LINE};">${content}</td>
    </tr>`;
}

/** Owner-facing plain text (also used as Web3Forms message body). */
export function buildBookingEmailText(payload: BookingEmailPayload) {
  return [
    `Ny bokning från webbplatsen`,
    ``,
    `BIL & TID`,
    `Registreringsnummer  ${payload.registration}`,
    `Biltyp               ${payload.carType}`,
    `Datum                ${formatDateLabel(payload.date)}`,
    `Tid                  ${payload.time}`,
    ``,
    `KUND`,
    `Namn                 ${payload.customerName}`,
    `E-post               ${payload.email}`,
    `Telefon              ${payload.phone}`,
    ``,
    `TJÄNSTER`,
    ...servicesLines(payload).map((line) => `• ${line}`),
    ``,
    `TOTALT               ${payload.total}`,
    ``,
    `—`,
    `${SITE.name}`,
    SITE.address.full,
    SITE.phone,
  ].join("\n");
}

/** Customer-facing plain text (Web3Forms autoresponse). */
export function buildCustomerConfirmationText(payload: BookingEmailPayload) {
  return [
    `Hej ${payload.customerName}!`,
    ``,
    `Tack för din bokningsförfrågan hos ${SITE.name}.`,
    `Vi har tagit emot den och återkommer så snart vi kan.`,
    ``,
    `DIN BOKNING`,
    `Registreringsnummer  ${payload.registration}`,
    `Biltyp               ${payload.carType}`,
    `Datum                ${formatDateLabel(payload.date)}`,
    `Tid                  ${payload.time}`,
    ``,
    `VALDA TJÄNSTER`,
    ...servicesLines(payload).map((line) => `• ${line}`),
    ``,
    `Totalt               ${payload.total}`,
    ``,
    `Har du frågor? Ring oss på ${SITE.phone}`,
    `eller maila ${SITE.email}.`,
    ``,
    `Välkommen!`,
    `${SITE.name}`,
    SITE.address.full,
  ].join("\n");
}

function emailShell(options: {
  title: string;
  eyebrow: string;
  intro: string;
  body: string;
  footerNote?: string;
}) {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%);padding:28px 28px 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f7d4d1;">${escapeHtml(options.eyebrow)}</p>
              <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:700;color:#ffffff;">${escapeHtml(options.title)}</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#f7d4d1;">${escapeHtml(options.intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 22px 8px;">
              ${options.body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;background:${SOFT};border-top:1px solid ${LINE};">
              <p style="margin:0;font-size:13px;line-height:1.65;color:${MUTED};text-align:center;">
                <strong style="color:${INK};">${escapeHtml(SITE.name)}</strong><br />
                ${escapeHtml(SITE.address.full)}<br />
                <a href="${SITE.phoneHref}" style="color:${BRAND};text-decoration:none;font-weight:600;">${escapeHtml(SITE.phone)}</a>
                &nbsp;·&nbsp;
                <a href="mailto:${escapeHtml(SITE.email)}" style="color:${BRAND};text-decoration:none;">${escapeHtml(SITE.email)}</a>
              </p>
              ${
                options.footerNote
                  ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:${MUTED};text-align:center;">${escapeHtml(options.footerNote)}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBookingEmailHtml(payload: BookingEmailPayload) {
  const phoneHref = `tel:${payload.phone.replace(/\s/g, "")}`;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        ${metaCard("Registreringsnr", payload.registration)}
        ${metaCard("Biltyp", payload.carType)}
      </tr>
      <tr>
        ${metaCard("Datum", formatDateLabel(payload.date))}
        ${metaCard("Tid", payload.time)}
      </tr>
    </table>

    <p style="margin:24px 6px 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND};">Kund</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 6px;">
      ${contactRow("Namn", payload.customerName)}
      ${contactRow("E-post", payload.email, `mailto:${escapeHtml(payload.email)}`)}
      ${contactRow("Telefon", payload.phone, phoneHref)}
    </table>

    <p style="margin:28px 6px 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND};">Valda tjänster</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
      <tr style="background:${SOFT};">
        <th align="left" style="padding:12px 18px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Tjänst</th>
        <th align="right" style="padding:12px 18px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Pris</th>
      </tr>
      ${servicesHtmlRows(payload)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 16px;">
      <tr>
        <td style="padding:18px 20px;background:${SOFT_RED};border-radius:12px;border:1px solid #f0d9d7;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Totalt</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:700;color:${BRAND_DARK};">${escapeHtml(payload.total)}</p>
        </td>
      </tr>
    </table>
  `;

  return emailShell({
    title: "Ny bokningsförfrågan",
    eyebrow: SITE.name,
    intro: "En kund har skickat en bokning via webbplatsen. Svara direkt på mailet för att nå kunden.",
    body,
  });
}

export function buildCustomerConfirmationHtml(payload: BookingEmailPayload) {
  const body = `
    <p style="margin:20px 6px 0;font-size:15px;line-height:1.65;color:${INK};">
      Hej ${escapeHtml(payload.customerName)}! Vi har tagit emot din bokningsförfrågan och återkommer så snart vi kan med bekräftelse.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      <tr>
        ${metaCard("Registreringsnr", payload.registration)}
        ${metaCard("Biltyp", payload.carType)}
      </tr>
      <tr>
        ${metaCard("Datum", formatDateLabel(payload.date))}
        ${metaCard("Tid", payload.time)}
      </tr>
    </table>

    <p style="margin:28px 6px 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND};">Valda tjänster</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
      <tr style="background:${SOFT};">
        <th align="left" style="padding:12px 18px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Tjänst</th>
        <th align="right" style="padding:12px 18px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Pris</th>
      </tr>
      ${servicesHtmlRows(payload)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;">
      <tr>
        <td style="padding:18px 20px;background:${SOFT_RED};border-radius:12px;border:1px solid #f0d9d7;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Totalt</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:700;color:${BRAND_DARK};">${escapeHtml(payload.total)}</p>
        </td>
      </tr>
    </table>

    <p style="margin:8px 6px 16px;font-size:14px;line-height:1.6;color:${MUTED};">
      Frågor? Ring <a href="${SITE.phoneHref}" style="color:${BRAND};text-decoration:none;font-weight:600;">${escapeHtml(SITE.phone)}</a>
      eller maila <a href="mailto:${escapeHtml(SITE.email)}" style="color:${BRAND};text-decoration:none;">${escapeHtml(SITE.email)}</a>.
    </p>
  `;

  return emailShell({
    title: "Tack för din bokning!",
    eyebrow: SITE.name,
    intro: "Din förfrågan är mottagen.",
    body,
    footerNote: "Detta är en automatisk bekräftelse — svara gärna om något behöver ändras.",
  });
}

/** Structured fields for Web3Forms’ default email layout (clear Swedish labels). */
export function buildWeb3FormsFields(payload: BookingEmailPayload) {
  return {
    Namn: payload.customerName,
    Registreringsnummer: payload.registration,
    Biltyp: payload.carType,
    Datum: formatDateLabel(payload.date),
    Tid: payload.time,
    Telefon: payload.phone,
    Tjänster: servicesLines(payload).join("\n"),
    Totalt: payload.total,
  };
}
