/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
import "server-only";

export type Point = { lat: number; lng: number };

const cache = new Map<string, Point | null>();

const US_STATE_ABBREVS = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]);

// A bare five-digit number is almost always a US ZIP code; qualify it so it doesn't
// resolve to an unrelated country.
function normalize(query: string) {
  return /^\d{5}$/.test(query.trim()) ? `${query.trim()}, USA` : query.trim();
}

function candidateAttempts(query: string, broaden: boolean, countryHint?: string): string[] {
  const cleaned = query
    .replace(/^where\s*[:;]\s*/i, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!broaden) return [cleaned || query];

  // Split on commas, semicolons, or period+space boundaries ("Road. Acworth, GA" ->
  // ["Road", "Acworth", "GA"]).
  const parts = cleaned
    .split(/[,;]|\.\s+/)
    .map((part) => part.replace(/\.+$/, "").trim())
    .filter(Boolean);

  if (parts.length === 0) return [cleaned || query];

  // If the trailing token is a 2-letter US state abbreviation (or state + ZIP),
  // append "USA" so progressive broadening never leaves a bare "GA" / "TX" token.
  const last = parts[parts.length - 1];
  const stateMatch = last.match(/^([A-Za-z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/);
  const effectiveParts = [...parts];
  if (stateMatch && US_STATE_ABBREVS.has(stateMatch[1].toUpperCase())) {
    effectiveParts.push("USA");
  } else if (countryHint && !effectiveParts.some((p) => p.toLowerCase().includes(countryHint.toLowerCase()))) {
    effectiveParts.push(countryHint);
  }

  const out: string[] = [];
  for (let i = 0; i < effectiveParts.length; i += 1) {
    const remaining = effectiveParts.slice(i);
    // Never query a single bare 2–3 character token (e.g. "GA" -> Gabon) or a
    // lone country name when trying to place a specific address.
    if (remaining.length === 1 && (remaining[0].length <= 3 || remaining[0].toLowerCase() === countryHint?.toLowerCase() || remaining[0] === "USA")) {
      continue;
    }
    const attempt = remaining.join(", ");
    if (attempt.length >= 4 && !out.includes(attempt)) {
      out.push(attempt);
    }
  }
  return out.length ? out : [cleaned];
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
 * so when `broaden` is set the leading parts are dropped one at a time
 * ("3215 Mars Hills Road. Acworth, GA" → "Acworth, GA, USA") until something resolves.
 */
export async function geocode(
  rawQuery: string,
  { broaden = false, countryHint }: { broaden?: boolean; countryHint?: string } = {},
): Promise<Point | null> {
  const query = normalize(rawQuery);
  if (!query) return null;
  const key = `${broaden ? "b:" : ""}${countryHint ?? ""}:${query.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const attempts = candidateAttempts(query, broaden, countryHint);
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
