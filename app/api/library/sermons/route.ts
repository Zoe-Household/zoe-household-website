import { NextRequest, NextResponse } from "next/server";
import { fetchSermonPage } from "@/lib/library";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  try {
    const data = await fetchSermonPage({
      sort: searchParams.get("sort") ?? "date",
      limit: 12,
      page: searchParams.get("page") ?? undefined,
      search: searchParams.get("search") ?? "",
    });
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sermons are unavailable right now.";
    return NextResponse.json({ ok: false, error: message, items: [], nextPageToken: null }, { status: 502 });
  }
}
