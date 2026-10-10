"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CAMPAIGN, CAMPAIGNS, SITE, type OfferCampaign } from "@/data/site";
import {
  availableSlotsForDate,
  earliestAdvanceDate,
  formatIsoDate,
  getMonthDays,
  startOfTodayLocal,
  WEEKDAY_LABELS,
} from "@/lib/booking-hours";
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
  submitBooking,
  SUPABASE_NOT_CONFIGURED,
} from "@/lib/submit-booking";

const DISMISS_KEY = "glansig-offer-popup-v2";
const CAR_TYPES = ["Mellan", "SUV"] as const;

type Step = "choose" | "book";

function formatRegistrationDisplay(value: string) {
  const compact = sanitizeRegistration(value).replace(/\s/g, "");
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

export default function OfferPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
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
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const backRef = useRef<HTMLButtonElement>(null);

  const selectedCampaign: OfferCampaign | null =
    CAMPAIGNS.find((c) => c.id === selectedCampaignId) ?? null;

  const today = useMemo(() => startOfTodayLocal(), []);
  const earliestDate = useMemo(() => earliestAdvanceDate(today), [today]);

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

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      return;
    }
    const iso = formatIsoDate(selectedDate);
    let cancelled = false;
    fetch(`/api/availability?date=${iso}&advance=1`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        const slots: string[] =
          Array.isArray(result.slots) && result.slots.length
            ? result.slots
            : availableSlotsForDate(selectedDate, { requireAdvanceDay: true });
        setAvailableTimes(slots);
        setTime((prev) => (prev && !slots.includes(prev) ? "" : prev));
      })
      .catch(() => {
        if (cancelled) return;
        setAvailableTimes(
          availableSlotsForDate(selectedDate, { requireAdvanceDay: true }),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

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

  useEffect(() => {
    if (step === "book" && selectedCampaign) {
      backRef.current?.focus();
    }
  }, [step, selectedCampaign]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const goToChoose = () => {
    setStep("choose");
    setError(null);
  };

  const goToBook = (campaign: OfferCampaign) => {
    setSelectedCampaignId(campaign.id);
    setStep("book");
    setError(null);
  };

  const canSubmit =
    selectedCampaign !== null &&
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
    if (!canSubmit || !selectedDate || !selectedCampaign) return;

    setSubmitting(true);
    setError(null);
    try {
      await submitBooking({
        customerName: sanitizeCustomerName(name),
        phone: sanitizePhone(phone),
        email: sanitizeEmail(email),
        registration: formatRegistrationDisplay(registration),
        carType,
        date: formatIsoDate(selectedDate),
        time,
        services: [
          {
            name: `${selectedCampaign.bookingName} – kampanj`,
            quantity: 1,
            price: `${selectedCampaign.price} (ord. ${selectedCampaign.originalPrice})`,
          },
        ],
        total: selectedCampaign.price,
        source: "campaign",
        requireAdvanceDay: true,
      });
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* ignore */
      }
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === SUPABASE_NOT_CONFIGURED) {
        setError(
          "Bokningsdatabasen är inte konfigurerad ännu. Kontakta oss per telefon.",
        );
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

  const chooseMode = step === "choose" && !success;

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
      <div
        className={`offer-popup-panel${chooseMode ? " offer-popup-panel--choose" : ""}`}
      >
        <button
          type="button"
          className="offer-popup-close"
          onClick={dismiss}
          aria-label="Stäng"
        >
          ×
        </button>

        {success && selectedDate && selectedCampaign ? (
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
              {selectedCampaign.bookingName} · {selectedCampaign.price}
            </p>
            <button type="button" className="offer-popup-submit" onClick={dismiss}>
              <span className="offer-popup-submit-main">Stäng</span>
            </button>
          </div>
        ) : step === "book" && selectedCampaign ? (
          <>
            <div className="offer-popup-hero">
              <button
                ref={backRef}
                type="button"
                className="offer-popup-back"
                onClick={goToChoose}
              >
                Tillbaka
              </button>
              <h2 id="offer-popup-title" className="offer-popup-title">
                <span className="offer-popup-title-accent">
                  {selectedCampaign.kicker}
                </span>
                <span className="offer-popup-title-main">
                  {selectedCampaign.headline}
                </span>
              </h2>
              <p className="offer-popup-desc">{selectedCampaign.description}</p>
              <p className="offer-popup-prices">
                <span className="offer-popup-price-old">
                  {selectedCampaign.originalPrice}
                </span>
                <span className="offer-popup-price-new">
                  {selectedCampaign.price}
                </span>
              </p>
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
                  {submitting ? "Bokar…" : "Hämta Erbjudandet"}
                </span>
                <span className="offer-popup-submit-sub">
                  Just nu {selectedCampaign.price} (ord.{" "}
                  <span className="offer-popup-submit-ord">
                    {selectedCampaign.originalPrice}
                  </span>
                  )
                </span>
              </button>
            </form>
          </>
        ) : (
          <div className="offer-popup-choose">
            <h2 id="offer-popup-title" className="offer-popup-choose-title">
              Aktuella erbjudanden
            </h2>
            <div className="offer-popup-campaigns">
              {CAMPAIGNS.map((campaign) => (
                <article key={campaign.id} className="offer-popup-campaign">
                  <Image
                    src={campaign.image}
                    alt={campaign.imageAlt}
                    width={819}
                    height={1024}
                    className="offer-popup-campaign-image"
                    priority
                    sizes="(max-width: 700px) 45vw, 320px"
                  />
                  <button
                    type="button"
                    className="offer-popup-book"
                    aria-label={`Boka nu, ${campaign.bookingName}`}
                    onClick={() => goToBook(campaign)}
                  >
                    BOKA NU
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
