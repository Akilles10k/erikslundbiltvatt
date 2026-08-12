"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import LogoIcon from "./LogoIcon";

const links = [
  { href: "/", label: "Hem" },
  { href: "/tjanster", label: "Tjänster & priser" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="navbar-header">
      <div className="navbar-accent" aria-hidden />
      <div className="navbar-shell">
        <div className="navbar">
          <Link href="/" className="navbar-logo" onClick={() => setOpen(false)}>
            <LogoIcon size={44} />
            <span className="navbar-logo-text">
              <span className="navbar-logo-name">{SITE.name}</span>
              <span className="navbar-logo-sub">Bilvård i {SITE.city}</span>
            </span>
          </Link>

          <div className="navbar-actions">
            <nav className="navbar-center" aria-label="Huvudmeny">
              <ul className="navbar-links">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`navbar-link${link.href === "/kontakt" ? " navbar-link--cta" : ""} ${isActive(link.href) ? "active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="navbar-end">
              <a href={SITE.phoneHref} className="navbar-meta navbar-meta--phone">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round" />
                </svg>
                <span>{SITE.phone}</span>
              </a>
              <p className="navbar-meta navbar-meta--hours">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  {SITE.openingHours[0].days} {SITE.openingHours[0].hours}
                </span>
              </p>
            </div>

            <button
              type="button"
              className="navbar-menu-btn"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Stäng meny" : "Öppna meny"}
              aria-expanded={open}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav
        className={`navbar-overlay ${open ? "navbar-overlay--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="navbar-overlay-inner">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`navbar-overlay-link ${isActive(link.href) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="navbar-overlay-meta">
            <a href={SITE.phoneHref} className="navbar-overlay-contact">
              {SITE.phone}
            </a>
            <p className="navbar-overlay-hours">
              {SITE.openingHours.map((row) => (
                <span key={row.days}>
                  {row.days} {row.hours}
                </span>
              ))}
            </p>
          </div>
        </div>
      </nav>
    </header>
  );
}
