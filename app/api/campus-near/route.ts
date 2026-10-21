import { NextRequest, NextResponse } from "next/server";
import { geocode, type Point } from "@/lib/geocode";
import { campusByName, nearestCampus } from "@/lib/nearest-campus";

export const runtime = "nodejs";

function pointFromQuery(lat: string | null, lng: string | null): Point | null {
  if (lat == null || lng == null || lat === "" || lng === "") return null;
  const point = { lat: Number(lat), lng: Number(lng) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
  if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return null;
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
      lat: point.lat,
      lng: point.lng,
    });
  }

  const named = query ? campusByName(query) : null;
  if (named) {
    return NextResponse.json({ slug: named.slug, kilometers: null, matched: "name", lat: named.lat, lng: named.lng });
  }

  return NextResponse.json({ error: "We couldn't place that location. Try a city or a fuller address." }, { status: 404 });
}
