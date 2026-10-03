"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { CalendarButton, CampusFinder, FormCard, GivingCard, Modal, SermonLibrary, VisitorHub } from "@/components/Interactive";
import { NationsMap } from "@/components/NationsMap";
import { TeachingLibrary } from "@/components/TeachingLibrary";
import { SocialIcon } from "@/components/SiteChrome";
import { beliefs, Campus, campuses, sermons, socialLinks } from "@/data/site";

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

const homeCampuses = [
  { name: "Zoe Atlanta", place: "6865 Factory Shoals Rd SW, Austell, GA 30168", href: "/visit/atlanta", image: "/figma/campus-atlanta-42d4b1.png", pastor: "Temi Lawal" },
  { name: "Zoe Abeokuta", place: "Abeokuta, Nigeria", href: "/visit/abeokuta", image: "/figma/campus-abeokuta-7f776f.png" },
  { name: "Zoe Houston", place: "Houston, Texas", href: "/visit/houston", image: "/figma/campus-houston-2ae206.png" },
  { name: "ZOE IKEJA", place: "Ikeja, Lagos", href: "/visit/ikeja", image: "/figma/campus-ikeja.png" },
  { name: "Zoe IPAJA", place: "Ipaja, Lagos", href: "/visit/ipaja", image: "/figma/campus-ipaja.png" },
  { name: "Zoe UK", place: "United Kingdom", href: "/visit/london", image: "/figma/campus-uk-64c435.png" },
  { name: "Zoe YABA", place: "Yaba, Lagos", href: "/visit/yaba", image: "/figma/campus-yaba.png" },
] as const;

function HomePage() {
  return <>
    <section className="fig-hero">
      <div className="fig-hero-media">
        <video autoPlay muted loop playsInline poster="/hero/zoe-welcome-team.jpg">
          <source src="/hero/zoe-hero.mp4?v=2" type="video/mp4" />
        </video>
      </div>
      <div className="fig-hero-copy">
        <span className="fig-pill">Greek: ζωή</span>
        <h1>The life of God</h1>
        <p>A people led by the Spirit, shining the light of the gospel in every sector.</p>
        <div className="fig-actions">
          <Link className="fig-btn fig-btn-lime" href="/visit">Find a Campus</Link>
          <Link className="fig-btn fig-btn-ghost" href="/sermons">Watch A Sermon</Link>
        </div>
      </div>
    </section>

    <section className="fig-who">
      <div className="fig-who-grid">
        <div className="fig-who-dark">
          <h2>Who We Are</h2>
          <div className="fig-who-panel">
            <p className="fig-who-lead"><span>W</span>hat makes us unique is our unwavering commitment to revealing <span>C</span>hrist. We’re not just a church.</p>
            <p>We are more than a place to gather. Discover the Life, Identity and Community that make us ZOE</p>
            <hr />
            <div className="fig-who-points">
              <div><strong>Spirit led</strong><span>Led by the Spirit. Living the life of God</span></div>
              <div><strong>Identity in Christ</strong><span>Discovering who we are as He sees us in Him.</span></div>
            </div>
          </div>
        </div>
        <div className="fig-who-light">
          <p className="fig-kicker">One people in Christ</p>
          <p>ZOE Household is a people committed to revealing Jesus and His unending grace. From our gatherings to different sectors and communities we serve, we continue to grow as one household living out our identity in Christ and shining the light of the gospel.</p>
          <img src="/figma/who-we-are-1e3fbc.png" alt="People gathered at Zoe Household" />
        </div>
      </div>
    </section>

    <section className="fig-feature">
      <img src="/figma/feature-video.png" alt="Zoe Household worship gathering" />
      <a className="fig-play" href="https://www.youtube.com/@PastorDolapoLawal" target="_blank" rel="noreferrer" aria-label="Watch the latest message">▶</a>
    </section>

    <section className="fig-band">
      <div className="fig-band-head">
        <div>
          <h2>One family, many cities</h2>
          <p>Six campuses across Nigeria and the United States. Find the gathering nearest you and reach out — a campus pastor will be glad to welcome you.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/visit">Find a Campus</Link>
      </div>
      <div className="fig-campus-row three">
        {homeCampuses.slice(0, 3).map((campus) => <Link className="fig-campus-card" href={campus.href} key={campus.href}>
          <div className="fig-campus-photo" style={{ backgroundImage: `url(${campus.image})` }}>
            <div>
              <strong>{campus.name}</strong>
              <span>{campus.place}</span>
              {"pastor" in campus && campus.pastor ? <em>{campus.pastor}</em> : null}
            </div>
            <b>Explore</b>
          </div>
        </Link>)}
      </div>
      <div className="fig-campus-row four">
        {homeCampuses.slice(3).map((campus) => <Link className="fig-campus-card" href={campus.href} key={campus.href}>
          <div className="fig-campus-photo" style={{ backgroundImage: `url(${campus.image})` }}>
            <div>
              <strong>{campus.name}</strong>
              <span>{campus.place}</span>
            </div>
            <b>Explore</b>
          </div>
        </Link>)}
      </div>
    </section>

    <section className="fig-resources">
      <div className="fig-band-head">
        <div>
          <h2>Keep Growing Through the Week.</h2>
          <p>Resources to help you remain engaged with God&apos;s Word throughout the week.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/resources">See All Resources</Link>
      </div>
      <div className="fig-resource-row">
        <article>
          <p>Ongoing devotional · Substack</p>
          <h3>The Zoe Devotional</h3>
          <span>Scripture, reflection, and Christ-centered encouragement for the life you are living now.</span>
          <a className="fig-btn fig-btn-lime" href="https://substack.com/" target="_blank" rel="noreferrer">Read The Devotional</a>
        </article>
        <article className="fig-bible" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url("/figma/bible-plan.png")' }}>
          <p>Bible plan</p>
          <h3>Who Is Jesus</h3>
          <span>Meet Jesus in Scripture and discover the life found in Him. Take time to slow down, reflect on His Word.</span>
          <a className="fig-btn fig-btn-solid" href="https://www.bible.com/" target="_blank" rel="noreferrer">Open In The Bible App</a>
        </article>
      </div>
    </section>

    <section className="fig-cta">
      <h2>We Would Love to Pray With You.</h2>
      <p>Whatever you&apos;re carrying, you can bring it to God. Share your prayer request and allow the Zoe Household to stand with you.</p>
      <Link className="fig-btn fig-btn-solid" href="/prayer">Submit A Prayer Request</Link>
    </section>

    <section className="fig-events">
      <div className="fig-band-head">
        <div>
          <h2>Gather With the Household.</h2>
          <p>Explore the gatherings coming up across Zoe Household.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/about">Read full biography</Link>
      </div>
      <div className="fig-event-row">
        <article className="dark">
          <div><strong>09 - 14</strong><span>June</span></div>
          <div>
            <h3>Ignite</h3>
            <p>A time to gather, encounter God, build meaningful connections, and be stirred to live out the life of Christ.</p>
            <small>12658 Goar Rd, Houston, TX 77077</small>
            <Link href="/events/ignite">View Event Details</Link>
          </div>
        </article>
        <article>
          <div><strong>09 - 14</strong><span>June</span></div>
          <div>
            <h3>Ignite</h3>
            <p>A time to gather, encounter God, build meaningful connections, and be stirred to live out the life of Christ.</p>
            <small>12658 Goar Rd, Houston, TX 77077</small>
            <Link href="/events/ignite">View Event Details</Link>
          </div>
        </article>
        <article>
          <div><strong>09 - 14</strong><span>June</span></div>
          <div>
            <h3>Ignite</h3>
            <p>A time to gather, encounter God, build meaningful connections, and be stirred to live out the life of Christ.</p>
            <small>12658 Goar Rd, Houston, TX 77077</small>
            <Link href="/events/ignite">View Event Details</Link>
          </div>
        </article>
      </div>
    </section>

    <section className="fig-cta fig-cta-close">
      <h2>Find Your Place in the Household.</h2>
      <p>Connect with a campus, find community, and become part of a people committed to knowing Jesus, growing together and shining the light of the gospel.</p>
      <div className="fig-actions">
        <Link className="fig-btn fig-btn-solid" href="/visit">Join the Household</Link>
        <Link className="fig-btn fig-btn-ghost" href="/visit">Find A Campus</Link>
      </div>
    </section>
  </>;
}

