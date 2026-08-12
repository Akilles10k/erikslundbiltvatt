import Link from "next/link";
import { SITE } from "@/data/site";
import LogoIcon from "./LogoIcon";

const companyLinks = [
  { href: "/", label: "Hem" },
  { href: "/tjanster", label: "Tjänster & priser" },
  { href: "/tjanster", label: "Boka tid" },
  { href: "/kontakt", label: "Kontakt" },
];

const serviceLinks = [
  { href: "/tjanster#kategori-tvatt", label: "Handtvätt" },
  { href: "/tjanster#kategori-rekond", label: "Rekond" },
  { href: "/tjanster#kategori-rekond", label: "Lackskydd" },
  { href: "/tjanster", label: "Se alla priser" },
];

const contactLinks: { href: string; label: string; external?: boolean }[] = [
  { href: SITE.phoneHref, label: SITE.phone },
  { href: `mailto:${SITE.email}`, label: SITE.email },
  {
    href: SITE.address.mapsHref,
    label: SITE.address.full,
    external: true,
  },
];

const infoLinks: { href: string; label: string; external?: boolean }[] = [
  ...SITE.openingHours.map((row) => ({
    href: "/kontakt",
    label: `${row.days} ${row.hours}`,
  })),
  {
    href: SITE.address.mapsHref,
    label: "Hitta hit",
    external: true,
  },
];

type FooterColumnProps = {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="footer-col">
      <p className="footer-col-title">{title}</p>
      <ul className="footer-col-links">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              href={link.href}
              className="footer-col-link"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <p className="footer-slogan">
            Så du kan
            <br />
            glänsa
          </p>

          <div className="footer-cols">
            <FooterColumn title="Företag" links={companyLinks} />
            <FooterColumn title="Tjänster" links={serviceLinks} />
            <FooterColumn title="Kontakt" links={contactLinks} />
            <FooterColumn title="Info" links={infoLinks} />
          </div>
        </div>

        <div className="footer-mid">
          <Link href="/" className="footer-brandmark">
            <LogoIcon size={40} className="footer-brandmark-logo" />
            <span className="footer-brandmark-name">{SITE.name}</span>
          </Link>

          <div className="footer-mid-actions">
            <Link href="/tjanster" className="footer-pill-btn">
              Boka tid
            </Link>
            <Link href="/tjanster" className="footer-pill-btn">
              Se priser
            </Link>
          </div>
        </div>

        <div className="footer-legal">
          <div className="footer-legal-links">
            <span className="footer-lang">Svenska</span>
            <Link href="/kontakt" className="footer-legal-link">
              Kontakt
            </Link>
            <a
              href={SITE.address.mapsHref}
              className="footer-legal-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hitta hit
            </a>
          </div>
          <p className="footer-copy">
            Copyright {year} {SITE.name}. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}
