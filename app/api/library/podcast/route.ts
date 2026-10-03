import { NextResponse } from "next/server";
import { fetchPodcastEpisodes } from "@/lib/library";

export const runtime = "nodejs";

export async function GET() {
  try {
    const episodes = await fetchPodcastEpisodes();
    return NextResponse.json({ ok: true, episodes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Podcast episodes are unavailable right now.";
    return NextResponse.json({ ok: false, error: message, episodes: [] }, { status: 502 });
  }
}
