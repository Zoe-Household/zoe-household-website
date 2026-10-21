/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
import type { EventItem } from "@/lib/site-content";
import { distanceKm, type Point } from "@/lib/nearest-campus";

export type EventPhase = "live" | "upcoming" | "tba" | "past";

export type RankedEvent = EventItem & {
  phase: EventPhase;
  kilometers: number | null;
  nearby: boolean;
};

/** Events within this distance of the visitor are treated as "near you". */
export const NEARBY_KM = 800;

/** When an event has a start but no end time, assume it runs this long. */
const DEFAULT_DURATION_MS = 4 * 60 * 60 * 1000;

const time = (iso?: string | null) => {
  if (!iso) return null;
  const value = Date.parse(iso);
  return Number.isNaN(value) ? null : value;
};

export function eventPhase(event: EventItem, now: number): EventPhase {
  const start = time(event.startDate);
  if (start == null) return event.status === "past" ? "past" : event.status === "live" ? "live" : "tba";
  const end = time(event.endDate) ?? start + DEFAULT_DURATION_MS;
  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "past";
}

const PHASE_RANK: Record<EventPhase, number> = { live: 0, upcoming: 1, tba: 2, past: 3 };

/**
 * Orders events for a visitor: happening now, then upcoming (soonest first), then
 * events without dates, then past events (most recent first). Within the live and
 * upcoming groups, events near the visitor come before events elsewhere.
 */
export function rankEvents(events: EventItem[], now: number, visitor: Point | null): RankedEvent[] {
  const ranked = events.map((event): RankedEvent => {
    const kilometers = visitor && event.lat != null && event.lng != null ? distanceKm(visitor, { lat: event.lat, lng: event.lng }) : null;
    return { ...event, phase: eventPhase(event, now), kilometers, nearby: kilometers != null && kilometers <= NEARBY_KM };
  });
  return ranked.sort((a, b) => {
    if (a.phase !== b.phase) return PHASE_RANK[a.phase] - PHASE_RANK[b.phase];
    if (a.phase !== "past" && a.nearby !== b.nearby) return a.nearby ? -1 : 1;
    const aStart = time(a.startDate) ?? Number.MAX_SAFE_INTEGER;
    const bStart = time(b.startDate) ?? Number.MAX_SAFE_INTEGER;
    if (a.phase === "past") {
      const aEnd = time(a.endDate) ?? aStart;
      const bEnd = time(b.endDate) ?? bStart;
      return bEnd - aEnd;
    }
    return aStart - bStart;
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Short, human countdown for the featured card, e.g. "Starts in 23 days". */
export function relativeLabel(event: RankedEvent, now: number) {
  if (event.phase === "live") return "Happening now";
  if (event.phase === "tba") return "Dates to be announced";
  const start = time(event.startDate);
  if (start == null) return null;
  if (event.phase === "past") return "Recently held";
  const days = Math.round((startOfDay(start) - startOfDay(now)) / DAY_MS);
  if (days <= 0) {
    const hours = Math.max(1, Math.round((start - now) / (60 * 60 * 1000)));
    return hours <= 1 ? "Starts within the hour" : `Starts in ${hours} hours`;
  }
  if (days === 1) return "Starts tomorrow";
  if (days < 14) return `Starts in ${days} days`;
  const weeks = Math.round(days / 7);
  if (days < 60) return `Starts in ${weeks} weeks`;
  const months = Math.round(days / 30);
  return `Starts in ${months} months`;
}

function startOfDay(ms: number) {
  const date = new Date(ms);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatKilometers(kilometers: number) {
  const miles = kilometers * 0.621371;
  if (kilometers < 1) return "Less than a mile away";
  const shownMiles = miles < 10 ? miles.toFixed(1) : Math.round(miles).toLocaleString("en-US");
  const shownKm = kilometers < 10 ? kilometers.toFixed(1) : Math.round(kilometers).toLocaleString("en-US");
  return `About ${shownKm} km · ${shownMiles} miles away`;
}
