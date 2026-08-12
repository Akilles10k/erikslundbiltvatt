import Link from "next/link";
import { SITE } from "@/data/site";

const infoCards = [
  {
    id: "email",
    label: "E-post",
    href: `mailto:${SITE.email}`,
    value: SITE.email,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "address",
    label: "Adress",
    href: SITE.address.mapsHref,
    value: SITE.address.full,
    external: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
] as const;

export default function ContactPageContent() {
  return (
    <main className="contact">
      <div className="contact-wrap">
        <header className="contact-page-head">
          <p className="contact-page-eyebrow">Hör av dig</p>
          <h1 className="contact-page-title">Kontakt</h1>
          <p className="contact-page-lead">
            Biltvätt, handtvätt och bilrekond i {SITE.city}. Ring, maila eller besök oss —
            vi hjälper dig boka rätt tid.
          </p>
        </header>

        <div className="contact-body">
          <div className="contact-info">
            <a href={SITE.phoneHref} className="contact-phone-card">
              <span className="contact-phone-card-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="contact-phone-card-label">Ring oss</span>
              <span className="contact-phone-card-number">{SITE.phone}</span>
              {SITE.phoneSecondary ? (
                <span className="contact-phone-card-alt">eller {SITE.phoneSecondary}</span>
              ) : null}
            </a>

            <div className="contact-card-grid">
              {infoCards.map((card) => (
                <a
                  key={card.id}
                  href={card.href}
                  className="contact-info-card"
                  {...("external" in card && card.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="contact-info-card-icon" aria-hidden>
                    {card.icon}
                  </span>
                  <span className="contact-info-card-label">{card.label}</span>
                  <span className="contact-info-card-value">{card.value}</span>
                </a>
              ))}

              <div className="contact-info-card contact-info-card--hours">
                <span className="contact-info-card-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="contact-info-card-label">Öppettider</span>
                <ul className="contact-hours-list">
                  {SITE.openingHours.map((row) => (
                    <li key={row.days}>
                      <span>{row.days}</span>
                      <span>{row.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="contact-page-actions">
                <Link href="/tjanster" className="contact-page-btn contact-page-btn--primary">
                  Boka online
              </Link>
              <Link href="/tjanster" className="contact-page-btn contact-page-btn--ghost">
                Se priser
              </Link>
            </div>
          </div>

          <section className="contact-map-block" aria-label="Karta">
            <div className="contact-map-block-frame">
              <iframe
                src={SITE.address.mapsEmbedHref}
                title={`Karta – ${SITE.name}, ${SITE.address.full}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
