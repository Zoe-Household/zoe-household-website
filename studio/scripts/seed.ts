/**
 * Seeds Sanity with the current campuses and global events so the live site is
 * driven by the backend. Idempotent: uses deterministic IDs + createOrReplace,
 * so re-running updates the same documents instead of creating duplicates.
 *
 * Run from the studio folder:
 *   npx sanity exec scripts/seed.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { campuses } from "../../data/site";

const client = getCliClient({ apiVersion: "2026-10-12" });
const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(here, "../../public");

const assetCache = new Map<string, string>();

async function uploadImage(publicPath: string): Promise<string | null> {
  if (assetCache.has(publicPath)) return assetCache.get(publicPath)!;
  try {
    const abs = resolve(PUBLIC, `.${publicPath}`);
    const filename = publicPath.split("/").pop() || "image.jpg";
    const asset = await client.assets.upload("image", createReadStream(abs), { filename });
    assetCache.set(publicPath, asset._id);
    return asset._id;
  } catch (err) {
    console.warn(`! Could not upload ${publicPath}: ${(err as Error).message}`);
    return null;
  }
}

function imageField(assetId: string | null, extra: Record<string, unknown> = {}) {
  if (!assetId) return undefined;
  return { _type: "image", asset: { _type: "reference", _ref: assetId }, ...extra };
}

function keyed<T extends object>(items: T[]) {
  return items.map((item, index) => ({ _key: `k${index}`, ...item }));
}

const SHARED_MOMENT = "/figma/about-hero.jpg";

type GlobalEvent = {
  slug: string;
  title: string;
  kind: string;
  status: "upcoming" | "live" | "past";
  featured: boolean;
  dateLabel: string;
  location: string;
  image: string;
  summary: string;
  intro: string;
  body: string;
  registerUrl?: string;
  order: number;
};

const events: GlobalEvent[] = [
  {
    slug: "ignite",
    title: "Ignite 2026",
    kind: "Global Gathering",
    status: "live",
    featured: true,
    dateLabel: "Oct 12 – 15, 2026",
    location: "Atlanta, GA",
    image: "/figma/asset-08.jpg",
    summary: "A global gathering held every year at Zoe Household. Four days of intense teaching, worship, and fellowship.",
    intro: "A defining gathering for worship, the Word, prayer, and fresh fire.",
    body: "Ignite brings the global household together to behold Jesus, receive the Word, and return to our cities strengthened for the life and work God has entrusted to us.",
    order: 10,
  },
  {
    slug: "camp-meeting",
    title: "Camp Meeting",
    kind: "Retreat",
    status: "upcoming",
    featured: false,
    dateLabel: "Dates to be announced",
    location: "Location to be announced",
    image: "/figma/asset-13-724bec.jpg",
    summary: "Unhurried days of formation, fellowship, and encounter — time to sit deeply with Scripture and pray together.",
    intro: "Unhurried days of formation, fellowship, and encounter.",
    body: "Camp Meeting creates room for the household to withdraw from the ordinary rhythm, sit deeply with Scripture, pray together, and build lasting relationships across campuses.",
    order: 20,
  },
  {
    slug: "still-waters",
    title: "Still Waters",
    kind: "Conference",
    status: "upcoming",
    featured: false,
    dateLabel: "Dates to be announced",
    location: "Location to be announced",
    image: "/figma/prayer-hero-793934.jpg",
    summary: "A restorative gathering for quiet, clarity, and the presence of God. Rest and renewal found in Christ.",
    intro: "A restorative gathering for quiet, clarity, and the presence of God.",
    body: "Still Waters is an invitation to slow down, attend to the soul, and receive the rest and renewal found in Christ.",
    order: 30,
  },
];

async function seedCampuses() {
  for (const [index, campus] of campuses.entries()) {
    const hero = await uploadImage(campus.image);
    const portrait = await uploadImage(campus.portrait);
    const shared = await uploadImage(SHARED_MOMENT);
    const gallery = [hero, portrait, shared]
      .filter((id): id is string => Boolean(id))
      .map((id, i) => imageField(id, { _key: `g${i}`, alt: `Zoe ${campus.shortName}` }));

    const hasAddress = !campus.address.includes("released once available");

    const doc = {
      _id: `campus-${campus.slug}`,
      _type: "campus",
      name: campus.name,
      shortName: campus.shortName,
      slug: { _type: "slug", current: campus.slug },
      place: campus.place,
      pastor: campus.pastor,
      phone: campus.phone,
      address: hasAddress ? campus.address : undefined,
      lat: campus.lat,
      lng: campus.lng,
      verse: campus.verse,
      verseRef: campus.verseRef,
      whatToExpect:
        `You can expect a warm welcome, worship, prayer, and clear teaching from Scripture at Zoe ${campus.shortName}. ` +
        `Come as you are — someone from the team will be glad to help you find your way and settle in.`,
      languages: "English",
      services: keyed(
        campus.services.map((service) => ({
          _type: "object",
          name: service.name,
          schedule: service.schedule,
          address: service.address,
        })),
      ),
      heroImage: imageField(hero),
      gallery,
      order: (index + 1) * 10,
    };

    await client.createOrReplace(doc);
    console.log(`✓ campus-${campus.slug}`);
  }
}

async function seedEvents() {
  for (const event of events) {
    const image = await uploadImage(event.image);
    const doc = {
      _id: `event-${event.slug}`,
      _type: "event",
      title: event.title,
      slug: { _type: "slug", current: event.slug },
      kind: event.kind,
      status: event.status,
      featured: event.featured,
      dateLabel: event.dateLabel,
      location: event.location,
      image: imageField(image),
      summary: event.summary,
      intro: event.intro,
      body: keyed([
        {
          _type: "block",
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", text: event.body, marks: [] }],
        },
      ]),
      registerUrl: event.registerUrl,
      order: event.order,
    };
    await client.createOrReplace(doc);
    console.log(`✓ event-${event.slug}`);
  }
}

async function run() {
  console.log("Seeding campuses…");
  await seedCampuses();
  console.log("Seeding events…");
  await seedEvents();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
