"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CAMPAIGN, SITE } from "@/data/site";
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

const DISMISS_KEY = "glansig-offer-popup-dismissed";
const CAR_TYPES = ["Mellan", "SUV"] as const;
const WEEKDAY_LABELS = ["mån", "tis", "ons", "tor", "fre", "lör", "sön"] as const;

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 17) slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
})();

function formatRegistrationDisplay(value: string) {
  const compact = sanitizeRegistration(value).replace(/\s/g, "");
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

function formatIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

function slotsForDate(date: Date | null) {
  if (date?.getDay() === 6) {
    return TIME_SLOTS.filter((slot) => slot >= "10:00");
  }
  return TIME_SLOTS;
}

export default function OfferPopup() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registration, setRegistration] = useState("");
  const [carType, setCarType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const earliestDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const monthDays = useMemo(
    () => getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth],
  );

  const leadingEmpty = monthDays.length === 0 ? 0 : (monthDays[0].getDay() + 6) % 7;
  const canGoPrev =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() &&
      viewMonth.getMonth() > today.getMonth());
  const monthLabel = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);
  const availableTimes = slotsForDate(selectedDate);

  useEffect(() => {
    if (!CAMPAIGN.active) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const timer = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const canSubmit =
    isValidCustomerName(name) &&
    isValidPhone(phone) &&
    isValidEmail(email) &&
    isValidRegistration(registration) &&
    carType !== "" &&
    selectedDate !== null &&
    selectedDate >= earliestDate &&
    time !== "" &&
    !submitting;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !selectedDate) return;

    setSubmitting(true);
    setError(null);
    try {
      await sendBookingToEmail({
        customerName: sanitizeCustomerName(name),
        phone: sanitizePhone(phone),
        email: sanitizeEmail(email),
        registration: formatRegistrationDisplay(registration),
        carType,
        date: formatIsoDate(selectedDate),
        time,
        services: [
          {
            name: "Helrekond – 50% kampanj",
            quantity: 1,
            price: CAMPAIGN.campaignPrice,
          },
        ],
        total: CAMPAIGN.campaignPrice,
      });
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* ignore */
      }
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === WEB3FORMS_NOT_CONFIGURED) {
        setError("Kunde inte skicka bokningen. Försök igen eller ring oss.");
      } else {
        setError(
          message && message.length < 180
            ? message
            : "Kunde inte boka tiden. Försök igen eller ring oss.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="offer-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-popup-title"
    >
      <button
        type="button"
        className="offer-popup-backdrop"
        aria-label="Stäng"
        onClick={dismiss}
      />
      <div className="offer-popup-panel">
        <button
          type="button"
          className="offer-popup-close"
          onClick={dismiss}
          aria-label="Stäng"
        >
          ×
        </button>

        {success && selectedDate ? (
          <div className="offer-popup-success" role="status">
            <h2 id="offer-popup-title" className="offer-popup-title">
              <span className="offer-popup-title-main">Tiden är bokad</span>
            </h2>
            <p className="offer-popup-desc">
              {new Intl.DateTimeFormat("sv-SE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(selectedDate)}{" "}
              kl. {time}. En bekräftelse skickas till {sanitizeEmail(email)}.
            </p>
            <p className="offer-popup-tag">
              Helrekond · {CAMPAIGN.campaignPrice}
            </p>
            <button type="button" className="offer-popup-submit" onClick={dismiss}>
              <span className="offer-popup-submit-main">Stäng</span>
            </button>
          </div>
        ) : (
          <>
            <div className="offer-popup-hero">
              <h2 id="offer-popup-title" className="offer-popup-title">
                <span className="offer-popup-title-accent">{CAMPAIGN.title}</span>
                <span className="offer-popup-title-main">{CAMPAIGN.subtitle}</span>
              </h2>
              <p className="offer-popup-desc">{CAMPAIGN.description}</p>
              <p className="offer-popup-tag">Tidsbegränsat nykundserbjudande</p>
            </div>

            <form className="offer-popup-card" onSubmit={onSubmit} noValidate>
              <label className="offer-popup-field">
                <span className="offer-popup-label">
                  För- & Efternamn <span aria-hidden>*</span>
                </span>
                <input
                  className="offer-popup-input"
                  type="text"
                  name="name"
                  placeholder="För- & Efternamn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setName(sanitizeCustomerName(name))}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="offer-popup-field">
                <span className="offer-popup-label">
                  Telefonnummer <span aria-hidden>*</span>
                </span>
                <input
                  className="offer-popup-input"
                  type="tel"
                  name="phone"
                  placeholder="Telefonnummer"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </label>

              <label className="offer-popup-field">
                <span className="offer-popup-label">
                  Mejladress <span aria-hidden>*</span>
                </span>
                <div className="offer-popup-input-wrap">
                  <span className="offer-popup-input-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6.5h16v11H4v-11Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="m4.5 7 7.5 6 7.5-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    className="offer-popup-input offer-popup-input--icon"
                    type="email"
                    name="email"
                    placeholder="Mejladress"
                    value={email}
                    onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                </div>
              </label>

              <label className="offer-popup-field">
                <span className="offer-popup-label">
                  Registreringsnummer <span aria-hidden>*</span>
                </span>
                <input
                  className="offer-popup-input"
                  type="text"
                  name="registration"
                  placeholder="ABC 123"
                  value={registration}
                  onChange={(e) =>
                    setRegistration(formatRegistrationDisplay(e.target.value))
                  }
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={8}
                  required
                />
              </label>

              <fieldset className="offer-popup-field offer-popup-fieldset">
                <legend className="offer-popup-label">
                  Biltyp <span aria-hidden>*</span>
                </legend>
                <div className="offer-popup-choices">
                  {CAR_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`offer-popup-choice ${
                        carType === type ? "offer-popup-choice--selected" : ""
                      }`}
                      aria-pressed={carType === type}
                      onClick={() => setCarType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="offer-popup-field offer-popup-fieldset">
                <legend className="offer-popup-label">
                  Datum <span aria-hidden>*</span>
                </legend>
                <p className="offer-popup-hint">
                  Bokning görs minst en dag i förväg. Söndagar är stängt.
                </p>
                <div className="booking-form-calendar-wrap offer-popup-calendar">
                  <div className="booking-form-month-nav">
                    <button
                      type="button"
                      className="booking-form-month-btn booking-form-month-btn--prev"
                      onClick={() =>
                        setViewMonth(
                          (prev) =>
                            new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                        )
                      }
                      disabled={!canGoPrev}
                      aria-label="Föregående månad"
                    >
                      ‹
                    </button>
                    <span className="booking-form-month-label">{monthLabel}</span>
                    <button
                      type="button"
                      className="booking-form-month-btn booking-form-month-btn--next"
                      onClick={() =>
                        setViewMonth(
                          (prev) =>
                            new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                        )
                      }
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
                  <div
                    className="booking-form-calendar-grid"
                    role="grid"
                    aria-label="Välj datum"
                  >
                    {Array.from({ length: leadingEmpty }, (_, i) => (
                      <span
                        key={`empty-${i}`}
                        className="booking-form-calendar-cell booking-form-calendar-cell--empty"
                      />
                    ))}
                    {monthDays.map((day) => {
                      const isSunday = day.getDay() === 0;
                      const isPast = day < earliestDate;
                      const selected =
                        selectedDate?.toDateString() === day.toDateString();
                      const disabled = isSunday || isPast;
                      return (
                        <button
                          key={formatIsoDate(day)}
                          type="button"
                          role="gridcell"
                          disabled={disabled}
                          aria-label={
                            isSunday
                              ? `${day.getDate()} ${monthLabel}, stängt`
                              : `${day.getDate()} ${monthLabel}`
                          }
                          aria-selected={selected}
                          className={[
                            "booking-form-calendar-day",
                            selected && "booking-form-calendar-day--selected",
                            isSunday && "booking-form-calendar-day--closed",
                            isPast && !isSunday && "booking-form-calendar-day--past",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => {
                            if (day < earliestDate || day.getDay() === 0) return;
                            setSelectedDate(day);
                            const slots = slotsForDate(day);
                            if (time && !slots.includes(time)) setTime("");
                          }}
                        >
                          <span className="booking-form-calendar-day-num">
                            {day.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </fieldset>

              {selectedDate && (
                <fieldset className="offer-popup-field offer-popup-fieldset">
                  <legend className="offer-popup-label">
                    Tid <span aria-hidden>*</span>
                  </legend>
                  <div className="booking-form-times offer-popup-times">
                    {availableTimes.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`booking-form-time ${
                          time === slot ? "booking-form-time--selected" : ""
                        }`}
                        aria-pressed={time === slot}
                        onClick={() => setTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {error && (
                <p className="offer-popup-error" role="alert">
                  {error}{" "}
                  <a href={SITE.phoneHref}>{SITE.phone}</a>
                </p>
              )}

              <button
                type="submit"
                className="offer-popup-submit"
                disabled={!canSubmit}
              >
                <span className="offer-popup-submit-main">
                  {submitting ? "Bokar…" : CAMPAIGN.ctaText}
                </span>
                <span className="offer-popup-submit-sub">
                  Just Nu fr. 1.495:- (Ord. fr. 3.000:-)
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
