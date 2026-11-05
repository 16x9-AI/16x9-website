/**
 * Sentences a visual spec claims to copy from its note.
 * Cloned from frontierdesk `src/app/_lib/page-post-visual-prose.ts`.
 */

type Spec = {
  subhead?: unknown;
  visual?: { kind?: unknown; text?: unknown; points?: unknown };
  g?: { sub3?: unknown };
};

const SINGLE_QUOTES = new RegExp("[\\u2018\\u2019]", "g");
const DOUBLE_QUOTES = new RegExp("[\\u201C\\u201D]", "g");
const NBSP = new RegExp("\\u00a0", "g");
const SPACES = new RegExp("\\s+", "g");
const LINK_IN_PARENS = new RegExp("\\s*\\(\\s*https?://[^)]*\\)", "g");
const BARE_LINK = new RegExp("https?://\\S+", "g");

const norm = (s: string) =>
  s
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(NBSP, " ")
    .replace(SPACES, " ")
    .trim();
const stripLinks = (s: string) => s.replace(LINK_IN_PARENS, "").replace(BARE_LINK, "");

/** Sentences the spec presents as the note's words that are not in the note. */
export function proseNotInNote(spec: unknown, body: string, title: string): string[] {
  const hay = norm(stripLinks(`${title}\n${body}`));
  const s = (spec && typeof spec === "object" ? spec : {}) as Spec;
  const claims: string[] = [];
  if (typeof s.subhead === "string") claims.push(s.subhead);
  if (s.visual && s.visual.kind === "statement") {
    if (typeof s.visual.text === "string") claims.push(s.visual.text);
    if (Array.isArray(s.visual.points)) {
      for (const p of s.visual.points) {
        if (p && typeof p === "object" && typeof (p as { text?: unknown }).text === "string") {
          claims.push((p as { text: string }).text);
        }
      }
    }
  }
  if (s.g && typeof s.g.sub3 === "string") claims.push(s.g.sub3);
  return claims.filter((c) => {
    const n = norm(stripLinks(c)).replace(/\.$/, "");
    return n.length > 0 && !hay.includes(n);
  });
}
