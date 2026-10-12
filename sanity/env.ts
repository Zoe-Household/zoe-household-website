export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-10-12";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

// A read token is only needed for drafts/preview; public published content is
// readable without one. Keep it server-side.
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";

export const isSanityConfigured = projectId.length > 0;
