"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useMemo, useRef, useState } from "react";
import { Campus, campuses, sermons } from "@/data/site";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = soundOn;
    if (!soundOn) await video.play().catch(() => undefined);
    setSoundOn(!soundOn);
  };

  return <section className="home-hero">
    <video ref={videoRef} className="home-hero-video" autoPlay muted loop playsInline poster="/assets/zoe-hero.png">
      <source src="/assets/zoe-hero-video.m4v" type="video/mp4" />
    </video>
    <div className="home-hero-overlay" />
    <div className="home-hero-content">
      <h1>zoe</h1>
      <div className="definition-line">
        <span>[zoh-ee]</span>
        <button type="button" onClick={toggleSound} aria-label={soundOn ? "Mute hero video" : "Play hero video sound"} aria-pressed={soundOn}>
          <span className={`sound-glyph ${soundOn ? "on" : ""}`} aria-hidden="true">◖</span>
        </button>
        <span>Greek</span>
        <span>noun</span>
      </div>
      <p className="outline-definition">THE LIFE<br />OF GOD.</p>
      <div className="hero-actions">
        <Link className="button button-light" href="/visit">Plan Your Visit</Link>
        <Link className="button button-outline-light" href="/sermons">Watch a Sermon</Link>
      </div>
    </div>
  </section>;
}

