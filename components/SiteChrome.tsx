"use client";

import Link from "next/link";
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

const nav = [
  { label: "About", href: "/about", children: [["Who We Are", "/about"], ["What We Believe", "/about/beliefs"], ["FAQs", "/about/faqs"]] },
  { label: "Visit", href: "/visit", children: campuses.map((campus) => [campus.shortName, `/visit/${campus.slug}`]) },
  { label: "Watch & Listen", href: "/sermons", children: [["Sermons", "/sermons"], ["Pneuma Worship", "/pneuma-worship"]] },
] as const;

function LocalYear() {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => {
    const timer = window.setInterval(() => setYear(new Date().getFullYear()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <>{year}</>;
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (open) closeRef.current?.focus();
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

    <header className="desktop-header">
      <Link className="desktop-brand" href="/" aria-label="Zoe Household home">
        <img src="/assets/zoe-mark-logo.png" alt="" />
        <span><strong>ZOE Household</strong><small>Global</small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {nav.map((item) => <div className="desktop-nav-group" key={item.label}>
          <Link href={item.href}>{item.label}</Link>
          <div className="desktop-dropdown">
            {item.children.map(([label, href]) => <Link key={href} href={href}><strong>{label}</strong><span>Explore</span></Link>)}
          </div>
        </div>)}
        <Link href="/events">Events</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/prayer">Prayer</Link>
        <Link className="desktop-give" href="/give">Give</Link>
      </nav>
    </header>

    <header className="mobile-header">
      <Link className="mobile-wordmark" href="/" aria-label="Zoe Household home">zoe</Link>
      <Link className="mobile-give" href="/give">Give</Link>
    </header>

    <aside className={`mobile-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="mobile-drawer-inner">
        <div className="mobile-drawer-top">
          <span>zoe.</span>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close navigation">Close</button>
        </div>
        <nav aria-label="Mobile navigation">
          <Link onClick={close} href="/">Home</Link>
          <Link onClick={close} href="/about">About</Link>
          <Link onClick={close} href="/visit"><em>Visit</em></Link>
          <Link onClick={close} href="/sermons">Watch &amp; Listen</Link>
          <Link onClick={close} href="/events">Events</Link>
          <Link onClick={close} href="/resources"><em>Resources</em></Link>
          <Link onClick={close} href="/prayer">Prayer</Link>
          <Link onClick={close} href="/give">Give</Link>
        </nav>
      </div>
    </aside>

    <button className={`mobile-fab ${open ? "is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close site navigation" : "Open site navigation"}>
      <span />
      <span />
      <span />
    </button>

    <main id="main-content">{children}</main>

    <footer className="stitch-footer">
      <div className="stitch-footer-inner">
        <Link className="footer-wordmark" href="/">zoe.</Link>
        <div className="footer-socials" aria-label="Zoe Household social links">
          {(Object.keys(socialLinks) as IconName[]).map((name) => <a key={name} href={socialLinks[name]} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /></a>)}
        </div>
        <div className="footer-link-grid">
          <a href="https://churchos.faith/" target="_blank" rel="noreferrer">Member Login</a>
          <Link href="/about/faqs#general-inquiry">General Inquiry</Link>
          <Link href="/prayer">Prayer Request</Link>
          <a href="mailto:connect@zoehousehold.org">Connect</a>
          <Link href="/about/faqs">Privacy</Link>
          <Link href="/about/faqs">Terms</Link>
        </div>
        <p>© <LocalYear /> Zoe Household. All Rights Reserved</p>
      </div>
    </footer>
  </div>;
}
