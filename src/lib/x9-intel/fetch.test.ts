import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import {
  buildPayload,
  extractParagraphs,
  fetchSources,
  isPublicHttpUrl,
  pickPrimaryLinks,
  readReport,
  readReportFile,
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

describe("pickPrimaryLinks", () => {
  const page = "https://news.example/story";
  const l = (url: string, text = "the announcement") => ({ url, text });
  const pick = (links: { url: string; text: string }[], max = 10, exclude?: Set<string>, from = page) =>
    pickPrimaryLinks(from, links, { max, exclude });

  it("keeps cross-domain links, drops same-domain ones (www and subdomains ignored)", () => {
    expect(
      pick([
        l("https://corp.example/post"),
        l("https://www.news.example/other"),
        l("https://blog.news.example/x"),
      ]),
    ).toEqual(["https://corp.example/post"]);
    expect(pick([l("https://www.news.example/a")], 5, undefined, "https://www.corp.example/")).toEqual([
      "https://www.news.example/a",
    ]);
  });

  it("treats co.uk style suffixes as one registrable domain", () => {
    const from = "https://www.bbc.co.uk/news/1";
    expect(pick([l("https://news.bbc.co.uk/x"), l("https://other.co.uk/y"), l("https://bbc.com/z")], 10, undefined, from)).toEqual([
      "https://other.co.uk/y",
      "https://bbc.com/z",
    ]);
  });

  it("drops denied hosts and their subdomains, keeps apple.com and substack.com", () => {
    expect(
      pick([
        l("https://news.google.com/a"),
        l("https://docs.google.com/b"),
        l("https://x.com/c"),
        l("https://mobile.twitter.com/d"),
        l("https://www.youtube.com/e"),
        l("https://en.wikipedia.org/f"),
        l("https://apple.com/g"),
        l("https://some.substack.com/h"),
      ]),
    ).toEqual(["https://apple.com/g", "https://some.substack.com/h"]);
  });

  it("drops sign-in, subscribe and similar paths, and file downloads (query ignored)", () => {
    expect(
      pick([
        l("https://a.example/sign-in"),
        l("https://a.example/Login?next=1"),
        l("https://a.example/subscribe"),
        l("https://a.example/share/1"),
        l("https://a.example/report.PDF"),
        l("https://a.example/report.pdf?dl=1"),
        l("https://a.example/img.webp"),
        l("https://a.example/research/paper"),
      ]),
    ).toEqual(["https://a.example/research/paper"]);
  });

  it("drops non-http(s) links and anchors with fewer than 3 non-space characters", () => {
    expect(
      pick([
        l("mailto:a@b.example"),
        l("ftp://b.example/f"),
        l("https://a.example/1", " a  b "),
        l("https://a.example/2", ""),
        l("https://a.example/3", "abc"),
      ]),
    ).toEqual(["https://a.example/3"]);
  });

  it("strips hashes, honours exclude, dedupes and caps at max in document order", () => {
    const links = [
      l("https://a.example/1#top"),
      l("https://a.example/1#other"),
      l("https://b.example/2"),
      l("https://c.example/3"),
      l("https://d.example/4"),
    ];
    expect(pick(links, 10, new Set(["https://b.example/2"]))).toEqual([
      "https://a.example/1",
      "https://c.example/3",
      "https://d.example/4",
    ]);
    expect(pick(links, 2)).toEqual(["https://a.example/1", "https://b.example/2"]);
    expect(pick(links, 0)).toEqual([]);
  });
});

describe("fetchSources primary-source discovery", () => {
  const news = (links: string) => `<p>${LONG} Read the <a href="${links}">official announcement</a>.</p>`;
  const stubFor = (pages: Record<string, string>) =>
    vi.fn(async (url: RequestInfo | URL) => {
      const body = pages[String(url)];
      return body === undefined ? new Response("nope", { status: 404 }) : html(body);
    });
  const run = (stub: ReturnType<typeof stubFor>, episodes: { links: string[] }[], extra = {}) =>
    fetchSources(episodes, { fetch: stub as unknown as typeof fetch, ...extra });

  it("follows a primary link from a news page and records via", async () => {
    const stub = stubFor({
      "https://news.example/a": news("https://corp.example/launch#x"),
      "https://corp.example/launch": `<p>${LONG} Primary text.</p>`,
    });
    const out = await run(stub, [{ links: ["https://news.example/a"] }]);
    expect(out).toHaveLength(2);
    expect(out[1]).toEqual({
      episode_index: 0,
      url: "https://corp.example/launch",
      paragraphs: [`${LONG} Primary text.`],
      via: "https://news.example/a",
    });
    expect(out[0].via).toBeUndefined();
  });

  it("resolves relative links and decodes entities in hrefs", async () => {
    const stub = stubFor({
      "https://news.example/a": `<p>${LONG} <a href="https://corp.example/p?a=1&amp;b=2">the paper</a></p>`,
      "https://corp.example/p?a=1&b=2": `<p>${LONG}</p>`,
    });
    const out = await run(stub, [{ links: ["https://news.example/a"] }]);
    expect(out[1].url).toBe("https://corp.example/p?a=1&b=2");
  });

  it("skips the episode's own links and does not fetch a URL twice", async () => {
    const stub = stubFor({
      "https://news.example/a": news("https://other.example/b"),
      "https://other.example/b": news("https://news.example/a#frag"),
    });
    const out = await run(stub, [{ links: ["https://news.example/a", "https://other.example/b"] }]);
    expect(out.map((s) => s.url)).toEqual(["https://news.example/a", "https://other.example/b"]);
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it("maxLinkedPerEpisode=0 disables discovery; the cap limits it otherwise", async () => {
    const page = `<p>${LONG} <a href="https://c1.example/">first one</a> <a href="https://c2.example/">second one</a> <a href="https://c3.example/">third one</a></p>`;
    const pages = { "https://news.example/a": page, "https://c1.example/": `<p>${LONG}</p>`, "https://c2.example/": `<p>${LONG}</p>`, "https://c3.example/": `<p>${LONG}</p>` };
    const off = await run(stubFor(pages), [{ links: ["https://news.example/a"] }], { maxLinkedPerEpisode: 0 });
    expect(off).toHaveLength(1);
    const dflt = await run(stubFor(pages), [{ links: ["https://news.example/a"] }]);
    expect(dflt.map((s) => s.url)).toEqual(["https://news.example/a", "https://c1.example/", "https://c2.example/"]);
  });

  it("respects the run-wide maxLinkedTotal", async () => {
    const pages: Record<string, string> = {};
    const episodes = [0, 1, 2].map((n) => {
      pages[`https://news.example/${n}`] = news(`https://corp${n}.example/x`);
      pages[`https://corp${n}.example/x`] = `<p>${LONG}</p>`;
      return { links: [`https://news.example/${n}`] };
    });
    const out = await run(stubFor(pages), episodes, { maxLinkedTotal: 2 });
    expect(out.filter((s) => s.via !== undefined).map((s) => s.url)).toEqual([
      "https://corp0.example/x",
      "https://corp1.example/x",
    ]);
  });

  it("truncates linked paragraphs to linkedMaxChars, whole paragraphs first", async () => {
    const para = (c: string) => c.repeat(50);
    const stub = stubFor({
      "https://news.example/a": news("https://corp.example/long"),
      "https://corp.example/long": `<p>${para("a")}</p><p>${para("b")}</p><p>${para("c")}</p>`,
    });
    const out = await run(stub, [{ links: ["https://news.example/a"] }], { linkedMaxChars: 120 });
    expect(out[1].paragraphs).toEqual([para("a"), para("b"), "c".repeat(20)]);
  });

  it("does not recurse from linked pages", async () => {
    const stub = stubFor({
      "https://news.example/a": news("https://corp.example/p"),
      "https://corp.example/p": news("https://deep.example/q"),
      "https://deep.example/q": `<p>${LONG}</p>`,
    });
    const out = await run(stub, [{ links: ["https://news.example/a"] }]);
    expect(out.map((s) => s.url)).toEqual(["https://news.example/a", "https://corp.example/p"]);
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it("records a failing linked fetch with error and via, without throwing", async () => {
    const stub = stubFor({ "https://news.example/a": news("https://gone.example/x") });
    const out = await run(stub, [{ links: ["https://news.example/a"] }]);
    expect(out[1]).toEqual({
      episode_index: 0,
      url: "https://gone.example/x",
      paragraphs: [],
      via: "https://news.example/a",
      error: "HTTP 404",
    });
  });
});

describe("isPublicHttpUrl", () => {
  it("accepts public hosts and public IP literals", () => {
    for (const u of [
      "https://corp.example/post",
      "http://sub.news.example:8080/a?b=1",
      "https://8.8.8.8/",
      "https://172.15.0.1/",
      "https://172.32.0.1/",
      "https://100.63.0.1/",
      "https://100.128.0.1/",
      "https://[2606:4700::1111]/",
      "https://[::ffff:8.8.8.8]/",
      "https://192.0.1.1/",
      "https://198.17.0.1/",
      "https://198.20.0.1/",
      "https://223.255.255.254/",
      "https://[64:ff9b::808:808]/",
      "https://[2002:808:808::1]/",
      "https://[::808:808]/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(true);
    }
  });

  it("rejects non-http(s), userinfo, single-label and reserved names", () => {
    for (const u of [
      "ftp://corp.example/f",
      "file:///etc/passwd",
      "javascript:alert(1)",
      "not a url",
      "https://user@corp.example/",
      "https://user:pw@corp.example/",
      "http://intranet/",
      "http://localhost/",
      "http://LOCALHOST:3000/",
      "http://app.localhost/",
      "http://printer.local/",
      "http://db.internal/",
      "http://metadata.google.internal/computeMetadata/v1/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(false);
    }
  });

  it("rejects private, loopback, link-local, CGNAT and metadata IPv4 literals", () => {
    for (const u of [
      "http://127.0.0.1/",
      "http://127.255.255.254/",
      "http://10.1.2.3/",
      "http://172.16.0.1/",
      "http://172.31.255.255/",
      "http://192.168.1.1/",
      "http://169.254.169.254/latest/meta-data/",
      "http://100.64.0.1/",
      "http://100.127.255.255/",
      "http://0.0.0.0/",
      "http://0.1.2.3/",
      "http://2130706433/", // decimal form of 127.0.0.1, normalised by URL
      "http://0x7f.1/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(false);
    }
  });

  it("rejects private IPv6 literals, including IPv4-mapped ones", () => {
    for (const u of [
      "http://[::1]/",
      "http://[::]/",
      "http://[fc00::1]/",
      "http://[fd12:3456::1]/",
      "http://[fe80::1]/",
      "http://[febf::1]/",
      "http://[::ffff:127.0.0.1]/",
      "http://[::ffff:169.254.169.254]/",
      "http://[::ffff:10.0.0.1]/",
      "http://[::ffff:c0a8:101]/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(false);
    }
  });
});

describe("isPublicHttpUrl extended reserved ranges", () => {
  it("rejects IPv4 documentation, benchmarking, IETF, multicast and reserved ranges", () => {
    for (const u of [
      "http://192.0.0.1/",
      "http://192.0.0.255/",
      "http://192.0.2.1/",
      "http://198.18.0.1/",
      "http://198.19.255.254/",
      "http://198.51.100.7/",
      "http://203.0.113.9/",
      "http://224.0.0.1/",
      "http://239.255.255.250/",
      "http://240.0.0.1/",
      "http://255.255.255.255/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(false);
    }
  });

  it("rejects IPv6 site-local, multicast and documentation ranges", () => {
    for (const u of [
      "http://[fec0::1]/",
      "http://[feff::1]/",
      "http://[ff00::1]/",
      "http://[ff02::1]/",
      "http://[2001:db8::1]/",
      "http://[2001:db8:ffff::1]/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(false);
    }
  });

  it("applies the IPv4 rules to embedded addresses (IPv4-compatible, NAT64, 6to4)", () => {
    for (const u of [
      "http://[::127.0.0.1]/",
      "http://[::10.0.0.1]/",
      "http://[::192.0.2.1]/",
      "http://[::ffff:198.18.0.1]/",
      "http://[::ffff:224.0.0.1]/",
      "http://[64:ff9b::127.0.0.1]/",
      "http://[64:ff9b::a00:1]/",
      "http://[64:ff9b::169.254.169.254]/",
      "http://[64:ff9b::203.0.113.5]/",
      "http://[2002:7f00:1::]/",
      "http://[2002:a9fe:a9fe::1]/",
      "http://[2002:c0a8:101::1]/",
      "http://[2002:cb00:7109::1]/",
      "http://[2002:ffff:ffff::1]/",
    ]) {
      expect(isPublicHttpUrl(u), u).toBe(false);
    }
  });
});

describe("pickPrimaryLinks safety and filters", () => {
  const page = "https://news.example/story";
  const l = (url: string, text = "the announcement") => ({ url, text });
  const pick = (links: { url: string; text: string }[]) => pickPrimaryLinks(page, links, { max: 20 });

  it("drops non-public links", () => {
    expect(
      pick([
        l("http://169.254.169.254/latest"),
        l("http://localhost:8080/admin"),
        l("https://user:pw@corp.example/x"),
        l("http://intranet/wiki"),
        l("https://corp.example/ok"),
      ]),
    ).toEqual(["https://corp.example/ok"]);
  });

  it("matches DENY_PATH on whole path segments only", () => {
    const kept = [
      "https://a.example/shareholder-letter",
      "https://a.example/investors/shares",
      "https://a.example/registered-offering",
      "https://a.example/termsheet",
      "https://a.example/cookbook",
    ];
    const dropped = [
      "https://a.example/share",
      "https://a.example/share/1",
      "https://a.example/login",
      "https://a.example/privacy",
      "https://a.example/newsletter/x",
      "https://a.example/newsletters",
      "https://a.example/about/terms",
      "https://a.example/cookie-policy",
      "https://a.example/privacy.html",
    ];
    expect(pick([...kept, ...dropped].map((u) => l(u)))).toEqual(kept);
  });

  it("drops affiliate and click-tracking redirect links", () => {
    const dropped = [
      "https://go.vendor.example/c/123/456",
      "https://click.vendor.example/c/abc",
      "https://links.vendor.example/page?subId=9",
      "https://track.vendor.example/page?u1=abc",
      "https://redirect.vendor.example/page?clickref=zz",
      "https://goto.vendor.example/x?subid1=1",
      "https://shop.sjv.io/abc",
      "https://x.pxf.io/abc",
      "https://www.anrdoezrs.net/click-1",
      "https://www.dpbolvw.net/click-1",
      "https://www.kqzyfj.net/click-1",
      "https://www.jdoqocy.com/click-1",
      "https://www.tkqlhce.com/click-1",
      "https://www.awin1.com/cread.php?x=1",
      "https://click.linksynergy.com/deeplink",
      "https://www.shareasale.com/r.cfm",
      "https://x.impactradius-event.com/a",
      "https://go.skimresources.com/?id=1",
      "https://amzn.to/3abc",
      "https://www.amazon.com/gp/product/B000?tag=site-20",
    ];
    const kept = [
      "https://go.vendor.example/docs", // "go" host without a tracking path or param
      "https://www.amazon.com/gp/product/B000", // no tag
      "https://www.amazon.com/dp/B000?tag=site-20", // not a /gp/ path
      "https://vendor.example/c/123", // /c/ on a normal host
    ];
    expect(pick([...dropped, ...kept].map((u) => l(u)))).toEqual(kept);
  });
});

describe("fetchSources hardening", () => {
  const news = (href: string) => `<p>${LONG} Read the <a href="${href}">official announcement</a>.</p>`;
  const redirect = (location: string, status = 302) =>
    new Response(null, { status, headers: { location } });
  const withUrl = (res: Response, url: string) => {
    Object.defineProperty(res, "url", { value: url });
    return res;
  };
  const stubWith = (handler: (url: string, init?: RequestInit) => Response | Promise<Response>) =>
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => handler(String(url), init));
  const run = (stub: ReturnType<typeof stubWith>, links: string[], extra = {}) =>
    fetchSources([{ links }], { fetch: stub as unknown as typeof fetch, ...extra });

  it("records a linked page redirecting to a metadata IP as 'blocked redirect' without fetching it", async () => {
    const stub = stubWith((url) => {
      if (url === "https://news.example/a") return html(news("https://corp.example/p"));
      if (url === "https://corp.example/p") return redirect("http://169.254.169.254/latest/meta-data/");
      return new Response("should not be fetched", { status: 200 });
    });
    const out = await run(stub, ["https://news.example/a"]);
    expect(out[1]).toEqual({
      episode_index: 0,
      url: "https://corp.example/p",
      paragraphs: [],
      via: "https://news.example/a",
      error: "blocked redirect",
    });
    expect(stub.mock.calls.map((c) => String(c[0]))).not.toContain("http://169.254.169.254/latest/meta-data/");
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it("fetches linked pages with redirect manual and follows relative Location hops itself", async () => {
    const stub = stubWith((url) => {
      if (url === "https://news.example/a") return html(news("https://corp.example/old"));
      if (url === "https://corp.example/old") return redirect("/new");
      if (url === "https://corp.example/new") return html(`<p>${LONG} Moved here.</p>`);
      return new Response("nope", { status: 404 });
    });
    const out = await run(stub, ["https://news.example/a"]);
    expect(out[1]).toMatchObject({ url: "https://corp.example/old", paragraphs: [`${LONG} Moved here.`] });
    expect(out[1].error).toBeUndefined();
    const linkedCalls = stub.mock.calls.filter((c) => String(c[0]).startsWith("https://corp.example"));
    expect(linkedCalls.map((c) => String(c[0]))).toEqual(["https://corp.example/old", "https://corp.example/new"]);
    expect(linkedCalls.every((c) => c[1]?.redirect === "manual")).toBe(true);
  });

  it("gives up after 5 redirect hops on a linked page", async () => {
    let n = 0;
    const stub = stubWith((url) => {
      if (url === "https://news.example/a") return html(news("https://corp.example/r0"));
      n++;
      return redirect(`https://corp.example/r${n}`);
    });
    const out = await run(stub, ["https://news.example/a"]);
    expect(out[1].error).toBe("too many redirects");
    // initial request + 5 followed hops
    expect(stub.mock.calls.filter((c) => String(c[0]).startsWith("https://corp.example"))).toHaveLength(6);
  });

  it("keeps redirect follow for episode links, but never fetches a non-public one", async () => {
    const stub = stubWith((url) => html(`<p>${LONG}</p>`));
    const out = await run(stub, ["https://a.example/1", "http://169.254.169.254/latest", "http://localhost/x"]);
    expect(stub).toHaveBeenCalledTimes(1);
    expect(stub.mock.calls[0][1]?.redirect).toBe("follow");
    expect(out[0].paragraphs).toEqual([LONG]);
    expect(out[1]).toMatchObject({ paragraphs: [], error: "blocked URL" });
    expect(out[2]).toMatchObject({ paragraphs: [], error: "blocked URL" });
  });

  it("uses the final URL of an episode redirect for the domain comparison; via keeps the original", async () => {
    const stub = stubWith((url) => {
      if (url === "https://short.example/x") {
        return withUrl(
          html(
            `<p>${LONG} <a href="/more">same site story</a> <a href="https://corp.example/doc">the filing</a></p>`,
          ),
          "https://news.example/story",
        );
      }
      if (url === "https://corp.example/doc") return html(`<p>${LONG} Filing text.</p>`);
      return new Response("nope", { status: 404 });
    });
    const out = await run(stub, ["https://short.example/x"]);
    expect(out.map((s) => s.url)).toEqual(["https://short.example/x", "https://corp.example/doc"]);
    expect(out[1].via).toBe("https://short.example/x");
    // /more resolved against the final URL is same-domain, so it is not picked.
    expect(stub.mock.calls.map((c) => String(c[0]))).not.toContain("https://news.example/more");
  });

  it("does not pick a link that points at an episode page's final URL", async () => {
    const stub = stubWith((url) => {
      if (url === "https://short.example/x") {
        return withUrl(html(`<p>${LONG} nothing to follow here at all.</p>`), "https://corp.example/doc");
      }
      if (url === "https://news.example/a") return html(news("https://corp.example/doc#section"));
      return new Response("nope", { status: 404 });
    });
    const out = await run(stub, ["https://short.example/x", "https://news.example/a"]);
    expect(out.map((s) => s.url)).toEqual(["https://short.example/x", "https://news.example/a"]);
    expect(stub).toHaveBeenCalledTimes(2);
  });

  it("takes links only from kept paragraphs, not boilerplate, duplicates or short blocks", async () => {
    const page = [
      `<p>Subscribe to our newsletter: <a href="https://spam.example/sub">sign up here</a> for the daily briefing.</p>`,
      `<p>Short <a href="https://short.example/s">link text</a></p>`,
      `<p>${LONG} <a href="https://keep.example/doc">the document</a></p>`,
      `<p>${LONG} <a href="https://keep.example/doc">the document</a></p>`,
      `<p>${LONG} but a dupe-text variant? <a href="https://other.example/y">another doc</a></p>`,
    ].join("");
    const stub = stubWith((url) => {
      if (url === "https://news.example/a") return html(page);
      return html(`<p>${LONG}</p>`);
    });
    const out = await run(stub, ["https://news.example/a"], { maxLinkedPerEpisode: 10 });
    expect(out.map((s) => s.url)).toEqual([
      "https://news.example/a",
      "https://keep.example/doc",
      "https://other.example/y",
    ]);
  });

  it("ignores links in paragraphs past the 60-paragraph cap", async () => {
    const many = Array.from({ length: 60 }, (_, n) => `<p>${LONG} Number ${n}.</p>`).join("");
    const stub = stubWith((url) =>
      url === "https://news.example/a"
        ? html(`${many}<p>${LONG} Number 61. <a href="https://late.example/doc">late doc</a></p>`)
        : html(`<p>${LONG}</p>`),
    );
    const out = await run(stub, ["https://news.example/a"]);
    expect(out).toHaveLength(1);
  });

  it("drops affiliate links found on a page", async () => {
    const stub = stubWith((url) =>
      url === "https://news.example/a"
        ? html(
            `<p>${LONG} <a href="https://go.vendor.example/c/1/2">buy it</a> <a href="https://www.dpbolvw.net/click-1">deal</a> <a href="https://corp.example/real">the source</a></p>`,
          )
        : html(`<p>${LONG}</p>`),
    );
    const out = await run(stub, ["https://news.example/a"]);
    expect(out.map((s) => s.url)).toEqual(["https://news.example/a", "https://corp.example/real"]);
    expect(stub).toHaveBeenCalledTimes(2);
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

describe("buildPayload via", () => {
  it("passes via through unchanged", () => {
    const sources = [{ episode_index: 0, url: "https://c.example", paragraphs: [LONG], via: "https://n.example" }];
    expect(buildPayload({ date: "2026-11-24", episodes: [{}] }, sources).sources).toEqual(sources);
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

describe("summarizeRun linked", () => {
  it("reports linked counts separately, without URLs or text", () => {
    const line = summarizeRun({
      report_date: "2026-11-24",
      episodes: [],
      sources: [
        { episode_index: 0, url: "https://secret.example/x", paragraphs: [LONG] },
        { episode_index: 0, url: "https://secret.example/l1", paragraphs: [LONG], via: "https://secret.example/x" },
        { episode_index: 0, url: "https://secret.example/l2", paragraphs: [], via: "https://secret.example/x", error: "HTTP 404" },
      ],
    });
    expect(line).toBe("x9-intel-fetch 2026-11-24: 0 episodes, sources 1 ok / 0 failed, linked 1 ok / 1 failed");
    expect(line).not.toMatch(/secret|paragraph/);
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

describe("readReportFile", () => {
  const dir = mkdtempSync(join(tmpdir(), "x9-report-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const write = (name: string, content: string) => {
    const p = join(dir, name);
    writeFileSync(p, content);
    return p;
  };
  const blobSha = (b: Buffer) => createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex");
  const raw = JSON.stringify({ date: "2026-11-24", episodes: [{ title: "A" }] });

  it("returns the git blob sha, equal to what readReport gives for the same bytes", async () => {
    const p = write("ok.json", raw);
    const file = await readReportFile(p, { expectedDate: "2026-11-24" });
    expect(file.sha).toBe(blobSha(Buffer.from(raw)));
    const stub = vi.fn(async () => new Response(raw));
    const api = await readReport("2026-11-24", { token: "t", fetch: stub as unknown as typeof fetch });
    expect(file.sha).toBe(api.sha);
    expect(file.report).toEqual(api.report);
  });

  it("fails with a fixed message that does not quote invalid JSON", async () => {
    const MARKER = "SECRET-REPORT-TEXT-MARKER";
    const p = write("bad.json", `{"episodes": ${MARKER}`);
    const err = await readReportFile(p).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toMatch(/not valid JSON/);
    expect((err as Error).message).not.toContain(MARKER);
  });

  it("fails when episodes is missing or the file is missing", async () => {
    const p = write("noep.json", JSON.stringify({ date: "2026-11-24" }));
    await expect(readReportFile(p)).rejects.toThrow(/no episodes array/);
    await expect(readReportFile(join(dir, "absent.json"))).rejects.toThrow(/could not be read/);
  });

  it("fails on a date mismatch without printing either date", async () => {
    const p = write("mismatch.json", raw);
    const err = await readReportFile(p, { expectedDate: "2026-11-23" }).catch((e: Error) => e);
    expect((err as Error).message).toMatch(/does not match --date/);
    expect((err as Error).message).not.toContain("2026-11-2");
  });

  it("takes the date from the report when --date is omitted, and requires YYYY-MM-DD", async () => {
    const out = await readReportFile(write("d.json", raw));
    expect(out.date).toBe("2026-11-24");
    expect(out.report.date).toBe("2026-11-24");
    const bad = write("nodate.json", JSON.stringify({ date: "24/11/2026", episodes: [] }));
    await expect(readReportFile(bad)).rejects.toThrow(/no valid date/);
    const none = write("nodate2.json", JSON.stringify({ episodes: [] }));
    await expect(readReportFile(none)).rejects.toThrow(/no valid date/);
  });

  it("fills in the date from --date when the report has none", async () => {
    const p = write("fill.json", JSON.stringify({ episodes: [] }));
    const out = await readReportFile(p, { expectedDate: "2026-11-24" });
    expect(out.report.date).toBe("2026-11-24");
  });
});
