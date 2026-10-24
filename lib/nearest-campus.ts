import { campuses, type Campus } from "@/data/site";

export type Point = { lat: number; lng: number };

export function distanceKm(from: Point, to: Point) {
  const earth = 6371;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function campusByName(query: string) {
  const text = query.toLowerCase();
  const hits = campuses.filter((campus) => campus.match.some((term) => text.includes(term)));
  return hits.sort((a, b) => longestTerm(b, text) - longestTerm(a, text))[0] ?? null;
}

function longestTerm(campus: Campus, text: string) {
  return campus.match.reduce((best, term) => (text.includes(term) ? Math.max(best, term.length) : best), 0);
}

export function nearestCampus(point: Point) {
  return campuses
    .filter((campus) => campus.slug !== "online")
    .map((campus) => ({ campus, kilometers: distanceKm(point, campus) }))
    .sort((a, b) => a.kilometers - b.kilometers)[0];
}
