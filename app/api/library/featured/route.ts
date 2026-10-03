import { NextResponse } from "next/server";
import { fetchFeaturedSermon } from "@/lib/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const featured = await fetchFeaturedSermon();
    return NextResponse.json({ ok: true, video: featured?.video ?? null, pool: featured?.pool ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sermons are unavailable right now.";
    return NextResponse.json({ ok: false, error: message, video: null }, { status: 502 });
  }
}
