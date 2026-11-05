/**
 * Who may open /team. FD's named-person and domain allowlist, with 16x9's own
 * defaults. FD's people are not copied. Extra reviewers come from X9_TEAM_EMAILS.
 * Notices go out only when X9_TEAM_NOTIFY_EMAILS is set. An empty list sends nothing.
 */

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const TEAM_DOMAINS = ["16x9.ai"];
const TEAM_PEOPLE = ["nelson.sanmiguel@16x9.ai"];

export function isTeamEmail(email: string | null | undefined): boolean {
  const e = (email ?? "").trim().toLowerCase();
  if (!e.includes("@")) return false;
  if ([...TEAM_PEOPLE, ...list(process.env.X9_TEAM_EMAILS)].includes(e)) return true;
  return TEAM_DOMAINS.includes(e.split("@")[1] ?? "");
}

export function teamNotifyRecipients(): string[] {
  return list(process.env.X9_TEAM_NOTIFY_EMAILS);
}
