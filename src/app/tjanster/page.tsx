import type { Metadata } from "next";
import ServicesPageContent from "@/components/ServicesPageContent";
import JsonLd from "@/components/JsonLd";
import { createPageMetadata, getBreadcrumbJsonLd, getServicesItemListJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Biltvätt & Bilrekond – Priser",
  description:
    "Prislista för biltvätt, handtvätt och bilrekond i Erikslund. Se priser på utvändig tvätt, invändig tvätt, rekond, lackskydd, polering och bilvård hos Glansig Bilvård.",
  path: "/tjanster",
  keywords: [
    "biltvätt pris",
    "bilrekond pris",
    "handtvätt pris Erikslund",
    "prislista bilvård",
  ],
});

export default function TjansterPage() {
  return (
    <>
      <JsonLd
        data={[
          getServicesItemListJsonLd(),
          getBreadcrumbJsonLd([
            { name: "Hem", path: "/" },
            { name: "Tjänster & priser", path: "/tjanster" },
          ]),
        ]}
      />
      <ServicesPageContent />
    </>
  );
}
