"use client";

import Link from "next/link";
import { createContext, FormEvent, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CalendarButton, FormCard, Modal } from "@/components/Interactive";
import { NationsMap } from "@/components/NationsMap";
import { TeachingLibrary, YoutubeImage } from "@/components/TeachingLibrary";
import { Arrow } from "@/components/SiteChrome";
import { beliefs, Campus, campuses, pastorDolapoBio, socialLinks } from "@/data/site";
import { eventPhase, formatKilometers, rankEvents, relativeLabel, type RankedEvent } from "@/lib/event-order";
import type { LibraryVideo } from "@/lib/library";
import type { Point } from "@/lib/nearest-campus";
import { EMPTY_CONTENT, fallbackEvents, fallbackMoments, type CampusActivity, type EventItem, type SiteContent } from "@/lib/site-content";

type MergedCampus = Campus & {
  gallery?: string[];
  email?: string;
  instagram?: string;
  whatToExpect?: string;
  gettingThere?: string;
  parking?: string;
  languages?: string;
  whatsappChannelUrl?: string;
  membershipClassTitle?: string;
  membershipClassSchedule?: string;
  membershipClassUrl?: string;
  membershipClassFlyer?: string;
  newHereUrl?: string;
  activities?: CampusActivity[];
};

type ResolvedContent = {
  campusesOrdered: MergedCampus[];
  bySlug: Map<string, MergedCampus>;
  events: EventItem[];
  moments: string[];
  generatedAt: number;
};

const ContentContext = createContext<ResolvedContent | null>(null);

function useSite(): ResolvedContent {
  const value = useContext(ContentContext);
  if (!value) throw new Error("Site content is not available outside <Prototype>.");
  return value;
}

function resolveContent(content: SiteContent): ResolvedContent {
  const overrides = content.campus ?? {};
  const merged: MergedCampus[] = campuses.map((base) => {
    const o = overrides[base.slug];
    if (!o) return base;
    return {
      ...base,
      place: o.place ?? base.place,
      pastor: o.pastor ?? base.pastor,
      phone: o.phone ?? base.phone,
      email: o.email,
      instagram: o.instagram,
      address: o.address ?? base.address,
      verse: o.verse ?? base.verse,
      verseRef: o.verseRef ?? base.verseRef,
      whatToExpect: o.whatToExpect,
      gettingThere: o.gettingThere,
      parking: o.parking,
      languages: o.languages,
      image: o.heroImage ?? base.image,
      services: o.services && o.services.length ? o.services : base.services,
      gallery: o.gallery,
      whatsappChannelUrl: o.whatsappChannelUrl,
      membershipClassTitle: o.membershipClassTitle,
      membershipClassSchedule: o.membershipClassSchedule,
      membershipClassUrl: o.membershipClassUrl,
      membershipClassFlyer: o.membershipClassFlyer,
      newHereUrl: o.newHereUrl,
      activities: o.activities,
    };
  });
  const bySlug = new Map(merged.map((campus) => [campus.slug, campus]));
  const campusesOrdered = campusOrder
    .map((slug) => bySlug.get(slug))
    .filter((campus): campus is MergedCampus => Boolean(campus));
  return {
    campusesOrdered,
    bySlug,
    events: content.events ?? fallbackEvents,
    moments: content.moments ?? fallbackMoments,
    generatedAt: content.generatedAt ?? 0,
  };
}

/** Current time, refreshed every minute so event cards roll over as events start and end. */
function useNow(initial: number) {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return now;
}

const VISITOR_KEY = "zoe:visitor-location";
const IP_KEY = "zoe:ip-location";
const VISITOR_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function rememberVisitorLocation(point: Point) {
  try {
    window.localStorage.setItem(VISITOR_KEY, JSON.stringify({ ...point, at: Date.now() }));
  } catch {
    // Storage can be unavailable (private mode); ranking just falls back to IP location.
  }
}

/**
 * Where the visitor is, without prompting: a location they already shared on the
 * Campus page (kept for 30 days), otherwise an approximate IP-based location.
 */
function useVisitorLocation() {
  const [point, setPoint] = useState<Point | null>(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const saved = JSON.parse(window.localStorage.getItem(VISITOR_KEY) ?? "null") as (Point & { at?: number }) | null;
      if (saved && Number.isFinite(saved.lat) && Number.isFinite(saved.lng) && Date.now() - (saved.at ?? 0) < VISITOR_MAX_AGE_MS) {
        setPoint({ lat: saved.lat, lng: saved.lng });
        return;
      }
      const cached = window.sessionStorage.getItem(IP_KEY);
      if (cached) {
        setPoint(JSON.parse(cached) as Point | null);
        return;
      }
    } catch {
      // Fall through to the network lookup.
    }
    fetch("/api/locate")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: (Point & { source?: string }) | null) => {
        const found = data && Number.isFinite(data.lat) && Number.isFinite(data.lng) ? { lat: data.lat, lng: data.lng } : null;
        try { window.sessionStorage.setItem(IP_KEY, JSON.stringify(found)); } catch { /* ignore */ }
        if (!cancelled) setPoint(found);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  return point;
}

function useRankedEvents(campusSlug?: string) {
  const { events, generatedAt } = useSite();
  const now = useNow(generatedAt);
  const visitor = useVisitorLocation();
  const scoped = useMemo(
    () => (campusSlug ? events.filter((event) => event.campusSlug === campusSlug) : events),
    [events, campusSlug],
  );
  const ranked = useMemo(() => rankEvents(scoped, now, visitor), [scoped, now, visitor]);
  return { ranked, now, located: visitor != null && !campusSlug };
}

function eventCampusLabel(event: EventItem, bySlug: Map<string, MergedCampus>) {
  if (!event.campusSlug) return "All campuses";
  const campus = bySlug.get(event.campusSlug);
  return campus ? `Zoe ${campus.shortName}` : event.campusSlug;
}

function PlayIcon() {
  return <svg className="icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>;
}

function PinIcon() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.4 7-11.5a7 7 0 1 0-14 0C5 14.6 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

function ClockIcon() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function CalendarIcon() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function PhoneIcon() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.4 4.1-1.9 1.4a12 12 0 0 0 6.3 6.3l1.4-1.9 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}