function AboutPage() {
  return <>
    <section className="about-hero">
      <div className="about-hero-copy">
        <span className="about-pill">Who we are</span>
        <h1>This Is Zoe.<br />This Is Who We Are.</h1>
        <p>A people growing together in the life of God.</p>
      </div>
      <div className="about-hero-photo">
        <img src="/figma/about-hero-frame.png" alt="Zoe Household worship gathering" />
        <img className="about-scroll" src="/figma/scroll-down.svg" alt="" />
      </div>
    </section>

    <section className="about-vision" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), url("/figma/about-vision-51f746.png")' }}>
      <article className="cream">
        <h2>Vision</h2>
        <p>To reveal the believer’s identity in Christ and bring unbelievers into the reality of who they are in Him, discovering the life, purpose, and identity found in Christ.</p>
      </article>
      <article className="dark">
        <h2>Mission</h2>
        <p>To teach and reveal Jesus and His unending grace, raising a people who embody the life of God and serve the body of Christ across every sector and area of life.</p>
      </article>
    </section>

    <section className="about-pastor">
      <figure>
        <img src="/figma/asset-04-15ae5e.png" alt="Pastor Dolapo Lawal" />
        <figcaption><span>Senior Pastor</span>Pastor Dolapo Lawal</figcaption>
      </figure>
      <div>
        <h2>Our Lead Pastor</h2>
        <p>Pastor Dolapo Lawal is the Lead Pastor of The Zoe Household Global, a fast growing vibrant church with expressions in Atlanta, USA and Lagos, Nigeria. Called to reveal Christ, Pastor Dolapo teaches the word of God with simplicity and precision. His depth in the word of God and passion to reach the world with truth has endeared many to His ministry. Pastor Dolapo has released numerous songs for the edification of the body of Christ. He currently resides in Atlanta, USA where he currently pastors The Zoe Household Atlanta. He is happily married to Temiloluwa and they are blessed with two lovely children.</p>
        <div className="fig-actions">
          <a className="fig-btn fig-btn-solid" href="https://www.pastordolapolawal.com/" target="_blank" rel="noreferrer">Read Full Biography</a>
          <a className="fig-btn fig-btn-ghost" href="/sermons">Watch A Sermon</a>
        </div>
      </div>
    </section>

    <section className="about-nations">
      <div className="fig-band-head">
        <div>
          <h2>Nations Reached</h2>
          <p>Zoe is one household gathered across different cities and nations. From Nigeria to the United States and the United Kingdom, our campuses are different locations within the same household.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/visit">Explore All Campus</Link>
      </div>
      <NationsMap />
    </section>
  </>;
}

const doctrine = [
  ["01", "God", beliefs[0][1], beliefs[0][2]],
  ["02", "Jesus Christ", "We believe that Jesus Christ is the Son of God, fully God and fully man, who came to earth through the virgin birth, lived a sinless life, died on the cross for our sins, and rose again on the third day. He is the only way to the Father and the only source of eternal life. Jesus is Savior, Lord, and soon-coming King.", "John 1:1, Philippians 2:6-8, Luke 1:35, John 14:6, 1 Corinthians 15:3-4"],
  ["03", "The Holy Spirit", beliefs[2][1], beliefs[2][2]],
  ["04", "Trinity", beliefs[3][1], beliefs[3][2]],
  ["05", "Salvation", beliefs[4][1], beliefs[4][2]],
  ["06", "Sanctification", beliefs[5][1], beliefs[5][2]],
  ["07", "Spiritual Gifts", beliefs[6][1], beliefs[6][2]],
  ["08", "Communion", beliefs[7][1], beliefs[7][2]],
  ["09", "Marriage", beliefs[8][1], beliefs[8][2]],
  ["10", "Resurrection", beliefs[9][1], beliefs[9][2]],
  ["11", "Christ’s Return", beliefs[10][1], beliefs[10][2]],
] as const;

function BeliefsPage() {
  const [open, setOpen] = useState(1);
  return <>
    <section className="belief-hero" style={{ backgroundImage: 'url("/figma/beliefs-hero.png")' }}>
      <div className="about-hero-copy">
        <span className="belief-pill">What we believe</span>
        <h1>This Is Zoe.<br />This Is Who We Are.</h1>
        <p>A people growing together in the life of God.</p>
      </div>
      <img className="belief-scroll" src="/figma/scroll-down.svg" alt="" />
    </section>

    <section className="belief-body">
      <aside>
        <p>Doctrinal Index</p>
        <a href="#believe-intro">Introduction</a>
        {doctrine.map(([num, title], index) => (
          <a key={num} href={`#belief-${num}`} className={open === index ? "is-active" : ""} onClick={() => setOpen(index)}>{num} {title}</a>
        ))}
      </aside>
      <div>
        <div id="believe-intro" className="belief-intro">
          <h2>What We Believe Matters</h2>
          <p>Our beliefs aren&apos;t just words on a page. They shape the way we see Jesus, understand His work in us, and live out the life we&apos;ve received in Him.</p>
          <strong>Here is what we believe as the Zoe Household.</strong>
        </div>
        <div className="belief-list">
          {doctrine.map(([num, title, body, refs], index) => {
            const expanded = open === index;
            return <article id={`belief-${num}`} key={num} className={expanded ? "is-open" : ""}>
              <button type="button" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
                <span>{num}</span>
                <strong>{title}</strong>
                <i aria-hidden="true">{expanded ? "−" : "+"}</i>
              </button>
              {expanded ? <>
                <hr />
                <p>{body}</p>
                <small>{refs}</small>
              </> : <em>Click to view full doctrinal statement on {title}</em>}
            </article>;
          })}
        </div>
      </div>
    </section>

    <section className="fig-resources">
      <div className="fig-band-head">
        <div>
          <h2>Keep Growing Through the Week.</h2>
          <p>Resources to help you remain engaged with God&apos;s Word throughout the week.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/resources">See All Resources</Link>
      </div>
      <div className="fig-resource-row">
        <article>
          <p>Ongoing devotional · Substack</p>
          <h3>The Zoe Devotional</h3>
          <span>Scripture, reflection, and Christ-centered encouragement for the life you are living now.</span>
          <a className="fig-btn fig-btn-lime" href="https://substack.com/" target="_blank" rel="noreferrer">Read The Devotional</a>
        </article>
        <article className="fig-bible" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.8), rgba(0,0,0,.8)), url("/figma/bible-plan.png")' }}>
          <p>Bible plan</p>
          <h3>Who Is Jesus</h3>
          <span>Meet Jesus in Scripture and discover the life found in Him. Take time to slow down, reflect on His Word.</span>
          <a className="fig-btn fig-btn-solid" href="https://www.bible.com/" target="_blank" rel="noreferrer">Open In The Bible App</a>
        </article>
      </div>
    </section>
  </>;
}

const faqTabs = ["General", "Visiting Zoe", "Gatherings & Services", "Campuses", "Getting Connected", "Giving & Support"] as const;

