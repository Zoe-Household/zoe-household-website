"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Accordion, CampusFinder, FormCard, GivingCard, HeroVideo, SermonLibrary, VisitorHub } from "@/components/Interactive";
import { SocialIcon } from "@/components/SiteChrome";
import { beliefs, Campus, campuses, faqs, pastorDolapoBio, socialLinks } from "@/data/site";

function PageHero({
  eyebrow,
  title,
  body,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return <section className={`page-hero ${image ? "has-image" : ""}`} style={image ? { "--hero-image": `url("${image}")` } as React.CSSProperties : undefined}>
    <div className="page-hero-inner">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {body && <p>{body}</p>}
      {children}
    </div>
  </section>;
}

function SplitSection({
  eyebrow,
  title,
  body,
  image,
  reverse = false,
  children,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  image: string;
  reverse?: boolean;
  children?: React.ReactNode;
}) {
  return <section className={`section split-section ${reverse ? "reverse" : ""}`}>
    <div className="split-media"><img src={image} alt="" /></div>
    <div className="split-copy">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="rich-copy">{body}</div>
      {children}
    </div>
  </section>;
}

function CampusCards({ compact = false }: { compact?: boolean }) {
  return <div className={`campus-grid ${compact ? "compact" : ""}`}>
    {campuses.map((campus) => <Link className="campus-card" href={`/visit/${campus.slug}`} key={campus.slug}>
      <img src={campus.image} alt="" />
      <span className="campus-card-shade" />
      <span className="campus-card-copy"><small>{campus.region}</small><strong>{campus.shortName}</strong><em>Explore campus →</em></span>
    </Link>)}
  </div>;
}

function Quote({ children, attribution }: { children: React.ReactNode; attribution: string }) {
  return <figure className="testimony">
    <blockquote>“{children}”</blockquote>
    <figcaption>{attribution}</figcaption>
  </figure>;
}

function HomePage() {
  return <>
    <HeroVideo />

    <section className="section dark-section latest-teaching">
      <div className="section-heading">
        <p className="eyebrow">Latest Teaching</p>
        <h2>Gather around the Word.</h2>
      </div>
      <div className="feature-video">
        <div className="feature-video-media">
          <video autoPlay muted loop playsInline poster="/assets/zoe-worship-leader.jpg">
            <source src="/assets/zoe-youtube-thumbnail.m4v" type="video/mp4" />
          </video>
          <a className="round-play" href="https://www.youtube.com/@PastorDolapoLawal" target="_blank" rel="noreferrer" aria-label="Watch the latest teaching on YouTube">▶</a>
        </div>
        <div className="feature-video-copy">
          <span className="chip">From Zoe Atlanta</span>
          <h3>How to Heal with Intrusive Thoughts</h3>
          <p>Pastor Dolapo Lawal teaches a Christ-centered way to bring the thought life under the truth of God’s Word.</p>
          <Link className="button button-light" href="/sermons">Explore Sermons</Link>
        </div>
      </div>
    </section>

    <section className="identity-statement">
      <p className="eyebrow">This is Zoe</p>
      <h2>We see Him, and see us, as He sees us in Him.</h2>
      <p>Zoe Household is a global, multi-campus church centered on the revelation of Christ and the life of God made visible in His people.</p>
      <Link className="text-link" href="/about">Meet the household →</Link>
    </section>

    <section className="section campuses-section">
      <div className="section-heading inline">
        <div><p className="eyebrow">One Household · Seven Campuses</p><h2>Find your place in the family.</h2></div>
        <Link className="button button-quiet" href="/visit">Plan Your Visit</Link>
      </div>
      <CampusCards />
    </section>

    <Quote attribution="A member of Zoe Household">I found more than a church to attend. I found people to grow with, pray with, and do life with.</Quote>

    <section className="section devotional-section">
      <div className="section-heading">
        <p className="eyebrow">Daily Formation</p>
        <h2>Keep becoming, wherever you are.</h2>
      </div>
      <div className="resource-pair">
        <article className="editorial-card green-card">
          <small>Ongoing devotional · Substack</small>
          <h3>The Zoe Devotional</h3>
          <p>Scripture, reflection, and Christ-centered encouragement for the life you are living now.</p>
          <a className="button button-light" href="https://substack.com/" target="_blank" rel="noreferrer">Read the Devotional</a>
        </article>
        <article className="editorial-card image-card">
          <img src="/assets/zoe-faith-over-fear.jpg" alt="" />
          <div><small>Bible App plan</small><h3>Who Is Jesus</h3><p>Meet Jesus in Scripture and discover the life found in Him.</p><a className="button button-light" href="https://www.bible.com/" target="_blank" rel="noreferrer">Open in the Bible App</a></div>
        </article>
      </div>
    </section>

    <SplitSection
      eyebrow="Prayer"
      title="You do not have to carry it alone."
      image="/assets/zoe-prayer.jpg"
      body={<p>Whatever season you are in, the household is ready to stand with you in prayer.</p>}
    >
      <Link className="button button-dark" href="/prayer">Share a Prayer Request</Link>
    </SplitSection>

    <section className="section events-preview">
      <div className="section-heading inline">
        <div><p className="eyebrow">Global Gatherings</p><h2>Moments that shape the household.</h2></div>
        <Link className="text-link" href="/events">View all events →</Link>
      </div>
      <div className="event-grid">
        <EventCard slug="ignite" title="Ignite" label="Annual global gathering" />
        <EventCard slug="camp-meeting" title="Camp Meeting" label="A household set apart" />
        <EventCard slug="still-waters" title="Still Waters" label="Rest, reflection, renewal" />
      </div>
    </section>

    <section className="social-close">
      <p className="eyebrow">Life in the Household</p>
      <h2>Stay close to what God is doing.</h2>
      <div className="large-socials">
        {(Object.keys(socialLinks) as (keyof typeof socialLinks)[]).map((name) => <a key={name} href={socialLinks[name]} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /><span>{name}</span></a>)}
      </div>
      <Link className="button button-primary" href="/visit">Find Your Campus</Link>
    </section>
  </>;
}

function AboutPage() {
  return <>
    <PageHero eyebrow="About Zoe Household" title="The life of God, lived together." body="A global household formed around the revelation of Jesus Christ." image="/assets/zoe-arrival-smiles.jpg">
      <div className="button-row"><Link className="button button-light" href="/visit">Find a Campus</Link><Link className="button button-outline-light" href="/about/beliefs">What We Believe</Link></div>
    </PageHero>
    <section className="section statement-grid">
      <article><span>Our vision</span><h2>We see Him, and see us, as He sees us in Him.</h2></article>
      <article><span>Our mission</span><p>To reveal Christ, build believers in the consciousness of their identity in Him, and express the life of God together across cities and nations.</p></article>
    </section>
    <SplitSection
      eyebrow="Our Lead Pastor"
      title="Pastor Dolapo Lawal"
      image="/assets/zoe-worship-leader.jpg"
      reverse
      body={<p>{pastorDolapoBio}</p>}
    >
      <a className="text-link" href="https://www.youtube.com/@PastorDolapoLawal" target="_blank" rel="noreferrer">Watch Pastor Dolapo teach →</a>
    </SplitSection>
    <section className="section values-section">
      <div className="section-heading"><p className="eyebrow">The Household</p><h2>What life here feels like.</h2></div>
      <div className="value-grid">
        <article><span>01</span><h3>Christ revealed</h3><p>Jesus is the center, substance, and pattern of our life together.</p></article>
        <article><span>02</span><h3>People known</h3><p>We are not an audience. We are a family growing in grace and truth.</p></article>
        <article><span>03</span><h3>Lives formed</h3><p>Scripture, prayer, worship, and service shape how we live every day.</p></article>
      </div>
    </section>
    <section className="cta-band"><h2>There is room for you in the household.</h2><Link className="button button-primary" href="/visit">Plan Your Visit</Link></section>
  </>;
}

function BeliefsPage() {
  return <>
    <PageHero eyebrow="What We Believe" title="Jesus is at the center." body="These convictions shape our worship, our teaching, and our life together." />
    <section className="section narrow-section">
      <Accordion items={beliefs} />
    </section>
    <section className="cta-band"><h2>Come grow with us.</h2><div className="button-row"><Link className="button button-primary" href="/visit">Find a Campus</Link><Link className="button button-quiet" href="/sermons">Watch a Teaching</Link></div></section>
  </>;
}

function FaqPage() {
  return <>
    <PageHero eyebrow="Questions & Answers" title="Come as you are." body="Helpful answers for your first visit and your next step." />
    <section className="section narrow-section"><Accordion items={faqs} /></section>
    <section id="general-inquiry" className="section form-section">
      <FormCard kind="inquiry" />
    </section>
  </>;
}

function VisitPage() {
  return <>
    <PageHero eyebrow="Visit Zoe Household" title="There is a place for you here." body="Find the Zoe campus nearest you, prepare for Sunday, and meet your local household." image="/assets/zoe-welcome-team.jpg" />
    <section className="section finder-section">
      <div className="section-heading"><p className="eyebrow">Find a Campus</p><h2>Start with your location.</h2></div>
      <CampusFinder />
    </section>
    <section className="section">
      <div className="section-heading inline"><div><p className="eyebrow">All Campuses</p><h2>Seven cities. One household.</h2></div></div>
      <CampusCards />
    </section>
    <section className="section arrows-intro">
      <div><p className="eyebrow">Families</p><h2>Zoe Arrows</h2></div>
      <p>Children are welcomed into a safe, joyful space where they can encounter Jesus and grow in His Word. Pre-registration and local check-in details are available on each campus page.</p>
    </section>
  </>;
}

function CampusPage({ campus }: { campus: Campus }) {
  const hasMaps = !campus.address.includes("released once available");
  return <>
    <PageHero eyebrow={`${campus.region} Campus`} title={campus.name} body="Welcome home. We would love to meet you at our next gathering." image={campus.image}>
      <div className="button-row"><a className="button button-light" href="#visitor-pathway">Plan Your Visit</a>{hasMaps && <a className="button button-outline-light" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.address)}`} target="_blank" rel="noreferrer">Get Directions</a>}</div>
    </PageHero>
    <section className="campus-verse"><blockquote>“{campus.verse}”</blockquote><p>{campus.verseRef}</p></section>
    <section className="section service-section">
      <div className="section-heading"><p className="eyebrow">Gather With Us</p><h2>Services at {campus.shortName}</h2></div>
      <div className="service-grid">
        {campus.services.map((service) => <article key={service.name}>
          <small>{service.name}</small><h3>{service.schedule}</h3><p>{service.address}</p>
          {!service.address.includes("released once available") && <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.address)}`} target="_blank" rel="noreferrer">Open in Maps →</a>}
        </article>)}
      </div>
      {campus.phone && <p className="campus-contact">Campus phone: <a href={`tel:${campus.phone.replace(/[^\d+]/g, "")}`}>{campus.phone}</a></p>}
    </section>
    <section className="section arrows-campus">
      <div className="arrows-copy"><p className="eyebrow">Zoe Arrows</p><h2>A place for every child to grow.</h2><p>Children join the household for praise and worship. After worship, meet a servant leader in the entry lobby for Zoe Arrows check-in.</p></div>
      <img src="/assets/zoe-arrival-smiles.jpg" alt="" />
    </section>
    <VisitorHub campus={campus} />
    <section className="campus-social">
      <p className="eyebrow">Stay Connected</p><h2>Follow life across Zoe Household.</h2>
      <div className="large-socials">
        {(Object.keys(socialLinks) as (keyof typeof socialLinks)[]).map((name) => <a key={name} href={socialLinks[name]} target="_blank" rel="noreferrer" aria-label={name}><SocialIcon name={name} /><span>{name}</span></a>)}
      </div>
    </section>
  </>;
}

