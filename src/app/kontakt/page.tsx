import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";
import JsonLd from "@/components/JsonLd";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/data/site";

export const metadata: Metadata = createPageMetadata({
  title: "Kontakt & Öppettider",
  description:
    `Kontakta Glansig Biltvätt för biltvätt och bilrekond i Erikslund. ${SITE.address.full}. Öppettider mån–fre 08–18, lör 10–17. Ring ${SITE.phone}.`,
  path: "/kontakt",
  keywords: [
    "biltvätt Erikslund adress",
    "bilrekond Erikslund kontakt",
    "Glansig Biltvätt öppettider",
  ],
});

export default function KontaktPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Hem", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
        ])}
      />
      <ContactPageContent />
    </>
  );
}