const faqItems: { tab: (typeof faqTabs)[number]; q: string; a: string }[] = [
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

function FaqPage() {
  const [tab, setTab] = useState<(typeof faqTabs)[number]>("General");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const visible = faqItems.filter((item) => item.tab === tab && `${item.q} ${item.a}`.toLowerCase().includes(query.trim().toLowerCase()));

  const chooseTab = (next: (typeof faqTabs)[number]) => {
    setTab(next);
    setOpen(0);
    document.getElementById("faq-answers")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sendInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) {
      setSent(true);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "inquiry",
          name: data.get("name"),
          email: data.get("email"),
          phone: "",
          topic: data.get("topic"),
          message: data.get("message"),
          region: data.get("atlantaEmails") === "on" ? "Zoe Atlanta emails" : "",
          consent: true,
        }),
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

  return <>
    <section className="belief-hero faq-hero" style={{ backgroundImage: 'url("/figma/faq-hero.png")' }}>
      <div className="about-hero-copy">
        <span className="belief-pill">Frequently asked questions</span>
        <h1>How Can We Help?</h1>
        <p>Have a question about ZoeHousehold, visiting a campus, our gatherings, or getting connected? Start here.</p>
      </div>
      <div className="faq-search-wrap">
        <label className="faq-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="#152022" strokeWidth="1.6" /><path d="M16.5 16.5 21 21" fill="none" stroke="#152022" strokeWidth="1.6" /></svg>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setOpen(0); }} placeholder="What should expect when I visit?" aria-label="Search questions" />
        </label>
        <div className="faq-popular">
          <span>Popular:</span>
          <button type="button" onClick={() => chooseTab("Getting Connected")}>Getting connected</button>
          <button type="button" onClick={() => chooseTab("Visiting Zoe")}>Visiting ZOE</button>
          <button type="button" onClick={() => chooseTab("Campuses")}>Campuses</button>
        </div>
      </div>
    </section>

    <section className="faq-topics">
      {[
        ["Partnership", "Questions about visiting Zoe and what to expect when you arrive.", "Giving & Support"],
        ["Find a Campus", "Find a Zoe location and learn more about gathering there.", "Campuses"],
        ["Getting Connected", "Find out how to become part of the Zoe Household and grow together.", "Getting Connected"],
        ["What We Believe", "Learn more about the truths that guide our household.", ""],
      ].map(([title, body, next]) => next ? (
        <button type="button" key={title} onClick={() => chooseTab(next as (typeof faqTabs)[number])}>
          <strong>{title}</strong>
          <span>{body}</span>
          <em>Explore Questions <i /></em>
        </button>
      ) : (
        <Link key={title} href="/about/beliefs">
          <strong>{title}</strong>
          <span>{body}</span>
          <em>Explore Questions <i /></em>
        </Link>
      ))}
    </section>

    <section id="faq-answers" className="faq-panel">
      <div className="faq-panel-head">
        <h2>Find Your Answer</h2>
        <p>Browse some of the questions people ask most often. Can&apos;t find what you&apos;re looking for? Search above or send us an inquiry below.</p>
      </div>
      <div className="faq-tabs" role="tablist">
        {faqTabs.map((name) => <button key={name} type="button" role="tab" aria-selected={tab === name} className={tab === name ? "is-active" : ""} onClick={() => { setTab(name); setOpen(0); }}>{name}</button>)}
      </div>
      <div className="faq-accordion">
        {visible.length === 0 && <p className="faq-empty">No questions match that search.</p>}
        {visible.map((item, index) => {
          const expanded = open === index;
          return <article key={item.q} className={expanded ? "is-open" : ""}>
            <button type="button" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
              <strong>{item.q}</strong>
              <i aria-hidden="true" />
            </button>
            {expanded && <p>{item.a}</p>}
          </article>;
        })}
      </div>
    </section>

    <section className="fig-resources">
      <div className="fig-band-head">
        <div>
          <h2>Keep Growing Through the Week.</h2>
          <p>Resources to help you remain engaged with God&apos;s Word throughout the week.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/resources">See All Resources</Link>
      </div>
      <div className="fig-resource-row">
        <article>
          <p>Ongoing devotional · Substack</p>
          <h3>The Zoe Devotional</h3>
          <span>Scripture, reflection, and Christ-centered encouragement for the life you are living now.</span>
          <a className="fig-btn fig-btn-lime" href="https://substack.com/" target="_blank" rel="noreferrer">Read The Devotional</a>
        </article>
        <article className="fig-bible" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.8), rgba(0,0,0,.8)), url("/figma/bible-plan.png")' }}>
          <p>Bible plan</p>
          <h3>Who Is Jesus</h3>
          <span>Meet Jesus in Scripture and discover the life found in Him. Take time to slow down, reflect on His Word.</span>
          <a className="fig-btn fig-btn-solid" href="https://www.bible.com/" target="_blank" rel="noreferrer">Open In The Bible App</a>
        </article>
      </div>
    </section>

    <section id="general-inquiry" className="faq-inquiry">
      <h2>Still Have a Question?</h2>
      <p>That&apos;s okay. If you couldn&apos;t find what you were looking for, send us your question and we&apos;ll help get you to the right place.</p>
      {sent ? <p className="faq-sent">Your message has been sent. We will help you get to the right place.</p> : (
        <form className="faq-form" onSubmit={sendInquiry}>
          <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div>
            <label>Full Name<input name="name" required placeholder="Enter full name" autoComplete="name" /></label>
            <label>Email<input name="email" type="email" required placeholder="Enter full name" autoComplete="email" /></label>
          </div>
          <label>What can we help you with?
            <select name="topic" required defaultValue="">
              <option value="" disabled>Select below</option>
              {faqTabs.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label>Your Message<textarea name="message" required placeholder="Your message" rows={4} /></label>
          <label className="faq-check"><input name="atlantaEmails" type="checkbox" /> Also include me in Zoe Atlanta emails.</label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send Message"}</button>
        </form>
      )}
    </section>
  </>;
}

function nextSundayLabel() {
  const date = new Date();
  const days = (7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + days);
  const day = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  return `${day} • 9:00 AM (Your Local Time)`;
}

function OnlineGathering() {
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
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "online",
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") ?? "",
        }),
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
  return <section className="visit-far">
    <div className="visit-far-copy">
      <h2>Your nearest campus is a little farther away.</h2>
      <p>We couldn&apos;t find a Zoe campus within roughly three hours of the address you entered. You can still join us through our available online gathering.</p>
    </div>
    <article>
      <div className="visit-live">
        <span aria-hidden="true">▶</span>
        <div>
          <h3>Next Live Gathering</h3>
          <p>{nextSundayLabel()}</p>
        </div>
      </div>
      <hr />
      <div className="visit-remind-copy">
        <h3>Don&apos;t Miss The Next Gathering</h3>
        <p>Want a reminder? Leave your details below and we&apos;ll remind you before the next live gathering.</p>
      </div>
      {sent ? <p className="visit-sent">You&apos;re on the list. We&apos;ll remind you before the next gathering.</p> : (
        <form onSubmit={remind}>
          <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>Full Name<input name="name" required placeholder="Enter full name" autoComplete="name" /></label>
          <label>Email Address<input name="email" type="email" required placeholder="Enter email address" autoComplete="email" /></label>
          <label>Phone Number<input name="phone" type="tel" placeholder="Enter phone number" autoComplete="tel" /></label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Remind Me"}</button>
        </form>
      )}
      <hr />
      <div className="visit-online-row">
        <div>
          <h3>Join the Online Church</h3>
          <p>Connect with our global community, receive updates, and fellowship together.</p>
        </div>
        <span>Join the Online Church</span>
      </div>
    </article>
  </section>;
}

