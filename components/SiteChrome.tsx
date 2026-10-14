"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { campuses, socialLinks } from "@/data/site";

type IconName = "instagram" | "youtube" | "spotify" | "tiktok";

export function SocialIcon({ name }: { name: IconName }) {
  if (name === "instagram") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.02 4.85.08 3.25.14 4.77 1.68 4.92 4.91.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.25-.15-4.77-1.69-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.24 8.42 2.18 8.8 2.16 12 2.16Zm0 1.97c-3.15 0-3.52.01-4.76.07-2.27.1-2.8 1.21-2.9 3.04-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.1 1.83.63 2.94 2.9 3.04 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c2.27-.1 2.8-1.21 2.9-3.04.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.1-1.83-.63-2.94-2.9-3.04-1.24-.06-1.61-.07-4.76-.07Zm0 3.7a4.17 4.17 0 1 1 0 8.34 4.17 4.17 0 0 1 0-8.34Zm0 6.88a2.71 2.71 0 1 0 0-5.42 2.71 2.71 0 0 0 0 5.42Zm5.06-8.42a.98.98 0 1 1 0 1.95.98.98 0 0 1 0-1.95Z" /></svg>;
  }
  if (name === "youtube") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3 3 0 0 0-2.12-2.14C19.51 3.55 12 3.55 12 3.55s-7.51 0-9.38.5A3 3 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3 3 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.51 0 9.38-.5a3 3 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" /></svg>;
  }
  if (name === "spotify") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.49 17.33a.75.75 0 0 1-1.03.25c-2.85-1.74-6.43-2.13-10.65-1.17a.75.75 0 1 1-.34-1.46c4.62-1.05 8.56-.6 11.77 1.35.35.22.46.68.25 1.03Zm1.46-3.26a.94.94 0 0 1-1.29.31c-3.26-2-8.22-2.58-12.07-1.41a.94.94 0 0 1-.55-1.79c4.4-1.34 9.87-.68 13.6 1.61.43.26.57.83.31 1.28Zm.12-3.41c-3.9-2.32-10.33-2.53-14.09-1.39a1.13 1.13 0 1 1-.65-2.16c4.32-1.31 11.42-1.05 15.91 1.61a1.13 1.13 0 1 1-1.17 1.94Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.01-2.77V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 1 0 15.86 15.67v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4c-.36 0-.71-.03-1.04-.1Z" /></svg>;
}

type NavGroup = { label: string; href: string; children: readonly (readonly [string, string])[] };

const groups: NavGroup[] = [
  { label: "About", href: "/about", children: [["Who We Are", "/about"], ["What We Believe", "/about/beliefs"], ["FAQs", "/about/faqs"]] },
  { label: "Campus", href: "/visit", children: [["Nearest Campus", "/visit"], ...campuses.map((campus) => [`Zoe ${campus.shortName}`, `/visit/${campus.slug}`] as const)] },
  { label: "Watch & Listen", href: "/sermons", children: [["Sermons & Podcast", "/sermons"], ["Pneuma Worship", "/pneuma-worship"]] },
];

