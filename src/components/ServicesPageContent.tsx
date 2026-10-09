"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  CAMPAIGN,
  CATEGORY_LABELS,
  SERVICES,
  type Service,
} from "@/data/site";
import ServiceCard from "@/components/ServiceCard";
import CartBar from "@/components/CartBar";
import { useCart } from "@/context/CartContext";

const CATEGORY_ORDER: Service["category"][] = [
  "tvatt",
  "rekond",
  "special",
  "dack",
  "fordon",
];

function getCampaignService(): Service | null {
  if (!CAMPAIGN.active) return null;
  const service = SERVICES.find((item) => item.id === CAMPAIGN.serviceId);
  if (!service) return null;
  return {
    ...service,
    price: CAMPAIGN.campaignPrice,
    priceLarge: `Ord. pris ${CAMPAIGN.originalPrice}`,
    description: `${CAMPAIGN.description} ${service.description}`,
  };
}

function ServicesPageInner() {
  const searchParams = useSearchParams();
  const { upsertService, hydrated } = useCart();
  const addedRef = useRef(false);
  const campaignActive =
    CAMPAIGN.active && searchParams.get("kampanj") === CAMPAIGN.slug;

  const campaignService = useMemo(
    () => (campaignActive ? getCampaignService() : null),
    [campaignActive],
  );

  const categories = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: SERVICES.filter((service) => service.category === category),
  })).filter((entry) => entry.items.length > 0);

  useEffect(() => {
    if (!campaignService || !hydrated || addedRef.current) return;
    upsertService(campaignService);
    addedRef.current = true;

    const timer = window.setTimeout(() => {
      const section = document.getElementById(
        `kategori-${campaignService.category}`,
      );
      const card = document.getElementById(`service-${campaignService.id}`);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        card?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [campaignService, upsertService, hydrated]);

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
          {campaignActive && campaignService && (
            <p className="services-campaign-banner" role="status">
              Kampanj aktiv: <strong>{campaignService.name}</strong> –{" "}
              <span className="services-campaign-banner-price">
                {CAMPAIGN.campaignPrice}
              </span>{" "}
              <span className="services-campaign-banner-old">
                (Ord. {CAMPAIGN.originalPrice})
              </span>
            </p>
          )}
        </header>

        <nav className="services-catbar" aria-label="Kategorier">
          {categories.map(({ category, label }) => (
            <a
              key={category}
              href={`#kategori-${category}`}
              className={`services-catbar-link${
                campaignActive && campaignService?.category === category
                  ? " services-catbar-link--active"
                  : ""
              }`}
            >
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
              {items.map((service) => {
                const isCampaign =
                  campaignActive && service.id === CAMPAIGN.serviceId;
                return (
                  <ServiceCard
                    key={service.id}
                    service={
                      isCampaign && campaignService ? campaignService : service
                    }
                    campaign={
                      isCampaign
                        ? {
                            originalPrice: CAMPAIGN.originalPrice,
                            campaignPrice: CAMPAIGN.campaignPrice,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <CartBar />
    </>
  );
}

function ServicesPageFallback() {
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
            <a
              key={category}
              href={`#kategori-${category}`}
              className="services-catbar-link"
            >
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

export default function ServicesPageContent() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesPageInner />
    </Suspense>
  );
}