function SermonsPage() {
  return <>
    <PageHero eyebrow="Watch & Listen" title="Be formed by the Word." body="Explore a growing library of Christ-centered teachings from Zoe Household." image="/assets/zoe-faith-over-fear.jpg">
      <a className="button button-light" href="https://www.youtube.com/@PastorDolapoLawal" target="_blank" rel="noreferrer">Visit YouTube</a>
    </PageHero>
    <section className="section"><SermonLibrary /></section>
  </>;
}

function PneumaPage() {
  return <>
    <PageHero eyebrow="Pneuma Worship" title="Songs from the life of the Spirit." body="Pneuma Worship is the worship expression of Zoe Household—music shaped by Scripture, prayer, and the revelation of Christ." image="/assets/zoe-worship-leader.jpg">
      <div className="button-row"><a className="button button-light" href={socialLinks.spotify} target="_blank" rel="noreferrer">Listen on Spotify</a><a className="button button-outline-light" href={socialLinks.youtube} target="_blank" rel="noreferrer">Watch on YouTube</a></div>
    </PageHero>
    <section className="section music-intro">
      <div><p className="eyebrow">Our Sound</p><h2>Worship that reveals Jesus.</h2></div>
      <p>Our songs give voice to the truth of God’s Word and the household’s response to Him—adoration, faith, surrender, and joy.</p>
    </section>
    <section className="section dark-section release-grid">
      <article><small>Listen everywhere</small><h2>Pneuma Worship</h2><p>Find current releases on Spotify and worship with Zoe Household wherever you are.</p><a className="button button-light" href={socialLinks.spotify} target="_blank" rel="noreferrer">Open Spotify</a></article>
      <div className="album-art"><img src="/assets/zoe-global-logo.jpg" alt="Zoe Global" /></div>
    </section>
    <section className="social-close"><p className="eyebrow">Worship With Us</p><h2>Gather with a local household.</h2><Link className="button button-primary" href="/visit">Find a Campus</Link></section>
  </>;
}

