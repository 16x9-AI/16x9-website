import { describe, expect, it, vi } from "vitest";
import {
  buildPayload,
  extractParagraphs,
  fetchSources,
  readReport,
  shouldWriteMycel,
  summarizeRun,
  upsertDailyInput,
  type Payload,
} from "./fetch";

const LONG = "This paragraph is comfortably longer than the forty character minimum.";

function html(res: string, init: ResponseInit = {}): Response {
  return new Response(res, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
    ...init,
  });
}

describe("extractParagraphs", () => {
  it("keeps only <p> text, strips tags, scripts and styles", () => {
    const out = extractParagraphs(
      `<div>${LONG} (div text, not a paragraph)</div>
       <script>var x = "<p>${LONG} from a script</p>";</script>
       <style>p { color: red }</style>
       <p>Inside <b>bold</b> and <a href="/x">a link</a>. ${LONG}</p>`,
    );
    expect(out).toEqual([`Inside bold and a link. ${LONG}`]);
  });

  it("decodes named and numeric entities once and collapses whitespace", () => {
    const [text] = extractParagraphs(
      `<p>Tom &amp; Jerry&nbsp;said &ldquo;hi&rdquo; &#8212; &#x2019;ok&#x2019;
         &amp;lt; stays literal, and so on and on.</p>`,
    );
    expect(text).toBe("Tom & Jerry said “hi” — ’ok’ &lt; stays literal, and so on and on.");
  });

  it("drops paragraphs under 40 characters", () => {
    expect(extractParagraphs(`<p>Too short.</p><p>${LONG}</p>`)).toEqual([LONG]);
  });

  it("drops exact duplicates and short repeated boilerplate", () => {
    const out = extractParagraphs(
      `<p>${LONG}</p><p>${LONG}</p>
       <p>Subscribe to our newsletter for the daily briefing in your inbox.</p>
       <p>We use cookies to improve your experience on this website today.</p>`,
    );
    expect(out).toEqual([LONG]);
  });

  it("keeps a long paragraph that merely mentions a boilerplate word", () => {
    const long = `${LONG} The newsletter market grew sharply this quarter, ${"and analysts expect more growth. ".repeat(8)}`.trim();
    expect(extractParagraphs(`<p>${long}</p>`)).toHaveLength(1);
  });

  it("caps at 60 paragraphs and 12,000 characters", () => {
    const many = Array.from({ length: 100 }, (_, n) => `<p>${LONG} Number ${n}.</p>`).join("");
    expect(extractParagraphs(many)).toHaveLength(60);

    const big = Array.from({ length: 10 }, (_, n) => `<p>${`${n} `.repeat(1000)}</p>`).join("");
    const out = extractParagraphs(big);
    expect(out.reduce((sum, p) => sum + p.length, 0)).toBeLessThanOrEqual(12_000);
    expect(out.length).toBeLessThan(10);
  });
});

