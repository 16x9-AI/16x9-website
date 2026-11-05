// Renders the image for a LinkedIn page-post draft.
// Cloned from frontierdesk src/server/page-post-visuals/index.ts.
// Chromium is optional at runtime: without puppeteer-core and @sparticuz/chromium
// (or X9_CHROME_PATH) this returns an error and the caller keeps the previous image.

import { renderSpec } from "./engine.mjs";

export async function renderVisual(spec, note) {
  let browser;
  try {
    browser = await launch();
  } catch (e) {
    return {
      status: "error",
      reason: `the renderer failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  try {
    const r = await renderSpec(browser, spec, {
      noteText: note.text,
      date: note.date,
      title: note.title,
    });
    if (r.status === "rendered") return { status: "rendered", png: r.png };
    return { status: r.status, reason: String(r.reason) };
  } catch (e) {
    return {
      status: "error",
      reason: `the renderer failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

async function optional(name) {
  return import(name);
}

async function launch() {
  const local = process.env.X9_CHROME_PATH || process.env.FD_CHROME_PATH;
  const puppeteer = (await optional("puppeteer" + "-core")).default;
  if (local)
    return puppeteer.launch({ executablePath: local, headless: true, args: ["--no-sandbox"] });
  const chromium = (await optional("@sparticuz" + "/chromium")).default;
  return puppeteer.launch({
    args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
    executablePath: await chromium.executablePath(),
    headless: "shell",
  });
}
