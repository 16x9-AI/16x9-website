// The FD LinkedIn page-post visual engine, ported from frontierdesk
// src/server/page-post-visuals/engine.mjs. Same templates, fit rules and validator.
// 16x9 adds the `16x9` token set. Frontier Desk's token set is unchanged.
import path from "path";
import { pathToFileURL } from "url";
import { validateSpec, checkSpecSchema } from "./validate.mjs";

export const ENGINE_DIR = path.join(process.cwd(), "src", "server", "page-post-visuals");

export const TOKEN_SETS = {
  "frontier-desk": { loop: "../brand/fd-loop.png" },
  "16x9": { loop: "../brand/x9-mark.svg" },
};

export const G_TEMPLATE = {
  build_out_tracker: "G-buildout",
  owner_explainer: "G-explainer",
  week_in_five: "G-week",
  field_report: "G-week",
};

export function toNote(spec) {
  const ts = TOKEN_SETS[spec.brand.tokenSet];
  if (!ts) throw new Error("no token set " + spec.brand.tokenSet);
  const base = { ...spec.chrome, brand: spec.brand, assets: ts };
  if (spec.g) {
    const T = G_TEMPLATE[spec.type];
    if (!T) throw new Error("no G template for type " + spec.type);
    return { template: T, note: { ...base, g: { ...spec.g, headline: spec.headline, subhead: spec.subhead } } };
  }
  return {
    template: "F",
    note: {
      ...base,
      f: {
        headline: spec.headline,
        subhead: spec.subhead,
        visual: spec.visual,
        rowsHeader: spec.rowsHeader || ["", ""],
        rows: spec.rows || [],
      },
    },
  };
}

export async function renderPage(browser, T, note) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.evaluateOnNewDocument((n) => {
      window.NOTE = n;
    }, note);
    await page.goto(pathToFileURL(path.join(ENGINE_DIR, "templates", T + ".html")).href, { waitUntil: "networkidle0" });
    await page.waitForFunction("window.__fitDone === true", { timeout: 30000 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const fonts = await page.evaluate(() =>
      ['700 40px "Cabinet Grotesk"', '500 40px "Geist Variable"', '400 20px "Geist Mono Variable"'].map((f) => document.fonts.check(f)),
    );
    const fit = await page.evaluate(() => window.__fit);
    const issues = await page.evaluate(() => window.pageIssues().map((i) => i.m));
    const png = Buffer.from(await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1080, height: 1350 } }));
    return { png, fonts, fit, issues, ok: fit.ok && issues.length === 0 && fonts.every(Boolean) };
  } finally {
    await page.close();
  }
}

export async function renderSpec(browser, spec, { noteText, date, title } = {}) {
  if (spec && typeof spec === "object" && ("unsupported_type" in spec || "unsupported_layout" in spec)) {
    return { status: "unsupported", reason: "unsupported " + JSON.stringify(spec) };
  }
  if (noteText != null) {
    const r = validateSpec(spec, noteText, { date, title });
    if (r.status !== "valid") {
      return {
        status: "invalid",
        reason:
          "spec failed validation: " +
          [...r.errors, ...r.offending.map((o) => `offending ${o.kind} ${JSON.stringify(o.token)} at ${o.path}`)].join("; "),
      };
    }
  } else {
    const errs = checkSpecSchema(spec);
    if (errs.length) return { status: "invalid", reason: "schema errors: " + errs.join("; ") };
  }
  const { template, note } = toNote(spec);
  const r = await renderPage(browser, template, note);
  if (!r.ok) {
    const why = [
      ...(r.fit.ok ? [] : ["cannot fit at minimum size: " + (r.fit.issues || []).join("; ")]),
      ...r.issues,
      ...(r.fonts.every(Boolean) ? [] : ["fonts did not load"]),
    ].join("; ");
    return { status: "overflow", reason: why };
  }
  return { status: "rendered", png: r.png, template, result: r };
}
