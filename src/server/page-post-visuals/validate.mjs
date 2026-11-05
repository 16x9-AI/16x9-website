// Cloned from frontierdesk src/server/page-post-visuals/validate.mjs.
// Usage: node validate.mjs <spec.json> <note.txt> [--date YYYY-MM-DD]
import Ajv2020 from "ajv/dist/2020.js";
import schema from "./spec/schema.json" with { type: "json" };

const ajv = new Ajv2020({ allErrors: true, strict: false });
const checkSchema = ajv.compile(schema);

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MON =
  "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?";
const mm = (name) => String(MONTHS.indexOf(name.slice(0, 3).toLowerCase()) + 1).padStart(2, "0");
const pad = (n) => String(n).padStart(2, "0");

export const normSpace = (s) => String(s).replace(/[\s\u00a0\u202f]+/g, " ").trim();

export function extractDates(text) {
  const dates = [];
  let rest = normSpace(text);
  const take = (re, fn) => {
    rest = rest.replace(re, (...m) => {
      dates.push(fn(m));
      return " ";
    });
  };
  take(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m) => `${m[1]}-${m[2]}-${m[3]}`);
  take(new RegExp(`\\b${MON}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "g"), (m) => `${m[3]}-${mm(m[1])}-${pad(m[2])}`);
  take(new RegExp(`\\b(\\d{1,2})\\s+${MON},?\\s+(\\d{4})\\b`, "g"), (m) => `${m[3]}-${mm(m[2])}-${pad(m[1])}`);
  take(new RegExp(`\\b${MON},?\\s+(\\d{4})\\b`, "g"), (m) => `${m[2]}-${mm(m[1])}`);
  return { dates, rest };
}

export function extractNumbers(text) {
  const re = /(?<![\w.])(\$?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(%)?(?:\s+(thousand|million|billion|trillion)\b)?/gi;
  const out = [];
  for (const m of text.matchAll(re)) {
    out.push((m[1] || "") + m[2].replace(/,/g, "") + (m[3] || "") + (m[4] || "") + (m[5] ? " " + m[5].toLowerCase() : ""));
  }
  return out;
}

const noteIndex = (body) => {
  const { dates, rest } = extractDates(body);
  return { dates: new Set(dates), numbers: new Set(extractNumbers(rest)), text: rest };
};

export function displayedStrings(spec) {
  const out = [];
  const skipTop = new Set(["brand", "type", "spec_version"]);
  const skipAny = new Set(["kind", "seriesId", "dateLabel"]);
  const walk = (v, p, top) => {
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
        if (skipAny.has(k) || (top && skipTop.has(k))) continue;
        walk(x, p ? `${p}.${k}` : k, false);
      }
    }
  };
  walk(spec, "", true);
  return out;
}

export function validateSpec(spec, noteText, { date, title } = {}) {
  if (spec && typeof spec === "object" && ("unsupported_type" in spec || "unsupported_layout" in spec)) {
    if (!checkSchema(spec)) return { status: "invalid", errors: schemaErrors(), offending: [] };
    return { status: "unsupported", result: spec, errors: [], offending: [] };
  }
  if (!checkSchema(spec)) return { status: "invalid", errors: schemaErrors(), offending: [] };

  const errors = [];
  const offending = [];
  const note = noteIndex(normSpace(noteText + (title ? " . " + title : "")));

  for (const [p, s] of displayedStrings(spec)) {
    const { dates, rest } = extractDates(s);
    for (const d of dates) {
      const ok = note.dates.has(d) || (d.length === 7 && [...note.dates].some((x) => x.startsWith(d)));
      if (!ok) offending.push({ path: p, token: d, kind: "date", text: s });
    }
    for (const n of extractNumbers(rest)) {
      if (!note.numbers.has(n)) offending.push({ path: p, token: n, kind: "number", text: s });
    }
  }

  if (date && spec.chrome && spec.chrome.dateLabel) {
    const [y, m, d] = date.split("-").map(Number);
    const expected = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${d}, ${y}`;
    if (spec.chrome.dateLabel !== expected) errors.push(`chrome.dateLabel "${spec.chrome.dateLabel}" does not match --date ${date} (expected "${expected}")`);
  }

  if (offending.length) errors.unshift(`${offending.length} figure token(s) not found verbatim in the note`);
  return { status: errors.length ? "invalid" : "valid", errors, offending };
}

function schemaErrors() {
  return (checkSchema.errors || []).map(
    (e) => `schema ${e.instancePath || "/"} ${e.message}${e.params && e.params.allowedValues ? " " + JSON.stringify(e.params.allowedValues) : ""}`,
  );
}

export function checkSpecSchema(spec) {
  return checkSchema(spec) ? [] : schemaErrors();
}
