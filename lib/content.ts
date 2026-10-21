import "server-only";
import { geocode } from "@/lib/geocode";
import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { CAMPUSES_QUERY, EVENTS_QUERY } from "@/sanity/lib/queries";
import { EMPTY_CONTENT, type CampusContent, type EventItem, type SiteContent } from "@/lib/site-content";

type SanityImage = Parameters<typeof urlForImage>[0];

type EventDoc = {
  slug?: string;
  title?: string;
  kind?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  dateLabel?: string;
  location?: string;
  geo?: { lat?: number; lng?: number } | null;
  campusSlug?: string | null;
  image?: SanityImage;
  summary?: string;
  intro?: string;
  body?: PortableBlock[];
  registerUrl?: string;
};

type CampusDoc = {
  slug?: string;
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
  services?: { name?: string; schedule?: string; address?: string }[];
  heroImage?: SanityImage;
  gallery?: (SanityImage & { alt?: string })[];
};

type PortableBlock = { _type?: string; children?: { text?: string }[] };

function blocksToText(blocks?: PortableBlock[]): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .filter((block) => block._type === "block")
    .map((block) => (block.children ?? []).map((span) => span.text ?? "").join(""))
    .filter(Boolean)
    .join("\n\n");
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "";
  if (!end) return startDate.toLocaleDateString("en-US", opts);
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return startDate.toLocaleDateString("en-US", opts);
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  if (sameMonth) {
    const month = startDate.toLocaleDateString("en-US", { month: "short" });
    return `${month} ${startDate.getDate()} – ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }
  return `${startDate.toLocaleDateString("en-US", opts)} – ${endDate.toLocaleDateString("en-US", opts)}`;
}

const UNPLACED = /announced|\btba\b|\btbd\b|online|virtual/i;

// Events store a map pin when an editor sets one; otherwise the address in
// "Location" is geocoded (cached for a day) so every event can be placed.
async function eventPoint(doc: EventDoc) {
  if (doc.geo?.lat != null && doc.geo?.lng != null) return { lat: doc.geo.lat, lng: doc.geo.lng };
  if (!doc.location || UNPLACED.test(doc.location)) return null;
  return geocode(doc.location, { broaden: true });
}

const STATUSES = ["upcoming", "live", "past"] as const;

async function mapEvents(docs: EventDoc[]): Promise<EventItem[]> {
  const valid = docs.filter((doc): doc is EventDoc & { slug: string; title: string } => Boolean(doc.slug && doc.title));
  const points = await Promise.all(valid.map(eventPoint));
  return valid.map((doc, index) => ({
    slug: doc.slug,
    kind: doc.kind ?? "Event",
    title: doc.title,
    dateLabel: doc.dateLabel || formatDateRange(doc.startDate, doc.endDate) || "Dates to be announced",
    location: doc.location || "Location to be announced",
    image: urlForImage(doc.image, 1200) ?? "/figma/asset-08.jpg",
    summary: doc.summary ?? "",
    live: doc.status === "live",
    intro: doc.intro || doc.summary || "",
    body: blocksToText(doc.body) || doc.summary || "",
    registerUrl: doc.registerUrl,
    campusSlug: doc.campusSlug ?? null,
    startDate: doc.startDate ?? null,
    endDate: doc.endDate ?? null,
    status: STATUSES.find((status) => status === doc.status) ?? null,
    lat: points[index]?.lat ?? null,
    lng: points[index]?.lng ?? null,
  }));
}

function mapCampuses(docs: CampusDoc[]): Record<string, CampusContent> {
  const out: Record<string, CampusContent> = {};
  for (const doc of docs) {
    if (!doc.slug) continue;
    const gallery = (doc.gallery ?? []).map((image) => urlForImage(image, 1200)).filter((url): url is string => Boolean(url));
    const services = (doc.services ?? [])
      .filter((service) => service.name)
      .map((service) => ({ name: service.name ?? "", schedule: service.schedule ?? "", address: service.address ?? "" }));
    out[doc.slug] = {
      heroImage: urlForImage(doc.heroImage, 1600),
      gallery: gallery.length ? gallery : undefined,
      pastor: doc.pastor || undefined,
      phone: doc.phone || undefined,
      email: doc.email || undefined,
      instagram: doc.instagram || undefined,
      place: doc.place || undefined,
      address: doc.address || undefined,
      verse: doc.verse || undefined,
      verseRef: doc.verseRef || undefined,
      whatToExpect: doc.whatToExpect || undefined,
      gettingThere: doc.gettingThere || undefined,
      parking: doc.parking || undefined,
      languages: doc.languages || undefined,
      services: services.length ? services : undefined,
    };
  }
  return out;
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSanityConfigured) return { ...EMPTY_CONTENT, generatedAt: Date.now() };
  try {
    const [eventDocs, campusDocs] = await Promise.all([
      client.fetch<EventDoc[]>(EVENTS_QUERY),
      client.fetch<CampusDoc[]>(CAMPUSES_QUERY),
    ]);
    const events = await mapEvents(eventDocs ?? []);
    const campus = mapCampuses(campusDocs ?? []);
    const moments = Object.values(campus).flatMap((item) => item.gallery ?? []);
    return {
      events: events.length ? events : null,
      moments: moments.length ? moments : null,
      campus,
      generatedAt: Date.now(),
    };
  } catch {
    return { ...EMPTY_CONTENT, generatedAt: Date.now() };
  }
}

export async function getEventSlugs(): Promise<string[]> {
  const content = await getSiteContent();
  return (content.events ?? []).map((event) => event.slug);
}
