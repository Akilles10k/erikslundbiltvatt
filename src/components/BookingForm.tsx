"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { SITE } from "@/data/site";
import { type BookingEmailPayload } from "@/lib/booking-message";
import {
  isValidCustomerName,
  isValidEmail,
  isValidPhone,
  isValidRegistration,
  sanitizeCustomerName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeRegistration,
} from "@/lib/booking-validation";
import {
  sendBookingToEmail,
  WEB3FORMS_NOT_CONFIGURED,
} from "@/lib/send-booking-email";

const TOTAL_STEPS = 5;
const CAR_TYPES = ["SUV", "Mellan"] as const;

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 17) slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
})();

type CarType = (typeof CAR_TYPES)[number];

type BookingData = {
  customerName: string;
  registration: string;
  email: string;
  phone: string;
  carType: CarType | "";
  date: Date | null;
  time: string;
};

const initialData: BookingData = {
  customerName: "",
  registration: "",
  email: "",
  phone: "",
  carType: "",
  date: null,
  time: "",
};

function parsePriceKr(price: string): number | null {
  const match = price.match(/(\d[\d\s]*)\s*kr/i);
  if (!match) return null;
  return Number.parseInt(match[1].replace(/\s/g, ""), 10);
}

function formatDayShort(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthDays(year: number, month: number) {
  const days: Date[] = [];
  const cursor = new Date(year, month, 1);
  while (cursor.getMonth() === month) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const WEEKDAY_LABELS = ["mån", "tis", "ons", "tor", "fre", "lör", "sön"] as const;

function getMondayOffset(date: Date) {
  return (date.getDay() + 6) % 7;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatRegistrationDisplay(value: string) {
  const compact = sanitizeRegistration(value).replace(/\s/g, "");
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

type BookingFormProps = {
  variant?: "page" | "embedded";
  onClose?: () => void;
};

export default function BookingForm({ variant = "page", onClose }: BookingFormProps) {
  const embedded = variant === "embedded";
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthDays = useMemo(
    () => getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  );

  const leadingEmptyCells = useMemo(() => {
    if (monthDays.length === 0) return 0;
    return getMondayOffset(monthDays[0]);
  }, [monthDays]);

  const canGoPrevMonth = useMemo(() => {
    const now = new Date();
    return (
      viewMonth.getFullYear() > now.getFullYear() ||
      (viewMonth.getFullYear() === now.getFullYear() && viewMonth.getMonth() > now.getMonth())
    );
  }, [viewMonth]);

  const today = useMemo(() => startOfToday(), []);

  const monthLabel = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const cartTotal = useMemo(() => {
    return items.reduce((sum, { service, quantity }) => {
      const price = parsePriceKr(service.price);
      if (price === null) return sum;
      return sum + price * quantity;
    }, 0);
  }, [items]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return (
          isValidCustomerName(data.customerName) &&
          isValidRegistration(data.registration) &&
          isValidEmail(data.email) &&
          isValidPhone(data.phone)
        );
      case 2:
        return data.carType !== "";
      case 3:
        return data.date !== null;
      case 4:
        return data.time !== "";
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, data]);

  const update = <K extends keyof BookingData>(key: K, value: BookingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const submitBooking = async () => {
    if (!canContinue || submitting || !data.date) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: BookingEmailPayload = {
      customerName: sanitizeCustomerName(data.customerName),
      registration: formatRegistrationDisplay(data.registration),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      carType: data.carType,
      date: data.date.toISOString(),
      time: data.time,
      services: items.map(({ service, quantity }) => ({
        name: service.name,
        quantity,
        price: service.price,
      })),
      total: cartTotal > 0 ? `${cartTotal} kr` : "Enligt offert",
    };

    try {
      await sendBookingToEmail(payload);
      clearCart();
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === WEB3FORMS_NOT_CONFIGURED) {
        setSubmitError(
          "Bokningsmejl är inte aktiverat. Saknar NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.",
        );
      } else {
        setSubmitError(
          message && message.length < 180
            ? message
            : "Kunde inte skicka bokningen. Försök igen eller ring oss.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (!canContinue || submitting) return;
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else void submitBooking();
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const shiftMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const cardClass = embedded
    ? "booking-form-card booking-form-card--embedded"
    : "booking-form-card";

  const successContent = (
    <div
      className={`booking-success-overlay ${embedded ? "booking-success-overlay--embedded" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="booking-success-overlay-inner">
        <p className="booking-success-overlay-text">
          Tack för din bokning! Boknings bekräftelsen kommer på mejl.
        </p>
        {embedded ? (
          <button
            type="button"
            className="booking-form-btn booking-form-btn--primary booking-form-btn--full"
            onClick={onClose}
          >
            Stäng
          </button>
        ) : (
          <Link href="/" className="booking-form-btn booking-form-btn--primary booking-form-btn--full">
            Till startsidan
          </Link>
        )}
      </div>
    </div>
  );

  if (submitted) {
    return embedded ? successContent : <main className="booking-page">{successContent}</main>;
  }

  const formContent = (
    <div className={cardClass}>
      <div className="booking-form-header">
        <h1 className="booking-form-title">Boka tid</h1>
        {embedded ? (
          <button type="button" className="booking-form-close" onClick={onClose} aria-label="Stäng">
            ×
          </button>
        ) : (
          <Link href="/" className="booking-form-close" aria-label="Stäng">
            ×
          </Link>
        )}
      </div>

        <div className="booking-form-progress" aria-hidden>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`booking-form-progress-seg ${i < step ? "booking-form-progress-seg--active" : ""}`}
            />
          ))}
        </div>
        <p className="booking-form-step-label">
          Steg {step} av {TOTAL_STEPS}
        </p>

        <div className="booking-form-body">
          {step === 1 && (
            <>
              <label className="booking-form-field">
                <span className="booking-form-label">Namn</span>
                <input
                  type="text"
                  className={`booking-form-input${data.customerName && !isValidCustomerName(data.customerName) ? " booking-form-input--invalid" : ""}`}
                  placeholder="För- och efternamn"
                  value={data.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  onBlur={() => update("customerName", sanitizeCustomerName(data.customerName))}
                  autoComplete="name"
                  maxLength={80}
                  aria-invalid={data.customerName.length > 0 && !isValidCustomerName(data.customerName)}
                />
                {data.customerName.length > 0 && !isValidCustomerName(data.customerName) && (
                  <span className="booking-form-field-hint">Ange ditt namn (minst 2 tecken).</span>
                )}
              </label>
              <label className="booking-form-field">
                <span className="booking-form-label">Registreringsnummer</span>
                <input
                  type="text"
                  className={`booking-form-input${data.registration && !isValidRegistration(data.registration) ? " booking-form-input--invalid" : ""}`}
                  placeholder="ABC 123"
                  value={data.registration}
                  onChange={(e) => update("registration", formatRegistrationDisplay(e.target.value))}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={8}
                  inputMode="text"
                  aria-invalid={data.registration.length > 0 && !isValidRegistration(data.registration)}
                />
                {data.registration.length > 0 && !isValidRegistration(data.registration) && (
                  <span className="booking-form-field-hint">Ange ett giltigt svenskt registreringsnummer, t.ex. ABC 123.</span>
                )}
              </label>
              <label className="booking-form-field">
                <span className="booking-form-label">E-post</span>
                <input
                  type="email"
                  className={`booking-form-input${data.email && !isValidEmail(data.email) ? " booking-form-input--invalid" : ""}`}
                  placeholder="namn@example.com"
                  value={data.email}
                  onChange={(e) => update("email", sanitizeEmail(e.target.value))}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={data.email.length > 0 && !isValidEmail(data.email)}
                />
                {data.email.length > 0 && !isValidEmail(data.email) && (
                  <span className="booking-form-field-hint">Ange en giltig e-postadress.</span>
                )}
              </label>
              <label className="booking-form-field">
                <span className="booking-form-label">Telefon</span>
                <input
                  type="tel"
                  className={`booking-form-input${data.phone && !isValidPhone(data.phone) ? " booking-form-input--invalid" : ""}`}
                  placeholder="070 123 45 67"
                  value={data.phone}
                  onChange={(e) => update("phone", sanitizePhone(e.target.value))}
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={18}
                  aria-invalid={data.phone.length > 0 && !isValidPhone(data.phone)}
                />
                {data.phone.length > 0 && !isValidPhone(data.phone) && (
                  <span className="booking-form-field-hint">Ange ett svenskt telefonnummer, t.ex. 070 123 45 67.</span>
                )}
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <p className="booking-form-section-title">Välj biltyp</p>
              <div className="booking-form-options">
                {CAR_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`booking-form-option ${data.carType === type ? "booking-form-option--selected" : ""}`}
                    onClick={() => update("carType", type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="booking-form-section-title">Välj datum</p>
              <div className="booking-form-calendar-wrap">
                <div className="booking-form-month-nav">
                  <button
                    type="button"
                    className="booking-form-month-btn booking-form-month-btn--prev"
                    onClick={() => shiftMonth(-1)}
                    disabled={!canGoPrevMonth}
                    aria-label="Föregående månad"
                  >
                    ‹
                  </button>
                  <span className="booking-form-month-label">{monthLabel}</span>
                  <button
                    type="button"
                    className="booking-form-month-btn booking-form-month-btn--next"
                    onClick={() => shiftMonth(1)}
                    aria-label="Nästa månad"
                  >
                    ›
                  </button>
                </div>
                <div className="booking-form-calendar-weekdays" aria-hidden>
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label} className="booking-form-calendar-weekday">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="booking-form-calendar-grid" role="grid" aria-label="Kalender">
                  {Array.from({ length: leadingEmptyCells }, (_, i) => (
                    <span key={`empty-${i}`} className="booking-form-calendar-cell booking-form-calendar-cell--empty" />
                  ))}
                  {monthDays.map((day) => {
                    const isSunday = day.getDay() === 0;
                    const isPast = day < today;
                    const isToday = day.toDateString() === today.toDateString();
                    const isSelected = data.date?.toDateString() === day.toDateString();
                    const unavailable = isSunday || isPast;

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        role="gridcell"
                        disabled={unavailable}
                        aria-label={
                          isSunday
                            ? `${day.getDate()} — stängt`
                            : `${day.getDate()} ${monthLabel}`
                        }
                        aria-selected={isSelected}
                        className={[
                          "booking-form-calendar-day",
                          isSelected && "booking-form-calendar-day--selected",
                          isToday && !isSelected && "booking-form-calendar-day--today",
                          isSunday && "booking-form-calendar-day--closed",
                          isPast && !isSunday && "booking-form-calendar-day--past",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => update("date", day)}
                      >
                        <span className="booking-form-calendar-day-num">{day.getDate()}</span>
                        {isSunday && (
                          <span className="booking-form-calendar-day-closed">Stängt</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="booking-form-section-title">Välj tid</p>
              <div className="booking-form-times">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`booking-form-time ${data.time === slot ? "booking-form-time--selected" : ""}`}
                    onClick={() => update("time", slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <p className="booking-form-section-title">Bekräfta din bokning</p>
              <div className="booking-form-summary">
                <dl className="booking-form-summary-list">
                  <div>
                    <dt>Namn</dt>
                    <dd>{data.customerName}</dd>
                  </div>
                  <div>
                    <dt>Registreringsnummer</dt>
                    <dd>{data.registration}</dd>
                  </div>
                  <div>
                    <dt>Biltyp</dt>
                    <dd>{data.carType}</dd>
                  </div>
                  <div>
                    <dt>Datum</dt>
                    <dd>{data.date ? formatDayShort(data.date) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Tid</dt>
                    <dd>{data.time}</dd>
                  </div>
                  <div>
                    <dt>E-post</dt>
                    <dd>{data.email}</dd>
                  </div>
                  <div>
                    <dt>Telefon</dt>
                    <dd>{data.phone}</dd>
                  </div>
                </dl>

                {items.length > 0 && (
                  <div className="booking-form-summary-services">
                    <p className="booking-form-summary-services-title">Valda tjänster</p>
                    <ul>
                      {items.map(({ service, quantity }) => (
                        <li key={service.id}>
                          {quantity > 1 ? `${quantity}× ` : ""}
                          {service.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="booking-form-summary-total">
                  <div className="booking-form-summary-row">
                    <span>Totalt</span>
                    <span>{cartTotal > 0 ? `${cartTotal} kr` : "Enligt offert"}</span>
                  </div>
                  <div className="booking-form-summary-row booking-form-summary-row--pay">
                    <span>Totalt att betala</span>
                    <strong>{cartTotal > 0 ? `${cartTotal} kr` : "Enligt offert"}</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {submitError && (
          <p className="booking-form-error" role="alert">
            {submitError}{" "}
            <a href={SITE.phoneHref} className="booking-form-error-link">
              {SITE.phone}
            </a>
          </p>
        )}

        <div className={`booking-form-footer ${step === 1 ? "booking-form-footer--single" : ""}`}>
          {step > 1 && (
            <button
              type="button"
              className="booking-form-btn booking-form-btn--back"
              onClick={goBack}
              disabled={submitting}
            >
              Tillbaka
            </button>
          )}
          <button
            type="button"
            className="booking-form-btn booking-form-btn--primary"
            disabled={!canContinue || submitting}
            onClick={goNext}
          >
            {submitting ? "Skickar…" : step === TOTAL_STEPS ? "Fortsätt" : "Nästa"}
          </button>
        </div>
      </div>
  );

  return embedded ? formContent : <main className="booking-page">{formContent}</main>;
}
