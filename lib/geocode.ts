/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
import "server-only";

export type Point = { lat: number; lng: number };

const cache = new Map<string, Point | null>();

// A bare five-digit number is almost always a US ZIP code; qualify it so it doesn't
// resolve to an unrelated country.
function normalize(query: string) {
  return /^\d{5}$/.test(query.trim()) ? `${query.trim()}, USA` : query.trim();
}

async function lookup(query: string): Promise<Point | null> {
  const params = new URLSearchParams({ format: "json", limit: "1", q: query });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { "User-Agent": "ZoeHouseholdWebsite/1.0 (campus finder)", Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) return null;
  const results = (await response.json()) as { lat?: string; lon?: string }[];
  const first = results[0];
  if (!first?.lat || !first.lon) return null;
  const point = { lat: Number(first.lat), lng: Number(first.lon) };
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) ? point : null;
}

/**
 * Geocodes a free-form place. Street-level addresses often aren't in OpenStreetMap,
 * so when `broaden` is set the leading comma-separated parts are dropped one at a
 * time ("7 Road, Off Street, Ikeja Lagos Nigeria" → "Off Street, …" → "Ikeja Lagos
 * Nigeria") until something resolves.
 */
export async function geocode(rawQuery: string, { broaden = false } = {}): Promise<Point | null> {
  const query = normalize(rawQuery);
  if (!query) return null;
  const key = `${broaden ? "b:" : ""}${query.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const parts = query.split(",").map((part) => part.trim()).filter(Boolean);
  const attempts = broaden ? parts.map((_, index) => parts.slice(index).join(", ")) : [query];
  let point: Point | null = null;
  for (const attempt of attempts) {
    try {
      point = await lookup(attempt);
    } catch {
      point = null;
    }
    if (point) break;
  }
  cache.set(key, point);
  return point;
}