function VisitPage() {
  const atlanta = campuses.find((campus) => campus.slug === "atlanta") ?? campuses[0];
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<Campus | "online" | null>(null);
  const [modal, setModal] = useState<"children" | "visit" | "online" | null>(null);
  const search = (event: FormEvent) => {
    event.preventDefault();
    const query = address.toLowerCase();
    const match = campuses.find((campus) => campus.match.some((term) => query.includes(term)));
    setResult(match ?? "online");
  };
  return <>
    <section className="belief-hero visit-hero" style={{ backgroundImage: 'url("/figma/visit-hero.png")' }}>
      <div className="about-hero-copy">
        <h1>Find Your Campus</h1>
        <p>Enter your address and we&apos;ll help you find the closest Zoe campus within roughly a three-hour drive.</p>
      </div>
      <form id="visit-finder" className="visit-finder" onSubmit={search}>
        <span>Where are you coming from</span>
        <div>
          <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Enter your address here" aria-label="Where are you coming from" required />
          <button className="fig-btn fig-btn-lime" type="submit">Find My Campus</button>
        </div>
        <small>Your address is only used to help find the nearest campus.</small>
      </form>
    </section>

    {result === "online" && <OnlineGathering />}

    {result && result !== "online" && <section className="visit-found">
      <h2>We Found A Campus For You</h2>
      <article>
        <div>
          <span className="visit-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" fill="none" stroke="#152022" strokeWidth="1.6" /><circle cx="12" cy="10" r="2.2" fill="none" stroke="#152022" strokeWidth="1.6" /></svg>
          </span>
          <div>
            <p>Based on your location</p>
            <strong>We found a campus for you</strong>
            <em>{result.address.includes("Lagos") ? `${result.shortName}, Lagos` : result.city}</em>
          </div>
        </div>
        <div className="visit-found-actions">
          <Link className="fig-btn fig-btn-lime" href={`/visit/${result.slug}`}>Plan Your Visit</Link>
          <Link className="fig-btn fig-btn-outline" href="/sermons">Watch A Sermon</Link>
        </div>
      </article>
    </section>}

    {result === null && <section className="fig-band">
      <div className="fig-band-head">
        <div>
          <h2>One family, many cities</h2>
          <p>Six campuses across Nigeria and the United States. Find the gathering nearest you and reach out — a campus pastor will be glad to welcome you.</p>
        </div>
        <a className="fig-btn fig-btn-lime" href="#visit-finder">Find a Campus</a>
      </div>
      <div className="fig-campus-row three">
        {homeCampuses.slice(0, 3).map((campus) => <Link className="fig-campus-card" href={campus.href} key={campus.href}>
          <div className="fig-campus-photo" style={{ backgroundImage: `url(${campus.image})` }}>
            <div>
              <strong>{campus.name}</strong>
              <span>{campus.place}</span>
              {"pastor" in campus && campus.pastor ? <em>{campus.pastor}</em> : null}
            </div>
            <b>Explore</b>
          </div>
        </Link>)}
      </div>
      <div className="fig-campus-row four">
        {homeCampuses.slice(3).map((campus) => <Link className="fig-campus-card" href={campus.href} key={campus.href}>
          <div className="fig-campus-photo" style={{ backgroundImage: `url(${campus.image})` }}>
            <div>
              <strong>{campus.name}</strong>
              <span>{campus.place}</span>
            </div>
            <b>Explore</b>
          </div>
        </Link>)}
      </div>
    </section>}

    {result === null && <section className="visit-plan">
      <div>
        <h2>Planning Your Visit?</h2>
        <p>Everything you need for your first visit, all in one place.</p>
      </div>
      <div className="visit-plan-row">
        <article className="c1">
          <header><span>01</span><i /></header>
          <div>
            <h3>What to Expect</h3>
            <p>Experience engaging praise and worship, followed by a relevant, biblical message. Come as you are — there is a place for you.</p>
            <Link href="/about">Learn More</Link>
          </div>
        </article>
        <article className="c2">
          <header><span>02</span><i /></header>
          <div>
            <h3>Make Check-In Easier</h3>
            <p>Have children joining you? Register them ahead of time so their check-in is quicker and easier when you arrive.</p>
            <button type="button" onClick={() => setModal("children")}>Register your children</button>
          </div>
        </article>
        <article className="c3">
          <header><span>03</span><i /></header>
          <div>
            <h3>We&apos;d Love to Welcome You</h3>
            <p>If you&apos;re planning to join us, let us know. If there&apos;s anything you&apos;d like help with before Sunday, you can tell us here.</p>
            <button type="button" onClick={() => setModal("visit")}>Let us Know</button>
          </div>
        </article>
        <article className="c4">
          <header><span>04</span><i /></header>
          <div>
            <h3>Save the Date</h3>
            <p>Add the next Sunday Service to your personal calendar so you always know when and where to join us online or in person.</p>
            <CalendarButton campus={atlanta} />
          </div>
        </article>
      </div>
    </section>}

    <section className="fig-cta visit-listen">
      <h2>There&apos;s a Word for You</h2>
      <p>Listen to messages from across Zoe Household and find biblical teaching to encourage your faith, strengthen your walk, and point you back to Jesus.</p>
      <Link className="fig-btn fig-btn-solid" href="/sermons">Watch &amp; Listen</Link>
    </section>
    {modal && <Modal onClose={() => setModal(null)}><FormCard kind={modal} campus={modal === "online" ? undefined : atlanta} onClose={() => setModal(null)} /></Modal>}
  </>;
}