function EventCard({ slug, title, label }: { slug: string; title: string; label: string }) {
  return <Link className="event-card" href={`/events/${slug}`}>
    <span className="event-number">{title.slice(0, 1)}</span><small>{label}</small><h3>{title}</h3><p>Details for the next gathering will be released once available.</p><strong>Explore event →</strong>
  </Link>;
}

function EventsPage() {
  return <>
    <PageHero eyebrow="Global Events" title="Gatherings for the whole household." body="Shared moments of worship, formation, rest, and encounter across Zoe Household." image="/assets/zoe-hero.png" />
    <section className="section event-grid event-grid-large">
      <EventCard slug="ignite" title="Ignite" label="Annual global gathering" />
      <EventCard slug="camp-meeting" title="Camp Meeting" label="A household set apart" />
      <EventCard slug="still-waters" title="Still Waters" label="Rest, reflection, renewal" />
    </section>
  </>;
}

const eventDetails: Record<string, { title: string; eyebrow: string; intro: string; body: string }> = {
  ignite: {
    title: "Ignite",
    eyebrow: "Annual Global Gathering",
    intro: "A defining gathering for worship, the Word, prayer, and fresh fire.",
    body: "Ignite brings the global household together to behold Jesus, receive the Word, and return to our cities strengthened for the life and work God has entrusted to us.",
  },
  "camp-meeting": {
    title: "Camp Meeting",
    eyebrow: "A Household Set Apart",
    intro: "Unhurried days of formation, fellowship, and encounter.",
    body: "Camp Meeting creates room for the household to withdraw from the ordinary rhythm, sit deeply with Scripture, pray together, and build lasting relationships across campuses.",
  },
  "still-waters": {
    title: "Still Waters",
    eyebrow: "Rest · Reflection · Renewal",
    intro: "A restorative gathering for quiet, clarity, and the presence of God.",
    body: "Still Waters is an invitation to slow down, attend to the soul, and receive the rest and renewal found in Christ.",
  },
};

