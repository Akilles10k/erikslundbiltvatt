import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import WhySection from "@/components/WhySection";
import StatsSection from "@/components/StatsSection";
import HomeSeoSection from "@/components/HomeSeoSection";
import JsonLd from "@/components/JsonLd";
import {
  createPageMetadata,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Biltvätt & Bilrekond Erikslund",
  description:
    "Professionell biltvätt, handtvätt och bilrekond i Erikslund. Boka tid online hos Glansig Bilvård – invändig & utvändig tvätt, lackskydd, polering och bilvård.",
  path: "/",
  keywords: [
    "biltvätt Erikslund",
    "bilrekond Erikslund",
    "handtvätt bil Erikslund",
    "bilvård Erikslund",
  ],
});

export default function HomePage() {
  return (
    <main>
      <JsonLd
        data={[
          getFaqJsonLd(),
          getBreadcrumbJsonLd([{ name: "Hem", path: "/" }]),
        ]}
      />
      <section className="hero" aria-label="Glansig Bilvård – biltvätt och bilrekond i Erikslund">
        <svg
          className="hero-watermark"
          viewBox="0 -80 1400 360"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <text
            className="hero-watermark-text"
            x="700"
            y="200"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="180"
            fontWeight="700"
            fontFamily="IBM Plex Sans, sans-serif"
          >
            GLANSIG BILTVÄTT
          </text>
        </svg>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-line" aria-hidden />
            <span className="hero-eyebrow-label">Glansig Bilvård · Erikslund</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-main">Biltvätt</span>
            <span className="hero-title-accent">& Bilrekond</span>
          </h1>
          <p className="hero-subtitle">
            Professionell handtvätt och bilvård i Erikslund
          </p>
          <div className="hero-actions">
            <Link href="/tjanster" className="hero-btn hero-btn--secondary">
              Boka tid
            </Link>
            <Link href="/tjanster" className="hero-btn">
              Priser
            </Link>
          </div>
        </div>
        <div className="hero-car-mobile" aria-hidden>
          <Image
            src="/hero-car.png"
            alt="Professionell biltvätt och bilrekond i Erikslund hos Glansig Bilvård"
            width={900}
            height={500}
            className="hero-car-mobile-img"
            priority
          />
        </div>
      </section>
      <WhySection />
      <StatsSection />
      <HomeSeoSection />
    </main>
  );
}
