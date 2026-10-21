/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Approximate visitor location from Vercel's IP geolocation headers. It is only
// used to put nearby events first, so it never prompts for permission and returns
// null wherever the headers are absent (for example in local development).
export function GET(request: NextRequest) {
  const lat = Number(request.headers.get("x-vercel-ip-latitude"));
  const lng = Number(request.headers.get("x-vercel-ip-longitude"));
  const city = request.headers.get("x-vercel-ip-city");
  const located = request.headers.has("x-vercel-ip-latitude") && Number.isFinite(lat) && Number.isFinite(lng);
  return NextResponse.json(
    located ? { lat, lng, city: city ? decodeURIComponent(city) : null, source: "ip" } : null,
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