describe("fetchSources", () => {
  const episodes = [
    { links: ["https://a.example/1", "https://a.example/2", "https://a.example/3", "https://a.example/4"] },
    { links: ["not a url", "ftp://b.example/file", "https://b.example/ok"] },
  ];

  it("takes at most maxLinksPerEpisode per episode, sequentially, with the polite User-Agent", async () => {
    let active = 0;
    let peak = 0;
    const calls: string[] = [];
    const stub = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      active++;
      peak = Math.max(peak, active);
      calls.push(String(url));
      expect((init?.headers as Record<string, string>)["User-Agent"]).toBe(
        "16x9-intel-fetch/1.0 (+https://16x9.ai)",
      );
      await Promise.resolve();
      active--;
      return html(`<p>${LONG}</p>`);
    });
    const out = await fetchSources([episodes[0]], { fetch: stub as unknown as typeof fetch });
    expect(out.map((s) => s.url)).toEqual([
      "https://a.example/1",
      "https://a.example/2",
      "https://a.example/3",
    ]);
    expect(out.every((s) => s.episode_index === 0 && s.paragraphs.length === 1)).toBe(true);
    expect(peak).toBe(1);
    expect(calls).toHaveLength(3);
  });

  it("records bad and non-http(s) URLs as errors without fetching them", async () => {
    const stub = vi.fn(async () => html(`<p>${LONG}</p>`));
    const out = await fetchSources([episodes[1]], { fetch: stub as unknown as typeof fetch });
    expect(out[0]).toMatchObject({ url: "not a url", paragraphs: [], error: expect.any(String) });
    expect(out[1]).toMatchObject({ url: "ftp://b.example/file", paragraphs: [] });
    expect(out[1].error).toBeTruthy();
    expect(out[2].paragraphs).toEqual([LONG]);
    expect(stub).toHaveBeenCalledTimes(1);
  });

  it("records HTTP errors, thrown errors and timeouts, and keeps going", async () => {
    const stub = vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith("/1")) return new Response("nope", { status: 403 });
      if (u.endsWith("/2")) throw new Error("socket hang up");
      if (u.endsWith("/3")) return new Promise<Response>(() => undefined); // never settles
      return html(`<p>${LONG}</p>`);
    });
    const out = await fetchSources([{ links: ["https://x.example/1", "https://x.example/2", "https://x.example/3"] }, { links: ["https://x.example/ok"] }], {
      fetch: stub as unknown as typeof fetch,
      timeoutMs: 20,
    });
    expect(out[0].error).toBe("HTTP 403");
    expect(out[1].error).toBe("socket hang up");
    expect(out[2].error).toMatch(/timeout/);
    expect(out[3]).toEqual({ episode_index: 1, url: "https://x.example/ok", paragraphs: [LONG] });
  });

  it("skips non-HTML responses", async () => {
    const stub = vi.fn(async () => new Response("{}", { headers: { "content-type": "application/json" } }));
    const [one] = await fetchSources([{ links: ["https://x.example/api"] }], {
      fetch: stub as unknown as typeof fetch,
    });
    expect(one.error).toMatch(/not HTML/);
  });

  it("stops reading a body at maxBytes", async () => {
    const stub = vi.fn(async () => html(`<p>${LONG}</p>`.repeat(1) + `<p>${"x".repeat(500)}</p>`));
    const [one] = await fetchSources([{ links: ["https://x.example/big"] }], {
      fetch: stub as unknown as typeof fetch,
      maxBytes: 100,
    });
    // The second paragraph is cut off before its closing tag, so only the first survives.
    expect(one.paragraphs).toEqual([LONG]);
  });
});

describe("buildPayload", () => {
  it("indexes episodes by position and carries the collect shape", () => {
    const report = {
      date: "2026-11-24",
      episodes: [
        { title: "A", summary: "sa", keyData: "k", impact: "high", stackLayer: "L1", signalType: "S", links: ["https://a.example"], angle: "dropped" },
        { title: "B" },
      ],
    };
    const sources = [{ episode_index: 0, url: "https://a.example", paragraphs: [LONG] }];
    const payload = buildPayload(report, sources);
    expect(payload).toEqual({
      report_date: "2026-11-24",
      episodes: [
        { i: 0, title: "A", summary: "sa", keyData: "k", impact: "high", stackLayer: "L1", signalType: "S", links: ["https://a.example"] },
        { i: 1, title: "B", summary: "", keyData: "", impact: "", stackLayer: "", signalType: "", links: [] },
      ],
      sources,
    });
  });
});

