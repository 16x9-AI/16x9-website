/**
 * Who may open /login and /team. An explicit address list, never a domain.
 * Unset X9_TEAM_EMAILS keeps the two defaults. A non-blank value replaces
 * them. "@16x9.ai" and a bare domain do not admit anyone.
 * Notices go out only when X9_TEAM_NOTIFY_EMAILS is set. An empty list sends nothing.
 */

const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_TEAM_EMAILS = ["nelson.sanmiguel@16x9.ai", "info@16x9.ai"] as const;

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

function addresses(value: string | undefined): string[] {
  const seen = new Set<string>();
  for (const part of (value ?? "").split(",")) {
    const email = part.trim().toLowerCase();
    if (!ADDRESS.test(email) || email.includes("*") || seen.has(email)) continue;
    seen.add(email);
  }
  return [...seen];
}

/** The admin allowlist. A blank env keeps the defaults. Any other value replaces them. */
export function teamAllowlist(): string[] {
  const raw = process.env.X9_TEAM_EMAILS;
  if (raw == null || raw.trim() === "") return [...DEFAULT_TEAM_EMAILS];
  return addresses(raw);
}

export function isTeamEmail(email: string | null | undefined): boolean {
  const e = (email ?? "").trim().toLowerCase();
  if (!ADDRESS.test(e) || e.includes("*")) return false;
  return teamAllowlist().includes(e);
}

export function teamNotifyRecipients(): string[] {
  return list(process.env.X9_TEAM_NOTIFY_EMAILS);
}
