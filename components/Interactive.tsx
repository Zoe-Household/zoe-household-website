"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Campus, campuses } from "@/data/site";

type FormKind = "visit" | "children" | "reminder" | "online" | "prayer" | "inquiry";

const formCopy: Record<FormKind, [string, string]> = {
  visit: ["We're looking forward to having you.", "Let us know you're coming, and tell us if there's anything we can help you with before Sunday"],
  children: ["Pre-register for Zoe Arrows", "A simpler check-in starts here."],
  reminder: ["Get service reminders", "Stay connected to your local household."],
  online: ["Request Zoe Online access", "Share your email and our team will contact you with access details."],
  prayer: ["Share a prayer request", "Your request will be received with care."],
  inquiry: ["How can we help?", "Your message will be routed to the right Zoe team."],
};

export function FormCard({ kind, campus, onClose }: { kind: FormKind; campus?: Campus; onClose?: () => void }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeSensitive, setTimeSensitive] = useState(false);
  const [children, setChildren] = useState(1);
  const [heading, description] = formCopy[kind];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("website")) {
      // Honeypot tripped — pretend success without hitting the network.
      setSent(true);
      return;
    }

    const payload: Record<string, unknown> = { kind, campus: campus?.slug };

    if (kind === "children") {
      const childList = Array.from({ length: children }, (_, index) => ({
        name: formData.get(`child-${index}-name`) ?? "",
        ageGroup: formData.get(`child-${index}-age`) ?? "",
        notes: formData.get(`child-${index}-notes`) ?? "",
      }));
      payload.children = childList;
      payload.name = formData.get("name") ?? "";
      payload.email = formData.get("email") ?? "";
    } else {
      for (const [key, value] of formData.entries()) {
        if (key === "website" || key === "campus") continue;
        payload[key] = value;
      }
      payload.campusEmails = formData.get("campusEmails") === "on";
      payload.timeSensitive = timeSensitive;
      if (formData.has("consent")) payload.consent = true;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({ ok: false, error: "Unexpected response from server." }));
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
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
    return <div className={`form-card success-card${kind === "visit" ? " is-visit" : ""}`} role="status">
      {onClose && <button className="form-close" type="button" onClick={onClose} aria-label="Close form">×</button>}
      <span className="eyebrow">Received</span><h2>Thank you.</h2><p>{success}</p>
    </div>;
  }

  return <form className={`form-card${kind === "visit" ? " is-visit" : ""}`} onSubmit={submit}>
    {onClose && <button className="form-close" type="button" onClick={onClose} aria-label="Close form">×</button>}
    <span className="eyebrow">{campus?.name ?? "Zoe Household"}</span>
    <h2>{resolvedHeading}</h2>
    <p>{description}</p>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="form-honeypot" aria-hidden="true" />
    <div className="form-grid">
      {error && <p className="form-error full" role="alert">{error}</p>}
      {!["online", "reminder"].includes(kind) && <label className="field"><span>{kind === "visit" ? "Full Name" : "Name"}</span><input name="name" autoComplete="name" placeholder={kind === "visit" ? "Enter full name" : undefined} required /></label>}
      <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" placeholder={kind === "visit" ? "Enter email" : undefined} required /></label>

      {kind === "visit" && <>
        <label className="field full"><span>Is there anything we can help you with before Sunday?</span><textarea name="message" placeholder="Your message" /></label>
        <label className="checkbox full"><input type="checkbox" name="campusEmails" /> Also include me in Zoe {campus?.shortName ?? "Atlanta"} emails.</label>
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
        <label className="checkbox full"><input type="checkbox" name="consent" required /> I agree that Zoe Household may use these details to respond to my inquiry.</label>
      </>}
      <button className="button button-dark full" type="submit" disabled={submitting}>{submitting ? "Sending…" : kind === "visit" ? "Send Message" : "Submit"}</button>
    </div>
  </form>;
}

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, []);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <div className="modal-card" role="dialog" aria-modal="true">{children}</div>
  </div>;
}