describe("readReport", () => {
  const raw = JSON.stringify({ date: "2026-11-24", episodes: [{ title: "A" }] });

  it("reads raw content through the contents API and returns a git blob sha", async () => {
    const stub = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response(raw));
    const out = await readReport("2026-11-24", { token: "t0ken", fetch: stub as unknown as typeof fetch });
    expect(out.report.episodes).toHaveLength(1);
    expect(out.sha).toMatch(/^[0-9a-f]{40}$/);
    const [url, init] = stub.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.github.com/repos/16x9-AI/industry-daily-report/contents/reports/2026-11-24.json",
    );
    const headers = init?.headers as Record<string, string>;
    expect(headers.Accept).toBe("application/vnd.github.raw+json");
    expect(headers.Authorization).toBe("Bearer t0ken");
  });

  it("honours repo and pathTemplate overrides", async () => {
    const stub = vi.fn(async (_url: RequestInfo | URL) => new Response(raw));
    await readReport("2026-11-24", {
      token: "t",
      repo: "o/r",
      pathTemplate: "x/{date}.json",
      fetch: stub as unknown as typeof fetch,
    });
    expect(String(stub.mock.calls[0][0])).toBe("https://api.github.com/repos/o/r/contents/x/2026-11-24.json");
  });

  it("throws a clear error on 404", async () => {
    const stub = vi.fn(async () => new Response("{}", { status: 404 }));
    await expect(
      readReport("2026-11-24", { token: "t", fetch: stub as unknown as typeof fetch }),
    ).rejects.toThrow(/report not found.*reports\/2026-11-24\.json/);
  });

  it("keeps response body text out of error messages", async () => {
    const MARKER = "SECRET-REPORT-TEXT-MARKER";
    const cases = [
      async () => new Response(`boom ${MARKER}`, { status: 500 }),
      async () => new Response(`{"episodes": ${MARKER}`, { status: 200 }),
      async () => {
        throw new Error(`failed: ${MARKER}`);
      },
    ];
    for (const failing of cases) {
      const err = await readReport("2026-11-24", {
        token: "t",
        fetch: vi.fn(failing) as unknown as typeof fetch,
      }).then(
        () => null,
        (e: Error) => e,
      );
      expect(err).toBeInstanceOf(Error);
      expect(err?.message).not.toContain(MARKER);
    }
    const err500 = await readReport("2026-11-24", {
      token: "t",
      fetch: vi.fn(cases[0]) as unknown as typeof fetch,
    }).catch((e: Error) => e);
    expect((err500 as Error).message).toMatch(/\(500\)/);
  });

  it("rejects a file without an episodes array", async () => {
    const stub = vi.fn(async () => new Response("{}"));
    await expect(
      readReport("2026-11-24", { token: "t", fetch: stub as unknown as typeof fetch }),
    ).rejects.toThrow(/no episodes/);
  });
});

