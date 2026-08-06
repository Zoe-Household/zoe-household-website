import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  FORM_KINDS,
  FormKind,
  ValidationError,
  checkRateLimit,
  notifyByEmail,
  persistSubmission,
  validateSubmission,
  verifyTurnstile,
} from "@/lib/submissions";

export const runtime = "nodejs";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { kind, website, turnstileToken, ...fields } = body as {
    kind?: string;
    website?: string; // Honeypot field name — must match the hidden input in FormCard.
    turnstileToken?: string;
  } & Record<string, unknown>;

  // Honeypot: a hidden field real users never see or fill in. Any bot that fills
  // every input on the form trips this silently — we return a fake success so it
  // doesn't learn to avoid the field. The client already short-circuits on this,
  // but we re-check server-side as defense in depth against direct API calls.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!kind || !FORM_KINDS.includes(kind as FormKind)) {
    return NextResponse.json({ ok: false, error: "Unknown form type." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { ok: false, error: "We couldn't verify you're human. Please try again." },
      { status: 400 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = validateSubmission(kind as FormKind, fields);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message, issues: error.issues },
        { status: 422 },
      );
    }
    throw error;
  }

  const submission = {
    id: randomUUID(),
    kind: kind as FormKind,
    receivedAt: new Date().toISOString(),
    ip,
    data,
  };

  try {
    await persistSubmission(submission);
  } catch (error) {
    console.error("[api/submit] Failed to persist submission", error);
  }

  const emailResult = await notifyByEmail(kind as FormKind, data);

  return NextResponse.json({ ok: true, notified: emailResult.sent });
}