export function Accordion({ items, className = "" }: { items: readonly (readonly [string, string, string?])[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return <div className={`accordion ${className}`}>
    {items.map(([title, body, detail], index) => <article className="accordion-item" key={title}>
      <h3>
        <button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}>
          <span>{title}</span><span aria-hidden="true">{open === index ? "−" : "+"}</span>
        </button>
      </h3>
      {open === index && <div className="accordion-panel"><p>{body}</p>{detail && <small>{detail}</small>}</div>}
    </article>)}
  </div>;
}

type FormKind = "visit" | "children" | "reminder" | "online" | "prayer" | "inquiry";

const formCopy: Record<FormKind, [string, string]> = {
  visit: ["Let us know you’re coming", "We would be glad to help before Sunday."],
  children: ["Pre-register for Zoe Arrows", "A simpler check-in starts here."],
  reminder: ["Get service reminders", "Stay connected to your local household."],
  online: ["Request Zoe Online access", "Share your email and our team will contact you with access details."],
  prayer: ["Share a prayer request", "Your request will be received with care."],
  inquiry: ["How can we help?", "Your message will be routed to the right Zoe team."],
};

export function FormCard({ kind, campus, onClose }: { kind: FormKind; campus?: Campus; onClose?: () => void }) {
  const [sent, setSent] = useState(false);
  const [timeSensitive, setTimeSensitive] = useState(false);
  const [children, setChildren] = useState(1);
  const [heading, description] = formCopy[kind];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  const resolvedHeading = kind === "children" && campus ? `Pre-register for Zoe Arrows — ${campus.shortName}` : heading;
  const success = kind === "online"
    ? "Thank you. The Zoe Online team will contact you with access details."
    : kind === "prayer"
      ? "Your prayer request has been received."
      : kind === "reminder"
        ? `You’re on the ${campus?.shortName ?? "Zoe"} service reminder list.`
        : kind === "children"
          ? `Your Zoe Arrows pre-registration for ${campus?.shortName ?? "this campus"} has been received.`
          : "Thank you. Your message has been received.";

  if (sent) {
    return <div className="form-card success-card" role="status">
      {onClose && <button className="form-close" type="button" onClick={onClose} aria-label="Close form">×</button>}
      <span className="eyebrow">Received</span><h2>Thank you.</h2><p>{success}</p>
    </div>;
  }

  return <form className="form-card" onSubmit={submit}>
    {onClose && <button className="form-close" type="button" onClick={onClose} aria-label="Close form">×</button>}
    <span className="eyebrow">{campus?.name ?? "Zoe Household"}</span>
    <h2>{resolvedHeading}</h2>
    <p>{description}</p>
    <div className="form-grid">
      {!["online", "reminder"].includes(kind) && <label className="field"><span>Name</span><input name="name" autoComplete="name" required /></label>}
      <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>

      {kind === "visit" && <>
        <label className="field full"><span>Is there anything we can help you with before Sunday?</span><textarea name="message" /></label>
        <label className="checkbox full"><input type="checkbox" name="campusEmails" defaultChecked /> Also include me in Zoe {campus?.shortName} emails.</label>
      </>}

      {kind === "children" && <>
        {Array.from({ length: children }, (_, index) => <div className="child-fields full" key={index}>
          <label className="field"><span>Child’s name</span><input name={`child-${index}-name`} required /></label>
          <label className="field"><span>Age group</span><select name={`child-${index}-age`} required defaultValue=""><option value="" disabled>Select age group</option><option>Infant</option><option>Toddler</option><option>Ages 4–6</option><option>Ages 7–9</option><option>Ages 10–12</option></select></label>
          <label className="field full"><span>Anything we should know? (optional)</span><textarea name={`child-${index}-notes`} /></label>
        </div>)}
        <button className="text-button full" type="button" onClick={() => setChildren((count) => count + 1)}>+ Add another child</button>
      </>}

      {kind === "prayer" && <>
        <label className="field"><span>Phone number (optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>
        <label className="field"><span>Campus</span><select name="campus" required defaultValue=""><option value="" disabled>Select a campus</option>{campuses.map((item) => <option key={item.slug} value={item.slug}>{item.shortName}</option>)}<option value="none">I don’t currently attend a campus</option></select></label>
        <label className="field full"><span>Prayer request</span><textarea name="request" required /></label>
        <label className="checkbox full"><input type="checkbox" checked={timeSensitive} onChange={(event) => setTimeSensitive(event.target.checked)} /> This is time-sensitive.</label>
        {timeSensitive && <label className="field full"><span>Relevant date</span><input name="relevantDate" type="date" required /></label>}
      </>}

      {kind === "inquiry" && <>
        <label className="field"><span>Phone number (optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>
        <label className="field"><span>Topic</span><select name="topic" required defaultValue=""><option value="" disabled>Select a topic</option><option>Visiting a Campus</option><option>Membership</option><option>Giving</option><option>Events</option><option>Scholarship & Resources</option><option>Media & Partnerships</option><option>Other</option></select></label>
        <label className="field"><span>Campus or region (optional)</span><input name="region" /></label>
        <label className="field full"><span>Message</span><textarea name="message" required /></label>
        <label className="checkbox full"><input type="checkbox" required /> I agree that Zoe Household may use these details to respond to my inquiry.</label>
      </>}
      <button className="button button-dark full" type="submit">Submit</button>
    </div>
  </form>;
}

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <div className="modal-card" role="dialog" aria-modal="true">{children}</div>
  </div>;
}

function nextSundayAtFour() {
  const date = new Date();
  const days = (7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + days);
  date.setHours(16, 0, 0, 0);
  return date;
}

function icsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function CalendarButton({ campus }: { campus: Campus }) {
  const available = !campus.services[0].schedule.includes("released once available");
  const add = () => {
    const start = nextSundayAtFour();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const service = campus.services[0];
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Zoe Household//Sunday Service//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${start.getTime()}-${campus.slug}@zoehousehold.org`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${campus.name} Sunday Service`,
      `LOCATION:${service.address.replace(/,/g, "\\,")}`,
      `DESCRIPTION:Join ${campus.name} for Sunday Service.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${campus.slug}-sunday-service.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return <button className="button button-quiet" type="button" onClick={add} disabled={!available}>
    {available ? "Add to Calendar" : "Calendar details will be released once available"}
  </button>;
}

export function VisitorHub({ campus }: { campus: Campus }) {
  const [modal, setModal] = useState<"visit" | "children" | "reminder" | null>(null);
  return <section id="visitor-pathway" className="section visitor-hub">
    <div className="section-heading">
      <p className="eyebrow">Plan your visit</p>
      <h2>Your first visit, made simple.</h2>
      <p>Choose a step below to prepare for Sunday.</p>
    </div>
    <div className="visitor-hub-grid">
      <article className="hub-card"><span>01</span><h3>What to expect</h3><p>Worship, prayer, the Word, family, and a warm welcome. Come as you are.</p></article>
      <button className="hub-card" type="button" onClick={() => setModal("children")}><span>02</span><h3>Register children</h3><p>Pre-register for a simpler Zoe Arrows check-in.</p><b>Open form →</b></button>
      <button className="hub-card" type="button" onClick={() => setModal("visit")}><span>03</span><h3>Let us know</h3><p>Tell the welcome team you are coming or ask for help before Sunday.</p><b>Open form →</b></button>
      <article className="hub-card"><span>04</span><h3>Add to calendar</h3><p>Save the next Sunday gathering to your default calendar.</p><CalendarButton campus={campus} /></article>
      <button className="hub-card wide" type="button" onClick={() => setModal("reminder")}><span>05</span><h3>Service reminders</h3><p>Join the {campus.shortName} email list for upcoming service reminders.</p><b>Join the list →</b></button>
    </div>
    {modal && <Modal onClose={() => setModal(null)}><FormCard kind={modal} campus={campus} onClose={() => setModal(null)} /></Modal>}
  </section>;
}

export function CampusFinder() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<Campus | "online" | null>(null);
  const [onlineForm, setOnlineForm] = useState(false);
  const search = (event: FormEvent) => {
    event.preventDefault();
    const query = address.toLowerCase();
    const match = campuses.find((campus) => campus.match.some((term) => query.includes(term)));
    setResult(match ?? "online");
  };
  return <div className="finder-shell">
    <form className="finder-form" onSubmit={search}>
      <label><span>Your address, city, or postcode</span><input value={address} onChange={(event) => setAddress(event.target.value)} required placeholder="Start typing your location" /></label>
      <button className="button button-primary" type="submit">Find a Campus</button>
    </form>
    {result && result !== "online" && <div className="finder-result">
      <p className="eyebrow">Recommended for you</p>
      <h2>{result.name}</h2>
      <p>{result.address}</p>
      <div className="button-row"><Link className="button button-dark" href={`/visit/${result.slug}`}>Plan Your Visit</Link><a className="button button-quiet" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.address)}`} target="_blank" rel="noreferrer">Open Maps</a></div>
    </div>}
    {result === "online" && <div className="finder-result online-result">
      <p className="eyebrow">A household without borders</p>
      <h2>Join Zoe Online.</h2>
      <p>Gather live with the household wherever you are.</p>
      <div className="online-countdown" aria-label="Next online gathering"><span><strong>02</strong>days</span><span><strong>05</strong>hours</span><span><strong>31</strong>minutes</span></div>
      <button className="button button-primary" type="button" onClick={() => setOnlineForm(true)}>Request Access</button>
    </div>}
    {onlineForm && <Modal onClose={() => setOnlineForm(false)}><FormCard kind="online" onClose={() => setOnlineForm(false)} /></Modal>}
  </div>;
}

export function SermonLibrary() {
  const tags = useMemo(() => ["All", ...Array.from(new Set(sermons.flatMap((sermon) => [sermon.topic, sermon.series])))], []);
  const [tag, setTag] = useState("All");
  const filtered = tag === "All" ? sermons : sermons.filter((sermon) => sermon.topic === tag || sermon.series === tag);
  return <>
    <div className="filter-chips" aria-label="Filter sermons">
      {tags.map((item) => <button type="button" key={item} className={tag === item ? "active" : ""} onClick={() => setTag(item)}>{item}</button>)}
    </div>
    <div className="sermon-grid">
      {filtered.map((sermon) => <a className="sermon-card" key={sermon.title} href="https://www.youtube.com/@PastorDolapoLawal" target="_blank" rel="noreferrer">
        <div className="sermon-thumb"><span>▶</span></div>
        <div><small>{sermon.topic} · {sermon.series}</small><h3>{sermon.title}</h3><p>Pastor Dolapo Lawal · {sermon.campus}</p></div>
      </a>)}
    </div>
  </>;
}

export function GivingCard({ title, global = false, tithely = false }: { title: string; global?: boolean; tithely?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const methods = global ? ["CashApp", "Zelle", "PayPal", "Nigerian Bank", "US Bank"] : ["Bank transfer"];
  return <article className={`giving-card ${flipped ? "flipped" : ""}`}>
    <div className="giving-card-inner">
      <div className={`giving-face giving-front ${global ? "global" : ""}`}>
        <button className="flip-button" type="button" onClick={() => setFlipped(true)}>Give →</button>
        <small>{global ? "Global giving" : "Campus giving"}</small>
        <h3>{title}</h3>
        <p>{global ? "Support the work of the household across every city." : "Support your local household."}</p>
      </div>
      <div className="giving-face giving-back">
        <button className="flip-button" type="button" onClick={() => setFlipped(false)}>← Back</button>
        <small>{tithely ? "Secure giving" : global ? "Global options" : "Transfer details"}</small>
        <h3>{tithely ? "Give securely" : "Choose a method"}</h3>
        {tithely
          ? <a className="button button-primary" href="https://give.tithe.ly/?formId=38e44ec6-bbde-428c-b073-df0309a7e479&context=modal" target="_blank" rel="noreferrer">Continue to Tithely</a>
          : <div className="payment-methods">{methods.map((method) => <div key={method}><span>{method}</span><strong>1234567890</strong></div>)}</div>}
      </div>
    </div>
  </article>;
}