const links = [
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Prayer", href: "/prayer" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/sermons") return pathname.startsWith("/sermons") || pathname.startsWith("/pneuma");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Arrow({ className = "" }: { className?: string }) {
  return <svg className={`icon-arrow ${className}`} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Chevron() {
  return <svg className="icon-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function DesktopMenu({ group, active }: { group: NavGroup; active: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && ref.current?.contains(focused)) focused.blur();
  };

  return <li
    className={`nav-item has-menu${open ? " is-open" : ""}`}
    ref={ref}
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={close}
    onFocus={() => setOpen(true)}
    onBlur={(event) => {
      if (!ref.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}
  >
    <Link className={`nav-link${active ? " is-active" : ""}`} href={group.href} aria-haspopup="true" aria-expanded={open}>
      {group.label}<Chevron />
    </Link>
    <div className="nav-menu">
      <div className={`nav-menu-inner${group.children.length > 4 ? " is-wide" : ""}`}>
        {group.children.map(([label, href]) => <Link key={href} href={href} onClick={close}>{label}</Link>)}
      </div>
    </div>
  </li>;
}

function LocalYear() {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => {
    const timer = window.setInterval(() => setYear(new Date().getFullYear()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <>{year}</>;
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>

    <header className={`site-header${scrolled || open ? " is-scrolled" : ""}`}>
      <div className="site-header-inner">
        <nav className="nav-pill" aria-label="Primary navigation">
          <Link className="nav-brand" href="/" aria-label="Zoe Household home">
            <img src="/figma/zoe-logo-white.png" alt="" width={240} height={209} />
          </Link>
          <ul className="nav-list">
            <li className="nav-item"><Link className={`nav-link${isActive(pathname, "/") ? " is-active" : ""}`} href="/">Home</Link></li>
            {groups.map((group) => <DesktopMenu key={group.label} group={group} active={isActive(pathname, group.href)} />)}
            {links.map((link) => <li className="nav-item" key={link.href}><Link className={`nav-link${isActive(pathname, link.href) ? " is-active" : ""}`} href={link.href}>{link.label}</Link></li>)}
          </ul>
          <Link className={`btn btn-primary nav-give${isActive(pathname, "/give") ? " is-active" : ""}`} href="/give">Give</Link>
          <button className={`nav-toggle${open ? " is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
            <span /><span /><span />
          </button>
        </nav>

        <div id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
          <div className="mobile-menu-inner">
            <ul>
              <li><Link className={isActive(pathname, "/") ? "is-active" : ""} href="/" onClick={close} tabIndex={open ? 0 : -1}>Home</Link></li>
              {groups.map((group) => {
                const isOpen = expanded === group.label;
                return <li key={group.label} className={isOpen ? "is-expanded" : ""}>
                  <div className="mobile-menu-row">
                    <Link className={isActive(pathname, group.href) ? "is-active" : ""} href={group.href} onClick={close} tabIndex={open ? 0 : -1}>{group.label}</Link>
                    <button type="button" onClick={() => setExpanded(isOpen ? null : group.label)} aria-expanded={isOpen} aria-label={`${isOpen ? "Hide" : "Show"} ${group.label} pages`} tabIndex={open ? 0 : -1}><Chevron /></button>
                  </div>
                  <div className="mobile-submenu">
                    <div>
                      {group.children.map(([label, href]) => <Link key={href} href={href} onClick={close} tabIndex={open && isOpen ? 0 : -1}>{label}</Link>)}
                    </div>
                  </div>
                </li>;
              })}
              {links.map((link) => <li key={link.href}><Link className={isActive(pathname, link.href) ? "is-active" : ""} href={link.href} onClick={close} tabIndex={open ? 0 : -1}>{link.label}</Link></li>)}
            </ul>
            <Link className="btn btn-primary btn-block" href="/give" onClick={close} tabIndex={open ? 0 : -1}>Give</Link>
          </div>
        </div>
      </div>
    </header>
    <button className={`menu-scrim${open ? " is-open" : ""}`} type="button" aria-hidden="true" tabIndex={-1} onClick={close} />

    <main id="main-content">{children}</main>

    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-member">
          <div>
            <p className="label">Member login</p>
            <h2>Already part of the household?</h2>
            <p>Sign in with the email on your member account to stay connected and manage your information.</p>
          </div>
          <a className="btn btn-primary" href="https://churchq.io/login" target="_blank" rel="noreferrer">Sign in <Arrow /></a>
        </div>

        <div className="footer-panel">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/figma/zoe-logo-white.png" alt="Zoe Household" width={240} height={209} />
              <strong>The life of God.</strong>
              <p>A global household of people discovering, living, and revealing the life of God in Christ.</p>
              <div className="footer-socials" aria-label="Zoe Household social links">
                {(Object.keys(socialLinks) as IconName[]).map((name) => <a key={name} href={socialLinks[name]} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /></a>)}
              </div>
            </div>
            <div className="footer-col">
              <p>Explore</p>
              <Link href="/">Home</Link>
              <Link href="/visit">Campus</Link>
              <Link href="/events">Events</Link>
              <Link href="/prayer">Prayer</Link>
              <Link href="/give">Give</Link>
            </div>
            <div className="footer-col">
              <p>About</p>
              <Link href="/about">Who We Are</Link>
              <Link href="/about/beliefs">What We Believe</Link>
              <Link href="/about/faqs">FAQs</Link>
            </div>
            <div className="footer-col">
              <p>Campuses</p>
              {campuses.map((campus) => <Link key={campus.slug} href={`/visit/${campus.slug}`}>Zoe {campus.shortName}</Link>)}
            </div>
            <div className="footer-col">
              <p>Grow</p>
              <Link href="/sermons">Sermons &amp; Podcast</Link>
              <Link href="/pneuma-worship">Pneuma Worship</Link>
              <Link href="/resources">Devotionals</Link>
              <Link href="/resources/scholarship">Zoe Scholarship</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© <LocalYear /> Zoe Household. All rights reserved.</span>
            <span><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link></span>
          </div>
        </div>

        <svg className="footer-wordmark" viewBox="0 0 1000 132" role="img" aria-label="Zoe Household">
          <text x="500" y="112" textAnchor="middle" textLength="1000" lengthAdjust="spacingAndGlyphs">ZOE HOUSEHOLD</text>
        </svg>
      </div>
    </footer>
  </div>;
}
