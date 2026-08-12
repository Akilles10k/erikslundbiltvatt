import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { CartProvider } from "@/context/CartContext";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, GLOBAL_JSON_LD, SITE_URL } from "@/lib/seo";
import { SITE } from "@/data/site";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name} – Biltvätt & Bilrekond Erikslund`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Automotive",
  classification: "Biltvätt, bilrekond, bilvård",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "sv-SE": SITE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: SITE_URL,
    siteName: SITE.name,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/hero-car.png",
        width: 900,
        height: 500,
        alt: "Biltvätt och bilrekond i Erikslund – Glansig Bilvård",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/hero-car.png"],
  },
  other: {
    "geo.region": "SE-D",
    "geo.placename": "Erikslund",
    "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
    ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9a231e",
};

const LIGHT_PAGES = ["/tjanster", "/kontakt"];

function isLightPage(pathname: string) {
  return LIGHT_PAGES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isContactPage(pathname: string) {
  return pathname === "/kontakt" || pathname.startsWith("/kontakt/");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const bodyClass = [
    ibmPlexSans.className,
    isLightPage(pathname) && "page-light",
    isContactPage(pathname) && "page-contact",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="sv">
      <body className={bodyClass}>
        <JsonLd data={GLOBAL_JSON_LD} />
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
