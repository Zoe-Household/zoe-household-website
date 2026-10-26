// Shared content types and the built-in fallback content. This module is safe to
// import from client components; the actual Sanity fetching lives in lib/content.ts
// (server-only). When Sanity isn't configured, or returns nothing, the site renders
// from the fallbacks below so it always works.

export type EventItem = {
  slug: string;
  kind: string;
  title: string;
  dateLabel: string;
  location: string;
  image: string;
  summary: string;
  live: boolean;
  intro: string;
  body: string;
  registerUrl?: string;
  /** Slug of the campus this event belongs to, or null for a global event. */
  campusSlug?: string | null;
  /** ISO datetimes; when set, the site works out upcoming / live / past from them. */
  startDate?: string | null;
  endDate?: string | null;
  /** Editor-set status, only used for events without dates. */
  status?: "upcoming" | "live" | "past" | null;
  /** Event coordinates, used to put events near the visitor first. */
  lat?: number | null;
  lng?: number | null;
};

export type CampusActivity = {
  title: string;
  schedule: string;
  description?: string;
  link?: string;
};

export type CampusContent = {
  heroImage?: string;
  gallery?: string[];
  pastor?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  place?: string;
  address?: string;
  verse?: string;
  verseRef?: string;
  whatToExpect?: string;
  gettingThere?: string;
  parking?: string;
  languages?: string;
  services?: { name: string; schedule: string; address: string }[];
  whatsappChannelUrl?: string;
  membershipClassTitle?: string;
  membershipClassSchedule?: string;
  membershipClassUrl?: string;
  membershipClassFlyer?: string;
  newHereUrl?: string;
  activities?: CampusActivity[];
};

export type SiteContent = {
  events: EventItem[] | null;
  moments: string[] | null;
  campus: Record<string, CampusContent>;
  /** When the server rendered this content, so the first client render matches it. */
  generatedAt?: number;
};

export const EMPTY_CONTENT: SiteContent = { events: null, moments: null, campus: {} };

export const fallbackEvents: EventItem[] = [
  {
    slug: "ignite",
    kind: "Global Gathering",
    title: "Ignite 2026",
    dateLabel: "June 11 – 14, 2026",
    location: "Atlanta, GA",
    startDate: "2026-06-11T23:00:00.000Z",
    endDate: "2026-06-15T03:00:00.000Z",
    lat: 33.749,
    lng: -84.388,
    image: "/figma/asset-08.jpg",
    summary: "A global gathering held every year at Zoe Household. Four days of intense teaching, worship, and fellowship.",
    live: false,
    intro: "A defining gathering for worship, the Word, prayer, and fresh fire.",
    body: "Ignite brings the global household together to behold Jesus, receive the Word, and return to our cities strengthened for the life and work God has entrusted to us.",
  },
  {
    slug: "camp-meeting",
    kind: "Retreat",
    title: "Camp Meeting",
    dateLabel: "November 13 – 15, 2026",
    location: "Ikeja, Lagos, Nigeria",
    startDate: "2026-11-13T13:00:00.000Z",
    endDate: "2026-11-16T00:30:00.000Z",
    lat: 6.6018,
    lng: 3.3515,
    image: "/figma/asset-13-724bec.jpg",
    summary: "Unhurried days of formation, fellowship, and encounter — time to sit deeply with Scripture and pray together.",
    live: false,
    intro: "Unhurried days of formation, fellowship, and encounter.",
    body: "Camp Meeting creates room for the household to withdraw from the ordinary rhythm, sit deeply with Scripture, pray together, and build lasting relationships across campuses.",
  },
  {
    slug: "still-waters",
    kind: "Conference",
    title: "Still Waters",
    dateLabel: "Dates to be announced",
    location: "Location to be announced",
    image: "/figma/prayer-hero-793934.jpg",
    summary: "A restorative gathering for quiet, clarity, and the presence of God. Rest and renewal found in Christ.",
    live: false,
    intro: "A restorative gathering for quiet, clarity, and the presence of God.",
    body: "Still Waters is an invitation to slow down, attend to the soul, and receive the rest and renewal found in Christ.",
  },
];

export const fallbackMoments = [
  "asset-15.jpg", "asset-16.jpg", "asset-17.jpg", "asset-18.jpg", "pneuma-hero-1c7cfc.jpg",
  "about-hero.jpg", "asset-19.jpg", "asset-20.jpg", "arrows-atlanta.jpg", "asset-21.jpg",
  "asset-22.jpg", "asset-23-615969.jpg", "asset-14-41c41a.jpg", "visit-hero.jpg", "asset-08.jpg",
].map((file) => `/figma/${file}`);
