const features = [
  {
    title: "Premium resultat",
    description:
      "Vi använder kvalitetsprodukter för ett skinande rent resultat vid biltvätt och bilrekond i Erikslund.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 21s-6.5-4.35-9-8.5C1.5 9.5 3.5 5 8 5c2.2 0 3.5 1.2 4 2 0.5-0.8 1.8-2 4-2 4.5 0 6.5 4.5 5 7.5-2.5 4.15-9 8.5-9 8.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Snabb service",
    description:
      "Boka handtvätt eller bilrekond online och få din bil klar i rätt tid. Effektiv bilvård i Erikslund.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M13 2L4.5 13.5H11L10 22l9.5-12.5H13V2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Nöjd kund-garanti",
    description:
      "Vi lämnar inte ifrån oss bilen förrän du är nöjd med vår biltvätt och bilvård.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function WhySection() {
  return (
    <section className="why">
      <div className="why-inner">
        <h2 className="why-heading">Varför välja Glansig Biltvätt för biltvätt i Erikslund?</h2>
        <div className="why-grid">
          {features.map((feature) => (
            <article key={feature.title} className="why-card">
              <div className="why-card-icon">{feature.icon}</div>
              <div className="why-card-body">
                <h3 className="why-card-title">{feature.title}</h3>
                <p className="why-card-text">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
