import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

/**
 * Backend for the site's form submissions (Prayer Request, Visit/Children/Reminder
 * registration, and General Inquiry / Contact).
 *
 * There is no database yet, so submissions are persisted as JSON-lines files under
 * data/submissions/ (gitignored) — an interim "ticketing system" per the project's
 * PRD, until a proper CMS/DB or ChurchOS integration lands. Every submission also
 * triggers an admin email notification via Resend when RESEND_API_KEY is configured.
 */

export const FORM_KINDS = ["visit", "children", "reminder", "online", "prayer", "inquiry"] as const;
export type FormKind = (typeof FORM_KINDS)[number];

const emailField = z.string().trim().min(1, "Email is required").email("Enter a valid email address");
const nameField = z.string().trim().min(1, "Name is required").max(120);
const phoneField = z.string().trim().max(30).optional().or(z.literal(""));

const childSchema = z.object({
  name: nameField,
  ageGroup: z.string().trim().min(1, "Select an age group"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const baseSchema = z.object({
  campus: z.string().trim().max(60).optional().or(z.literal("")),
});

const schemasByKind = {
  visit: baseSchema.extend({
    name: nameField,
    email: emailField,
    message: z.string().trim().max(2000).optional().or(z.literal("")),
    campusEmails: z.boolean().optional(),
  }),
  children: baseSchema.extend({
    name: nameField,
    email: emailField,
    children: z.array(childSchema).min(1, "Add at least one child"),
  }),
  reminder: baseSchema.extend({
    email: emailField,
  }),
  online: z.object({
    email: emailField,
  }),
  prayer: baseSchema.extend({
    name: nameField,
    email: emailField,
    phone: phoneField,
    request: z.string().trim().min(1, "Prayer request is required").max(4000),
    timeSensitive: z.boolean().optional(),
    relevantDate: z.string().trim().optional().or(z.literal("")),
  }),
  inquiry: baseSchema.extend({
    name: nameField,
    email: emailField,
    phone: phoneField,
    topic: z.string().trim().min(1, "Select a topic"),
    region: z.string().trim().max(120).optional().or(z.literal("")),
    message: z.string().trim().min(1, "Message is required").max(4000),
    consent: z.literal(true, { message: "Consent is required" }),
  }),
} satisfies Record<FormKind, z.ZodType>;

export type SubmissionPayload<K extends FormKind = FormKind> = z.infer<(typeof schemasByKind)[K]>;

export class ValidationError extends Error {
  issues: z.ZodIssue[];
  constructor(issues: z.ZodIssue[]) {
    super(issues[0]?.message ?? "Invalid submission");
    this.issues = issues;
  }
}

export function validateSubmission(kind: FormKind, data: unknown) {
  const schema = schemasByKind[kind];
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error.issues);
  return result.data;
}

const recipientsByKind: Record<FormKind, string | undefined> = {
  visit: process.env.NOTIFY_EMAIL_VISIT ?? process.env.NOTIFY_EMAIL_DEFAULT,
  children: process.env.NOTIFY_EMAIL_CHILDREN ?? process.env.NOTIFY_EMAIL_DEFAULT,
  reminder: process.env.NOTIFY_EMAIL_REMINDER ?? process.env.NOTIFY_EMAIL_DEFAULT,
  online: process.env.NOTIFY_EMAIL_ONLINE ?? process.env.NOTIFY_EMAIL_DEFAULT,
  prayer: process.env.NOTIFY_EMAIL_PRAYER ?? process.env.NOTIFY_EMAIL_DEFAULT,
  inquiry: process.env.NOTIFY_EMAIL_INQUIRY ?? process.env.NOTIFY_EMAIL_DEFAULT,
};

const kindLabels: Record<FormKind, string> = {
  visit: "Visit / Welcome Team Request",
  children: "Zoe Arrows Children Pre-Registration",
  reminder: "Service Reminder Signup",
  online: "Zoe Online Access Request",
  prayer: "Prayer Request",
  inquiry: "General Inquiry",
};

const SUBMISSIONS_DIR = path.join(process.cwd(), "data", "submissions");

export type StoredSubmission = {
  id: string;
  kind: FormKind;
  receivedAt: string;
  ip?: string;
  data: Record<string, unknown>;
};

export async function persistSubmission(submission: StoredSubmission) {
  await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });
  const file = path.join(SUBMISSIONS_DIR, `${submission.kind}.jsonl`);
  await fs.appendFile(file, `${JSON.stringify(submission)}\n`, "utf8");
}

function renderEmailBody(kind: FormKind, data: Record<string, unknown>) {
  const rows = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `<tr><td style="padding:4px 12px;color:#6b6b6b;">${key}</td><td style="padding:4px 12px;"><strong>${
      typeof value === "object" ? JSON.stringify(value) : String(value)
    }</strong></td></tr>`)
    .join("");
  return `<div style="font-family:sans-serif;max-width:520px;">
    <h2 style="margin-bottom:4px;">New ${kindLabels[kind]}</h2>
    <p style="color:#6b6b6b;margin-top:0;">Submitted via zoehousehold.org</p>
    <table style="border-collapse:collapse;width:100%;">${rows}</table>
  </div>`;
}

let resendClientPromise: Promise<import("resend").Resend | null> | null = null;

async function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClientPromise) {
    resendClientPromise = import("resend").then((mod) => new mod.Resend(process.env.RESEND_API_KEY));
  }
  return resendClientPromise;
}

export async function notifyByEmail(kind: FormKind, data: Record<string, unknown>) {
  const to = recipientsByKind[kind];
  const from = process.env.NOTIFY_EMAIL_FROM ?? "Zoe Household Website <notifications@zoehousehold.org>";

  if (!to) {
    console.warn(`[submissions] No notification recipient configured for "${kind}" (set NOTIFY_EMAIL_${kind.toUpperCase()} or NOTIFY_EMAIL_DEFAULT). Skipping email.`);
    return { sent: false, reason: "no-recipient" as const };
  }

  const client = await getResendClient();
  if (!client) {
    console.warn(`[submissions] RESEND_API_KEY is not set. Would have emailed ${to} about a new ${kind} submission.`);
    return { sent: false, reason: "no-api-key" as const };
  }

  try {
    await client.emails.send({
      from,
      to,
      subject: `New ${kindLabels[kind]}`,
      html: renderEmailBody(kind, data),
    });
    return { sent: true as const };
  } catch (error) {
    console.error(`[submissions] Failed to send notification email for "${kind}"`, error);
    return { sent: false, reason: "send-error" as const };
  }
}

// Simple in-memory sliding-window rate limiter, keyed by IP. Resets on server
// restart — sufficient as a first line of defense against bots/spam until the
// site moves behind Cloudflare Turnstile + a durable store.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    hits.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  return true;
}

export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured yet — allow through (honeypot + rate limit still apply).
  if (!token) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const result = (await response.json()) as { success: boolean };
    return result.success;
  } catch (error) {
    console.error("[submissions] Turnstile verification failed", error);
    return false;
  }
}
