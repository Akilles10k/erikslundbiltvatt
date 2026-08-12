import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION } from "@/lib/seo";
import { SITE } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} – Biltvätt & Bilrekond Erikslund`,
    short_name: SITE.name,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#9a231e",
    theme_color: "#9a231e",
    lang: "sv",
    icons: [
      {
        src: "/hero-car.png",
        sizes: "900x500",
        type: "image/png",
      },
    ],
  };
}
