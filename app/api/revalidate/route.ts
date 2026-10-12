import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Sanity publish webhook → on-publish revalidation.
//
// Configure a webhook in Sanity (API → Webhooks) pointing at:
//   https://<your-domain>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
// Trigger on: Create / Update / Delete. Projection (optional, recommended):
//   {"_type": _type, "slug": slug.current}
//
// The site also uses time-based ISR (revalidate = 60s), so content refreshes
// within a minute even without this webhook. The webhook just makes publishes
// show up immediately.

type Payload = { _type?: string; slug?: string };

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  // If no secret is configured, refuse rather than allow anonymous revalidation.
  if (!secret) return false;
  const fromQuery = request.nextUrl.searchParams.get("secret");
  const header = request.headers.get("authorization");
  const fromHeader = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  return fromQuery === secret || fromHeader === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  let body: Payload = {};
  try {
    body = (await request.json()) as Payload;
  } catch {
    // Body is optional; fall through to a broad revalidate.
  }

  const revalidated: string[] = [];
  const touch = (path: string) => {
    revalidatePath(path);
    revalidated.push(path);
  };

  // Always refresh the catch-all route group that renders every page.
  touch("/");
  touch("/events");
  touch("/visit");

  if (body._type === "event" && body.slug) {
    touch(`/events/${body.slug}`);
  }
  if (body._type === "campus" && body.slug) {
    touch(`/visit/${body.slug}`);
  }

  return NextResponse.json({ revalidated: true, paths: revalidated, now: Date.now() });
}

export function GET() {
  return NextResponse.json({ ok: true, message: "POST a Sanity webhook here to revalidate." });
}
