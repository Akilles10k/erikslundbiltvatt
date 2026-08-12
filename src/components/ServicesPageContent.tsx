import {
  CATEGORY_LABELS,
  SERVICES,
  type Service,
} from "@/data/site";
import ServiceCard from "@/components/ServiceCard";
import CartBar from "@/components/CartBar";

const CATEGORY_ORDER: Service["category"][] = [
  "tvatt",
  "rekond",
  "special",
  "dack",
  "fordon",
];

export default function ServicesPageContent() {
  const categories = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: SERVICES.filter((service) => service.category === category),
  })).filter((entry) => entry.items.length > 0);

  return (
    <>
      <main className="services services--with-cart">
        <header className="services-header">
          <p className="services-eyebrow">Prislista</p>
          <h1 className="services-title">Biltvätt & Bilrekond – Priser</h1>
          <p className="services-intro">
            Handtvätt, bilrekond och bilvård i Erikslund. Välj tjänster med
            &quot;Lägg till&quot; och boka sedan en tid online.
          </p>
        </header>

        <nav className="services-catbar" aria-label="Kategorier">
          {categories.map(({ category, label }) => (
            <a key={category} href={`#kategori-${category}`} className="services-catbar-link">
              {label}
            </a>
          ))}
        </nav>

        {categories.map(({ category, label, items }) => (
          <section
            key={category}
            id={`kategori-${category}`}
            className="services-section"
          >
            <h2 className="services-section-title">{label}</h2>
            <div className="services-grid">
              {items.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        ))}

      </main>
      <CartBar />
    </>
  );
}
