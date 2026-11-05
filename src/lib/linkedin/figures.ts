/**
 * Figure checks from Frontier Desk `src/server/page-post-visuals/validate.mjs`.
 * A displayed number or date must appear verbatim in the note. Rounding is a different token.
 * Schema validation still lives in validate.mjs once spec/schema.json is on disk.
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MON =
  "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?";

const mm = (name: string) =>
  String(MONTHS.indexOf(name.slice(0, 3).toLowerCase()) + 1).padStart(2, "0");
const pad = (n: string) => String(n).padStart(2, "0");

export const normSpace = (s: string) =>
  String(s)
    .replace(/[\s\u00a0\u202f]+/g, " ")
    .trim();

export function extractDates(text: string): { dates: string[]; rest: string } {
  const dates: string[] = [];
  let rest = normSpace(text);
  const take = (re: RegExp, fn: (m: string[]) => string) => {
    rest = rest.replace(re, (...m: string[]) => {
      dates.push(fn(m));
      return " ";
    });
  };
  take(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m) => `${m[1]}-${m[2]}-${m[3]}`);
  take(
    new RegExp(`\\b${MON}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "g"),
    (m) => `${m[3]}-${mm(m[1])}-${pad(m[2])}`,
  );
  take(
    new RegExp(`\\b(\\d{1,2})\\s+${MON},?\\s+(\\d{4})\\b`, "g"),
    (m) => `${m[3]}-${mm(m[2])}-${pad(m[1])}`,
  );
  take(new RegExp(`\\b${MON},?\\s+(\\d{4})\\b`, "g"), (m) => `${m[2]}-${mm(m[1])}`);
  return { dates, rest };
}

export function extractNumbers(text: string): string[] {
  const re =
    /(?<![\w.])(\$?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(%)?(?:\s+(thousand|million|billion|trillion)\b)?/gi;
  const out: string[] = [];
  for (const m of text.matchAll(re)) {
    out.push(
      (m[1] || "") +
        m[2].replace(/,/g, "") +
        (m[3] || "") +
        (m[4] || "") +
        (m[5] ? " " + m[5].toLowerCase() : ""),
    );
  }
  return out;
}

const SKIP_TOP = new Set(["brand", "type", "spec_version"]);
const SKIP_ANY = new Set(["kind", "seriesId", "dateLabel"]);

export function displayedStrings(spec: unknown): [string, string][] {
  const out: [string, string][] = [];
  const walk = (v: unknown, p: string, top: boolean) => {
    if (typeof v === "string") {
      if (v) out.push([p, v]);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, `${p}[${i}]`, false));
      return;
    }
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        if (SKIP_ANY.has(k) || (top && SKIP_TOP.has(k))) continue;
        walk(x, p ? `${p}.${k}` : k, false);
      }
    }
  };
  walk(spec, "", true);
  return out;
}

export type Offending = { path: string; token: string; kind: "date" | "number"; text: string };

/** Displayed dates and numbers that are not verbatim in the note or its title. */
export function figuresNotInNote(spec: unknown, noteText: string, title = ""): Offending[] {
  const { dates, rest } = extractDates(normSpace(noteText + (title ? " . " + title : "")));
  const noteDates = new Set(dates);
  const noteNumbers = new Set(extractNumbers(rest));
  const offending: Offending[] = [];
  for (const [p, s] of displayedStrings(spec)) {
    const pulled = extractDates(s);
    for (const d of pulled.dates) {
      const ok =
        noteDates.has(d) || (d.length === 7 && [...noteDates].some((x) => x.startsWith(d)));
      if (!ok) offending.push({ path: p, token: d, kind: "date", text: s });
    }
    for (const n of extractNumbers(pulled.rest)) {
      if (!noteNumbers.has(n)) offending.push({ path: p, token: n, kind: "number", text: s });
    }
  }
  return offending;
}