const timezoneLabels: Record<string, string> = {
  "America/New_York": "Eastern Time (ET)",
  "America/Chicago": "Central Time (CT)",
  "Europe/London": "United Kingdom Time",
  "Africa/Lagos": "West Africa Time (WAT)",
};

function visitPlace(campus: Campus) {
  if (campus.slug === "atlanta") return "Atlanta, Georgia";
  if (campus.slug === "houston") return "Houston, Texas";
  if (campus.slug === "london") return "London, United Kingdom";
  return `${campus.city}, ${campus.country}`;
}

function serviceClock(schedule: string) {
  const match = schedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return { hour, minute: Number(match[2]) };
}

function formatClock(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function zonedParts(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: read("weekday"),
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour: Number(read("hour")),
    minute: Number(read("minute")),
  };
}

function upcomingSunday(campus: Campus) {
  const schedule = campus.services[0]?.schedule ?? "";
  const clock = serviceClock(schedule);
  const target = clock ?? { hour: 10, minute: 0 };
  const now = new Date();
  for (let offset = 0; offset < 8; offset += 1) {
    const probe = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const parts = zonedParts(campus.timezone, probe);
    if (!parts.weekday.startsWith("Sun")) continue;
    const alreadyStarted = offset === 0 && (parts.hour > target.hour || (parts.hour === target.hour && parts.minute >= target.minute));
    if (alreadyStarted) continue;
    return { pending: !clock, ...parts, hour: target.hour, minute: target.minute };
  }
  const fallback = zonedParts(campus.timezone, now);
  return { pending: !clock, ...fallback, hour: target.hour, minute: target.minute };
}

function icsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function SaveVisitModal({ campus, onClose }: { campus: Campus; onClose: () => void }) {
  const when = upcomingSunday(campus);
  const place = visitPlace(campus);
  const zone = timezoneLabels[campus.timezone] ?? campus.timezone;
  const dateLabel = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(when.year, when.month - 1, when.day)))
    .toUpperCase();
  const timeLabel = when.pending ? "Time will be released once available." : `Sunday · ${formatClock(when.hour, when.minute)}`;

  const add = () => {
    if (when.pending) return;
    const endHour = when.hour + 2;
    const stamp = (hour: number) => `${when.year}${String(when.month).padStart(2, "0")}${String(when.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}${String(when.minute).padStart(2, "0")}00`;
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Zoe Household//Sunday Service//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${when.year}${when.month}${when.day}-${campus.slug}@zoehousehold.org`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART;TZID=${campus.timezone}:${stamp(when.hour)}`,
      `DTEND;TZID=${campus.timezone}:${stamp(endHour)}`,
      `SUMMARY:Zoe ${campus.shortName} Sunday Service`,
      `LOCATION:${place.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${timeLabel}`,
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

  return <div className="save-visit">
    <header>
      <div>
        <h2>Save Your Visit</h2>
        <p>Add the next Zoe {campus.shortName} Sunday Service to your calendar.</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Close">×</button>
    </header>
    <article>
      <span>{dateLabel}</span>
      <h3>Zoe {campus.shortName}</h3>
      <p>{timeLabel}</p>
      <hr />
      <p>{place}</p>
      <small>{zone}</small>
    </article>
    <button type="button" onClick={add} disabled={when.pending}>{when.pending ? "Calendar details will be released once available" : "Add to Calendar"}</button>
  </div>;
}

export function CalendarButton({ campus, className = "button button-quiet", children = "Add to Calendar" }: { campus: Campus; className?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className={className} type="button" onClick={() => setOpen(true)}>{children}</button>
    {open && <Modal onClose={() => setOpen(false)}><SaveVisitModal campus={campus} onClose={() => setOpen(false)} /></Modal>}
  </>;
}