describe("upsertDailyInput", () => {
  const payload: Payload = {
    report_date: "2026-11-24",
    episodes: [
      { i: 0, title: "A", summary: "", keyData: "", impact: "", stackLayer: "", signalType: "", links: [] },
    ],
    sources: [
      { episode_index: 0, url: "https://a.example", paragraphs: [LONG] },
      { episode_index: 0, url: "https://b.example", paragraphs: [], error: "HTTP 500" },
    ],
  };
  const opts = {
    sha: "abc123",
    base: "https://mycel.example/",
    apiKey: "key",
    orgId: "org",
    ecosystemId: "eco",
    now: () => new Date("2026-11-24T09:31:00Z"),
  };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

  it("inserts with the idempotency key when no row exists", async () => {
    const stub = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "POST" ? json({}, 201) : json({ x9_intel_daily_inputs: [] }),
    );
    const out = await upsertDailyInput(payload, { ...opts, fetch: stub as unknown as typeof fetch });
    expect(out).toEqual({ status: "received", action: "inserted" });

    const read = new URL(String(stub.mock.calls[0][0]));
    expect(read.pathname).toBe("/api/business-private/x9_intel_daily_inputs");
    expect(read.searchParams.get("ecosystem_id")).toBe("eco");
    expect(read.searchParams.get("col_filters")).toBe('{"report_date":"2026-11-24"}');
    expect(read.searchParams.get("limit")).toBe("1");

    const [url, init] = stub.mock.calls[1];
    expect(String(url)).toBe("https://mycel.example/api/business-private/x9_intel_daily_inputs?ecosystem_id=eco");
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer key");
    expect(headers["X-Mycel-Organization"]).toBe("org");
    expect(headers["X-Mycel-Ecosystem"]).toBe("eco");
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      report_date: "2026-11-24",
      episode_count: 1,
      source_count: 1,
      report_sha: "abc123",
      fetched_at: "2026-11-24T09:31:00.000Z",
      status: "fetched",
      source_run: "x9_intel_fetch",
      idempotency_key: "x9-input:2026-11-24",
    });
    expect(JSON.parse(body.payload)).toEqual(payload);
  });

  it("patches the existing row by uuid", async () => {
    const id = "11111111-2222-3333-4444-555555555555";
    const stub = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "PATCH" ? json({}) : json({ x9_intel_daily_inputs: [{ id }] }),
    );
    const out = await upsertDailyInput(payload, { ...opts, fetch: stub as unknown as typeof fetch });
    expect(out).toEqual({ status: "received", action: "updated" });
    expect(stub).toHaveBeenCalledTimes(2);
    const [url, init] = stub.mock.calls[1];
    expect(String(url)).toBe(
      `https://mycel.example/api/business-private/x9_intel_daily_inputs/${id}?ecosystem_id=eco`,
    );
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body)).status).toBe("fetched");
  });

  it("does not insert when the read fails", async () => {
    for (const failing of [
      async () => new Response("down", { status: 500 }),
      async () => {
        throw new Error("network down");
      },
    ]) {
      const stub = vi.fn(failing);
      const out = await upsertDailyInput(payload, { ...opts, fetch: stub as unknown as typeof fetch });
      expect(out.status).toBe("error");
      expect(stub).toHaveBeenCalledTimes(1);
    }
  });

  it("reports a failed write", async () => {
    const stub = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "POST" ? new Response("duplicate key", { status: 409 }) : json({ x9_intel_daily_inputs: [] }),
    );
    const out = await upsertDailyInput(payload, { ...opts, fetch: stub as unknown as typeof fetch });
    expect(out).toEqual({ status: "error", detail: "write failed (409)" });
  });

  it("never puts response body text in error details", async () => {
    const MARKER = "SECRET-REPORT-TEXT-MARKER";
    const write500 = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "POST"
        ? new Response(`boom ${MARKER}`, { status: 500 })
        : json({ x9_intel_daily_inputs: [] }),
    );
    const read500 = vi.fn(async () => new Response(`boom ${MARKER}`, { status: 500 }));
    // A 200 with a non-JSON body makes res.json() throw a SyntaxError that quotes the body.
    const readBadJson = vi.fn(async () => new Response(`<html>${MARKER}`, { status: 200 }));
    const throwsWithBody = vi.fn(async () => {
      throw new Error(`failed: ${MARKER}`);
    });
    for (const stub of [write500, read500, readBadJson, throwsWithBody]) {
      const out = await upsertDailyInput(payload, { ...opts, fetch: stub as unknown as typeof fetch });
      expect(out.status).toBe("error");
      expect(JSON.stringify(out)).not.toContain(MARKER);
    }
    const out = await upsertDailyInput(payload, { ...opts, fetch: write500 as unknown as typeof fetch });
    expect(out).toEqual({ status: "error", detail: "write failed (500)" });
  });
});

describe("summarizeRun", () => {
  it("prints only the date and counts", () => {
    const line = summarizeRun({
      report_date: "2026-11-24",
      episodes: [
        { i: 0, title: "SECRET TITLE", summary: "SECRET SUMMARY", keyData: "", impact: "", stackLayer: "", signalType: "", links: ["https://secret.example/x"] },
      ],
      sources: [
        { episode_index: 0, url: "https://secret.example/x", paragraphs: [LONG] },
        { episode_index: 0, url: "https://secret.example/y", paragraphs: [], error: "HTTP 500" },
      ],
    });
    expect(line).toBe("x9-intel-fetch 2026-11-24: 1 episodes, sources 1 ok / 1 failed");
    expect(line).not.toMatch(/SECRET|secret\.example|paragraph/);
  });
});

describe("shouldWriteMycel", () => {
  it("writes only when not a dry run and enabled is exactly true", () => {
    expect(shouldWriteMycel({ dryRun: false, enabled: "true" })).toBe(true);
    expect(shouldWriteMycel({ dryRun: false, enabled: true })).toBe(true);
    expect(shouldWriteMycel({ dryRun: true, enabled: "true" })).toBe(false);
    expect(shouldWriteMycel({ dryRun: false, enabled: "false" })).toBe(false);
    expect(shouldWriteMycel({ dryRun: false, enabled: "TRUE" })).toBe(false);
    expect(shouldWriteMycel({ dryRun: false, enabled: "" })).toBe(false);
    expect(shouldWriteMycel({ dryRun: false, enabled: undefined })).toBe(false);
  });
});