function CampusPage({ campus }: { campus: Campus }) {
  const [modal, setModal] = useState<"children" | "visit" | null>(null);
  const atlanta = campus.slug === "atlanta";
  const hasAddress = !campus.address.includes("released once available");
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.address)}`;
  const gatherings = atlanta
    ? [["Sunday Service", "Sunday, 10:00 AM"], ["Bible Study", "Wednesday, 6:30 PM"], ["Prayer Gathering", "Friday, 6:00 PM"]]
    : [
        [campus.services[0]?.name ?? "Sunday Service", campus.services[0]?.schedule ?? "Time will be released once available."],
        [campus.services[1]?.name ?? "Bible Study", campus.services[1]?.schedule ?? "Time will be released once available."],
        [campus.services[2]?.name ?? "Prayer Gathering", campus.services[2]?.schedule ?? "Time will be released once available."],
      ];
  const verse = atlanta ? "Let all that you do be done in love" : campus.verse;
  const verseRef = atlanta ? "1 Corinthians 16:14" : campus.verseRef;
  const image = atlanta ? "/figma/visit-atlanta-hero-225203.png" : campus.image;
  return <div className="campus-page" key={campus.slug}>
    <section className="belief-hero atlanta-hero" style={{ backgroundImage: `url("${image}")` }}>
      <div className="about-hero-copy">
        <span className="belief-pill">Zoe Household — {campus.shortName}</span>
        <h1>You&apos;re Welcome Here.</h1>
        <p>Join us at Zoe {campus.shortName} as we gather to worship Jesus, hear the Word, and grow together as a household of faith.</p>
      </div>
      <a className="fig-btn fig-btn-lime" href="#plan-visit">Plan your Visit</a>
    </section>

    <section className="atlanta-verse">
      <p>Verse of the month</p>
      <h2>{verse}</h2>
      <span>— {verseRef}</span>
      <small>A word to carry with us throughout the month.</small>
    </section>

    <section className="atlanta-join">
      <h2>Join Us at Zoe {campus.shortName}</h2>
      <p>We&apos;d love to have you worship with us. Find the service time and location that works for you.</p>
      <div>
        {gatherings.map(([name, time]) => <article key={name}>
          <h3>{name}</h3>
          <p>{time}</p>
          <p>{campus.name}</p>
          {hasAddress ? <a href={maps} target="_blank" rel="noreferrer">Get Directions</a> : <span>Directions will be shared once the location is set.</span>}
        </article>)}
      </div>
      <aside><strong>Note:</strong> Please check the location for each gathering before you arrive, as different services may meet in different places.</aside>
    </section>

    <section className="atlanta-arrows">
      <figure>
        <img src="/figma/arrows-atlanta.png" alt="Children at Zoe Arrows" />
        <figcaption>Zoe Arrows</figcaption>
      </figure>
      <div>
        <p>For Your Family</p>
        <h2>Your Children Are Welcome Too.</h2>
        <span>Zoe Arrows is our children&apos;s ministry, created to help your kids encounter Jesus and grow in their faith while you enjoy the main gathering.</span>
        <article>
          <h3>A Simple Check-In</h3>
          <p>Children are checked in after praise and worship, during the announcements, before the preaching begins.</p>
        </article>
        <button type="button" onClick={() => setModal("children")}>Register Your Children</button>
        <small>Registering ahead of time helps speed up check-in when you arrive.</small>
      </div>
    </section>

    <section id="plan-visit" className="visit-plan">
      <div>
        <h2>Planning Your Visit?</h2>
        <p>Everything you need for your first visit, all in one place.</p>
      </div>
      <div className="visit-plan-row">
        <article className="c1">
          <header><span>01</span><i /></header>
          <div>
            <h3>What to Expect</h3>
            <p>Experience engaging praise and worship, followed by a relevant, biblical message. Come as you are — there is a place for you.</p>
            <Link href="/about">Learn More</Link>
          </div>
        </article>
        <article className="c2">
          <header><span>02</span><i /></header>
          <div>
            <h3>Make Check-In Easier</h3>
            <p>Have children joining you? Register them ahead of time so their check-in is quicker and easier when you arrive.</p>
            <button type="button" onClick={() => setModal("children")}>Register your children</button>
          </div>
        </article>
        <article className="c3">
          <header><span>03</span><i /></header>
          <div>
            <h3>We&apos;d Love to Welcome You</h3>
            <p>If you&apos;re planning to join us, let us know. If there&apos;s anything you&apos;d like help with before Sunday, you can tell us here.</p>
            <button type="button" onClick={() => setModal("visit")}>Let us Know</button>
          </div>
        </article>
        <article className="c4">
          <header><span>04</span><i /></header>
          <div>
            <h3>Save the Date</h3>
            <p>Add the next Sunday Service to your personal calendar so you always know when and where to join us online or in person.</p>
            <CalendarButton campus={campus} />
          </div>
        </article>
      </div>
    </section>
    {modal && <Modal onClose={() => setModal(null)}><FormCard kind={modal} campus={campus} onClose={() => setModal(null)} /></Modal>}
  </div>;
}

const sermonLibrary = [
  { title: "Inferno 4 (Fasting & Prayer)", topic: "Prayer", series: "Fasting & Prayer", campus: "Atlanta", date: "Aug. 22, 2026", duration: "45:08" },
  ...sermons.map((sermon) => ({ ...sermon, date: "", duration: "" })),
];

function SermonsPage() {
  const [seed, setSeed] = useState("");
  const [seedKey, setSeedKey] = useState(0);

  const explore = (topic: string) => {
    setSeed(topic);
    setSeedKey((key) => key + 1);
    document.getElementById("sermon-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <>
    <section className="belief-hero sermon-hero" style={{ backgroundImage: 'url("/figma/asset-07-3382ac.png")' }}>
      <div className="about-hero-copy">
        <span className="belief-pill">Sermons</span>
        <h1>Messages That Help you Grow</h1>
        <p>Explore our on-demand sermon library and discover messages by topic, series, and even campuses.</p>
      </div>
      <div className="sermon-hero-actions">
        <a className="fig-btn fig-btn-lime" href="#sermon-library">Watch Latest</a>
        <a className="fig-btn fig-btn-outline" href="#sermon-library">Watch A Sermon</a>
      </div>
    </section>

    <TeachingLibrary seed={seed} seedKey={seedKey} />

    <section className="sermon-topics">
      <div className="sermon-topic-banner" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), url("/figma/asset-03-102235.png")' }}>
        <article>
          <h2>Find a<br />Message for<br />Where You Are</h2>
          <p>Explore our sermons library by topic, series or campus and find messages that encourage, challenge and help you grow</p>
          <button type="button" onClick={() => explore("")}>Explore all topics <i aria-hidden="true">→</i></button>
        </article>
      </div>
      <div className="sermon-topic-row">
        {[
          ["Faith", "Explore sermons to trusting God and building a foundation of faith.", "Explore Faith"],
          ["Grace", "Messages exploring the unending grace of Jesus and what it means for Believers", "Explore Grace"],
          ["Identity", "Discover the reality of who you are in Christ and brining that identity into life.", "Explore Identity"],
        ].map(([title, body, action]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
            <button type="button" onClick={() => explore(title)}>{action} <i aria-hidden="true">→</i></button>
          </article>
        ))}
      </div>
    </section>

    <section className="sermon-subscribe" style={{ backgroundImage: 'url("/figma/sermon-subscribe-41dc6b.png")' }}>
      <h2>Never Miss A New Message</h2>
      <p>Stay connected with every sermon, teaching, and ministry update. Subscribe to Pastor Dolapo Lawal’s Youtube channel to be the first that receives new messages.</p>
      <a className="fig-btn fig-btn-solid" href={socialLinks.youtube} target="_blank" rel="noreferrer">Subscribe on YouTube</a>
    </section>
  </>;
}

const pneumaFaqs = [
  ["Where can I listen to Pneuma Worship?", "Pneuma Worship is on Spotify. Listen on Spotify opens the latest music from the ministry."],
  ["What has been released?", "The catalog includes FOR BY GRACE (2026), the singles Inhabit, Responsible Father, Gathering Of Believers, Amen Hallelujah, and Abba’s Beloved, and the 2024 album Pneuma (Live)."],
  ["Who is Pneuma Worship?", "Pneuma Worship is the worship ministry of Zoe Household, creating music that helps us encounter God and carry worship beyond our gatherings."],
  ["Can I experience this at a gathering?", "Yes. Worship is part of the gathering at every Zoe campus. Find the campus closest to you and come as you are."],
  ["How do I hear new music?", "Follow Pneuma Worship on Spotify to hear new releases as they come out."],
];

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
  const [open, setOpen] = useState(0);
  const releasesRef = useRef<HTMLDivElement>(null);
  const moveReleases = (direction: number) => {
    const node = releasesRef.current;
    const card = node?.querySelector("article");
    if (!node || !card) return;
    node.scrollBy({ left: direction * (card.clientWidth + 24), behavior: "smooth" });
  };
  return <>
    <section className="belief-hero pneuma-hero">
      <video className="pneuma-hero-video" autoPlay muted loop playsInline poster="/figma/pneuma-hero-1c7cfc.png">
        <source src="/pneuma/pneuma-hero.mp4" type="video/mp4" />
      </video>
      <img className="pneuma-hero-logo" src="/pneuma/pneuma-logo.png" alt="Pneuma Worship Collective" />
      <div className="about-hero-copy">
        <span className="pneuma-pill">Worship Ministry</span>
        <h1>Pneuma Worship</h1>
        <p>Discover the music of pneuma worship and experience worship beyond the gathering</p>
      </div>
      <div className="sermon-hero-actions">
        <a className="fig-btn fig-btn-lime" href={socialLinks.spotify} target="_blank" rel="noreferrer">Listen on Spotify</a>
        <a className="fig-btn fig-btn-outline" href="#releases">Explore our music</a>
      </div>
    </section>

    <div className="pneuma-hang" aria-label="Listen">
      <iframe
        title="Pneuma Live on Apple Music"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        height={450}
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
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="https://embed.music.apple.com/au/song/psalm-100-overflow/1767155662"
        />
      </div>
    </div>

    <section className="pneuma-listen">
      <img src="/figma/pneuma-photo-1.png" alt="" />
      <img src="/figma/pneuma-photo-2.png" alt="" />
      <img src="/figma/pneuma-photo-3.png" alt="" />
      <div>
        <a className="fig-btn fig-btn-lime" href={socialLinks.spotify} target="_blank" rel="noreferrer">Listen on Spotify</a>
        <div>
          <h2>Listen To Pneuma Worship</h2>
          <p>Discover the music of Pneuma Worship and carry worship beyond the gathering.</p>
        </div>
      </div>
    </section>

    <section id="releases" className="pneuma-releases">
      <header>
        <div>
          <h2>Previously Released From Pneuma Worship</h2>
          <p>The songs themselves, from the latest album back through the live record.</p>
        </div>
        <div className="pneuma-release-nav">
          <button type="button" onClick={() => moveReleases(-1)} aria-label="Previous songs">←</button>
          <button type="button" onClick={() => moveReleases(1)} aria-label="Next songs">→</button>
        </div>
      </header>
      <div className="pneuma-track" ref={releasesRef}>
        {pneumaSongs.map((song) => (
          <article key={song.href} style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.12) 42%, rgba(0,0,0,.82)), url("${song.art}")` }}>
            <div>
              <h3>{song.title}</h3>
              <span>Pneuma Worship</span>
            </div>
            <footer>
              <em>{song.detail}</em>
              <a href={song.href} target="_blank" rel="noreferrer">Listen Now <i aria-hidden="true">→</i></a>
            </footer>
          </article>
        ))}
      </div>
    </section>

    <section className="sch-faq">
      <header>
        <h2>Pneuma Worship FAQ</h2>
        <p>Find answers to some of the questions people ask about Pneuma Worship.</p>
      </header>
      <div>
        {pneumaFaqs.map(([question, answer], index) => (
          <article className={open === index ? "is-open" : ""} key={question}>
            <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
              {question}
              <i aria-hidden="true">{open === index ? "–" : "+"}</i>
            </button>
            {open === index ? <p>{answer}</p> : null}
          </article>
        ))}
      </div>
    </section>

    <section className="sch-apply">
      <div>
        <h2>Take The Sound Of Worship With You</h2>
        <p>Discover Pneuma Worship’s music and take the sound of worship everywhere you go</p>
      </div>
      <a className="fig-btn pneuma-listen-now" href={socialLinks.spotify} target="_blank" rel="noreferrer">Listen Now</a>
    </section>
  </>;
}