function UserIcon() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function SearchIcon() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function Label({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return <p className={`label${center ? " is-center" : ""}`}>{children}</p>;
}

function SectionHead({ label, title, body, action, center = false }: { label?: string; title: ReactNode; body?: ReactNode; action?: ReactNode; center?: boolean }) {
  return <div className={`section-head${center ? " is-center" : ""}`}>
    <div>
      {label ? <Label center={center}>{label}</Label> : null}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
    {action ? <div className="section-head-action">{action}</div> : null}
  </div>;
}

function PageHero({ label, title, body, image, video, poster, children, className = "", position, mark }: {
  mark?: ReactNode;
  label?: string;
  title: ReactNode;
  body?: ReactNode;
  image?: string;
  video?: string;
  poster?: string;
  children?: ReactNode;
  className?: string;
  position?: string;
}) {
  return <section className={`page-hero ${className}`}>
    <div className="page-hero-media" aria-hidden="true">
      {video
        ? <video autoPlay muted loop playsInline poster={poster}><source src={video} type="video/mp4" /></video>
        : image ? <img src={image} alt="" style={position ? { objectPosition: position } : undefined} fetchPriority="high" /> : null}
    </div>
    <div className="container page-hero-copy">
      {mark}
      {label ? <Label center>{label}</Label> : null}
      <h1>{title}</h1>
      {body ? <p className="lede">{body}</p> : null}
      {children}
    </div>
  </section>;
}

function Accordion({ items, initial = 0, numbered = false }: { items: readonly (readonly [string, string, string?])[]; initial?: number; numbered?: boolean }) {
  const [open, setOpen] = useState(initial);
  return <div className="accordion">
    {items.map(([question, answer, detail], index) => {
      const expanded = open === index;
      return <article className={`acc-item${expanded ? " is-open" : ""}`} key={question}>
        <button type="button" className="acc-trigger" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
          {numbered ? <span className="acc-num">{String(index + 1).padStart(2, "0")}</span> : null}
          <strong>{question}</strong>
          <i aria-hidden="true" />
        </button>
        <div className="acc-panel">
          <div>
            <p>{answer}</p>
            {detail ? <small>{detail}</small> : null}
          </div>
        </div>
      </article>;
    })}
  </div>;
}

const campusOrder = ["atlanta", "abeokuta", "houston", "ikeja", "ipaja", "london", "ifako", "online"];

function campusTitle(campus: Campus) {
  return campus.slug === "london" ? "UK" : campus.shortName;
}

function hasKnownAddress(campus: Campus) {
  return !campus.address.includes("released once available");
}

function isPending(text: string) {
  return text.includes("released once available");
}

function CampusCard({ campus }: { campus: Campus }) {
  return <Link className="campus-card" href={`/visit/${campus.slug}`}>
    <div className="campus-card-head">
      <h3>Zoe {campusTitle(campus)}</h3>
      <p>{campus.place}</p>
    </div>
    <div className="campus-card-photo">
      <img src={campus.portrait} alt={campus.pastor ? `${campus.pastor}, campus pastor of Zoe ${campus.shortName}` : ""} loading="lazy" />
      <span className="campus-card-pastor">
        <small>{campus.pastor ? "Campus Pastor" : "Meet the"}</small>
        <strong>{campus.pastor ?? "Campus Pastor"}</strong>
      </span>
      <span className="campus-card-explore">Explore Campus <i><Arrow /></i></span>
    </div>
  </Link>;
}

function CampusGrid() {
  const { campusesOrdered } = useSite();
  return <div className="campus-grid">
    {campusesOrdered.map((campus) => <CampusCard campus={campus} key={campus.slug} />)}
  </div>;
}

function EventBadges({ event, next = false }: { event: RankedEvent; next?: boolean }) {
  return <div className="event-card-badges">
    {event.phase === "live" ? <span className="badge is-live">Happening now</span> : null}
    {next && event.phase !== "live" ? <span className="badge is-next">Next up</span> : null}
    {event.nearby && event.phase !== "past" ? <span className="badge is-near">Near you</span> : null}
    {event.phase === "past" ? <span className="badge is-past">Past event</span> : null}
  </div>;
}

function EventMeta({ event, campusLabel }: { event: RankedEvent; campusLabel?: string }) {
  return <ul className="meta-list">
    {campusLabel ? <li><UserIcon />{campusLabel}</li> : null}
    <li><CalendarIcon />{event.dateLabel}</li>
    <li><PinIcon />{event.location}</li>
    {event.kilometers != null && event.phase !== "past" ? <li className="is-distance"><PinIcon />{formatKilometers(event.kilometers)}</li> : null}
  </ul>;
}

function EventCard({ event, onVolunteer, campusLabel }: { event: RankedEvent; onVolunteer?: () => void; campusLabel?: string }) {
  const past = event.phase === "past";
  return <article className={`event-card${past ? " is-past" : ""}`}>
    <div className="event-card-media">
      <img src={event.image} alt="" loading="lazy" />
      <EventBadges event={event} />
    </div>
    <div className="event-card-body">
      <span className="badge">{event.kind}</span>
      <h3>{event.title}</h3>
      <EventMeta event={event} campusLabel={campusLabel} />
      <p>{event.summary}</p>
      <div className="event-card-foot">
        <Link className="link-arrow" href={`/events/${event.slug}`}>{past ? "See what happened" : event.registerUrl ? "Register" : "See full details"} <Arrow /></Link>
        {onVolunteer && !past ? <button className="link-arrow is-muted" type="button" onClick={onVolunteer}>Volunteer <Arrow /></button> : null}
      </div>
    </div>
  </article>;
}

function FeaturedEvent({ event, now, onVolunteer, campusLabel }: { event: RankedEvent; now: number; onVolunteer?: () => void; campusLabel?: string }) {
  const countdown = relativeLabel(event, now);
  return <article className="event-feature">
    <div className="event-feature-media">
      <img src={event.image} alt="" />
      <EventBadges event={event} next />
    </div>
    <div className="event-feature-copy">
      <span className="badge">{event.kind}</span>
      <h3>{event.title}</h3>
      {countdown ? <span className="event-countdown"><ClockIcon />{countdown}</span> : null}
      <EventMeta event={event} campusLabel={campusLabel} />
      {event.summary ? <p>{event.summary}</p> : null}
      <div className="actions">
        {event.registerUrl
          ? <a className="btn btn-primary" href={event.registerUrl} target="_blank" rel="noreferrer">Register <Arrow /></a>
          : <Link className="btn btn-primary" href={`/events/${event.slug}`}>See full details <Arrow /></Link>}
        {event.registerUrl ? <Link className="btn btn-glass" href={`/events/${event.slug}`}>Event details</Link> : null}
        {onVolunteer ? <button className="btn btn-glass" type="button" onClick={onVolunteer}>Volunteer</button> : null}
      </div>
    </div>
  </article>;
}

/**
 * The next event for this visitor as a large card, followed by every other event:
 * upcoming soonest-first (nearby ones first), then past events, most recent first.
 */
function EventsShowcase({ limit, onVolunteer, campusSlug, showCampus = false }: { limit?: number; onVolunteer?: () => void; campusSlug?: string; showCampus?: boolean }) {
  const { bySlug } = useSite();
  const { ranked, now, located } = useRankedEvents(campusSlug);
  const labelFor = (event: RankedEvent) => (showCampus ? eventCampusLabel(event, bySlug) : undefined);
  const featured = ranked[0] && ranked[0].phase !== "past" ? ranked[0] : null;
  const rest = (featured ? ranked.slice(1) : ranked).slice(0, limit);
  const anyNearby = ranked.some((event) => event.nearby && event.phase !== "past");
  if (!ranked.length) return null;
  return <>
    {located && anyNearby ? <p className="events-note">Events near you are shown first.</p> : null}
    {featured ? <FeaturedEvent event={featured} now={now} onVolunteer={onVolunteer} campusLabel={labelFor(featured)} /> : null}
    {rest.length ? <div className="event-grid">
      {rest.map((event) => <EventCard event={event} key={event.slug} onVolunteer={onVolunteer} campusLabel={labelFor(event)} />)}
    </div> : null}
  </>;
}

function ResourcesSection({ id }: { id?: string }) {
  return <section id={id} className="section resources">
    <div className="container">
      <SectionHead
        label="Resources"
        title={<>Keep Growing <span className="hl">Through the Week</span></>}
        body="Resources to help you remain engaged with God's Word throughout the week."
        action={<Link className="link-arrow" href="/resources">See all resources <Arrow /></Link>}
      />
      <div className="resource-grid">
        <article className="resource-card is-teal">
          <span className="badge">Ongoing devotional · Substack</span>
          <h3>The Zoe Devotional</h3>
          <p>Scripture, reflection, and Christ-centered encouragement for the life you are living now.</p>
          <a className="btn btn-primary" href="https://thezoedevotional.substack.com/" target="_blank" rel="noreferrer">Read the Devotional <Arrow /></a>
        </article>
        <article className="resource-card has-image">
          <img src="/figma/bible-plan.jpg" alt="" loading="lazy" />
          <span className="badge">Bible plan</span>
          <h3>Who Is Jesus</h3>
          <p>Meet Jesus in Scripture and discover the life found in Him. Take time to slow down and reflect on His Word.</p>
          <a className="btn btn-glass" href="https://www.bible.com/reading-plans/71788-who-is-jesus" target="_blank" rel="noreferrer">Open in the Bible App <Arrow /></a>
        </article>
      </div>
    </div>
  </section>;
}

function WordCta() {
  return <section className="band band-image">
    <img src="/figma/sermon-subscribe-41dc6b.jpg" alt="" loading="lazy" />
    <div className="container band-inner is-center">
      <Label center>Watch &amp; listen</Label>
      <h2>There&apos;s a Word for You</h2>
      <p>Listen to messages from across Zoe Household and find biblical teaching to encourage your faith, strengthen your walk, and point you back to Jesus.</p>
      <div className="actions is-center">
        <Link className="btn btn-primary" href="/sermons"><PlayIcon /> Watch &amp; Listen</Link>
      </div>
    </div>
  </section>;
}

function PlanSteps({ campus, onOpen }: { campus: Campus; onOpen: (kind: "children" | "visit") => void }) {
  return <div className="step-grid">
    <article className="step-card">
      <span className="step-num">01</span>
      <h3>What to Expect</h3>
      <p>Engaging praise and worship, followed by a relevant, biblical message. Come as you are — there is a place for you.</p>
      <Link className="link-arrow" href="/about">Learn more <Arrow /></Link>
    </article>
    <article className="step-card">
      <span className="step-num">02</span>
      <h3>Make Check-In Easier</h3>
      <p>Bringing children? Register them ahead of time so check-in is quicker and easier when you arrive.</p>
      <button className="link-arrow" type="button" onClick={() => onOpen("children")}>Register your children <Arrow /></button>
    </article>
    <article className="step-card">
      <span className="step-num">03</span>
      <h3>We&apos;d Love to Welcome You</h3>
      <p>Planning to join us? Let us know, and tell us if there&apos;s anything you&apos;d like help with before Sunday.</p>
      <button className="link-arrow" type="button" onClick={() => onOpen("visit")}>Let us know <Arrow /></button>
    </article>
    <article className="step-card">
      <span className="step-num">04</span>
      <h3>Save the Date</h3>
      <p>Add the next Sunday service at Zoe {campus.shortName} to your calendar so you always know when and where to join.</p>
      <CalendarButton campus={campus} className="link-arrow"><>Add to calendar <Arrow /></></CalendarButton>
    </article>
  </div>;
}

function HomePage() {
  return <>
    <section className="page-hero hero-home">
      <div className="page-hero-media" aria-hidden="true">
        <video autoPlay muted loop playsInline poster="/hero/zoe-welcome-team.jpg">
          <source src="/hero/zoe-hero.mp4?v=2" type="video/mp4" />
        </video>
      </div>
      <div className="container page-hero-copy">
        <Label center>Greek: ζωή</Label>
        <h1>The Life of God</h1>
        <p className="lede">A people led by the Spirit, shining the light of the gospel in every sector.</p>
        <div className="actions is-center">
          <Link className="btn btn-primary" href="/visit">Find a Campus <Arrow /></Link>
          <Link className="btn btn-glass" href="/sermons"><PlayIcon /> Watch a Sermon</Link>
        </div>
      </div>
    </section>

    <section className="section who">
      <div className="container who-grid">
        <div className="who-copy">
          <Label>Who we are</Label>
          <h2>One People <span className="hl">in Christ</span></h2>
          <p className="statement">What makes us unique is our unwavering commitment to revealing Christ. We&apos;re not just a church.</p>
          <p>ZOE Household is a people committed to revealing Jesus and His unending grace. From our gatherings to the sectors and communities we serve, we continue to grow as one household living out our identity in Christ and shining the light of the gospel.</p>
          <div className="who-points">
            <div><span>01</span><strong>Spirit Led</strong><p>Led by the Spirit. Living the life of God.</p></div>
            <div><span>02</span><strong>Identity in Christ</strong><p>Discovering who we are as He sees us in Him.</p></div>
          </div>
          <Link className="link-arrow" href="/about">Discover who we are <Arrow /></Link>
        </div>
        <figure className="who-media">
          <img src="/figma/who-we-are-1e3fbc.jpg" alt="People gathered at Zoe Household" loading="lazy" />
        </figure>
      </div>
    </section>

    <section className="section feature">
      <div className="container">
        <a className="feature-media" href={socialLinks.youtube} target="_blank" rel="noreferrer">
          <img src="/figma/feature-video.jpg" alt="" loading="lazy" />
          <span className="feature-play" aria-hidden="true"><PlayIcon /></span>
          <span className="feature-caption">
            <span className="label">This week&apos;s word</span>
            <strong>Watch the latest message</strong>
            <em>On YouTube <Arrow /></em>
          </span>
        </a>
      </div>
    </section>

    <section className="section campuses is-paper">
      <div className="container">
        <SectionHead
          label="Our campuses"
          title={<>One Family, <span className="hl">Many Cities</span></>}
          body="Campuses across Nigeria, the United States, the United Kingdom, and online. Find the gathering nearest you — a campus pastor will be glad to welcome you."
          action={<Link className="btn btn-dark" href="/visit">Find a Campus <Arrow /></Link>}
        />
        <CampusGrid />
      </div>
    </section>

    <ResourcesSection />

    <section className="band band-lime">
      <div className="container band-inner">
        <div>
          <Label>Prayer</Label>
          <h2>We Would Love to Pray With You</h2>
          <p>Whatever you&apos;re carrying, you can bring it to God. Share your prayer request and allow the Zoe Household to stand with you.</p>
        </div>
        <Link className="btn btn-dark" href="/prayer">Submit a Prayer Request <Arrow /></Link>
      </div>
    </section>

    <section className="section events is-raised">
      <div className="container">
        <SectionHead
          label="Where we'll gather"
          title={<><span className="hl">Gather</span> With the Household</>}
          body="Join us for powerful moments of worship, teaching, and fellowship. We'd love to see you at one of our upcoming gatherings."
          action={<Link className="link-arrow" href="/events">All events <Arrow /></Link>}
        />
        <EventsShowcase limit={6} showCampus />
      </div>
    </section>

    <section className="band band-glow">
      <div className="container band-inner is-center">
        <Label center>Join the household</Label>
        <h2>Find Your Place in the Household</h2>
        <p>Connect with a campus, find community, and become part of a people committed to knowing Jesus, growing together, and shining the light of the gospel.</p>
        <div className="actions is-center">
          <Link className="btn btn-primary" href="/visit">Join the Household <Arrow /></Link>
          <Link className="btn btn-glass" href="/visit">Find a Campus</Link>
        </div>
      </div>
    </section>
  </>;
}

function AboutPage() {
  return <>
    <section className="about-hero">
      <div className="container about-hero-copy">
        <Label center>Who we are</Label>
        <h1>This Is Zoe. <br />This Is Who We Are.</h1>
        <p className="lede">A people growing together in the life of God.</p>
      </div>
      <div className="container">
        <figure className="about-hero-photo">
          <img src="/figma/about-hero-frame.jpg" alt="Zoe Household worship gathering" fetchPriority="high" />
        </figure>
      </div>
    </section>

    <section className="vision">
      <div className="container vision-grid">
        <article className="vision-card is-lemon">
          <Label>Vision</Label>
          <h2>Revealing Identity in Christ</h2>
          <p>To reveal the believer&apos;s identity in Christ and bring unbelievers into the reality of who they are in Him, discovering the life, purpose, and identity found in Christ.</p>
        </article>
        <article className="vision-card">
          <Label>Mission</Label>
          <h2>Embodying the Life of God</h2>
          <p>To teach and reveal Jesus and His unending grace, raising a people who embody the life of God and serve the body of Christ across every sector and area of life.</p>
        </article>
      </div>
    </section>

    <section className="section pastor">
      <div className="container pastor-grid">
        <figure className="pastor-photo">
          <img src="/figma/asset-04-15ae5e.jpg" alt="Pastor Dolapo Lawal" loading="lazy" />
          <figcaption><span>Lead Pastor</span><strong>Pastor Dolapo Lawal</strong></figcaption>
        </figure>
        <div className="pastor-copy">
          <Label>Our lead pastor</Label>
          <h2>Pastor Dolapo <span className="hl">Lawal</span></h2>
          <p>{pastorDolapoBio}</p>
          <dl className="stats">
            {[["14+", "Years of ministry"], ["1200+", "Sermons preached"], ["15+", "Nations reached"], ["2M+", "Lives impacted"]].map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}
          </dl>
          <div className="actions">
            <a className="btn btn-primary" href="https://www.pastordolapolawal.com/" target="_blank" rel="noreferrer">Read Full Biography <Arrow /></a>
            <Link className="btn btn-glass" href="/sermons"><PlayIcon /> Watch a Sermon</Link>
          </div>
        </div>
      </div>
    </section>

    <section className="section nations is-raised">
      <div className="container">
        <SectionHead
          label="Nations reached"
          title={<>One Household, <span className="hl">Many Nations</span></>}
          body="Zoe is one household gathered across different cities and nations. From Nigeria to the United States and the United Kingdom, our campuses are different locations within the same household."
          action={<Link className="btn btn-primary" href="/visit">Explore All Campuses <Arrow /></Link>}
        />
        <NationsMap />
      </div>
    </section>
  </>;
}

const doctrine = [
  ["God", beliefs[0][1], beliefs[0][2]],
  ["Jesus Christ", "We believe that Jesus Christ is the Son of God, fully God and fully man, who came to earth through the virgin birth, lived a sinless life, died on the cross for our sins, and rose again on the third day. He is the only way to the Father and the only source of eternal life. Jesus is Savior, Lord, and soon-coming King.", "John 1:1 · Philippians 2:6–8 · Luke 1:35 · John 14:6 · 1 Corinthians 15:3–4"],
  ["The Holy Spirit", beliefs[2][1], beliefs[2][2]],
  ["The Trinity", beliefs[3][1], beliefs[3][2]],
  ["Salvation", beliefs[4][1], beliefs[4][2]],
  ["Sanctification", beliefs[5][1], beliefs[5][2]],
  ["Spiritual Gifts", beliefs[6][1], beliefs[6][2]],
  ["Communion", beliefs[7][1], beliefs[7][2]],
  ["Marriage", beliefs[8][1], beliefs[8][2]],
  ["Resurrection", beliefs[9][1], beliefs[9][2]],
  ["Christ’s Return", beliefs[10][1], beliefs[10][2]],
] as const;

function BeliefsPage() {
  const [open, setOpen] = useState(0);
  const choose = (index: number) => {
    setOpen(index);
    document.getElementById(`belief-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return <>
    <PageHero label="What we believe" title="What We Believe" body="The truths that shape how we see Jesus, understand His work in us, and live out the life we've received in Him." image="/figma/beliefs-hero.jpg" />

    <section className="section beliefs">
      <div className="container beliefs-grid">
        <aside className="beliefs-index">
          <p className="label">Doctrinal index</p>
          <nav aria-label="Doctrinal index">
            {doctrine.map(([title], index) => <button type="button" key={title} className={open === index ? "is-active" : ""} onClick={() => choose(index)}><span>{String(index + 1).padStart(2, "0")}</span>{title}</button>)}
          </nav>
        </aside>
        <div className="beliefs-body">
          <div className="beliefs-intro">
            <h2>What We Believe <span className="hl">Matters</span></h2>
            <p>Our beliefs aren&apos;t just words on a page. They shape the way we see Jesus, understand His work in us, and live out the life we&apos;ve received in Him.</p>
            <strong>Here is what we believe as the Zoe Household.</strong>
          </div>
          <div className="accordion">
            {doctrine.map(([title, body, refs], index) => {
              const expanded = open === index;
              return <article id={`belief-${index}`} className={`acc-item${expanded ? " is-open" : ""}`} key={title}>
                <button type="button" className="acc-trigger" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
                  <span className="acc-num">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <i aria-hidden="true" />
                </button>
                <div className="acc-panel"><div><p>{body}</p><small>{refs}</small></div></div>
              </article>;
            })}
          </div>
        </div>
      </div>
    </section>

    <ResourcesSection />
  </>;
}

const faqTabs = ["General", "Visiting Zoe", "Gatherings & Services", "Campuses", "Getting Connected", "Giving & Support"] as const;
type FaqTab = (typeof faqTabs)[number];

const faqItems: { tab: FaqTab; q: string; a: string }[] = [
  { tab: "General", q: "What should I expect when I visit Zoe?", a: "Expect a warm welcome, worship, prayer, practical teaching from Scripture, and a household ready to help you settle in." },
  { tab: "General", q: "What time are your gatherings?", a: "Zoe Atlanta gathers on Sundays at 4:00pm and Thursdays at 7:00pm. Service times for the other campuses will be released once available." },
  { tab: "General", q: "Do I need to register before attending?", a: "No. You are always welcome to attend. The optional visitor form simply helps the local team prepare to welcome you and answer questions before Sunday." },
  { tab: "General", q: "What should I wear?", a: "Come as you are. Zoe is a place to meet with God and people, not a dress code to get right." },
  { tab: "General", q: "Can I bring my children?", a: "Yes. Zoe Arrows welcomes children. Check-in guidance and optional pre-registration are available on every campus page." },
  { tab: "Visiting Zoe", q: "What should I expect when I visit Zoe?", a: "Expect a warm welcome, worship, prayer, practical teaching from Scripture, and a household ready to help you settle in." },
  { tab: "Visiting Zoe", q: "Do I need to register before attending?", a: "No. You are always welcome to attend. The optional visitor form simply helps the local team prepare to welcome you and answer questions before Sunday." },
  { tab: "Visiting Zoe", q: "What should I wear?", a: "Come as you are. Zoe is a place to meet with God and people, not a dress code to get right." },
  { tab: "Visiting Zoe", q: "Can I bring my children?", a: "Yes. Zoe Arrows welcomes children. Check-in guidance and optional pre-registration are available on every campus page." },
  { tab: "Gatherings & Services", q: "What time are your gatherings?", a: "Zoe Atlanta gathers on Sundays at 4:00pm and Thursdays at 7:00pm. Service times for the other campuses will be released once available." },
  { tab: "Gatherings & Services", q: "How do I receive service reminders?", a: "Enter your email on the relevant campus page to join that campus’s service reminder list." },
  { tab: "Campuses", q: "How do I find a campus near me?", a: "Use the address finder on the Visit page or browse all seven Zoe Household locations." },
  { tab: "Getting Connected", q: "Can I join online?", a: "Yes. If a physical campus is not near you, share your email through Zoe Online and the team will contact you with access details." },
  { tab: "Getting Connected", q: "How do I become part of the household?", a: "Start with a Sunday gathering, then connect with the local team. They will help you find community and next steps." },
  { tab: "Giving & Support", q: "How can I give?", a: "Use the Give page to support Zoe Global or a specific campus through its available giving method." },
  { tab: "Giving & Support", q: "How can I submit a prayer request?", a: "Use the dedicated Prayer page so your request can be routed carefully to the appropriate prayer team." },
];

async function postSubmission(body: Record<string, unknown>) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({ ok: false, error: "Unexpected response from server." }));
  if (!response.ok || !result.ok) throw new Error(result.error ?? "Something went wrong. Please try again.");
}

function FaqPage() {
  const [tab, setTab] = useState<FaqTab>("General");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const term = query.trim().toLowerCase();
  const visible = term
    ? faqItems.filter((item, index, list) => `${item.q} ${item.a}`.toLowerCase().includes(term) && list.findIndex((other) => other.q === item.q) === index)
    : faqItems.filter((item) => item.tab === tab);

  const chooseTab = (next: FaqTab) => {
    setTab(next);
    setQuery("");
    setOpen(0);
    document.getElementById("faq-answers")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sendInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    if (data.get("website")) {
      setSent(true);
      return;
    }
    setSubmitting(true);
    try {
      await postSubmission({
        kind: "inquiry",
        name: data.get("name"),
        email: data.get("email"),
        phone: "",
        topic: data.get("topic"),
        message: data.get("message"),
        region: data.get("atlantaEmails") === "on" ? "Zoe Atlanta emails" : "",
        consent: true,
      });
      setSent(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    <PageHero label="Frequently asked questions" title="How Can We Help?" body="Have a question about Zoe Household, visiting a campus, our gatherings, or getting connected? Start here." image="/figma/faq-hero.jpg">
      <div className="hero-search">
        <label className="search-field">
          <SearchIcon />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setOpen(0); }} onKeyDown={(event) => { if (event.key === "Enter") document.getElementById("faq-answers")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} placeholder="What should I expect when I visit?" aria-label="Search questions" />
        </label>
        <div className="chip-row is-center">
          <span>Popular:</span>
          <button className="chip" type="button" onClick={() => chooseTab("Getting Connected")}>Getting connected</button>
          <button className="chip" type="button" onClick={() => chooseTab("Visiting Zoe")}>Visiting Zoe</button>
          <button className="chip" type="button" onClick={() => chooseTab("Campuses")}>Campuses</button>
        </div>
      </div>
    </PageHero>

    <section className="section">
      <div className="container topic-grid">
        {([
          ["Visiting Zoe", "Questions about visiting Zoe and what to expect when you arrive.", "Visiting Zoe"],
          ["Find a Campus", "Find a Zoe location and learn more about gathering there.", "Campuses"],
          ["Getting Connected", "Find out how to become part of the Zoe Household and grow together.", "Getting Connected"],
          ["What We Believe", "Learn more about the truths that guide our household.", ""],
        ] as const).map(([title, body, next]) => next ? (
          <button className="topic-card" type="button" key={title} onClick={() => chooseTab(next)}>
            <strong>{title}</strong>
            <span>{body}</span>
            <em>Explore questions <Arrow /></em>
          </button>
        ) : (
          <Link className="topic-card" key={title} href="/about/beliefs">
            <strong>{title}</strong>
            <span>{body}</span>
            <em>Read our beliefs <Arrow /></em>
          </Link>
        ))}
      </div>
    </section>

    <section id="faq-answers" className="section faq-answers is-raised">
      <div className="container narrow">
        <SectionHead center label="Answers" title={<>Find Your <span className="hl">Answer</span></>} body="Browse the questions people ask most often. Can't find what you're looking for? Search above or send us an inquiry below." />
        <div className="tab-row" role="tablist">
          {faqTabs.map((name) => <button key={name} type="button" role="tab" aria-selected={!term && tab === name} className={!term && tab === name ? "is-active" : ""} onClick={() => { setTab(name); setQuery(""); setOpen(0); }}>{name}</button>)}
        </div>
        {term ? <p className="results-note">Showing results for “{query.trim()}”</p> : null}
        <div className="accordion">
          {visible.length === 0 ? <p className="empty-note">No questions match that search.</p> : null}
          {visible.map((item, index) => {
            const expanded = open === index;
            return <article key={`${item.tab}-${item.q}`} className={`acc-item${expanded ? " is-open" : ""}`}>
              <button type="button" className="acc-trigger" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
                <strong>{item.q}</strong>
                <i aria-hidden="true" />
              </button>
              <div className="acc-panel"><div><p>{item.a}</p></div></div>
            </article>;
          })}
        </div>
      </div>
    </section>

    <ResourcesSection />

    <section id="general-inquiry" className="section inquiry">
      <div className="container inquiry-grid">
        <div>
          <Label>Get in touch</Label>
          <h2>Still Have a <span className="hl">Question?</span></h2>
          <p>That&apos;s okay. If you couldn&apos;t find what you were looking for, send us your question and we&apos;ll help get you to the right place.</p>
        </div>
        {sent ? <div className="form-panel is-sent" role="status"><h3>Message sent</h3><p>Thank you. We&apos;ll help you get to the right place.</p></div> : (
          <form className="form-panel" onSubmit={sendInquiry}>
            <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-row">
              <label>Full name<input name="name" required placeholder="Enter full name" autoComplete="name" /></label>
              <label>Email<input name="email" type="email" required placeholder="Enter email address" autoComplete="email" /></label>
            </div>
            <label>What can we help you with?
              <select name="topic" required defaultValue="">
                <option value="" disabled>Select below</option>
                {faqTabs.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label>Your message<textarea name="message" required placeholder="Your message" rows={4} /></label>
            <label className="check"><input name="atlantaEmails" type="checkbox" /> Also include me in Zoe Atlanta emails.</label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send Message"}</button>
          </form>
        )}
      </div>
    </section>
  </>;
}

const LIVE_TIME_ZONE = "America/New_York";
const LIVE_HOUR = 16;
const LIVE_MINUTE = 0;

function easternParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LIVE_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: read("weekday"),
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour: Number(read("hour")),
    minute: Number(read("minute")),
  };
}

function atEastern(year: number, month: number, day: number, hour: number, minute: number) {
  let utc = Date.UTC(year, month - 1, day, hour + 5, minute);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const seen = easternParts(new Date(utc));
    const delta = (hour - seen.hour) * 60 + (minute - seen.minute);
    const dayDrift = (year - seen.year) * 365 + (month - seen.month) * 31 + (day - seen.day);
    if (delta === 0 && dayDrift === 0) break;
    utc += (delta + dayDrift * 24 * 60) * 60 * 1000;
  }
  return new Date(utc);
}

function nextSundayLabel(now = new Date()) {
  const today = easternParts(now);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(today.weekday);
  let daysAhead = (7 - weekdayIndex) % 7;
  if (daysAhead === 0 && today.hour * 60 + today.minute >= LIVE_HOUR * 60 + LIVE_MINUTE) daysAhead = 7;
  const target = new Date(Date.UTC(today.year, today.month - 1, today.day + daysAhead));
  const when = atEastern(target.getUTCFullYear(), target.getUTCMonth() + 1, target.getUTCDate(), LIVE_HOUR, LIVE_MINUTE);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: LIVE_TIME_ZONE,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(when);
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: LIVE_TIME_ZONE, timeZoneName: "short" })
    .formatToParts(when)
    .find((part) => part.type === "timeZoneName")?.value ?? "ET";
  return `${day} · 4:00 PM Eastern Time (${zone})`;
}

const FAR_THRESHOLD_KM = 80.47; // 50 miles

function formatDistance(kilometers: number) {
  const miles = kilometers * 0.621371;
  if (kilometers < 1) return "Less than a mile away";
  const shown = miles < 10 ? miles.toFixed(1) : Math.round(miles).toLocaleString("en-US");
  const km = kilometers < 10 ? kilometers.toFixed(1) : Math.round(kilometers).toLocaleString("en-US");
  return `About ${km} km · ${shown} miles away`;
}

function OnlineGathering({ variant = "none" }: { variant?: "none" | "far" }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const remind = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    if (data.get("website")) {
      setSent(true);
      return;
    }
    setSubmitting(true);
    try {
      await postSubmission({ kind: "online", name: data.get("name"), email: data.get("email"), phone: data.get("phone") ?? "" });
      setSent(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return <section className="section online is-raised">
    <div className="container online-grid">
      <div>
        <Label>Zoe online</Label>
        <h2>{variant === "far" ? <>That Campus Is More Than <span className="hl">50 Miles Away</span></> : <>Join the Household <span className="hl">Online</span></>}</h2>
        <p>{variant === "far"
          ? "The closest campus is shown above, but it's a bit of a journey. You're just as welcome to gather with us online and stream the service live."
          : "We couldn't place a campus from that search. You're still welcome to gather with us online and stream the service live."}</p>
        <div className="live-card">
          <span className="live-dot" aria-hidden="true" />
          <div><strong>Next live gathering</strong><p>{nextSundayLabel()}</p></div>
        </div>
        <a className="btn btn-glass" href={socialLinks.youtube} target="_blank" rel="noreferrer"><PlayIcon /> Watch on YouTube</a>
      </div>
      {sent ? <div className="form-panel is-sent" role="status"><h3>You&apos;re on the list</h3><p>We&apos;ll remind you before the next gathering.</p></div> : (
        <form className="form-panel" onSubmit={remind}>
          <h3>Don&apos;t miss the next gathering</h3>
          <p>Leave your details and we&apos;ll remind you before the next live gathering.</p>
          <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>Full name<input name="name" required placeholder="Enter full name" autoComplete="name" /></label>
          <label>Email address<input name="email" type="email" required placeholder="Enter email address" autoComplete="email" /></label>
          <label>Phone number<input name="phone" type="tel" placeholder="Enter phone number" autoComplete="tel" /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Remind Me"}</button>
        </form>
      )}
    </div>
  </section>;
}

function VisitPage() {
  const { bySlug, campusesOrdered } = useSite();
  const atlanta = bySlug.get("atlanta") ?? campusesOrdered[0];
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<{ campus: MergedCampus; kilometers: number | null } | "online" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"children" | "visit" | null>(null);

  const showCampus = async (params: URLSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/campus-near?${params.toString()}`);
      const data = await response.json() as { slug?: string; kilometers?: number | null; error?: string; matched?: string; lat?: number; lng?: number };
      if (response.status === 404) {
        setResult("online");
      } else if (!response.ok || !data.slug) {
        throw new Error(data.error ?? "We couldn't find a campus from that search.");
      } else {
        const campus = bySlug.get(data.slug);
        if (!campus) throw new Error("We couldn't find a campus from that search.");
        setResult({ campus, kilometers: data.kilometers ?? null });
        if (data.matched !== "name" && Number.isFinite(data.lat) && Number.isFinite(data.lng)) rememberVisitorLocation({ lat: data.lat!, lng: data.lng! });
      }
      window.setTimeout(() => document.getElementById("visit-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (problem) {
      setResult(null);
      setError(problem instanceof Error ? problem.message : "We couldn't find a campus from that search.");
    } finally {
      setLoading(false);
    }
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    const query = address.trim();
    if (query.length < 2) return;
    void showCampus(new URLSearchParams({ q: query }));
  };

  const locate = (auto = false) => {
    if (!navigator.geolocation) {
      if (!auto) setError("This browser can't share your location. Enter a city or address instead.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void showCampus(new URLSearchParams({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        }));
      },
      () => {
        setLoading(false);
        // On auto-detect we stay quiet and let the visitor search manually.
        if (!auto) setError("Location access was blocked. Enter a city or address instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  // When a visitor lands on the Campus page, try to show their nearest campus
  // automatically. If permission is blocked/unavailable we silently fall back
  // to the manual finder below.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    locate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>
    <PageHero label="Visit" title="Find Your Campus" body="Enter a city or address, or use your location. We'll show the closest Zoe campus, and you can join online as well." image="/figma/visit-hero.jpg">
      <form id="visit-finder" className="finder" onSubmit={search}>
        <label className="search-field">
          <PinIcon />
          <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Where are you coming from?" aria-label="Where are you coming from" required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Finding…" : "Find My Campus"} <Arrow /></button>
      </form>
      <small className="hero-note">Your location is only used to find the nearest campus. <button className="note-button" type="button" onClick={() => locate()} disabled={loading}>Use my current location</button></small>
    </PageHero>

    <div id="visit-result">
      {error ? <section className="section"><div className="container"><p className="form-error" role="alert">{error}</p></div></section> : null}
      {result && result !== "online" ? (() => {
        const far = result.kilometers != null && result.kilometers > FAR_THRESHOLD_KM;
        return <>
          <section className="section found is-raised">
            <div className="container">
              <article className="found-card">
                <img src={result.campus.image} alt="" />
                <div>
                  <Label>Closest campus</Label>
                  <h2>Zoe {campusTitle(result.campus)}</h2>
                  <ul className="meta-list">
                    <li><PinIcon />{hasKnownAddress(result.campus) ? result.campus.address : result.campus.place}</li>
                    <li><ClockIcon />{isPending(result.campus.services[0].schedule) ? "Service time to be announced" : result.campus.services[0].schedule}</li>
                    {result.kilometers != null ? <li><PinIcon />{formatDistance(result.kilometers)}</li> : null}
                  </ul>
                  <div className="actions">
                    <Link className="btn btn-primary" href={`/visit/${result.campus.slug}`}>Plan Your Visit <Arrow /></Link>
                    <button className="btn btn-glass" type="button" onClick={() => setResult(null)}>Search again</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
          {far ? <OnlineGathering variant="far" /> : null}
        </>;
      })() : null}
      {result === "online" ? <OnlineGathering variant="none" /> : null}
    </div>

    <section className="section campuses is-paper">
      <div className="container">
        <SectionHead label="Our campuses" title={<>One Family, <span className="hl">Many Cities</span></>} body="Campuses across Nigeria, the United States, the United Kingdom, and online. Choose a campus to see service times, directions, and what to expect." />
        <CampusGrid />
      </div>
    </section>

    <section className="section">
      <div className="container">
        <SectionHead label="Plan your visit" title={<>Planning Your <span className="hl">Visit?</span></>} body="Everything you need for your first visit, all in one place." />
        <PlanSteps campus={result && result !== "online" ? result.campus : atlanta} onOpen={setModal} />
      </div>
    </section>

    <WordCta />
    {modal ? <Modal onClose={() => setModal(null)}><FormCard kind={modal} campus={result && result !== "online" ? result.campus : atlanta} onClose={() => setModal(null)} /></Modal> : null}
  </>;
}

const defaultOnlineActivities: CampusActivity[] = [
  {
    title: "Sunday Online Gathering",
    schedule: "Sundays · Schedule updated regularly",
    description: "Stream worship, prayer, and the Word live with the Zoe Online Church family.",
  },
  {
    title: "Online Prayer Stretch",
    schedule: "Weekly · Schedule updated regularly",
    description: "Join the online household in corporate prayer and intercession throughout the week.",
  },
  {
    title: "Online Bible Study & Word Share",
    schedule: "Midweek · Schedule updated regularly",
    description: "Dig deeper into Scripture, ask questions, and grow in grace alongside other believers.",
  },
  {
    title: "Zoe Membership Class",
    schedule: "Monthly · Schedule updated regularly",
    description: "Learn the vision, beliefs, and culture of Zoe Household and take your next step into the family.",
  },
];

function GlobalNewsletterSignup({ campusSlug }: { campusSlug?: string }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    if (data.get("website")) {
      setSent(true);
      return;
    }
    setSubmitting(true);
    try {
      await postSubmission({
        kind: "newsletter",
        campus: campusSlug ?? "online",
        name: data.get("name") ?? "",
        email: data.get("email") ?? "",
      });
      setSent(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return <section id="global-newsletter" className="section online is-raised">
    <div className="container online-grid">
      <div>
        <Label>Global newsletter</Label>
        <h2>Stay Connected With <span className="hl">Zoe Global</span></h2>
        <p>Sign up for the Zoe Household global newsletter to receive ministry updates, upcoming global gatherings, devotionals, and announcements right in your inbox.</p>
      </div>
      {sent ? (
        <div className="form-panel is-sent" role="status">
          <h3>You&apos;re subscribed</h3>
          <p>Thank you for signing up for the Zoe Household global newsletter.</p>
        </div>
      ) : (
        <form className="form-panel" onSubmit={subscribe}>
          <h3>Join the Global Newsletter</h3>
          <p>Enter your details below to receive updates from across the Zoe Household.</p>
          <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>Full name<input name="name" placeholder="Enter full name" autoComplete="name" /></label>
          <label>Email address<input name="email" type="email" required placeholder="Enter email address" autoComplete="email" /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? "Subscribing…" : "Sign Up for Newsletter"}</button>
        </form>
      )}
    </div>
  </section>;
}

function CampusEvents({ campus, title }: { campus: MergedCampus; title: string }) {
  const { events } = useSite();
  const isOnline = campus.slug === "online";
  const hasCampusEvents = events.some((event) => event.campusSlug === campus.slug);
  const activities = campus.activities && campus.activities.length ? campus.activities : isOnline ? defaultOnlineActivities : [];

  if (!hasCampusEvents && !activities.length) return null;

  return <section id="activities-events" className="section campus-events">
    <div className="container">
      <SectionHead
        label={isOnline ? "Activities & events" : "Events"}
        title={isOnline ? <>Activities &amp; Events at <span className="hl">Zoe {title}</span></> : <>What&apos;s Happening at <span className="hl">Zoe {title}</span></>}
        body={isOnline
          ? "Join our recurring online activities and upcoming gatherings throughout the week."
          : "Only gatherings assigned to this campus. The next one is first, then the rest from upcoming to past."}
      />
      {activities.length ? (
        <div className="step-grid online-activity-grid">
          {activities.map((activity, index) => (
            <article className="step-card" key={`${activity.title}-${index}`}>
              <span className="step-num">{String(index + 1).padStart(2, "0")}</span>
              <span className="badge">{activity.schedule || "Schedule to be announced"}</span>
              <h3>{activity.title}</h3>
              {activity.description ? <p>{activity.description}</p> : null}
              {activity.link ? <a className="link-arrow" href={activity.link} target="_blank" rel="noreferrer">Join / Details <Arrow /></a> : null}
            </article>
          ))}
        </div>
      ) : null}
      {hasCampusEvents ? <EventsShowcase campusSlug={campus.slug} /> : null}
    </div>
  </section>;
}

function CampusPage({ campus }: { campus: MergedCampus }) {
  const { campusesOrdered } = useSite();
  const [modal, setModal] = useState<"children" | "visit" | "reminder" | null>(null);
  const isOnline = campus.slug === "online";
  const known = hasKnownAddress(campus);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.address)}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(campus.address)}&output=embed`;
  const first = campus.services[0];
  const others = campusesOrdered.filter((item) => item.slug !== campus.slug);
  const gallery = campus.gallery ?? [];
  const title = campusTitle(campus);
  const newHereHref = campus.newHereUrl || "https://churchq.io/login?utm_source=zoehousehold&utm_medium=website&utm_campaign=online_new_here";
  const whatsappHref = campus.whatsappChannelUrl || "";
  const membershipTitle = campus.membershipClassTitle || "Next Membership Class";
  const membershipSchedule = campus.membershipClassSchedule || "Dates and registration details for the upcoming membership class will be shared here.";
  const membershipFlyer = campus.membershipClassFlyer || "/figma/about-vision-51f746.jpg";

  return <div className="campus-page" key={campus.slug}>
    <section className="campus-hero">
      <img className="campus-hero-media" src={campus.image} alt="" fetchPriority="high" />
      <div className="container campus-hero-copy">
        <Label>Zoe Household · {campus.place}</Label>
        <h1>Zoe {title}</h1>
        <p className="lede">You&apos;re welcome here. Join us at Zoe {campus.shortName} as we gather to worship Jesus, hear the Word, and grow together as a household of faith.</p>
        <div className="actions">
          <a className="btn btn-primary" href="#plan-visit">{isOnline ? "Join the Online Community" : "Plan Your Visit"} <Arrow /></a>
          {isOnline ? (
            <a className="btn btn-glass" href={newHereHref} target="_blank" rel="noreferrer" data-track="online-new-here-hero">I&apos;m New Here <Arrow /></a>
          ) : known ? (
            <a className="btn btn-glass" href={maps} target="_blank" rel="noreferrer"><PinIcon /> Get Directions</a>
          ) : (
            <Link className="btn btn-glass" href="/sermons"><PlayIcon /> Watch Online</Link>
          )}
        </div>
      </div>
      <div className="container">
        <dl className="campus-facts">
          <div>
            <dt><ClockIcon />{first.name}</dt>
            <dd>{isPending(first.schedule) ? "Time to be announced" : first.schedule}</dd>
          </div>
          <div>
            <dt><PinIcon />{isOnline ? "Where we gather" : "Location"}</dt>
            <dd>{known ? campus.address : isOnline ? "Streaming online" : "Location to be announced"}</dd>
          </div>
          <div>
            {campus.pastor ? (
              <><dt><UserIcon />Campus Pastor</dt><dd>{campus.pastor}</dd></>
            ) : campus.phone ? (
              <><dt><PhoneIcon />Call the campus</dt><dd><a href={`tel:${campus.phone.replace(/\s|-/g, "")}`}>{campus.phone}</a></dd></>
            ) : (
              <><dt><UserIcon />Questions</dt><dd><button type="button" onClick={() => setModal("visit")}>Send us a note</button></dd></>
            )}
          </div>
        </dl>
      </div>
    </section>

    <section className="section campus-verse">
      <div className="container narrow">
        <Label center>{isOnline ? "Verse of the month · Read during online announcements" : "Verse of the month"}</Label>
        <blockquote>“{campus.verse}”</blockquote>
        <cite>— {campus.verseRef}</cite>
        <small>
          {isOnline
            ? "This is the Verse of the Month read aloud to our online members during announcements — a word to confess and carry together throughout the month."
            : "A word to carry with us throughout the month."}
        </small>
      </div>
    </section>

    {isOnline ? (
      <section id="new-here" className="band band-lime">
        <div className="container band-inner">
          <div>
            <Label>I&apos;m new here</Label>
            <h2>New to Zoe Online Church?</h2>
            <p>We&apos;re so glad you&apos;re here. Connect with us through the ChurchOS app so our team can welcome you personally, help you settle in, and walk with you.</p>
          </div>
          <a className="btn btn-dark" href={newHereHref} target="_blank" rel="noreferrer" data-track="online-new-here-band">I&apos;m New Here · Open ChurchOS <Arrow /></a>
        </div>
      </section>
    ) : null}

    {(campus.whatToExpect || campus.gettingThere || campus.parking || campus.languages || campus.email || campus.instagram) ? (
      <section className="section campus-know">
        <div className="container">
          <SectionHead label="Good to know" title={isOnline ? <>Welcome to <span className="hl">Zoe {title}</span></> : <>Your First Visit to <span className="hl">Zoe {title}</span></>} body={campus.whatToExpect ?? undefined} />
          <dl className="campus-facts">
            {campus.languages ? <div><dt><UserIcon />Service language</dt><dd>{campus.languages}</dd></div> : null}
            {campus.parking ? <div><dt><PinIcon />Parking</dt><dd>{campus.parking}</dd></div> : null}
            {campus.gettingThere ? <div><dt><PinIcon />Getting there</dt><dd>{campus.gettingThere}</dd></div> : null}
            {campus.email ? <div><dt><UserIcon />Email</dt><dd><a href={`mailto:${campus.email}`}>{campus.email}</a></dd></div> : null}
            {campus.instagram ? <div><dt><UserIcon />Instagram</dt><dd><a href={campus.instagram} target="_blank" rel="noreferrer">Follow this campus</a></dd></div> : null}
          </dl>
        </div>
      </section>
    ) : null}

    <CampusEvents campus={campus} title={title} />

    {isOnline ? (
      <section id="connect-grow" className="section is-raised">
        <div className="container">
          <SectionHead
            label="Connect & grow"
            title={<>Ways to Connect <span className="hl">and Grow</span></>}
            body="Being part of Zoe Online Church is more than watching a broadcast — it's sharing life, growing in the Word, and walking with a spiritual family."
          />
          <div className="step-grid">
            <article className="step-card">
              <span className="step-num">01</span>
              <h3>I&apos;m New Here</h3>
              <p>First time streaming with us? Let us know through ChurchOS so we can welcome you and help you get connected.</p>
              <a className="link-arrow" href={newHereHref} target="_blank" rel="noreferrer" data-track="online-new-here-card">Connect on ChurchOS <Arrow /></a>
            </article>
            <article className="step-card">
              <span className="step-num">02</span>
              <h3>Join the WhatsApp Channel</h3>
              <p>Stay in the loop with daily encouragement, live stream links, prayer prompts, and family announcements.</p>
              <a className="link-arrow" href={whatsappHref || "#plan-visit"} target={whatsappHref ? "_blank" : undefined} rel={whatsappHref ? "noreferrer" : undefined}>Join WhatsApp Channel <Arrow /></a>
            </article>
            <article className="step-card">
              <span className="step-num">03</span>
              <h3>Membership &amp; Discipleship</h3>
              <p>Take the next step from viewer to family member through our online membership class and midweek teaching.</p>
              <a className="link-arrow" href="#plan-visit">See next membership class <Arrow /></a>
            </article>
            <article className="step-card">
              <span className="step-num">04</span>
              <h3>Prayer &amp; the Word</h3>
              <p>Grow through the Zoe Devotional, our Bible reading plan, and a prayer team ready to stand with you in faith.</p>
              <Link className="link-arrow" href="/prayer">Share a prayer request <Arrow /></Link>
            </article>
          </div>
        </div>
      </section>
    ) : null}

    {gallery.length ? (
      <section className="section campus-gallery">
        <div className="container">
          <SectionHead label="Moments" title={<>Life at <span className="hl">Zoe {title}</span></>} body="Snapshots from our gatherings and community." />
          <div className="moment-grid">
            {gallery.map((src, index) => (
              <figure className="moment-tile" key={`${src}-${index}`}>
                <img src={src} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>
    ) : null}

    <section className="section campus-gather is-raised">
      <div className="container">
        <SectionHead label="Gatherings" title={<>Join Us at <span className="hl">Zoe {title}</span></>} body="We'd love to have you worship with us. Find the gathering time and location that works for you." />
        <div className="gather-grid">
          <div className="gather-list">
            {campus.services.map((service) => {
              const serviceKnown = !isPending(service.address);
              return <article className="gather-card" key={service.name}>
                <span className="badge">{service.name}</span>
                <ul className="meta-list">
                  <li><ClockIcon />{isPending(service.schedule) ? "Time to be announced" : service.schedule}</li>
                  <li><PinIcon />{serviceKnown ? service.address : isOnline ? "Streaming online" : "Location to be announced"}</li>
                </ul>
                {serviceKnown
                  ? <a className="link-arrow" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.address)}`} target="_blank" rel="noreferrer">Get directions <Arrow /></a>
                  : isOnline
                    ? <a className="link-arrow" href={socialLinks.youtube} target="_blank" rel="noreferrer">Watch on YouTube <Arrow /></a>
                    : <span className="muted">Directions will be shared once the location is set.</span>}
              </article>;
            })}
            {campus.services.length > 1 ? <p className="note"><strong>Note:</strong> Please check the location for each gathering before you arrive, as different gatherings may meet in different places.</p> : null}
            <button className="btn btn-glass" type="button" onClick={() => setModal("reminder")}>Get service reminders <Arrow /></button>
          </div>
          {known ? <div className="gather-map">
            <iframe title={`Map of Zoe ${campus.shortName}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div> : isOnline ? <div className="gather-map is-empty">
            <PlayIcon />
            <h3>Stream from anywhere</h3>
            <p>Gather with Zoe {campus.shortName} from wherever you are. Service times and streaming details will be shared here as they are released.</p>
            <a className="btn btn-primary" href={socialLinks.youtube} target="_blank" rel="noreferrer"><PlayIcon /> Watch on YouTube</a>
          </div> : <div className="gather-map is-empty">
            <PinIcon />
            <h3>Location coming soon</h3>
            <p>The Zoe {campus.shortName} location will be shared here once it is set. In the meantime, you can join the household online.</p>
            <Link className="btn btn-primary" href="/sermons"><PlayIcon /> Watch Online</Link>
          </div>}
        </div>
      </div>
    </section>

    {!isOnline ? (
      <section className="section arrows">
        <div className="container arrows-grid">
          <figure className="arrows-media">
            <img src="/figma/arrows-atlanta.jpg" alt="A parent and child at Zoe Arrows" loading="lazy" />
            <figcaption>Zoe Arrows</figcaption>
          </figure>
          <div className="arrows-copy">
            <Label>For your family</Label>
            <h2>Your Children Are <span className="hl">Welcome Too</span></h2>
            <p>Zoe Arrows is our children&apos;s ministry, created to help your kids encounter Jesus and grow in their faith while you enjoy the main gathering.</p>
            <div className="info-card">
              <h3>A simple check-in</h3>
              <p>Children are checked in after praise and worship, during the announcements, before the preaching begins.</p>
            </div>
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => setModal("children")}>Register Your Children <Arrow /></button>
            </div>
            <small>Registering ahead of time helps speed up check-in when you arrive.</small>
          </div>
        </div>
      </section>
    ) : null}

    {isOnline ? (
      <section id="watch-parties" className="section">
        <div className="container">
          <div className="watch-party-banner">
            <div>
              <span className="badge is-near">Coming soon</span>
              <h2>Zoe Online <span className="hl">Watch Parties</span></h2>
              <p>Soon you&apos;ll be able to host or join a Zoe Online Watch Party in your city or home — gathering with believers near you to stream worship and the Word together.</p>
            </div>
            <div className="watch-party-actions">
              <button className="btn btn-glass" type="button" onClick={() => setModal("visit")}>Notify Me When Watch Parties Launch <Arrow /></button>
            </div>
          </div>
        </div>
      </section>
    ) : null}

    <section id="plan-visit" className="section is-raised">
      <div className="container">
        {isOnline ? (
          <>
            <SectionHead
              label="Join the online community"
              title={<>Join the <span className="hl">Online Community</span></>}
              body="Stay connected throughout the week through the Zoe WhatsApp Channel and take your next step with our upcoming Membership Class."
            />
            <div className="resource-grid online-community-grid">
              <article className="resource-card is-teal">
                <span className="badge">Zoe WhatsApp Channel</span>
                <h3>Join the Zoe WhatsApp Channel</h3>
                <p>Get instant updates, livestream links, announcements, and daily encouragement with the global Zoe Online family.</p>
                {whatsappHref ? (
                  <a className="btn btn-primary" href={whatsappHref} target="_blank" rel="noreferrer">Join WhatsApp Channel <Arrow /></a>
                ) : (
                  <button className="btn btn-primary" type="button" onClick={() => setModal("reminder")}>Get WhatsApp Channel Link <Arrow /></button>
                )}
              </article>
              <article className="online-flyer-card">
                <div className="online-flyer-media">
                  <img src={membershipFlyer} alt={membershipTitle} loading="lazy" />
                  <span className="badge is-live">Next Membership Class</span>
                </div>
                <div className="online-flyer-body">
                  <h3>{membershipTitle}</h3>
                  <p>{membershipSchedule}</p>
                  <div className="actions">
                    {campus.membershipClassUrl ? (
                      <a className="btn btn-primary" href={campus.membershipClassUrl} target="_blank" rel="noreferrer">Register for Class <Arrow /></a>
                    ) : (
                      <button className="btn btn-primary" type="button" onClick={() => setModal("visit")}>Register Interest <Arrow /></button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </>
        ) : (
          <>
            <SectionHead label="Plan your visit" title={<>Planning Your <span className="hl">Visit?</span></>} body={`Everything you need for your first visit to Zoe ${campus.shortName}, all in one place.`} />
            <PlanSteps campus={campus} onOpen={setModal} />
          </>
        )}
      </div>
    </section>

    {isOnline ? <GlobalNewsletterSignup campusSlug={campus.slug} /> : null}

    <section className="section more-campuses">
      <div className="container">
        <SectionHead label="One household" title={<>Visit Another <span className="hl">Campus</span></>} action={<Link className="link-arrow" href="/visit">All campuses <Arrow /></Link>} />
        <div className="mini-grid">
          {others.map((item) => <Link className="mini-card" href={`/visit/${item.slug}`} key={item.slug}>
            <img src={item.image} alt="" loading="lazy" />
            <span><strong>Zoe {campusTitle(item)}</strong><em>{item.place}</em></span>
            <i aria-hidden="true"><Arrow /></i>
          </Link>)}
        </div>
      </div>
    </section>

    <WordCta />
    {modal ? <Modal onClose={() => setModal(null)}><FormCard kind={modal} campus={campus} onClose={() => setModal(null)} /></Modal> : null}
  </div>;
}

function SermonsPage() {
  const [seed, setSeed] = useState("");
  const [seedKey, setSeedKey] = useState(0);

  const explore = (topic: string) => {
    setSeed(topic);
    setSeedKey((key) => key + 1);
    document.getElementById("sermon-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <>
    <PageHero label="Sermons & podcast" title="Messages That Help You Grow" body="Explore our on-demand library and discover messages by topic, series, and length." image="/figma/asset-07-3382ac.jpg" position="center 30%">
      <div className="actions is-center">
        <a className="btn btn-primary" href="#sermon-library"><PlayIcon /> Watch Latest</a>
        <a className="btn btn-glass" href={socialLinks.youtube} target="_blank" rel="noreferrer">Visit YouTube</a>
      </div>
    </PageHero>

    <TeachingLibrary seed={seed} seedKey={seedKey} />

    <section className="section topics is-raised">
      <div className="container">
        <div className="topic-banner">
          <img src="/figma/asset-03-102235.jpg" alt="" loading="lazy" />
          <article>
            <Label>Browse by topic</Label>
            <h2>Find a Message for Where You Are</h2>
            <p>Explore the library by topic and find messages that encourage, challenge, and help you grow.</p>
            <button className="btn btn-dark" type="button" onClick={() => explore("")}>Explore all messages <Arrow /></button>
          </article>
        </div>
        <div className="topic-grid is-three">
          {[
            ["Faith", "Messages on trusting God and building a foundation of faith."],
            ["Grace", "Messages exploring the unending grace of Jesus and what it means for believers."],
            ["Identity", "Discover the reality of who you are in Christ and bring that identity into life."],
          ].map(([title, body]) => (
            <button className="topic-card" type="button" key={title} onClick={() => explore(title)}>
              <strong>{title}</strong>
              <span>{body}</span>
              <em>Explore {title.toLowerCase()} <Arrow /></em>
            </button>
          ))}
        </div>
      </div>
    </section>

    <section className="band band-image">
      <img src="/figma/sermon-subscribe-41dc6b.jpg" alt="" loading="lazy" />
      <div className="container band-inner is-center">
        <Label center>Stay connected</Label>
        <h2>Never Miss a New Message</h2>
        <p>Subscribe to Pastor Dolapo Lawal&apos;s YouTube channel to be the first to receive new sermons, teachings, and ministry updates.</p>
        <div className="actions is-center">
          <a className="btn btn-primary" href={socialLinks.youtube} target="_blank" rel="noreferrer">Subscribe on YouTube <Arrow /></a>
        </div>
      </div>
    </section>
  </>;
}

const pneumaFaqs = [
  ["Where can I listen to Pneuma Worship?", "Pneuma Worship is on Spotify and Apple Music. Listen on Spotify opens the latest music from the ministry."],
  ["What has been released?", "The catalog includes FOR BY GRACE (2026), the singles Inhabit, Responsible Father, Gathering Of Believers, Amen Hallelujah, and Abba’s Beloved, and the 2024 album Pneuma (Live)."],
  ["Who is Pneuma Worship?", "Pneuma Worship is the worship ministry of Zoe Household, creating music that helps us encounter God and carry worship beyond our gatherings."],
  ["Can I experience this at a gathering?", "Yes. Worship is part of the gathering at every Zoe campus. Find the campus closest to you and come as you are."],
  ["How do I hear new music?", "Follow Pneuma Worship on Spotify to hear new releases as they come out."],
] as const;

const pneumaSongs = [
  { title: "For By Grace", detail: "FOR BY GRACE · 2026", art: "/pneuma/art-grace.jpg", href: "https://music.apple.com/us/album/for-by-grace/6805026466?i=6805026577" },
  { title: "Victory Chant", detail: "FOR BY GRACE · 2026", art: "/pneuma/art-grace.jpg", href: "https://music.apple.com/us/album/victory-chant/6805026466?i=6805026580" },
  { title: "Anchor", detail: "FOR BY GRACE · 2026", art: "/pneuma/art-grace.jpg", href: "https://music.apple.com/us/album/anchor/6805026466?i=6805026578" },
  { title: "Worthy", detail: "FOR BY GRACE · 2026", art: "/pneuma/art-grace.jpg", href: "https://music.apple.com/us/album/worthy/6805026466?i=6805026575" },
  { title: "Responsible Father", detail: "Single · 2026", art: "/pneuma/art-father.jpg", href: "https://music.apple.com/us/album/responsible-father/6773406847?i=6773406848" },
  { title: "Gathering Of Believers", detail: "Single · 2026", art: "/pneuma/art-gathering.jpg", href: "https://music.apple.com/us/album/gathering-of-believers/1873211759?i=1873211760" },
  { title: "Inhabit", detail: "Single · 2025", art: "/pneuma/art-inhabit.jpg", href: "https://music.apple.com/us/album/inhabit-feat-david-oguche/1837828123?i=1837828125" },
  { title: "Quickening Fire", detail: "Pneuma (Live) · 2024", art: "/pneuma/art-live.jpg", href: "https://music.apple.com/us/album/quickening-fire-feat-joshua-oguche/1784362134?i=1784362141" },
  { title: "Son of God", detail: "Pneuma (Live) · 2024", art: "/pneuma/art-live.jpg", href: "https://music.apple.com/us/album/son-of-god/1784362134?i=1784362143" },
  { title: "Welldone", detail: "Pneuma (Live) · 2024", art: "/pneuma/art-live.jpg", href: "https://music.apple.com/us/album/welldone/1784362134?i=1784362145" },
  { title: "Friend and Partner", detail: "Pneuma (Live) · 2024", art: "/pneuma/art-live.jpg", href: "https://music.apple.com/us/album/friend-and-partner/1784362134?i=1784362142" },
  { title: "Christ In Me", detail: "Pneuma (Live) · 2024", art: "/pneuma/art-live.jpg", href: "https://music.apple.com/us/album/christ-in-me-feat-godspower-ekpo-live/1784362134?i=1784362137" },
  { title: "Pleroo", detail: "Pneuma (Live) · 2024", art: "/pneuma/art-live.jpg", href: "https://music.apple.com/us/album/pleroo/1784362134?i=1784362135" },
  { title: "Amen Hallelujah", detail: "Single · 2024", art: "/pneuma/art-amen.jpg", href: "https://music.apple.com/us/album/amen-hallelujah/1779491441?i=1779491442" },
  { title: "Abba's Beloved", detail: "Single · 2024", art: "/pneuma/art-abba.jpg", href: "https://music.apple.com/us/album/abbas-beloved/1752259312?i=1752259313" },
];

function PneumaPage() {
  const releasesRef = useRef<HTMLDivElement>(null);
  const moveReleases = (direction: number) => {
    const node = releasesRef.current;
    const card = node?.querySelector("article");
    if (!node || !card) return;
    node.scrollBy({ left: direction * (card.clientWidth + 20), behavior: "smooth" });
  };
  return <>
    <PageHero className="pneuma-hero" video="/pneuma/pneuma-hero.mp4" poster="/figma/pneuma-hero-1c7cfc.jpg" mark={<img className="pneuma-logo" src="/pneuma/pneuma-logo.png" alt="Pneuma Worship Collective" width={450} height={450} />} label="Worship ministry" title="Pneuma Worship" body="Discover the music of Pneuma Worship and experience worship beyond the gathering.">
      <div className="actions is-center">
        <a className="btn btn-primary" href={socialLinks.spotify} target="_blank" rel="noreferrer"><PlayIcon /> Listen on Spotify</a>
        <a className="btn btn-glass" href="#releases">Explore our music</a>
      </div>
    </PageHero>

    <div className="pneuma-hang container" aria-label="Listen to Pneuma Worship">
      <iframe
        title="Pneuma Live on Apple Music"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        height={450}
        loading="lazy"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src="https://embed.music.apple.com/au/album/pneuma-live/1784362134"
      />
      <div>
        <iframe
          title="Pneuma Worship on Spotify"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          height={152}
          loading="lazy"
          src="https://open.spotify.com/embed/album/5JxkLybitjFLML464FtikB?utm_source=generator&theme=0"
        />
        <iframe
          title="Psalm 100 Overflow on Apple Music"
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          height={175}
          loading="lazy"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="https://embed.music.apple.com/au/song/psalm-100-overflow/1767155662"
        />
      </div>
    </div>

    <section className="section listen">
      <div className="container">
        <div className="listen-gallery">
          <img src="/figma/pneuma-photo-1.jpg" alt="Inhabit cover art" loading="lazy" />
          <img src="/figma/pneuma-photo-2.jpg" alt="Responsible Father cover art" loading="lazy" />
          <img src="/figma/pneuma-photo-3.jpg" alt="Pneuma cover art" loading="lazy" />
        </div>
        <div className="listen-row">
          <div>
            <Label>Worship ministry</Label>
            <h2>Listen to <span className="hl">Pneuma Worship</span></h2>
            <p>Discover the music of Pneuma Worship and carry worship beyond the gathering.</p>
          </div>
          <a className="btn btn-primary" href={socialLinks.spotify} target="_blank" rel="noreferrer"><PlayIcon /> Listen on Spotify</a>
        </div>
      </div>
    </section>

    <section id="releases" className="section releases is-raised">
      <div className="container">
        <SectionHead
          label="Discography"
          title={<>Previously <span className="hl">Released</span></>}
          body="The songs themselves, from the latest album back through the live record."
          action={<div className="carousel-nav">
            <button type="button" onClick={() => moveReleases(-1)} aria-label="Previous songs"><Arrow className="is-flipped" /></button>
            <button type="button" onClick={() => moveReleases(1)} aria-label="Next songs"><Arrow /></button>
          </div>}
        />
        <div className="release-track" ref={releasesRef}>
          {pneumaSongs.map((song) => (
            <article className="release-card" key={song.href}>
              <img src={song.art} alt="" loading="lazy" />
              <div>
                <h3>{song.title}</h3>
                <p>{song.detail}</p>
              </div>
              <a className="btn btn-primary btn-sm" href={song.href} target="_blank" rel="noreferrer"><PlayIcon /> Listen</a>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container narrow">
        <SectionHead center label="FAQ" title={<>Pneuma Worship <span className="hl">FAQ</span></>} body="Answers to some of the questions people ask about Pneuma Worship." />
        <Accordion items={pneumaFaqs} />
      </div>
    </section>

    <section className="band band-lime">
      <div className="container band-inner">
        <div>
          <Label>Listen now</Label>
          <h2>Take the Sound of Worship With You</h2>
          <p>Discover Pneuma Worship&apos;s music and take the sound of worship everywhere you go.</p>
        </div>
        <a className="btn btn-dark" href={socialLinks.spotify} target="_blank" rel="noreferrer"><PlayIcon /> Listen Now</a>
      </div>
    </section>
  </>;
}

function EventsPage() {
  const { moments } = useSite();
  const [more, setMore] = useState(false);
  const [volunteer, setVolunteer] = useState(false);
  const photos = more ? moments : moments.slice(0, 10);
  return <>
    <PageHero label="Zoe events" title="Gather With Purpose" body="From major gatherings to teaching moments across our campuses, Zoe events give us opportunities to come together, grow in Christ, and share life as one household." image="/figma/asset-03-102235.jpg">
      <div className="actions is-center">
        <a className="btn btn-primary" href="#events">See Upcoming Events <Arrow /></a>
      </div>
    </PageHero>

    <section id="events" className="section is-raised">
      <div className="container">
        <SectionHead label="Throughout the year" title={<>Our Global <span className="hl">Gatherings</span></>} body="Every gathering, with its campus on the card. Events that aren't tied to one campus are for the whole household. The next one is first, then upcoming, then past." />
        <EventsShowcase showCampus onVolunteer={() => setVolunteer(true)} />
      </div>
    </section>

    <section id="gather" className="section">
      <div className="container">
        <SectionHead label="Ways to gather" title={<>There&apos;s Always a Place <span className="hl">to Gather</span></>} body="From large gatherings to travelling teaching moments, there are different ways to come together, worship, learn, and spend time with the Zoe Household." />
        <div className="ways-grid">
          {[
            ["/figma/visit-atlanta-hero-225203.jpg", "Gather in Worship", "Come together with the wider Zoe family to worship Jesus, hear the Word, and share in what God is doing."],
            ["/figma/asset-13-724bec.jpg", "Grow Together", "Our gatherings give us time to slow down, learn from the Word, and grow alongside other people."],
            ["/figma/beliefs-hero.jpg", "Meet Us in Different Cities", "Zoe gatherings happen across different places throughout the year, bringing the household together wherever we are."],
            ["/figma/asset-14-41c41a.jpg", "Make Room for Community", "Some gatherings are big, some are smaller, but each one gives us a chance to meet, connect, and do life together."],
          ].map(([image, title, body]) => (
            <article className="way-card" key={title}>
              <img src={image} alt="" loading="lazy" />
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section moments">
      <div className="container">
        <SectionHead center label="Moments" title={<>There&apos;s More <span className="hl">to Experience</span></>} body="From worship nights to gatherings across our campuses, these moments remind us what happens when we come together." />
        <div className="moment-grid">
          {photos.map((file, index) => (
            <figure className="moment-tile" key={`${file}-${index}`}>
              <img src={file} alt="" loading="lazy" />
            </figure>
          ))}
        </div>
        <div className="actions is-center">
          <button className="btn btn-glass" type="button" onClick={() => setMore((value) => !value)}>{more ? "Show fewer moments" : "See more moments"} <Arrow /></button>
        </div>
      </div>
    </section>

    {volunteer ? <Modal onClose={() => setVolunteer(false)}><FormCard kind="inquiry" onClose={() => setVolunteer(false)} /></Modal> : null}
  </>;
}

function EventDetailPage({ slug }: { slug: string }) {
  const { events, generatedAt, bySlug } = useSite();
  const event = events.find((item) => item.slug === slug);
  const [volunteer, setVolunteer] = useState(false);
  const now = useNow(generatedAt);
  if (!event) return <NotFoundPage />;
  const phase = eventPhase(event, now);
  const heading = phase === "live" ? "Happening now" : phase === "past" ? "Past gathering" : "Next gathering";
  return <>
    <PageHero label={event.kind} title={event.title} body={event.intro} image={event.image} />
    <section className="section">
      <div className="container detail-grid">
        <div>
          <Label>About the gathering</Label>
          <h2>A Moment for the <span className="hl">Whole Household</span></h2>
          <p>{event.body}</p>
        </div>
        <aside className="info-card">
          <h3>{heading}</h3>
          <ul className="meta-list">
            <li><UserIcon />{eventCampusLabel(event, bySlug)}</li>
            <li><CalendarIcon />{event.dateLabel}</li>
            <li><PinIcon />{event.location}</li>
          </ul>
          {phase === "past" ? <>
            <p>This gathering has ended. See what&apos;s coming up next, or ask to hear about the next one.</p>
            <Link className="btn btn-primary btn-block" href="/events#events">See Upcoming Events <Arrow /></Link>
            <button className="btn btn-glass btn-block" type="button" onClick={() => setVolunteer(true)}>Get Event Updates</button>
          </> : event.registerUrl ? <>
            <p>Secure your place for this gathering.</p>
            <a className="btn btn-primary btn-block" href={event.registerUrl} target="_blank" rel="noreferrer">Register / Details <Arrow /></a>
            <button className="btn btn-glass btn-block" type="button" onClick={() => setVolunteer(true)}>Get Event Updates</button>
          </> : <>
            <p>Registration details are shared by the Zoe events team. Reach out and we&apos;ll keep you posted.</p>
            <button className="btn btn-primary btn-block" type="button" onClick={() => setVolunteer(true)}>Get Event Updates <Arrow /></button>
          </>}
        </aside>
      </div>
    </section>
    <section className="band band-lime">
      <div className="container band-inner">
        <div>
          <Label>Stay connected</Label>
          <h2>Find Your Campus Before the Next Gathering</h2>
          <p>Every gathering starts with a household. Find the Zoe campus nearest you.</p>
        </div>
        <Link className="btn btn-dark" href="/visit">Find Your Campus <Arrow /></Link>
      </div>
    </section>
    {volunteer ? <Modal onClose={() => setVolunteer(false)}><FormCard kind="inquiry" campus={event.campusSlug ? bySlug.get(event.campusSlug) : undefined} onClose={() => setVolunteer(false)} /></Modal> : null}
  </>;
}

function ResourcesPage() {
  return <>
    <PageHero label="Resources" title="Resources for Your Walk" body="Explore resources from Zoe Household to help you stay rooted in Scripture, grow in your faith, and keep following Jesus throughout the week." image="/figma/visit-hero.jpg">
      <div className="actions is-center">
        <a className="btn btn-primary" href="#grow">Explore Resources <Arrow /></a>
      </div>
    </PageHero>

    <ResourcesSection id="grow" />

    <section id="zoe-scholarship" className="section is-raised">
      <div className="container">
        <div className="split-card">
          <div>
            <Label>Zoe scholarship</Label>
            <h2>Investing in the <span className="hl">Next Generation</span></h2>
            <p>The Zoe Scholarship supports eligible students pursuing their academic goals. Find out more about the scholarship, who is eligible, what you&apos;ll need, and how to apply.</p>
            <div className="actions">
              <Link className="btn btn-primary" href="/resources/scholarship">Find Out More <Arrow /></Link>
            </div>
          </div>
          <figure>
            <img src="/figma/scholarship-library.jpg" alt="A student reading in a library" loading="lazy" />
            <figcaption>Our work. <br />Their words.</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <WordCta />
  </>;
}

const scholarshipFaqs = [
  ["Who is eligible to apply?", "Applicants who meet the Zoe Scholarship’s academic and financial requirements are eligible to apply. Please review the eligibility requirements above to see if you qualify."],
  ["What documents do I need?", "Academic transcripts, valid identification, proof of income, and a personal statement."],
  ["Can I apply while waiting for my results?", "Review the academic requirements above, including enrollment confirmation and active status in your program. Applications are open from August 1, 2026 through October 15, 2026."],
  ["When will I know if I have been selected?", "Applications are reviewed in November 2026. Notifications go out on December 10, 2026."],
  ["How will I be notified?", "Selected applicants are notified on December 10, 2026."],
] as const;

function ScholarshipPage() {
  const [apply, setApply] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sendApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    if (data.get("website")) {
      setSent(true);
      return;
    }
    if (data.get("consent") !== "on") {
      setError("Consent is required");
      return;
    }
    setSubmitting(true);
    try {
      await postSubmission({ kind: "inquiry", name: data.get("name"), email: data.get("email"), phone: data.get("phone"), topic: "Zoe Scholarship", message: data.get("message"), region: "", consent: true });
      setSent(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    <PageHero label="Zoe scholarship" title="Supporting the Next Step" body="The Zoe Scholarship is designed to support eligible students as they pursue their education. Learn about the requirements, prepare your application, and take the next step." image="/figma/scholarship-library.jpg">
      <div className="actions is-center">
        <button className="btn btn-primary" type="button" onClick={() => setApply(true)}>Apply Now <Arrow /></button>
        <a className="btn btn-glass" href="#qualify">Check eligibility</a>
      </div>
    </PageHero>

    <section className="section">
      <div className="container detail-grid">
        <div>
          <Label>About the scholarship</Label>
          <h2>A Little Support Can Go <span className="hl">a Long Way</span></h2>
        </div>
        <div>
          <p>Education takes commitment, preparation, and resources. The Zoe Scholarship provides support for eligible students who meet the required academic and financial criteria.</p>
          <p>Explore the requirements below to see if you qualify and learn what you&apos;ll need before beginning your application.</p>
        </div>
      </div>
    </section>

    <section id="qualify" className="section is-raised">
      <div className="container">
        <SectionHead label="Eligibility" title={<>Do You <span className="hl">Qualify?</span></>} body="Before applying, take a moment to review the requirements for the Zoe Scholarship." />
        <div className="step-grid is-three">
          {[
            ["Academic", "01", "Academic Requirements", "Required academic criteria including minimum GPA benchmarks, enrollment confirmation, and active status in your program of choice."],
            ["Financial", "02", "Financial Requirements", "Required financial criteria to ensure support is delivered where it is needed most, including household income thresholds."],
            ["Community", "03", "Additional Requirements", "Additional eligibility aspects such as community involvement, character references, and personal alignment with the household values."],
          ].map(([label, number, title, body]) => (
            <article className="step-card" key={number}>
              <span className="step-num">{number}</span>
              <span className="badge">{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="docs-banner">
          <img src="/figma/asset-03-102235.jpg" alt="" loading="lazy" />
          <div className="docs-banner-copy">
            <Label>Prepare</Label>
            <h2>Get Your Application Ready</h2>
            <p>Having your information ready before you begin makes the application easier and helps us review it faster.</p>
          </div>
          <div className="docs-card">
            <h3>You may need</h3>
            <ul>
              {["Academic transcripts", "Valid identification", "Proof of income", "Personal statement"].map((item) => <li key={item}>{item}</li>)}
            </ul>
            <button className="btn btn-primary btn-block" type="button" onClick={() => setApply(true)}>Start Your Application <Arrow /></button>
          </div>
        </div>
      </div>
    </section>

    <section className="section is-raised">
      <div className="container">
        <SectionHead center label="Timeline" title={<>Know the <span className="hl">Important Dates</span></>} body="Keep track of the key dates for the current scholarship cycle so you know when to apply and when to expect an update." />
        <ol className="timeline">
          {[
            ["Applications Open", "August 1, 2026"],
            ["Application Deadline", "October 15, 2026"],
            ["Application Review", "November 2026"],
            ["Notifications", "December 10, 2026"],
          ].map(([title, date], index) => (
            <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><em>{date}</em></li>
          ))}
        </ol>
      </div>
    </section>

    <section className="section">
      <div className="container narrow">
        <SectionHead center label="FAQ" title={<>Questions About the <span className="hl">Scholarship?</span></>} body="Answers to some of the questions applicants ask before applying." />
        <Accordion items={scholarshipFaqs} />
      </div>
    </section>

    <section className="band band-lime">
      <div className="container band-inner">
        <div>
          <Label>Apply</Label>
          <h2>Ready to Apply?</h2>
          <p>If you meet the requirements and have your information ready, take the next step and submit your application.</p>
        </div>
        <button className="btn btn-dark" type="button" onClick={() => setApply(true)}>Apply Now <Arrow /></button>
      </div>
    </section>

    {apply ? <Modal onClose={() => { setApply(false); setSent(false); setError(null); }}>
      <form className="form-card" onSubmit={sendApplication}>
        <button className="form-close" type="button" onClick={() => { setApply(false); setSent(false); setError(null); }} aria-label="Close form">×</button>
        <p className="label">Zoe Scholarship</p>
        <h2>Start Your Application</h2>
        {sent ? <p>Your application has been received. We&apos;ll be in touch about the next step.</p> : <>
          <p>Share a few details and the scholarship team will follow up with the next step.</p>
          <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="form-grid">
            <label className="field"><span>Name</span><input name="name" required autoComplete="name" /></label>
            <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
            <label className="field full"><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
            <label className="field full"><span>Tell us about your application</span><textarea name="message" required placeholder="Your program, campus, and anything we should know." /></label>
            <label className="checkbox full"><input name="consent" type="checkbox" required /> I agree to be contacted about this scholarship application.</label>
            {error ? <p className="form-error full" role="alert">{error}</p> : null}
            <button className="btn btn-primary btn-block full" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Submit Application"}</button>
          </div>
        </>}
      </form>
    </Modal> : null}
  </>;
}

function PrayerTeachings() {
  const [videos, setVideos] = useState<LibraryVideo[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/library/sermons?sort=date&search=prayer")
      .then((response) => response.json())
      .then((data) => { if (!cancelled) setVideos((data.items ?? []).slice(0, 3)); })
      .catch(() => { if (!cancelled) setVideos([]); });
    return () => { cancelled = true; };
  }, []);

  if (videos === null) return <div className="video-grid">{[0, 1, 2].map((index) => <div className="video-card is-loading" key={index} />)}</div>;
  if (videos.length === 0) return <p className="empty-note">Teachings are unavailable right now. <a href={socialLinks.youtube} target="_blank" rel="noreferrer">Watch on YouTube</a>.</p>;
  return <div className="video-grid">
    {videos.map((video) => <a className="video-card" key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
      <span className="video-card-media"><YoutubeImage id={video.id} alt="" /><i aria-hidden="true"><PlayIcon /></i>{video.duration ? <em>{video.duration}</em> : null}</span>
      <span className="video-card-body"><small>Pastor Dolapo Lawal</small><strong>{video.title}</strong></span>
    </a>)}
  </div>;
}

function PrayerPage() {
  const [open, setOpen] = useState(false);
  return <>
    <PageHero label="Prayer" title="There's a Place for Your Prayer" body="Prayer is part of how we draw near to God, seek His heart, and stand with one another. At Zoe, we believe we don't have to carry life alone." image="/figma/prayer-hero-793934.jpg">
      <div className="actions is-center">
        <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>Share Your Prayer Request <Arrow /></button>
      </div>
    </PageHero>

    <section className="section">
      <div className="container media-split">
        <figure><img src="/figma/pneuma-hero-1c7cfc.jpg" alt="People gathered in prayer" loading="lazy" /></figure>
        <div>
          <Label>Why we pray</Label>
          <h2>We Pray Because We Believe <span className="hl">God Hears Us</span></h2>
          <p>Prayer is more than bringing our needs to God. It is a place of fellowship with Him — a way to seek His direction, surrender what we carry, and stand together in faith.</p>
          <p>At Zoe, prayer is part of our life together as a household.</p>
        </div>
      </div>
    </section>

    <section className="section is-raised">
      <div className="container">
        <SectionHead label="Teachings" title={<>Learn to Pray. <span className="hl">Learn to Wait.</span></>} body="Explore teachings that can help you deepen your prayer life, understand fasting, and grow in your relationship with God." action={<Link className="link-arrow" href="/sermons">Explore teachings <Arrow /></Link>} />
        <PrayerTeachings />
      </div>
    </section>

    <section className="section">
      <div className="container media-split is-reverse">
        <figure><img src="/figma/asset-23-615969.jpg" alt="" loading="lazy" /></figure>
        <div>
          <Label>Prayer team</Label>
          <h2>Let Us Pray <span className="hl">With You</span></h2>
          <p>Whatever you&apos;re carrying, you don&apos;t have to carry it alone. Share your prayer request with us and our prayer team will stand with you in prayer.</p>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>Share Your Prayer Request <Arrow /></button>
          </div>
        </div>
      </div>
    </section>

    {open ? <Modal onClose={() => setOpen(false)}><FormCard kind="prayer" onClose={() => setOpen(false)} /></Modal> : null}
  </>;
}

const tithelyUrl = "https://give.tithe.ly/?formId=38e44ec6-bbde-428c-b073-df0309a7e479&context=modal";
const giveOrder = ["ikeja", "london", "ifako", "ipaja", "abeokuta", "atlanta", "houston", "online"];

function giveLabel(slug: string) {
  if (slug === "london") return "United Kingdom";
  return campuses.find((campus) => campus.slug === slug)?.shortName ?? slug;
}

function GivePage({ path }: { path: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("ikeja");
  const [copied, setCopied] = useState(false);
  const slug = path.split("/")[2] ?? "";
  const listed = giveOrder
    .map((item) => campuses.find((campus) => campus.slug === item))
    .filter((campus): campus is Campus => Boolean(campus))
    .filter((campus) => `${giveLabel(campus.slug)} ${campus.city} ${campus.region}`.toLowerCase().includes(query.trim().toLowerCase()));

  const copyDetails = async () => {
    const text = "Account name: Zoe Household Ministries Ikeja\nBank: Guaranty Trust Bank (GTB)\nAccount number: 0123456789";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return <>
    <PageHero label="Thank you" title="Give Where It Matters" body="Your generosity helps make the work of Zoe Household possible. Give towards the life of your local campus or support the wider work we're doing together." image="/figma/about-hero.jpg" />

    {path === "/give" ? <section className="section">
      <div className="container">
        <SectionHead center label="Giving" title={<>Where Would You <span className="hl">Like to Give?</span></>} body="Choose a giving option below. If you're connected to a Zoe campus, give to the campus closest to you." />
        <div className="give-grid">
          <article className="give-card">
            <span className="badge">Local</span>
            <h3>My Zoe Campus</h3>
            <p>Give to the Zoe campus closest to you and support the work happening in your local church community.</p>
            <Link className="btn btn-primary" href="/give/campus">Choose My Campus <Arrow /></Link>
          </article>
          <article className="give-card is-teal">
            <span className="badge">Global</span>
            <h3>Zoe Global</h3>
            <p>Support the wider work of Zoe Household across campuses, communities, and places beyond your local church.</p>
            <Link className="btn btn-primary" href="/give/global">Give Globally <Arrow /></Link>
          </article>
        </div>
      </div>
    </section> : null}

    {path === "/give/campus" ? <section className="section">
      <div className="container give-panel">
        <Link className="link-back" href="/give"><Arrow className="is-flipped" /> Back</Link>
        <div className="form-panel">
          <h2>Choose Your Campus</h2>
          <p>Select the campus you&apos;d like your giving to support.</p>
          <label className="search-field is-dark">
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campuses" aria-label="Search campuses" />
          </label>
          <div className="campus-options" role="radiogroup" aria-label="Campus">
            {listed.map((campus) => (
              <button className={selected === campus.slug ? "is-selected" : ""} type="button" role="radio" aria-checked={selected === campus.slug} key={campus.slug} onClick={() => setSelected(campus.slug)}>
                <img src={campus.image} alt="" />
                <strong>Zoe {giveLabel(campus.slug)}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
          {listed.length === 0 ? <p className="empty-note">No campus matches that search.</p> : null}
          <Link className="btn btn-primary btn-block" href={`/give/${selected}`}>Continue <Arrow /></Link>
        </div>
      </div>
    </section> : null}

    {path !== "/give" && path !== "/give/campus" ? <section className="section">
      <div className="container give-panel">
        <Link className="link-back" href={slug === "global" ? "/give" : "/give/campus"}><Arrow className="is-flipped" /> Back</Link>
        <div className="form-panel">
          <Label>{slug === "global" ? "Global giving" : "Campus giving"}</Label>
          <h2>{slug === "global" ? "Giving to Zoe Global" : `Giving to Zoe ${giveLabel(slug)}`}</h2>
          <p>You can support this {slug === "global" ? "work" : "campus"} through the details below.</p>
          {slug === "ikeja" ? <>
            <dl className="bank-details">
              <div><dt>Account name</dt><dd>Zoe Household Ministries Ikeja</dd></div>
              <div><dt>Bank</dt><dd>Guaranty Trust Bank (GTB)</dd></div>
              <div><dt>Account number</dt><dd>0123456789</dd></div>
            </dl>
            <button className="btn btn-primary btn-block" type="button" onClick={copyDetails}>{copied ? "Copied" : "Copy Bank Details"}</button>
          </> : slug === "global" || slug === "atlanta" || slug === "houston" || slug === "online"
            ? <a className="btn btn-primary btn-block" href={tithelyUrl} target="_blank" rel="noreferrer">Continue to Tithely <Arrow /></a>
            : <p className="info-card">Bank details for this campus will be shared by the campus.</p>}
        </div>
      </div>
    </section> : null}

    <section className="band band-glow">
      <div className="container band-inner give-verse">
        <h2>Your Generosity Builds <span className="hl">Lasting Change</span></h2>
        <p>Every gift is a part of what we&apos;re building together. Thank you for helping make room for the work God is doing through Zoe Household.</p>
      </div>
    </section>
  </>;
}

const LEGAL_UPDATED = "October 12, 2026";
const PRIVACY_EMAIL = "privacy@zoehousehold.org";
const CONTACT_EMAIL = "hello@zoehousehold.org";

function LegalPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return <>
    <PageHero label="Zoe Household" title={title} body={lead} image="/figma/about-hero.jpg" />
    <section className="section">
      <div className="container narrow">
        <div className="legal">
          <p className="legal-meta">Last updated: {LEGAL_UPDATED}</p>
          {children}
        </div>
      </div>
    </section>
  </>;
}

function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return <section className="legal-section">
    <h2>{heading}</h2>
    {children}
  </section>;
}

function PrivacyPage() {
  return <LegalPage
    title="Privacy Policy"
    lead="How Zoe Household collects, uses, and protects the information you share with us."
  >
    <LegalSection heading="Overview">
      <p>Zoe Household (&ldquo;Zoe,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a global household of believers with campuses across Nigeria, the United States, and the United Kingdom. This Privacy Policy explains what information we collect through this website, how we use it, and the choices you have. We are committed to handling your information with care, respect, and integrity.</p>
      <p>By using this website or submitting information through its forms, you agree to the practices described in this policy.</p>
    </LegalSection>

    <LegalSection heading="Information We Collect">
      <p><strong>Information you give us.</strong> When you plan a visit, pre-register a child for Zoe Arrows, request service reminders, connect online, submit a prayer request, or send us a general inquiry, we collect the details you choose to provide. This may include:</p>
      <ul>
        <li><strong>Contact details</strong> — your name, email address, and phone number.</li>
        <li><strong>Visit and family details</strong> — the campus you plan to attend and, for children&apos;s check-in, the information a parent or guardian chooses to share.</li>
        <li><strong>Prayer requests and messages</strong> — the content you include when you reach out to a prayer team or send a note.</li>
        <li><strong>Giving information</strong> — when you give, payments are processed by third-party providers or by bank transfer. We do not collect or store full card or bank account numbers on this website.</li>
      </ul>
      <p><strong>Information collected automatically.</strong> Like most websites, our hosting and infrastructure providers log basic technical data such as IP address, browser and device type, and the pages visited. This is used to keep the site secure, reliable, and performing well.</p>
    </LegalSection>

    <LegalSection heading="How We Use Your Information">
      <ul>
        <li>To respond to your requests and welcome you when you plan a visit.</li>
        <li>To route prayer requests carefully to the appropriate prayer team.</li>
        <li>To send the service reminders or online connection details you ask for.</li>
        <li>To support children&apos;s ministry check-in where a parent or guardian has provided information.</li>
        <li>To process and acknowledge giving through our giving partners.</li>
        <li>To maintain, protect, and improve the website.</li>
      </ul>
      <p>We only use the information for the purpose you shared it for, and we treat prayer requests and family details as sensitive and confidential.</p>
    </LegalSection>

    <LegalSection heading="How We Share Information">
      <p>We do not sell your personal information, and we do not share it for anyone else&apos;s marketing. We share information only in these limited cases:</p>
      <ul>
        <li><strong>Service providers</strong> who help us operate the site and ministry, including our website host (Vercel), email delivery (Resend), content management (Sanity), and our giving provider (Tithely). These providers process information on our behalf and are expected to protect it.</li>
        <li><strong>Embedded services</strong> such as Google Maps and YouTube, which may receive limited data when their content loads on a page, under their own privacy policies.</li>
        <li><strong>Legal reasons</strong>, where disclosure is reasonably necessary to comply with the law or protect the rights, safety, and property of our community.</li>
      </ul>
    </LegalSection>

    <LegalSection heading="Children&apos;s Information">
      <p>Information about children is provided by a parent or guardian for the purpose of children&apos;s ministry check-in and care. We collect only what is needed, keep it limited, and do not use it for any other purpose.</p>
    </LegalSection>

    <LegalSection heading="Data Retention">
      <p>We keep your information only as long as needed to fulfil the purpose you shared it for, to maintain appropriate ministry records, or as required by applicable law. When it is no longer needed, we take reasonable steps to delete or anonymise it.</p>
    </LegalSection>

    <LegalSection heading="Your Choices and Rights">
      <p>Depending on where you live, you may have the right to access, correct, or delete the personal information we hold about you, to withdraw consent, or to object to certain uses. You can unsubscribe from reminder emails at any time using the link in those emails. To make a request, contact us using the details below and we will respond within a reasonable time.</p>
    </LegalSection>

    <LegalSection heading="Cookies and Similar Technologies">
      <p>This website uses only essential cookies and local storage needed for core functionality. Embedded content such as maps and videos may set their own cookies when you interact with them, governed by the policies of those services.</p>
    </LegalSection>

    <LegalSection heading="Security">
      <p>We use reasonable technical and organisational measures to protect your information, including encrypted connections for data in transit. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
    </LegalSection>

    <LegalSection heading="International Transfers">
      <p>Because Zoe Household serves a global community and uses international service providers, your information may be processed in countries other than your own. Where this happens, we take steps to ensure your information remains protected.</p>
    </LegalSection>

    <LegalSection heading="Changes to This Policy">
      <p>We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;last updated&rdquo; date above. Continued use of the website after changes means you accept the updated policy.</p>
    </LegalSection>

    <LegalSection heading="Contact Us">
      <div className="legal-contact">
        <p>For privacy questions or to make a data request, contact us at <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. You can also reach us through the inquiry form on our <Link href="/about/faqs">FAQs page</Link>.</p>
      </div>
    </LegalSection>
  </LegalPage>;
}

function TermsPage() {
  return <LegalPage
    title="Terms of Use"
    lead="The terms that govern your use of the Zoe Household website."
  >
    <LegalSection heading="Acceptance of These Terms">
      <p>Welcome to the Zoe Household website. By accessing or using this site, you agree to these Terms of Use and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the site.</p>
    </LegalSection>

    <LegalSection heading="About This Website">
      <p>This website is operated by Zoe Household Global to share who we are, help you find and connect with a campus, access teaching and resources, and support the life of our community. Information on the site is provided for general and ministry purposes.</p>
    </LegalSection>

    <LegalSection heading="Using the Site">
      <p>You agree to use the website lawfully and respectfully. You may not:</p>
      <ul>
        <li>Use the site for any unlawful purpose or in violation of any applicable law.</li>
        <li>Attempt to gain unauthorised access to the site, its systems, or other users&apos; data.</li>
        <li>Upload or transmit viruses, malicious code, or anything intended to disrupt the site.</li>
        <li>Harass, abuse, impersonate, or harm another person through the site&apos;s forms.</li>
        <li>Submit content that is unlawful, misleading, or that infringes the rights of others.</li>
      </ul>
    </LegalSection>

    <LegalSection heading="Information You Submit">
      <p>When you submit a prayer request, visitor details, children&apos;s check-in information, or a message, you confirm that the information is accurate and that you have the right to share it. You give us permission to use that information for the purpose it was provided, as described in our <Link href="/privacy">Privacy Policy</Link>. Please do not submit sensitive information beyond what is needed.</p>
    </LegalSection>

    <LegalSection heading="Giving and Donations">
      <p>Giving through this website is processed by third-party providers or by bank transfer. Gifts are generally considered freely given and non-refundable. If you believe a giving error has occurred, please contact us promptly and we will do our best to help.</p>
    </LegalSection>

    <LegalSection heading="Intellectual Property">
      <p>Unless otherwise noted, the content on this site — including text, logos, images, sermons, music, and design — belongs to Zoe Household or its licensors and is protected by applicable laws. You may view and share content for personal, non-commercial purposes. You may not reproduce, distribute, or use it commercially without permission.</p>
    </LegalSection>

    <LegalSection heading="Third-Party Links and Services">
      <p>The site links to and embeds third-party services such as YouTube, Spotify, the Bible App, Substack, Google Maps, Tithely, and ChurchOS. We do not control these services and are not responsible for their content, availability, or practices. Your use of them is governed by their own terms and privacy policies.</p>
    </LegalSection>

    <LegalSection heading="Disclaimers">
      <p>The website and its content are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind, whether express or implied. While we strive to keep information accurate and the site available, we do not guarantee that it will always be uninterrupted, error-free, or current.</p>
    </LegalSection>

    <LegalSection heading="Limitation of Liability">
      <p>To the fullest extent permitted by law, Zoe Household and those serving with it will not be liable for any indirect, incidental, or consequential loss arising from your use of, or inability to use, the website or the services linked from it.</p>
    </LegalSection>

    <LegalSection heading="Changes to the Site and These Terms">
      <p>We may update, change, or discontinue parts of the website at any time, and we may revise these Terms of Use from time to time. When we do, we will update the &ldquo;last updated&rdquo; date above. Continued use of the site after changes means you accept the updated terms.</p>
    </LegalSection>

    <LegalSection heading="Contact Us">
      <div className="legal-contact">
        <p>Questions about these Terms? Contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or through the inquiry form on our <Link href="/about/faqs">FAQs page</Link>.</p>
      </div>
    </LegalSection>
  </LegalPage>;
}

function NotFoundPage() {
  return <section className="page-hero not-found">
    <div className="container page-hero-copy">
      <Label center>404</Label>
      <h1>This Page Is Not in the House</h1>
      <p className="lede">Let&apos;s help you find your way back.</p>
      <div className="actions is-center"><Link className="btn btn-primary" href="/">Return Home <Arrow /></Link></div>
    </div>
  </section>;
}

function Router({ path }: { path: string }) {
  const { bySlug, events } = useSite();
  if (path === "/") return <HomePage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/about/beliefs") return <BeliefsPage />;
  if (path === "/about/faqs") return <FaqPage />;
  if (path === "/visit") return <VisitPage />;
  if (path.startsWith("/visit/")) {
    const campus = bySlug.get(path.split("/")[2]);
    return campus ? <CampusPage campus={campus} /> : <NotFoundPage />;
  }
  if (path === "/sermons") return <SermonsPage />;
  if (path === "/pneuma-worship") return <PneumaPage />;
  if (path === "/events") return <EventsPage />;
  if (path.startsWith("/events/")) {
    const slug = path.split("/")[2];
    return events.some((event) => event.slug === slug) ? <EventDetailPage slug={slug} /> : <NotFoundPage />;
  }
  if (path === "/resources") return <ResourcesPage />;
  if (path === "/resources/scholarship") return <ScholarshipPage />;
  if (path === "/prayer") return <PrayerPage />;
  if (path === "/give" || path.startsWith("/give/")) return <GivePage path={path} />;
  if (path === "/privacy") return <PrivacyPage />;
  if (path === "/terms") return <TermsPage />;
  return <NotFoundPage />;
}

export function Prototype({ path, content = EMPTY_CONTENT }: { path: string; content?: SiteContent }) {
  const resolved = useMemo(() => resolveContent(content), [content]);
  return (
    <ContentContext.Provider value={resolved}>
      <Router path={path} />
    </ContentContext.Provider>
  );
}