function EventDetailPage({ slug }: { slug: string }) {
  const event = eventDetails[slug];
  return <>
    <PageHero eyebrow={event.eyebrow} title={event.title} body={event.intro} image="/assets/zoe-hero.png" />
    <section className="section event-detail">
      <div><p className="eyebrow">About the Gathering</p><h2>A moment for the whole household.</h2></div>
      <div><p>{event.body}</p><div className="release-note"><strong>Next gathering</strong><span>Dates, location, and registration details will be released once available.</span></div></div>
    </section>
    <section className="cta-band"><h2>Stay connected for the next release.</h2><Link className="button button-primary" href="/visit">Find Your Campus</Link></section>
  </>;
}

function ResourcesPage() {
  return <>
    <PageHero eyebrow="Resources" title="Truth for the life you are living." body="Devotionals and practical support to help you keep growing in Christ." image="/assets/zoe-faith-over-fear.jpg" />
    <section className="section resource-pair resource-page-grid">
      <article className="editorial-card green-card"><small>Ongoing devotional · Substack</small><h2>The Zoe Devotional</h2><p>Regular Scripture reflections for a Christ-centered life.</p><a className="button button-light" href="https://substack.com/" target="_blank" rel="noreferrer">Read the Devotional</a></article>
      <article className="editorial-card cream-card"><small>Bible App plan</small><h2>Who Is Jesus</h2><p>A guided devotional journey through the person and work of Jesus.</p><a className="button button-dark" href="https://www.bible.com/" target="_blank" rel="noreferrer">Open the Plan</a></article>
      <Link className="editorial-card scholarship-card" href="/resources/scholarship"><small>Zoe Scholarship</small><h2>Opening doors through education.</h2><p>Learn about the Zoe Household scholarship program, eligibility, and the next application cycle.</p><strong>Explore the scholarship →</strong></Link>
    </section>
  </>;
}

