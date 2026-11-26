/**
 * 16x9 Intel daily fetch runner. Run with Node 24 (native type stripping):
 *   npm run x9:fetch -- --date 2026-11-24 --dry-run
 * Always writes the payload file. Writes to Mycel only when not --dry-run and
 * X9_INTEL_DAILY_ENABLED is the string "true". It never publishes anything.
 *
 * --report-file <path>: read the report from a local JSON file instead of the GitHub API
 * (X9_REPORT_GITHUB_TOKEN is then not needed). Someone with access to the private
 * industry-daily-report repo downloads reports/<date>.json and hands the file over.
 * Without --date, the date comes from the report's own `date` field.
 */

import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { COMPANY } from "../src/lib/linkedin/company.ts";
import {
  buildPayload,
  fetchSources,
  readReport,
  readReportFile,
  shouldWriteMycel,
  summarizeRun,
  upsertDailyInput,
  type Report,
} from "../src/lib/x9-intel/fetch.ts";

// Same default as src/lib/linkedin/mycel.ts. An identifier, not a credential.
const DEFAULT_ORG_ID = "869d903e-d7ec-43c9-b901-e7f24bffa989";

function fail(message: string): never {
  console.error(`x9-intel-fetch: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      date: { type: "string" },
      out: { type: "string" },
      "report-file": { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
  });
  if (values.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(values.date)) fail("--date must be YYYY-MM-DD");

  let read: { report: Report; sha: string };
  let date: string;
  if (values["report-file"] !== undefined) {
    try {
      const file = await readReportFile(values["report-file"], { expectedDate: values.date });
      read = file;
      date = file.date;
    } catch (err) {
      fail(err instanceof Error ? err.message : "report file read failed");
    }
  } else {
    date = values.date ?? new Date().toISOString().slice(0, 10);
    const token = process.env.X9_REPORT_GITHUB_TOKEN;
    if (!token) fail("X9_REPORT_GITHUB_TOKEN is not set");
    try {
      read = await readReport(date, { token });
    } catch (err) {
      fail(err instanceof Error ? err.message : "report read failed");
    }
  }
  const out = values.out ?? `x9-intel-input-${date}.json`;

  const sources = await fetchSources(read.report.episodes);
  const payload = buildPayload(read.report, sources);
  await writeFile(out, `${JSON.stringify(payload, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });

  console.log(summarizeRun(payload));

  const write = shouldWriteMycel({
    dryRun: values["dry-run"] === true,
    enabled: process.env.X9_INTEL_DAILY_ENABLED,
  });
  if (!write) {
    console.log("dry run: Mycel write skipped");
    return;
  }
  const base = process.env.MYCEL_API_BASE;
  const apiKey = process.env.MYCEL_16X9_API_KEY;
  if (!base || !apiKey) fail("MYCEL_API_BASE and MYCEL_16X9_API_KEY are required for a Mycel write");

  const result = await upsertDailyInput(payload, {
    sha: read.sha,
    base,
    apiKey,
    orgId: process.env.MYCEL_16X9_ORG_ID || DEFAULT_ORG_ID,
    ecosystemId: process.env.MYCEL_16X9_ECOSYSTEM_ID || COMPANY.ecosystemId,
  });
  if (result.status === "error") fail(`Mycel write failed: ${result.detail}`);
  console.log(`Mycel row ${result.action} for ${payload.report_date}`);
}

// Logging policy: this runs on a public repo's runner, so logs are public. Print only the
// date, counts, HTTP status codes, row action and fixed messages. Never titles, summaries,
// report URLs, paragraphs or response bodies. Unexpected errors print the class name only.
try {
  await main();
} catch (err) {
  fail(`unexpected failure (${err instanceof Error ? err.name : "unknown"})`);
}
