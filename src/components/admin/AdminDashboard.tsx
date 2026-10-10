"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  availableSlotsForDate,
  formatIsoDate,
  getMondayOffset,
  getMonthDays,
  isOpenDay,
  startOfTodayLocal,
  WEEKDAY_LABELS,
} from "@/lib/booking-hours";
import type { BookingRow, BookingStatus } from "@/lib/supabase-admin";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Väntande",
  confirmed: "Bekräftad",
  completed: "Klar",
  cancelled: "Avbokad",
};

type Stats = {
  today: number;
  upcoming: number;
  monthTotal: number;
  availableDays: number;
};

function shortTime(value: string) {
  return value.slice(0, 5);
}

type AdminDashboardProps = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const today = useMemo(() => startOfTodayLocal(), []);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(() => formatIsoDate(today));
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [dayBookings, setDayBookings] = useState<BookingRow[]>([]);
  const [allBookings, setAllBookings] = useState<BookingRow[]>([]);
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"kalender" | "lista">("kalender");

  const monthDays = useMemo(
    () => getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth],
  );
  const leadingEmpty = monthDays.length ? getMondayOffset(monthDays[0]) : 0;
  const monthLabel = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const loadStats = useCallback(async () => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const response = await fetch(`/api/admin/stats?year=${year}&month=${month}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Kunde inte hämta statistik.");
    setStats(data.stats);
    setCounts(data.counts ?? {});
  }, [viewMonth]);

  const loadDay = useCallback(async (date: string) => {
    const response = await fetch(`/api/admin/bookings?date=${date}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Kunde inte hämta bokningar.");
    setDayBookings(data.bookings ?? []);
  }, []);

  const loadList = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (query.trim()) params.set("q", query.trim());
    if (serviceFilter.trim()) params.set("service", serviceFilter.trim());
    if (dateFilter.trim()) params.set("date", dateFilter.trim());
    const response = await fetch(`/api/admin/bookings?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Kunde inte hämta listan.");
    setAllBookings(data.bookings ?? []);
  }, [dateFilter, query, serviceFilter, statusFilter]);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadDay(selectedDate), loadList()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }, [loadDay, loadList, loadStats, selectedDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadStats();
      void loadDay(selectedDate);
      void loadList();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [loadDay, loadList, loadStats, selectedDate]);

  const daySlots = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00`);
    return availableSlotsForDate(date);
  }, [selectedDate]);

  const busySlots = useMemo(
    () =>
      new Set(
        dayBookings
          .filter((b) => b.status !== "cancelled")
          .map((b) => shortTime(b.start_time)),
      ),
    [dayBookings],
  );

  const patchBooking = async (id: string, body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kunde inte spara.");
      setSelected(data.booking);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (booking: BookingRow) => {
    if (
      !window.confirm(
        `Avboka ${booking.customer_name} ${shortTime(booking.start_time)}?`,
      )
    ) {
      return;
    }
    await patchBooking(booking.id, { status: "cancelled" });
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="admin-login-eyebrow">Glansig Bilvård · Erikslund</p>
          <h1 className="admin-page-title">Bokningsöversikt</h1>
        </div>
        <div className="admin-topbar-actions">
          <button
            type="button"
            className="admin-ghost-btn"
            onClick={() => void refresh()}
            disabled={loading}
          >
            Uppdatera
          </button>
          <button type="button" className="admin-ghost-btn" onClick={onLogout}>
            Logga ut
          </button>
        </div>
      </header>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <section className="admin-cards">
        <article className="admin-card">
          <p>Idag</p>
          <strong>{stats?.today ?? "–"}</strong>
        </article>
        <article className="admin-card">
          <p>Kommande</p>
          <strong>{stats?.upcoming ?? "–"}</strong>
        </article>
        <article className="admin-card">
          <p>Denna månad</p>
          <strong>{stats?.monthTotal ?? "–"}</strong>
        </article>
        <article className="admin-card">
          <p>Lediga dagar i mån</p>
          <strong>{stats?.availableDays ?? "–"}</strong>
        </article>
      </section>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "kalender" ? "admin-tab admin-tab--active" : "admin-tab"}
          onClick={() => setTab("kalender")}
        >
          Kalender
        </button>
        <button
          type="button"
          className={tab === "lista" ? "admin-tab admin-tab--active" : "admin-tab"}
          onClick={() => setTab("lista")}
        >
          Alla bokningar
        </button>
      </div>

      {tab === "kalender" ? (
        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-month-nav">
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() =>
                  setViewMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                  )
                }
              >
                ‹
              </button>
              <div className="admin-month-label">
                <strong>{monthLabel}</strong>
                <button
                  type="button"
                  className="admin-link-btn"
                  onClick={() => {
                    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    setSelectedDate(formatIsoDate(today));
                  }}
                >
                  Idag
                </button>
              </div>
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() =>
                  setViewMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                  )
                }
              >
                ›
              </button>
            </div>

            <div className="admin-legend">
              <span>
                <i className="admin-dot admin-dot--red" /> Bokningar
              </span>
              <span>
                <i className="admin-dot admin-dot--green" /> Ledig öppet dag
              </span>
              <span>
                <i className="admin-dot admin-dot--gray" /> Stängt / passerat
              </span>
              <span>
                <i className="admin-dot admin-dot--blue" /> Vald dag
              </span>
            </div>

            <div className="admin-cal-weekdays">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="admin-cal-grid">
              {Array.from({ length: leadingEmpty }, (_, i) => (
                <span key={`e-${i}`} className="admin-cal-empty" />
              ))}
              {monthDays.map((day) => {
                const iso = formatIsoDate(day);
                const count = counts[iso] ?? 0;
                const past = day < today;
                // Green = open + future/today with free slots and no bookings (Erikslund allows today).
                const green =
                  isOpenDay(day) &&
                  day >= today &&
                  availableSlotsForDate(day).length > 0 &&
                  count === 0;
                let tone: "gray" | "red" | "green" | "blue" = "gray";
                if (iso === selectedDate) tone = "blue";
                else if (count > 0) tone = "red";
                else if (green && !past) tone = "green";

                return (
                  <button
                    key={iso}
                    type="button"
                    className={`admin-cal-day admin-cal-day--${tone}`}
                    onClick={() => setSelectedDate(iso)}
                  >
                    <span>{day.getDate()}</span>
                    {count > 0 && <em>{count}</em>}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="admin-panel">
            <h2 className="admin-section-title">
              {new Intl.DateTimeFormat("sv-SE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date(`${selectedDate}T12:00:00`))}
            </h2>
            <p className="admin-muted">
              {dayBookings.filter((b) => b.status !== "cancelled").length} bokning(ar) ·{" "}
              {Math.max(0, daySlots.length - busySlots.size)} lediga tider
            </p>
            <div className="admin-slot-row">
              {daySlots.map((slot) => (
                <span
                  key={slot}
                  className={
                    busySlots.has(slot) ? "admin-slot admin-slot--busy" : "admin-slot"
                  }
                >
                  {slot}
                </span>
              ))}
              {daySlots.length === 0 && <span className="admin-muted">Stängt</span>}
            </div>
            <ul className="admin-booking-list">
              {dayBookings.length === 0 && (
                <li className="admin-muted">Inga bokningar denna dag.</li>
              )}
              {dayBookings.map((booking) => (
                <li key={booking.id}>
                  <button
                    type="button"
                    className="admin-booking-item"
                    onClick={() => setSelected(booking)}
                  >
                    <strong>
                      {shortTime(booking.start_time)} · {booking.customer_name}
                    </strong>
                    <span>
                      {booking.registration_number} · {booking.service_type} ·{" "}
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <section className="admin-panel">
          <div className="admin-filters">
            <input
              className="admin-input"
              placeholder="Sök namn eller regnr…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input
              className="admin-input"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filtrera datum"
            />
            <input
              className="admin-input"
              placeholder="Filtrera tjänst…"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            />
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Alla statusar</option>
              <option value="confirmed">Bekräftad</option>
              <option value="pending">Väntande</option>
              <option value="completed">Klar</option>
              <option value="cancelled">Avbokad</option>
            </select>
            <button
              type="button"
              className="admin-primary-btn"
              style={{ marginTop: 0, width: "auto" }}
              onClick={() => void loadList()}
            >
              Sök
            </button>
          </div>
          <ul className="admin-booking-list">
            {allBookings.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  className="admin-booking-item"
                  onClick={() => setSelected(booking)}
                >
                  <strong>
                    {booking.booking_date} {shortTime(booking.start_time)} ·{" "}
                    {booking.customer_name}
                  </strong>
                  <span>
                    {booking.registration_number} · {booking.service_type} ·{" "}
                    {STATUS_LABELS[booking.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selected && (
        <div className="admin-drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-head">
              <h2>Bokningsdetaljer</h2>
              <button
                type="button"
                className="admin-ghost-btn"
                onClick={() => setSelected(null)}
              >
                Stäng
              </button>
            </div>
            <dl className="admin-detail-list">
              <div>
                <dt>Namn</dt>
                <dd>{selected.customer_name}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>
                  <a href={`tel:${selected.customer_phone}`}>
                    {selected.customer_phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>E-post</dt>
                <dd>
                  <a href={`mailto:${selected.customer_email}`}>
                    {selected.customer_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Regnr</dt>
                <dd>{selected.registration_number}</dd>
              </div>
              <div>
                <dt>Biltyp</dt>
                <dd>{selected.car_type}</dd>
              </div>
              <div>
                <dt>Tjänst</dt>
                <dd>{selected.service_type}</dd>
              </div>
              <div>
                <dt>Datum</dt>
                <dd>{selected.booking_date}</dd>
              </div>
              <div>
                <dt>Tid</dt>
                <dd>{shortTime(selected.start_time)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{STATUS_LABELS[selected.status]}</dd>
              </div>
              <div>
                <dt>Totalt</dt>
                <dd>{selected.total || "—"}</dd>
              </div>
              <div>
                <dt>Källa</dt>
                <dd>{selected.source || "—"}</dd>
              </div>
              <div>
                <dt>Anteckning</dt>
                <dd>{selected.customer_notes || "—"}</dd>
              </div>
            </dl>

            <label className="admin-field">
              <span>Ändra status</span>
              <select
                className="admin-input"
                value={selected.status}
                disabled={saving}
                onChange={(e) =>
                  void patchBooking(selected.id, { status: e.target.value })
                }
              >
                <option value="confirmed">Bekräftad</option>
                <option value="pending">Väntande</option>
                <option value="completed">Klar</option>
                <option value="cancelled">Avbokad</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Omboka datum (YYYY-MM-DD)</span>
              <input
                className="admin-input"
                defaultValue={selected.booking_date}
                disabled={saving}
                onBlur={(e) => {
                  if (
                    e.target.value &&
                    e.target.value !== selected.booking_date
                  ) {
                    void patchBooking(selected.id, {
                      booking_date: e.target.value,
                      start_time: shortTime(selected.start_time),
                    });
                  }
                }}
              />
            </label>

            <label className="admin-field">
              <span>Omboka tid</span>
              <input
                className="admin-input"
                defaultValue={shortTime(selected.start_time)}
                disabled={saving}
                onBlur={(e) => {
                  if (
                    e.target.value &&
                    e.target.value !== shortTime(selected.start_time)
                  ) {
                    void patchBooking(selected.id, {
                      booking_date: selected.booking_date,
                      start_time: e.target.value,
                    });
                  }
                }}
              />
            </label>

            <div className="admin-drawer-actions">
              <button
                type="button"
                className="admin-primary-btn"
                disabled={saving || selected.status === "completed"}
                onClick={() =>
                  void patchBooking(selected.id, { status: "completed" })
                }
              >
                Markera som klar
              </button>
              <button
                type="button"
                className="admin-danger-btn"
                disabled={saving || selected.status === "cancelled"}
                onClick={() => void cancelBooking(selected)}
              >
                Avboka
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