function ScholarshipPage() {
  return <>
    <PageHero eyebrow="Zoe Scholarship" title="Investing in purpose through education." body="Supporting students as they pursue education, growth, and the future God has placed before them." image="/assets/zoe-arrival-smiles.jpg" />
    <section className="section scholarship-intro">
      <div><p className="eyebrow">The Opportunity</p><h2>Practical support for the journey ahead.</h2></div>
      <div><p>The Zoe Scholarship is part of the household’s commitment to equip people to flourish. Awards support eligible students pursuing their educational goals.</p><p>Next cycle dates will be announced once available.</p></div>
    </section>
    <section className="section criteria-grid">
      <article><span>01</span><h3>Review eligibility</h3><p>Full eligibility requirements for the next cycle will be published with the application release.</p></article>
      <article><span>02</span><h3>Prepare documents</h3><p>Applicants should be ready to share academic and supporting information requested in the application.</p></article>
      <article><span>03</span><h3>Submit during the cycle</h3><p>The application link and submission window will be released here when the next cycle opens.</p></article>
    </section>
    <section className="cta-band"><div><p className="eyebrow">Next Application Cycle</p><h2>Dates will be announced once available.</h2></div><Link className="button button-primary" href="/about/faqs#general-inquiry">Ask a Question</Link></section>
  </>;
}

function PrayerPage() {
  return <>
    <PageHero eyebrow="Prayer" title="We are ready to stand with you." body="Share what is on your heart. Your request will be received with care and routed to the appropriate prayer team." image="/assets/zoe-prayer.jpg" />
    <section className="section prayer-layout">
      <div className="prayer-copy"><p className="eyebrow">In Every Season</p><h2>Bring your request before God.</h2><p>You can share as much or as little detail as you are comfortable sharing.</p><blockquote>“The prayer of a righteous person is powerful and effective.”<cite>James 5:16</cite></blockquote></div>
      <FormCard kind="prayer" />
    </section>
  </>;
}

function GivePage() {
  const [campusSlug, setCampusSlug] = useState("atlanta");
  const selected = useMemo(() => campuses.find((campus) => campus.slug === campusSlug) ?? campuses[1], [campusSlug]);
  return <>
    <PageHero eyebrow="Give" title="Generosity makes room for the work." body="Give to Zoe Global or support the work of your local household." />
    <section className="section giving-priority">
      <div className="giving-detected">
        <div><p className="eyebrow">Your Campus</p><h2>{selected.name}</h2><p>Select another campus if needed.</p></div>
        <label><span>Campus</span><select value={campusSlug} onChange={(event) => setCampusSlug(event.target.value)}>{campuses.map((campus) => <option value={campus.slug} key={campus.slug}>{campus.shortName}</option>)}</select></label>
      </div>
      <div className="giving-top-grid">
        <GivingCard title={selected.name} tithely={["atlanta", "houston"].includes(selected.slug)} />
        <GivingCard title="Zoe Household Global" global />
      </div>
    </section>
    <section className="section giving-all">
      <div className="section-heading"><p className="eyebrow">All Campuses</p><h2>Give where you are planted.</h2></div>
      <div className="giving-grid">
        {campuses.map((campus) => <GivingCard key={campus.slug} title={campus.name} tithely={["atlanta", "houston"].includes(campus.slug)} />)}
      </div>
    </section>
    <section className="giving-scripture"><blockquote>“God loves a cheerful giver.”</blockquote><p>2 Corinthians 9:7</p></section>
  </>;
}

function NotFoundPage() {
  return <section className="not-found"><p className="eyebrow">404</p><h1>This page is not in the house.</h1><p>Let’s help you find your way back.</p><Link className="button button-primary" href="/">Return Home</Link></section>;
}

export function Prototype({ path }: { path: string }) {
  if (path === "/") return <HomePage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/about/beliefs") return <BeliefsPage />;
  if (path === "/about/faqs") return <FaqPage />;
  if (path === "/visit") return <VisitPage />;
  if (path.startsWith("/visit/")) {
    const campus = campuses.find((item) => item.slug === path.split("/")[2]);
    return campus ? <CampusPage campus={campus} /> : <NotFoundPage />;
  }
  if (path === "/sermons") return <SermonsPage />;
  if (path === "/pneuma-worship") return <PneumaPage />;
  if (path === "/events") return <EventsPage />;
  if (path.startsWith("/events/")) {
    const slug = path.split("/")[2];
    return eventDetails[slug] ? <EventDetailPage slug={slug} /> : <NotFoundPage />;
  }
  if (path === "/resources") return <ResourcesPage />;
  if (path === "/resources/scholarship") return <ScholarshipPage />;
  if (path === "/prayer") return <PrayerPage />;
  if (path === "/give") return <GivePage />;
  return <NotFoundPage />;
}
