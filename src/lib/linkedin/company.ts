/**
 * 16x9 instance of Frontier Desk's LinkedIn page-post desk.
 * FD modules keep their behavior; only these names change.
 * Secrets stay in the environment. Nothing here is a credential.
 */

export const COMPANY = {
  key: "x9",
  name: "16x9",
  domain: "16x9.ai",
  site: "https://16x9.ai",
  ecosystemId: "318b5ffd-6706-492f-912b-37ed4bc28a55",
  postsTable: "x9_linkedin_page_posts",
  visualsTable: "x9_linkedin_page_visuals",
  targetsTable: "x9_linkedin_page_targets",
  articlesTable: "x9_intel_articles",
  drafterAgent: "x9_linkedin_page_drafter",
  publisherAgent: "x9_linkedin_page_publisher",
  personalPublisherAgent: "x9_linkedin_personal_publisher",
  blobPrefix: "x9-page-posts/",
  sessionCookie: "x9_portal_session",
  challengeCookie: "x9_otp_challenge",
  googleStateCookie: "x9_google_oauth",
  issuer: "16x9",
  sessionAudience: "x9-portal",
  otpAudience: "x9-otp",
  googleAudience: "x9-google",
  /** Drafter idempotency, same shape as FD's `li-page:<note_id>`. */
  pageKey: (noteId: string) => `li-page:${noteId}`,
  /** Visual idempotency, same shape as FD's `li-visual:<post_id>`. */
  visualKey: (postId: string) => `li-visual:${postId}`,
  /** Per-target row id. One target's write never uses the other's id. */
  targetId: (postId: string, target: "company" | "personal") => `${postId}:${target}`,
} as const;

/** LinkedIn's limit on a post's text (Posts API commentary). */
export const POST_MAX = 3000;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function mycelConfigured(): boolean {
  return Boolean(process.env.MYCEL_API_BASE && process.env.MYCEL_16X9_API_KEY);
}

export function ecosystemId(): string {
  return process.env.MYCEL_16X9_ECOSYSTEM_ID || COMPANY.ecosystemId;
}

/**
 * Live LinkedIn posting stays off until Nelson connects the company page and
 * his personal profile and sets this to the string "true". Any other value,
 * including unset, does not dispatch a publisher.
 */
export function publisherEnabled(): boolean {
  return process.env.X9_LINKEDIN_PUBLISHER_ENABLED === "true";
}