const momentPhotos = ["asset-15.png", "asset-16.png", "asset-17.png", "asset-18.png", "pneuma-hero-1c7cfc.png", "about-hero.png", "asset-19.png", "asset-20.png", "arrows-atlanta.png", "asset-21.png", "asset-22.png", "asset-23-615969.png", "asset-14-41c41a.png", "visit-hero.png"];

function EventsPage() {
  const [more, setMore] = useState(false);
  const [volunteer, setVolunteer] = useState(false);
  const photos = more ? momentPhotos : momentPhotos.slice(0, 9);
  return <>
    <section className="sch-hero events-hero">
      <div>
        <span>Zoe Events</span>
        <h1>Gather With Purpose</h1>
        <p>From major gatherings to teaching moments across our campuses, Zoe events gives us opportunities to come together, grow in Christ, and share life as one household.</p>
      </div>
      <a className="fig-btn fig-btn-lime" href="#gather">Explore Gatherings <i aria-hidden="true">→</i></a>
    </section>

    <section id="gather" className="events-ways">
      <header>
        <h2>There’s Always a Place to Gather</h2>
        <p>From large gatherings to travelling teaching moments, there are different ways to come together, worship, learn, and spend time with the Zoe Household.</p>
      </header>
      <div>
        {[
          ["/figma/visit-atlanta-hero-225203.png", "Gather in Worship", "Come together with the wider Zoe family to worship Jesus, hear the Word, and share in what God is doing."],
          ["/figma/asset-13-724bec.png", "Grow Together", "Our gatherings give us time to slow down, learn from the Word, and grow alongside other people."],
          ["/figma/beliefs-hero.png", "Meet Us in Different Cities", "Zoe gatherings happen across different places throughout the year, bringing the household together wherever we are."],
          ["/figma/asset-14-41c41a.png", "Make Room for Community", "Some gatherings are big, some are smaller, but each one gives us a chance to meet, connect, and do life together."],
        ].map(([image, title, body]) => (
          <article key={title} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.15)), url("${image}")` }}>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="events-now">
      <div>
        <span>Happening now</span>
        <h2>Don’t Miss Our Event Currently Happening</h2>
        <p>Registration is currently open for Ignite 2026. Join us for this year’s gathering and be part of what God is doing across the Zoe Household.</p>
      </div>
      <article>
        <small>Global Event</small>
        <h3>Ignite 2026</h3>
        <p><em>Oct 12–15</em><em>Atlanta, GA</em></p>
        <span>A global gathering done annually at Zoe Household. Join us for 4 days of intense teaching, worship, and fellowship.</span>
        <div>
          <Link href="/events/ignite">Register <i aria-hidden="true">→</i></Link>
          <button type="button" onClick={() => setVolunteer(true)}>Volunteer <i aria-hidden="true">→</i></button>
        </div>
      </article>
    </section>

    <section className="events-global">
      <header>
        <h2>Our Global Gatherings</h2>
        <p>Throughout the year, we gather in different ways and at different places. We’d be glad to have you.</p>
      </header>
      <div>
        {[false, true, true].map((light, index) => (
          <article className={light ? "is-light" : ""} key={index}>
            <p><strong>09 – 14</strong><span>June</span></p>
            <h3>Ignite</h3>
            <span>A time to gather, encounter God, build meaningful connections, and be stirred to live out the life of Christ.</span>
            <em>12658 Goar Rd, Houston, TX 77077</em>
            <div>
              <Link href="/events/ignite">Register</Link>
              <button type="button" onClick={() => setVolunteer(true)}>Volunteer</button>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="events-moments">
      <div className={more ? "is-open" : ""}>
        {photos.map((file, index) => <img key={file} src={`/figma/${file}`} alt="" style={{ marginTop: index % 2 === 0 ? 48 : 0 }} />)}
      </div>
      <header>
        <h2>There’s more to experience</h2>
        <p>From worship nights to gatherings across our campuses, these moments remind us what happens when we come together. Take a look back at some of the moments we’ve shared.</p>
        <button type="button" onClick={() => setMore((open) => !open)}>{more ? "Show fewer moments" : "See more moments"} <i aria-hidden="true">→</i></button>
      </header>
    </section>

    {volunteer ? <Modal onClose={() => setVolunteer(false)}><FormCard kind="inquiry" onClose={() => setVolunteer(false)} /></Modal> : null}
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
    <PageHero eyebrow={event.eyebrow} title={event.title} body={event.intro} image="/figma/asset-14-41c41a.png" />
    <section className="section event-detail">
      <div><p className="eyebrow">About the Gathering</p><h2>A moment for the whole household.</h2></div>
      <div><p>{event.body}</p><div className="release-note"><strong>Next gathering</strong><span>Dates, location, and registration details will be released once available.</span></div></div>
    </section>
    <section className="cta-band"><h2>Stay connected for the next release.</h2><Link className="button button-primary" href="/visit">Find Your Campus</Link></section>
  </>;
}

function ResourcesPage() {
  return <>
    <section className="belief-hero resources-hero" style={{ backgroundImage: 'url("/figma/visit-hero.png")' }}>
      <div className="about-hero-copy">
        <span className="belief-pill">Resources</span>
        <h1>Resources for Your Walk</h1>
        <p>Explore resources from Zoe Household to help you stay rooted in Scripture, grow in your faith, and keep following Jesus throughout the week.</p>
      </div>
      <a className="fig-btn fig-btn-lime" href="#grow">Explore Resources</a>
    </section>

    <section id="grow" className="fig-resources resources-grow">
      <div className="fig-band-head">
        <div>
          <h2>Keep Growing Through the Week.</h2>
          <p>Resources to help you remain engaged with God&apos;s Word throughout the week.</p>
        </div>
        <a className="fig-btn fig-btn-lime" href="#grow">See All Resources</a>
      </div>
      <div className="fig-resource-row">
        <article>
          <p>Ongoing devotional · Substack</p>
          <h3>The Zoe Devotional</h3>
          <span>Scripture, reflection, and Christ-centered encouragement for the life you are living now.</span>
          <a className="fig-btn fig-btn-lime" href="https://substack.com/" target="_blank" rel="noreferrer">Read The Devotional</a>
        </article>
        <article className="fig-bible" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.8), rgba(0,0,0,.8)), url("/figma/bible-plan.png")' }}>
          <p>Bible plan</p>
          <h3>Who Is Jesus</h3>
          <span>Meet Jesus in Scripture and discover the life found in Him. Take time to slow down, reflect on His Word.</span>
          <a className="fig-btn fig-btn-solid" href="https://www.bible.com/" target="_blank" rel="noreferrer">Open In The Bible App</a>
        </article>
      </div>
    </section>

    <section id="zoe-scholarship" className="resources-scholarship">
      <h2>Zoe Scholarship</h2>
      <div>
        <article>
          <div>
            <h3>Investing in the Next Generation</h3>
            <p>The Zoe Scholarship supports eligible students pursuing their academic goals. Find out more about the scholarship, who is eligible, what you&apos;ll need, and how to apply.</p>
          </div>
          <Link className="fig-btn fig-btn-lime" href="/resources/scholarship">Find Out More</Link>
        </article>
        <figure>
          <img src="/figma/scholarship-library.png" alt="Students in a library" />
          <figcaption>Our Work.<br />Their Words.</figcaption>
        </figure>
      </div>
    </section>

    <section className="fig-cta visit-listen">
      <h2>There&apos;s a Word for You</h2>
      <p>Listen to messages from across Zoe Household and find biblical teaching to encourage your faith, strengthen your walk, and point you back to Jesus.</p>
      <Link className="fig-btn fig-btn-solid" href="/sermons">Watch &amp; Listen</Link>
    </section>
  </>;
}

const scholarshipFaqs = [
  ["Who is eligible to apply?", "Applicants who meet the Zoe Scholarship’s academic and financial requirements are eligible to apply. Please review the eligibility requirements above to see if you qualify."],
  ["What documents do I need?", "Academic transcripts, valid identification, proof of income, and a personal statement."],
  ["Can I apply while waiting for my results?", "Review the academic requirements above, including enrollment confirmation and active status in your program. Applications are open from August 1, 2026 through October 15, 2026."],
  ["When will I know if I have been selected?", "Applications are reviewed in November 2026. Notifications go out on December 10, 2026."],
  ["How will I be notified?", "Selected applicants are notified on December 10, 2026."],
];

function ScholarshipPage() {
  const [open, setOpen] = useState(0);
  const [apply, setApply] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sendApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
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
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "inquiry",
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          topic: "Zoe Scholarship",
          message: data.get("message"),
          region: "",
          consent: true,
        }),
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

  return <>
    <section className="sch-hero">
      <div>
        <span>Resources</span>
        <h1>Supporting the Next Step</h1>
        <p>The Zoe Scholarship is designed to support eligible students as they pursue their education. Learn about the requirements, prepare your application, and take the next step.</p>
      </div>
      <button className="fig-btn fig-btn-lime" type="button" onClick={() => setApply(true)}>Apply Now <i aria-hidden="true">→</i></button>
    </section>

    <section className="sch-intro">
      <h2>A Little Support Can Go a Long Way</h2>
      <p>Education takes commitment, preparation, and resources. The Zoe Scholarship provides support for eligible students who meet the required academic and financial criteria.<br /><br />Explore the requirements below to see if you qualify and learn what you&apos;ll need before beginning your application.</p>
    </section>

    <section className="sch-qualify">
      <header>
        <h2>Do You Qualify?</h2>
        <p>Before applying, take a moment to review the requirements for the Zoe Scholarship.</p>
      </header>
      <div>
        {[
          ["Academic", "01", "Academic Requirements", "Required academic criteria including minimum GPA benchmarks, enrollment confirmation, and active status in your program of choice."],
          ["Financial", "02", "Financial Requirements", "Required financial criteria to ensure support is delivered where it is needed most, including household income thresholds."],
          ["Community", "03", "Additional Requirements", "Additional eligibility aspects such as community involvement, character references, and personal alignment with the household values."],
        ].map(([label, number, title, body]) => (
          <article key={number}>
            <p><span>{label}</span><span>{number}</span></p>
            <h3>{title}</h3>
            <span>{body}</span>
          </article>
        ))}
      </div>
    </section>

    <section className="sch-banner" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), url("/figma/asset-03-102235.png")' }}>
      <div className="sch-ready">
        <div>
          <h2>Get Your Application Ready</h2>
          <p>Having your information ready before you begin can make the application process easier and ensure faster review cycles.</p>
          <p className="sch-note">Have these documents and details ready before starting your application.</p>
        </div>
        <div className="sch-docs">
          <h3>You may need:</h3>
          <ul>
            {["Academic Transcripts", "Valid Identification", "Proof of Income", "Personal Statement"].map((item) => <li key={item}>{item}</li>)}
          </ul>
          <button type="button" onClick={() => setApply(true)}>Start your Application <i aria-hidden="true">→</i></button>
        </div>
      </div>
    </section>

    <section className="sch-dates">
      <header>
        <h2>Know the Important Dates</h2>
        <p>Keep track of the key dates for the current scholarship cycle so you know when to apply and when to expect an update.</p>
      </header>
      <ol>
        {[
          ["Applications Open", "August 1, 2026"],
          ["Application Deadline", "October 15, 2026"],
          ["Application Review", "November 2026"],
          ["Notifications", "December 10, 2026"],
        ].map(([title, date]) => (
          <li key={title}><span aria-hidden="true" /><strong>{title}</strong><em>{date}</em></li>
        ))}
      </ol>
    </section>

    <section className="sch-faq">
      <header>
        <h2>Questions About the Scholarship?</h2>
        <p>Find answers to some of the questions applicants ask before applying.</p>
      </header>
      <div>
        {scholarshipFaqs.map(([question, answer], index) => (
          <article className={open === index ? "is-open" : ""} key={question}>
            <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
              {question}
              <i aria-hidden="true">{open === index ? "–" : "+"}</i>
            </button>
            {open === index ? <p>{answer}</p> : null}
          </article>
        ))}
      </div>
    </section>

    <section className="sch-apply">
      <div>
        <h2>Ready to Apply?</h2>
        <p>If you meet the requirements and have your information ready, take the next step and submit your application.</p>
      </div>
      <button className="fig-btn fig-btn-solid" type="button" onClick={() => setApply(true)}>Apply Now <i aria-hidden="true">→</i></button>
    </section>

    {apply ? <Modal onClose={() => { setApply(false); setSent(false); setError(null); }}>
      <form className="faq-form" onSubmit={sendApplication}>
        <h2>Start your Application</h2>
        {sent ? <p>Your application has been received. We&apos;ll be in touch about the next step.</p> : <>
          <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div>
            <label>Name<input name="name" required autoComplete="name" /></label>
            <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          </div>
          <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
          <label>Tell us about your application<textarea name="message" required placeholder="Your program, campus, and anything we should know." /></label>
          <label className="sch-consent"><input name="consent" type="checkbox" required /> I agree to be contacted about this scholarship application.</label>
          {error ? <p role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Submit application"}</button>
        </>}
      </form>
    </Modal> : null}
  </>;
}

function PrayerPage() {
  const [open, setOpen] = useState(false);
  return <>
    <section className="belief-hero prayer-hero" style={{ backgroundImage: 'url("/figma/prayer-hero-793934.png")' }}>
      <div className="about-hero-copy">
        <h1>There&apos;s a Place for Your Prayer.</h1>
        <p>Prayer is part of how we draw near to God, seek His heart, and stand with one another. At Zoe, we believe we don&apos;t have to carry life alone.</p>
      </div>
      <button className="fig-btn fig-btn-lime" type="button" onClick={() => setOpen(true)}>Share your prayer request</button>
    </section>

    <section className="pneuma-meet prayer-believe">
      <img src="/figma/pneuma-hero-1c7cfc.png" alt="People gathered in prayer" />
      <div>
        <h2>We Pray Because We Believe God Hears Us.</h2>
        <p>Prayer is more than bringing our needs to God. It is a place of fellowship with Him—a way to seek His direction, surrender what we carry, and stand together in faith.</p>
        <p>At Zoe, prayer is part of our life together as a household.</p>
      </div>
    </section>

    <section className="prayer-teach">
      <div className="sermon-library-head">
        <div>
          <h2>Learn to Pray. Learn to Wait.</h2>
          <p>Explore teachings that can help you deepen your prayer life, understand fasting, and grow in your relationship with God.</p>
        </div>
        <Link className="fig-btn fig-btn-lime" href="/sermons">Explore Teachings <i aria-hidden="true">→</i></Link>
      </div>
      <div className="sermon-grid">
        {sermonLibrary.slice(0, 3).map((sermon) => (
          <a className="sermon-card" href={socialLinks.youtube} target="_blank" rel="noreferrer" key={sermon.title}>
            <span className="sermon-thumb" style={{ backgroundImage: 'url("/figma/sermon-thumb-66e69f.png")' }}><i aria-hidden="true" />{sermon.duration ? <em>{sermon.duration}</em> : null}</span>
            <span className="sermon-copy">
              <small>Latest sermons</small>
              <strong>{sermon.title}</strong>
              <span>Pastor Dolapo Lawal</span>
              <span className="sermon-meta"><em>{sermon.campus}</em><em>{sermon.date || sermon.series}</em></span>
            </span>
          </a>
        ))}
      </div>
    </section>

    <section className="prayer-with">
      <img src="/figma/asset-23-615969.png" alt="" />
      <div>
        <h2>Let Us Pray With You.</h2>
        <p>Whatever you&apos;re carrying, you don&apos;t have to carry it alone. Share your prayer request with us and our prayer team will stand with you in prayer.</p>
        <button className="fig-btn fig-btn-lime" type="button" onClick={() => setOpen(true)}>Share your prayer request</button>
      </div>
    </section>

    {open ? <Modal onClose={() => setOpen(false)}><FormCard kind="prayer" onClose={() => setOpen(false)} /></Modal> : null}
  </>;
}

const tithelyUrl = "https://give.tithe.ly/?formId=38e44ec6-bbde-428c-b073-df0309a7e479&context=modal";
const giveOrder = ["ikeja", "london", "yaba", "ipaja", "abeokuta", "atlanta", "houston"];

function giveLabel(slug: string) {
  if (slug === "london") return "United Kingdom";
  return campuses.find((campus) => campus.slug === slug)?.shortName ?? slug;
}

function GiveHero() {
  return <section className="belief-hero give-hero" style={{ backgroundImage: 'url("/figma/about-hero.png")' }}>
    <div className="about-hero-copy">
      <span className="pneuma-pill">Thank You!</span>
      <h1>Give Where It Matters</h1>
      <p>Your generosity helps make the work of Zoe Household possible. Give towards the life of your local campus or support the wider work we’re doing together</p>
    </div>
    <img className="belief-scroll" src="/figma/scroll-down.svg" alt="" />
  </section>;
}

function GiveScripture() {
  return <section className="give-verse">
    <h2>Your Generosity Builds Lasting Change</h2>
    <p>Every gift is a part of what we’re building together. Thank you for helping make room for the work God is doing through Zoe Household.</p>
  </section>;
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
    <GiveHero />
    {path === "/give" ? <section className="give-choice">
      <header>
        <h2>Where Would You Like To Give</h2>
        <p>Choose a giving option below. If you’re connected to a Zoe Campus, we’ve highlighted the campus closest to you.</p>
      </header>
      <div>
        <article>
          <div>
            <span>Local</span>
            <h3>My Zoe Campus</h3>
            <p>Give to the Zoe Campus closest to you and support the work happening in your local church community</p>
          </div>
          <div className="give-near">We think you’re near Zoe Ikeja</div>
          <Link href="/give/campus">Choose My Campus <i aria-hidden="true">→</i></Link>
        </article>
        <article>
          <div>
            <span>Global</span>
            <h3>Zoe Global</h3>
            <p>Support the wider work of Zoe Household across campuses, communities, and places beyond your local church</p>
          </div>
          <Link href="/give/global">Give Globally <i aria-hidden="true">→</i></Link>
        </article>
      </div>
    </section> : null}

    {path === "/give/campus" ? <section className="give-panel">
      <Link className="give-back" href="/give">← Back</Link>
      <div>
        <h2>Choose Your Campus</h2>
        <p>Select the campus you’d like your giving to support</p>
        <label>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campuses" aria-label="Search campuses" />
        </label>
        <div role="radiogroup" aria-label="Campus">
          {listed.map((campus) => (
            <button className={selected === campus.slug ? "is-selected" : ""} type="button" role="radio" aria-checked={selected === campus.slug} key={campus.slug} onClick={() => setSelected(campus.slug)}>
              <strong>{giveLabel(campus.slug)}{campus.slug === "ikeja" ? <em>Suggested</em> : null}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        {listed.length === 0 ? <p>No campus matches that search.</p> : null}
        <Link href={`/give/${selected}`}>Continue <i aria-hidden="true">→</i></Link>
      </div>
    </section> : null}

    {path !== "/give" && path !== "/give/campus" ? <section className="give-panel">
      <Link className="give-back" href={slug === "global" ? "/give" : "/give/campus"}>← Back</Link>
      <div className="give-details">
        <h2>{slug === "global" ? "Giving To Zoe Global" : `Giving To Zoe ${giveLabel(slug)}`}</h2>
        <p>You can support this campus through the details below</p>
        {slug === "ikeja" ? <>
          <dl>
            <div><dt>Account name</dt><dd>Zoe Household Ministries Ikeja</dd></div>
            <div><dt>Bank</dt><dd>Guaranty Trust Bank (GTB)</dd></div>
            <div><dt>Account number</dt><dd>0123456789</dd></div>
          </dl>
          <button type="button" onClick={copyDetails}>{copied ? "Copied" : "Copy Bank Details"}</button>
        </> : slug === "global" || slug === "atlanta" || slug === "houston" ? <a href={tithelyUrl} target="_blank" rel="noreferrer">Continue to Tithely <i aria-hidden="true">→</i></a> : <p className="give-pending">Bank details for this campus will be shared by the campus.</p>}
      </div>
    </section> : null}
    <GiveScripture />
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
  if (path === "/give" || path.startsWith("/give/")) return <GivePage path={path} />;
  return <NotFoundPage />;
}
