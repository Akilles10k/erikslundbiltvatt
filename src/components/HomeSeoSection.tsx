import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/seo";
import { SITE } from "@/data/site";

const services = [
  {
    num: "01",
    title: "Biltvätt & handtvätt",
    text: "Skinande resultat utan att skada lacken – utvändig, invändig eller komplett tvätt.",
    href: "/tjanster",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M3 12h2l2-7h10l2 7h2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Bilrekond & lackskydd",
    text: "Polering, lackförsegling och rekondpaket som återställer glans och skyddar lacken.",
    href: "/tjanster",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.5 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Boka enkelt online",
    text: `Välj tjänster, boka tid och besök oss på ${SITE.address.street}.`,
    href: "/tjanster",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HomeSeoSection() {
  return (
    <section className="home-info" aria-labelledby="home-info-heading">
      <div className="home-info-inner">
        <div className="home-info-top">
          <header className="home-info-header">
            <p className="home-info-eyebrow">Bilvård i {SITE.city}</p>
            <h2 id="home-info-heading" className="home-info-title">
              Biltvätt och bilrekond i Erikslund
            </h2>
            <p className="home-info-lead">
              Glansig Bilvård erbjuder professionell biltvätt, handtvätt och bilrekond –
              från snabb utvändig tvätt till fullständig rekonditionering med lackskydd
              och polering.
            </p>
            <div className="home-info-actions">
              <Link href="/tjanster" className="home-info-btn home-info-btn--primary">
                Se priser
              </Link>
              <Link href="/tjanster" className="home-info-btn home-info-btn--ghost">
                Boka tid
              </Link>
              <Link href="/kontakt" className="home-info-btn home-info-btn--ghost">
                Kontakt
              </Link>
            </div>
          </header>

          <div className="home-info-services">
            {services.map((service, index) => (
              <Link
                key={service.title}
                href={service.href}
                className={`home-info-card home-info-card--${index + 1}`}
              >
                <span className="home-info-card-num" aria-hidden>
                  {service.num}
                </span>
                <div className="home-info-card-icon">{service.icon}</div>
                <div className="home-info-card-body">
                  <h3 className="home-info-card-title">{service.title}</h3>
                  <p className="home-info-card-text">{service.text}</p>
                </div>
                <span className="home-info-card-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="home-info-faq">
          <div className="home-info-faq-aside">
            <h2 className="home-info-faq-title">Vanliga frågor</h2>
            <p className="home-info-faq-lead">
              Svar på det vi oftast får höra om biltvätt, bilrekond och bokning i Erikslund.
            </p>
          </div>
          <div className="home-info-faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={item.question}
                className={`home-info-faq-item home-info-faq-item--${index + 1}`}
              >
                <summary className="home-info-faq-question">{item.question}</summary>
                <div className="home-info-faq-answer-wrap">
                  <p className="home-info-faq-answer">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
