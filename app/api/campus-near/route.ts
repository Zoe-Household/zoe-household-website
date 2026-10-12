import { NextRequest, NextResponse } from "next/server";
import { campusByName, nearestCampus, type Point } from "@/lib/nearest-campus";

export const runtime = "nodejs";

const geocodeCache = new Map<string, Point>();

function pointFromQuery(lat: string | null, lng: string | null): Point | null {
  if (lat == null || lng == null || lat === "" || lng === "") return null;
  const point = { lat: Number(lat), lng: Number(lng) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
  if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return null;
  return point;
}

// A bare five-digit number is almost always a US ZIP code; qualify it so it doesn't
// resolve to an unrelated country. Everything else is geocoded as typed so the
// distance to the nearest campus stays accurate anywhere in the world.
function normalizeQuery(query: string) {
  return /^\d{5}$/.test(query.trim()) ? `${query.trim()}, USA` : query;
}

async function geocode(rawQuery: string): Promise<Point | null> {
  const query = normalizeQuery(rawQuery);
  const key = query.toLowerCase();
  const cached = geocodeCache.get(key);
  if (cached) return cached;
  const params = new URLSearchParams({ format: "json", limit: "1", q: query });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "ZoeHouseholdWebsite/1.0 (campus finder)", Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) return null;
  const results = (await response.json()) as { lat?: string; lon?: string }[];
  const first = results[0];
  if (!first?.lat || !first.lon) return null;
  const point = { lat: Number(first.lat), lng: Number(first.lon) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
  geocodeCache.set(key, point);
  return point;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  const direct = pointFromQuery(searchParams.get("lat"), searchParams.get("lng"));

  if (!direct && query.length < 2) {
    return NextResponse.json({ error: "Enter a city, address, or campus." }, { status: 400 });
  }

  // Resolve the search to a real coordinate first so we can always return a true
  // distance to the nearest campus. Name matching is only a fallback for when a
  // place can't be geocoded (offline, rate-limited, or an unrecognised address).
  const point = direct ?? (await geocode(query));
  if (point) {
    const nearest = nearestCampus(point);
    return NextResponse.json({
      slug: nearest.campus.slug,
      kilometers: Math.round(nearest.kilometers * 10) / 10,
      matched: direct ? "location" : "place",
    });
  }

  const named = query ? campusByName(query) : null;
  if (named) {
    return NextResponse.json({ slug: named.slug, kilometers: null, matched: "name" });
  }

  return NextResponse.json({ error: "We couldn't place that location. Try a city or a fuller address." }, { status: 404 });
}
