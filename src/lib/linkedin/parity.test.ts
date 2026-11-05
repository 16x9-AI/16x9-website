import { describe, expect, it } from "vitest";
import { passesArticleGate, visibleArticles } from "./articles";
import { approveLabel, buildDecisionPlan, destinationFromChecks, targetsFor } from "./posts";
import { publicationKey, publishTargets } from "./publisher";
import { publisherEnabled } from "./company";
import { figuresNotInNote } from "./figures";
import { proseNotInNote } from "./prose";
import { describeVisual, resolveCurrent, type VisualRow } from "./visuals";
import { guardPostPlan } from "./write-guard";
import { isTeamEmail, teamNotifyRecipients } from "./team";
import { handleDecide } from "./decide";
import { handleOtpStart } from "./auth";
import { safeNext } from "./next-url";
import { toVisual, readExistingTargets } from "./queue";
import { resetDraftClaims, runAgent, submitLinkedInPostPlan } from "./mycel";
import { regeneratePostVisual, type RegenDeps } from "./regen";
import { authorizeCron, sweepPageVisuals } from "./sweep";
import { selectDailyEpisode } from "./research";
import {
  createChallenge,
  CHALLENGE_COOKIE,
  generateCode,
  resetThrottle,
  verifyChallenge,
  type CookieStore,
} from "./otp";
import { upsertRow, writeTarget } from "./mycel";
import { mintSessionToken, readSessionToken } from "./session-token";
import { fixtureArticles } from "./fixtures";
import type { PagePost } from "./posts";
import type { TargetWrite } from "./write-guard";

const ID = "11111111-1111-4111-8111-111111111111";

function memoryJar(): CookieStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    get: (name) => values.get(name),
    set: (name, value, maxAge) => {
      if (!value || maxAge <= 0) values.delete(name);
      else values.set(name, value);
    },
  };
}

function draft(over: Partial<PagePost> = {}): PagePost {
  return {
    id: ID,
    noteId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    noteTitle: "A note",
    noteUrl: "/articles/a-note",
    draftText: "Original draft.",
    finalText: "",
    status: "drafted",
    destination: "neither",
    decidedBy: "",
    decidedAt: "",
    postUrn: "",
    error: "",
    createdAt: "2026-11-05T08:00:00.000Z",
    ...over,
  };
}

describe("decision plan", () => {
  it("stores the exact trimmed text and refuses a blank or oversized post", () => {
    const planned = buildDecisionPlan({
      id: ID,
      decision: "approve",
      text: "  Kept as written.  ",
      actor: "nelson.sanmiguel@16x9.ai",
      at: "2026-11-05T12:00:00.000Z",
      destination: "company",
    });
    expect(planned.status).toBe("planned");
    if (planned.status !== "planned") return;
    expect(planned.plan.ops).toHaveLength(1);
    expect(planned.plan.ops[0].data.final_text).toBe("Kept as written.");
    expect(planned.plan.ops[0].data).not.toHaveProperty("post_urn");
    expect(planned.plan.ops[0].data).not.toHaveProperty("published_at");
    expect(guardPostPlan(planned.plan).ok).toBe(true);

    expect(
      buildDecisionPlan({ id: ID, decision: "approve", text: "   ", actor: "a@16x9.ai", at: "t" })
        .status,
    ).toBe("invalid");
    expect(
      buildDecisionPlan({
        id: ID,
        decision: "approve",
        text: "x".repeat(3001),
        actor: "a@16x9.ai",
        at: "t",
      }).status,
    ).toBe("invalid");
    expect(
      buildDecisionPlan({ id: "nope", decision: "reject", actor: "a@16x9.ai", at: "t" }).status,
    ).toBe("invalid");
  });

  it("refuses publisher fields and a second table", () => {
    const planned = buildDecisionPlan({ id: ID, decision: "reject", actor: "a@16x9.ai", at: "t" });
    if (planned.status !== "planned") throw new Error("expected a plan");
    planned.plan.ops[0].data.post_urn = "urn:li:share:1";
    expect(guardPostPlan(planned.plan)).toEqual({
      ok: false,
      reason: "post_urn is owned by the publisher",
    });
  });
});

describe("destinations", () => {
  it("maps the two checkboxes and names them on the button", () => {
    expect(destinationFromChecks(false, false)).toBe("neither");
    expect(destinationFromChecks(true, false)).toBe("company");
    expect(destinationFromChecks(false, true)).toBe("personal");
    expect(destinationFromChecks(true, true)).toBe("both");
    expect(targetsFor("both")).toEqual(["company", "personal"]);
    expect(targetsFor("neither")).toEqual([]);
    expect(approveLabel("company")).toMatch(/16x9 company page/);
    expect(approveLabel("personal")).toMatch(/Nelson personal/);
    expect(approveLabel("neither")).toMatch(/no LinkedIn destination/);
  });
});

describe("team gate", () => {
  it("allows the 16x9 domain and Nelson, and does not copy Frontier Desk defaults", () => {
    expect(isTeamEmail("nelson.sanmiguel@16x9.ai")).toBe(true);
    expect(isTeamEmail("someone@16x9.ai")).toBe(true);
    expect(isTeamEmail("person@frontierdesk.ai")).toBe(false);
    expect(isTeamEmail("colton@aeonsyndicate.com")).toBe(false);
    expect(teamNotifyRecipients()).toEqual([]);
  });
});

describe("handleDecide", () => {
  function deps(post: PagePost | null, extra: Partial<Parameters<typeof handleDecide>[1]> = {}) {
    const writes: TargetWrite[] = [];
    const calls: string[] = [];
    const base = {
      session: async () => ({ email: "nelson.sanmiguel@16x9.ai" }),
      getPost: async () => post,
      submit: async () => ({ status: "received" as const }),
      existingTargets: async () => [],
      writeTarget: async (row: TargetWrite) => {
        writes.push(row);
        return { status: "received" };
      },
      publish: publishTargets,
      notify: async () => {
        calls.push("notify");
      },
      now: () => "2026-11-05T12:00:00.000Z",
      ...extra,
    };
    return { deps: base, writes, calls };
  }

  it("returns 403, 409 and 404 without writing", async () => {
    const noSession = deps(draft(), { session: async () => null });
    const forbidden = await handleDecide(
      new Request("https://16x9.ai/api", { method: "POST", body: "{}" }),
      noSession.deps,
    );
    expect(forbidden.status).toBe(403);

    const outsider = deps(draft(), { session: async () => ({ email: "a@frontierdesk.ai" }) });
    expect(
      (
        await handleDecide(
          new Request("https://16x9.ai/api", {
            method: "POST",
            body: JSON.stringify({ id: ID, decision: "reject" }),
          }),
          outsider.deps,
        )
      ).status,
    ).toBe(403);

    const stale = deps(draft({ status: "approved" }));
    const conflict = await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({
          id: ID,
          decision: "approve",
          text: "Hello",
          destination: "company",
        }),
      }),
      stale.deps,
    );
    expect(conflict.status).toBe(409);
    expect(stale.writes).toHaveLength(0);

    const missing = deps(null);
    expect(
      (
        await handleDecide(
          new Request("https://16x9.ai/api", {
            method: "POST",
            body: JSON.stringify({ id: ID, decision: "reject" }),
          }),
          missing.deps,
        )
      ).status,
    ).toBe(404);
  });

  it("rejects without publishing and approves neither without a publisher call", async () => {
    const previous = process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = "true";
    const rejected = deps(draft());
    const calls: string[] = [];
    rejected.deps.publish = async (input) => {
      calls.push(input.targets.join(","));
      return { outcomes: [], writes: [] };
    };
    const res = await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({ id: ID, decision: "reject", text: "no" }),
      }),
      rejected.deps,
    );
    expect(res.status).toBe(200);
    expect(calls).toEqual([]);

    const neither = deps(draft());
    neither.deps.publish = async () => {
      calls.push("publish");
      return { outcomes: [], writes: [] };
    };
    await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({
          id: ID,
          decision: "approve",
          text: "Hello",
          destination: "neither",
        }),
      }),
      neither.deps,
    );
    expect(calls).toEqual([]);
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = previous;
  });

  it("rejects a draft whose text is over 3000 characters", async () => {
    const huge = "x".repeat(3001);
    const rejected = deps(draft());
    const res = await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({ id: ID, decision: "reject", text: huge }),
      }),
      rejected.deps,
    );
    expect(res.status).toBe(200);
    expect(rejected.writes).toEqual([]);
  });

  it("keeps the publisher disabled and records both targets independently", async () => {
    const previous = process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    expect(publisherEnabled()).toBe(false);
    const both = deps(draft());
    const dispatched: string[] = [];
    both.deps.publish = (input) =>
      publishTargets({
        ...input,
        dispatch: async (agent) => {
          dispatched.push(agent);
          return { postUrn: "urn" };
        },
      });
    const res = await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({
          id: ID,
          decision: "approve",
          text: "Hello there",
          destination: "both",
        }),
      }),
      both.deps,
    );
    expect(res.status).toBe(200);
    expect(dispatched).toEqual([]);
    expect(both.writes.map((row) => row.target).sort()).toEqual(["company", "personal"]);
    expect(both.writes.every((row) => row.status === "approved")).toBe(true);
    expect(new Set(both.writes.map((row) => row.id)).size).toBe(2);
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = previous;
  });

  it("does not let one target's failure overwrite the other", async () => {
    const previous = process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = "true";
    const both = deps(draft());
    both.deps.publish = (input) =>
      publishTargets({
        ...input,
        dispatch: async (_agent, body) => {
          if (body.target === "company") return { error: "company token missing" };
          return { postUrn: "urn:li:share:personal" };
        },
      });
    await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({
          id: ID,
          decision: "approve",
          text: "Hello there",
          destination: "both",
        }),
      }),
      both.deps,
    );
    const company = both.writes.find((row) => row.target === "company");
    const personal = both.writes.find((row) => row.target === "personal");
    expect(company?.status).toBe("failed");
    expect(company?.error).toMatch(/company token/);
    expect(personal?.status).toBe("published");
    expect(personal?.postUrn).toBe("urn:li:share:personal");
    expect(company?.id).not.toBe(personal?.id);
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = previous;
  });

  it("skips a second publish of the same text and image", async () => {
    const key = publicationKey(ID, "company", "Hello there", "");
    const calls: string[] = [];
    const result = await publishTargets({
      postId: ID,
      targets: ["company"],
      finalText: "Hello there",
      imageVersion: "",
      existing: [
        {
          id: `${ID}:company`,
          status: "published",
          idempotencyKey: key,
          postUrn: "urn:li:share:1",
        },
      ],
      dispatch: async () => {
        calls.push("dispatch");
        return { postUrn: "urn:li:share:2" };
      },
    });
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = "true";
    const again = await publishTargets({
      postId: ID,
      targets: ["company"],
      finalText: "Hello there",
      imageVersion: "",
      existing: [
        {
          id: `${ID}:company`,
          status: "published",
          idempotencyKey: key,
          postUrn: "urn:li:share:1",
        },
      ],
      dispatch: async () => {
        calls.push("dispatch");
        return {};
      },
    });
    expect(again.outcomes[0].status).toBe("skipped");
    expect(calls).toEqual([]);
    expect(
      result.outcomes[0].status === "disabled" || result.outcomes[0].status === "skipped",
    ).toBe(true);
    delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
  });
});

describe("image regeneration", () => {
  it("keeps the draft and the previous image when a new draw fails", async () => {
    const stored = new Map<
      string,
      { kind: "image"; url: string } | { kind: "failure"; reason: string }
    >();
    stored.set(`${ID}-baseversion1`, { kind: "image", url: "https://blob.example/old.png" });
    const row: VisualRow = {
      postId: ID,
      noteId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      kind: "spec",
      spec: {
        subhead: "A sentence from the note.",
        visual: { kind: "statement", text: "A sentence from the note." },
      },
      reason: "",
    };
    const note = {
      title: "Title",
      body: "A sentence from the note.\n\nMore.",
      publishedAt: "2026-11-05",
    };
    const deps: RegenDeps = {
      blobReady: () => true,
      getPost: async () => draft(),
      getVisual: async () => row,
      readChoice: async () => null,
      findStored: async (_id, version) => stored.get(`${ID}-${version}`) ?? null,
      storePng: async () => "https://blob.example/new.png",
      storeFailure: async (_id, version, reason) => {
        stored.set(`${ID}-${version}`, { kind: "failure", reason });
      },
      storeChoice: async () => undefined,
      noteFor: async () => note,
      requestSpec: async () => ({ status: "error", detail: "no alternative" }),
      draw: async () => ({ status: "error", reason: "renderer crashed" }),
    };
    const version = (await import("./blob-store")).visualVersion(row.noteId, row.spec);
    stored.set(`${ID}-${version}`, { kind: "image", url: "https://blob.example/old.png" });
    const result = await regeneratePostVisual(ID, "nelson.sanmiguel@16x9.ai", deps);
    expect(result.status).toBe("error");
    expect(stored.get(`${ID}-${version}`)).toEqual({
      kind: "image",
      url: "https://blob.example/old.png",
    });
  });

  it("refuses a non-draft", async () => {
    const deps: RegenDeps = {
      blobReady: () => true,
      getPost: async () => draft({ status: "approved" }),
      getVisual: async () => null,
      readChoice: async () => null,
      findStored: async () => null,
      storePng: async () => "",
      storeFailure: async () => undefined,
      storeChoice: async () => undefined,
      noteFor: async () => null,
      requestSpec: async () => ({ status: "not_configured" }),
      draw: async () => ({ status: "error", reason: "no" }),
    };
    const result = await regeneratePostVisual(ID, "nelson.sanmiguel@16x9.ai", deps);
    expect(result).toMatchObject({ status: "error", code: 409 });
  });
});

describe("figures and prose", () => {
  const note = "The facility is $12.8 million, dated 30 Sep 2026.";
  it("rejects an invented or rounded figure and a sentence that is not in the note", () => {
    const invented = figuresNotInNote({ headline: "$12.825 million" }, note, "Title");
    expect(invented.some((item) => item.token.startsWith("$12.825"))).toBe(true);
    const exact = figuresNotInNote({ headline: "$12.8 million" }, note, "Title");
    expect(exact).toEqual([]);
    expect(proseNotInNote({ subhead: "A sentence nobody wrote." }, note, "Title").length).toBe(1);
    expect(
      proseNotInNote(
        { subhead: "The facility is $12.8 million, dated 30 Sep 2026" },
        note,
        "Title",
      ),
    ).toEqual([]);
  });
});

describe("visual state", () => {
  it("does not invent an image when nothing is stored, and keeps a chosen image only for the same base spec", () => {
    const row: VisualRow = {
      postId: ID,
      noteId: "n",
      kind: "spec",
      spec: { headline: "One" },
      reason: "",
    };
    expect(describeVisual(row, null)).toEqual({ state: "pending" });
    expect(describeVisual(row, { kind: "failure", reason: "overflow" })).toEqual({
      state: "none",
      reason: "overflow",
    });
    const current = resolveCurrent(row, {
      v: "abc",
      base: "stale",
      spec: { headline: "Two" },
      kinds: ["g"],
      at: "",
      by: "",
    });
    expect(current.chosen).toBe(false);
    expect(current.spec).toEqual(row.spec);
  });
});

describe("articles and research", () => {
  it("hides a short unsourced row and keeps a sourced article", () => {
    const visible = visibleArticles(fixtureArticles());
    expect(visible.map((article) => article.slug)).toEqual(["what-a-sourced-note-has-to-carry"]);
    expect(
      passesArticleGate({
        status: "published",
        audience: "private",
        title: "T",
        slug: "t",
        body: "x".repeat(800),
        sources: [{ name: "S", url: "https://example.com" }],
      }),
    ).toBe(false);
  });

  it("selects one sourced episode and ignores chatter without a source", () => {
    const episode = selectDailyEpisode({
      date: "2026-11-05",
      items: [
        { title: "No source", summary: "Just a headline.", score: 9 },
        {
          title: "The sourced one",
          summary: "Read at the original page.",
          score: 2,
          sources: [{ title: "Filing", url: "https://example.com/filing" }],
        },
        { title: "Louder", summary: "Also sourced.", score: 5, url: "https://example.com/louder" },
      ],
    });
    expect(episode?.title).toBe("Louder");
    expect(
      selectDailyEpisode({ date: "2026-11-05", items: [{ title: "Chat", summary: "No link." }] }),
    ).toBeNull();
  });
});

describe("auth and cron gates", () => {
  it("round-trips a session token and an OTP challenge", async () => {
    const secret = "test-secret-test-secret-test-secret";
    const token = await mintSessionToken("nelson.sanmiguel@16x9.ai", secret);
    expect((await readSessionToken(token, secret))?.email).toBe("nelson.sanmiguel@16x9.ai");
    expect(await readSessionToken(token, "other-secret-other-secret-other")).toBeNull();

    resetThrottle();
    const jar = memoryJar();
    const code = generateCode();
    await createChallenge("nelson.sanmiguel@16x9.ai", code, secret, jar);
    expect(await verifyChallenge("nelson.sanmiguel@16x9.ai", "000000", secret, jar)).toBe(
      "invalid_code",
    );
    expect(await verifyChallenge("nelson.sanmiguel@16x9.ai", code, secret, jar)).toBe("ok");
  });

  it("blocks a sweep that is not the cron and a targeted run without the bearer", async () => {
    delete process.env.CRON_SECRET;
    delete process.env.X9_PAGE_VISUALS_SECRET;
    expect(authorizeCron(new Request("https://16x9.ai/api/cron/page-post-visuals"))?.status).toBe(
      403,
    );
    expect(
      authorizeCron(
        new Request("https://16x9.ai/api/cron/page-post-visuals", {
          headers: { "user-agent": "vercel-cron/1" },
        }),
      )?.status,
    ).toBe(403);
    process.env.CRON_SECRET = "cron-secret";
    expect(
      authorizeCron(
        new Request("https://16x9.ai/api/cron/page-post-visuals", {
          headers: { authorization: "Bearer cron-secret", "user-agent": "curl/8" },
        }),
      ),
    ).toBeNull();
    const targeted = authorizeCron(
      new Request("https://16x9.ai/api/cron/page-post-visuals?post=" + ID, {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );
    expect(targeted?.status).toBe(403);
    process.env.X9_PAGE_VISUALS_SECRET = "local-secret";
    const allowed = authorizeCron(
      new Request("https://16x9.ai/api/cron/page-post-visuals?force=1", {
        headers: { authorization: "Bearer local-secret" },
      }),
    );
    expect(allowed).toBeNull();
    delete process.env.X9_PAGE_VISUALS_SECRET;
    delete process.env.CRON_SECRET;

    const sweep = await sweepPageVisuals(
      {
        candidates: async () => [ID],
        inspect: async () => ({
          postId: ID,
          version: "v1",
          spec: { headline: "Hi" },
          note: { title: "T", body: "Hi" },
          stored: true,
        }),
        storeFailure: async () => undefined,
        storePng: async () => undefined,
        draw: async () => ({ status: "rendered", png: Buffer.from("png") }),
      },
      { configured: true },
    );
    expect(sweep.outcomes[0].result).toBe("already_stored");
  });

  it("does not let a replayed OTP cookie reset the attempt count", async () => {
    resetThrottle();
    const secret = "test-secret-test-secret-test-secret";
    const jar = memoryJar();
    const code = "123456";
    await createChallenge("nelson.sanmiguel@16x9.ai", code, secret, jar);
    const original = jar.values.get(CHALLENGE_COOKIE) ?? "";
    for (let i = 0; i < 5; i++) {
      jar.set(CHALLENGE_COOKIE, original, 600);
      expect(await verifyChallenge("nelson.sanmiguel@16x9.ai", "000000", secret, jar)).toBe(
        "invalid_code",
      );
    }
    jar.set(CHALLENGE_COOKIE, original, 600);
    expect(await verifyChallenge("nelson.sanmiguel@16x9.ai", code, secret, jar)).toBe(
      "too_many_attempts",
    );
  });
});

describe("review fixes", () => {
  it("rejects a draft that is over the 3000-character limit", async () => {
    const huge = "x".repeat(3001);
    const planned = buildDecisionPlan({
      id: ID,
      decision: "reject",
      text: huge,
      actor: "a@16x9.ai",
      at: "t",
    });
    expect(planned.status).toBe("planned");
    if (planned.status !== "planned") return;
    expect(planned.plan.ops[0].data.status).toBe("rejected");
    expect(planned.plan.ops[0].data.final_text).toBeUndefined();
    expect(
      buildDecisionPlan({
        id: ID,
        decision: "approve",
        text: huge,
        actor: "a@16x9.ai",
        at: "t",
      }).status,
    ).toBe("invalid");
  });

  it("inserts a target row when the update finds nothing, and skips the insert when it lands", async () => {
    const missed: string[] = [];
    const inserted = await upsertRow(
      "x9_linkedin_page_targets",
      `${ID}:company`,
      { target: "company", post_id: ID },
      {
        update: async () => {
          missed.push("update");
          return { status: "missing" };
        },
        insert: async (table, id, data) => {
          missed.push(`insert:${table}:${id}:${data.target}`);
          return { status: "received" };
        },
      },
    );
    expect(inserted.status).toBe("received");
    expect(missed).toEqual(["update", `insert:x9_linkedin_page_targets:${ID}:company:company`]);

    const landed: string[] = [];
    await upsertRow(
      "x9_linkedin_page_targets",
      `${ID}:personal`,
      { target: "personal" },
      {
        update: async () => {
          landed.push("update");
          return { status: "received" };
        },
        insert: async () => {
          landed.push("insert");
          return { status: "received" };
        },
      },
    );
    expect(landed).toEqual(["update"]);
  });

  it("writeTarget posts the row after a 404 patch", async () => {
    const prevBase = process.env.MYCEL_API_BASE;
    const prevKey = process.env.MYCEL_16X9_API_KEY;
    const prevPublisher = process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    process.env.MYCEL_API_BASE = "https://mycel.test";
    process.env.MYCEL_16X9_API_KEY = "test-key";
    delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    const calls: { method: string; body: Record<string, string> }[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      calls.push({
        method: init?.method || "GET",
        body: JSON.parse(String(init?.body || "{}")) as Record<string, string>,
      });
      if (init?.method === "PATCH") return new Response("no row", { status: 404 });
      return new Response("{}", { status: 201 });
    }) as typeof fetch;
    try {
      const result = await writeTarget({
        id: `${ID}:company`,
        postId: ID,
        target: "company",
        status: "approved",
        finalText: "Hello there",
        imageVersion: "",
        idempotencyKey: "key",
      });
      expect(result.status).toBe("received");
      expect(calls.map((call) => call.method)).toEqual(["PATCH", "POST"]);
      expect(calls[1].body.id).toBe(`${ID}:company`);
      expect(calls[1].body.target).toBe("company");
      expect(calls[1].body.final_text).toBe("Hello there");
    } finally {
      globalThis.fetch = original;
      if (prevBase === undefined) delete process.env.MYCEL_API_BASE;
      else process.env.MYCEL_API_BASE = prevBase;
      if (prevKey === undefined) delete process.env.MYCEL_16X9_API_KEY;
      else process.env.MYCEL_16X9_API_KEY = prevKey;
      if (prevPublisher === undefined) delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
      else process.env.X9_LINKEDIN_PUBLISHER_ENABLED = prevPublisher;
    }
  });
});

describe("review follow-ups", () => {
  it("does not email a code to a non-team address and caps sends per IP", async () => {
    resetThrottle();
    const prevSecret = process.env.AUTH_SECRET;
    const prevEcho = process.env.X9_OTP_DEV_ECHO;
    const prevNode = process.env.NODE_ENV;
    process.env.AUTH_SECRET = "test-secret-test-secret-test-secret";
    process.env.X9_OTP_DEV_ECHO = "1";
    process.env.NODE_ENV = "test";
    const jar = memoryJar();
    try {
      const outsider = await handleOtpStart(
        new Request("https://16x9.ai/api/auth/otp/start", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
          body: JSON.stringify({ email: "outsider@gmail.com" }),
        }),
        jar,
      );
      const body = (await outsider.json()) as {
        status?: string;
        devCode?: string;
        delivery?: string;
      };
      expect(outsider.status).toBe(200);
      expect(body.status).toBe("code_sent");
      expect(body.devCode).toBeUndefined();
      expect(jar.values.get(CHALLENGE_COOKIE)).toBeUndefined();

      const team = await handleOtpStart(
        new Request("https://16x9.ai/api/auth/otp/start", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
          body: JSON.stringify({ email: "nelson.sanmiguel@16x9.ai" }),
        }),
        jar,
      );
      const teamBody = (await team.json()) as { devCode?: string };
      expect(teamBody.devCode).toMatch(/^\d{6}$/);

      resetThrottle();
      let blocked = 0;
      for (let i = 0; i < 9; i++) {
        const res = await handleOtpStart(
          new Request("https://16x9.ai/api/auth/otp/start", {
            method: "POST",
            headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.20" },
            body: JSON.stringify({ email: `member${i}@16x9.ai` }),
          }),
          memoryJar(),
        );
        if (res.status === 429) blocked += 1;
      }
      expect(blocked).toBe(1);
    } finally {
      if (prevSecret === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = prevSecret;
      if (prevEcho === undefined) delete process.env.X9_OTP_DEV_ECHO;
      else process.env.X9_OTP_DEV_ECHO = prevEcho;
      if (prevNode === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = prevNode;
      resetThrottle();
    }
  });

  it("keeps only a same-origin path for the post-login redirect", () => {
    const origin = "https://16x9.ai";
    expect(safeNext("/team", origin)).toBe("/team");
    expect(safeNext("/articles?q=1", origin)).toBe("/articles?q=1");
    expect(safeNext("/\\evil.example", origin)).toBe("/team");
    expect(safeNext("/\t/evil.example", origin)).toBe("/team");
    expect(safeNext("https://evil.example/phish", origin)).toBe("/team");
    expect(safeNext("//evil.example", origin)).toBe("/team");
  });

  it("does not reset the OTP budget when a new code is requested", async () => {
    resetThrottle();
    const secret = "test-secret-test-secret-test-secret";
    const jar = memoryJar();
    await createChallenge("locked@16x9.ai", "111111", secret, jar);
    const original = jar.values.get(CHALLENGE_COOKIE) ?? "";
    for (let i = 0; i < 5; i++) {
      jar.set(CHALLENGE_COOKIE, original, 600);
      expect(await verifyChallenge("locked@16x9.ai", "000000", secret, jar)).toBe("invalid_code");
    }
    await createChallenge("locked@16x9.ai", "222222", secret, jar);
    const fresh = jar.values.get(CHALLENGE_COOKIE) ?? "";
    jar.set(CHALLENGE_COOKIE, original, 600);
    expect(await verifyChallenge("locked@16x9.ai", "111111", secret, jar)).toBe(
      "too_many_attempts",
    );
    jar.set(CHALLENGE_COOKIE, fresh, 600);
    expect(await verifyChallenge("locked@16x9.ai", "222222", secret, jar)).toBe(
      "too_many_attempts",
    );
  });

  it("parses a string visual spec the same way on every read", () => {
    const row = toVisual({
      post_id: ID,
      note_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      kind: "spec",
      spec: JSON.stringify({ headline: "Hi" }),
      reason: "",
    });
    expect(row.spec).toEqual({ headline: "Hi" });
    expect(
      toVisual({ ...row, spec: "{", kind: "spec", post_id: ID, note_id: "n" }).spec,
    ).toBeNull();
  });

  it("reads stored target rows and passes the image version into the approval", async () => {
    const prevBase = process.env.MYCEL_API_BASE;
    const prevKey = process.env.MYCEL_16X9_API_KEY;
    const prevPublisher = process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    process.env.MYCEL_API_BASE = "https://mycel.test";
    process.env.MYCEL_16X9_API_KEY = "test-key";
    delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    const original = globalThis.fetch;
    globalThis.fetch = (async (url: string) => {
      if (String(url).includes("x9_linkedin_page_targets")) {
        return Response.json({
          x9_linkedin_page_targets: [
            {
              id: `${ID}:company`,
              post_id: ID,
              status: "published",
              idempotency_key: "already",
              post_urn: "urn:li:share:1",
            },
          ],
        });
      }
      return Response.json({});
    }) as typeof fetch;
    try {
      const rows = await readExistingTargets(ID);
      expect(rows[0]).toMatchObject({
        id: `${ID}:company`,
        status: "published",
        idempotencyKey: "already",
        postUrn: "urn:li:share:1",
      });
    } finally {
      globalThis.fetch = original;
    }

    const writes: TargetWrite[] = [];
    const res = await handleDecide(
      new Request("https://16x9.ai/api", {
        method: "POST",
        body: JSON.stringify({
          id: ID,
          decision: "approve",
          text: "Hello there",
          destination: "company",
        }),
      }),
      {
        session: async () => ({ email: "nelson.sanmiguel@16x9.ai" }),
        getPost: async () => draft(),
        submit: async () => ({ status: "received" as const }),
        existingTargets: async () => [],
        writeTarget: async (row) => {
          writes.push(row);
          return { status: "received" };
        },
        publish: publishTargets,
        notify: async () => undefined,
        now: () => "2026-11-05T12:00:00.000Z",
        imageVersion: async () => "abc123def456",
      },
    );
    expect(res.status).toBe(200);
    expect(writes[0]?.imageVersion).toBe("abc123def456");
    expect(publisherEnabled()).toBe(false);
    if (prevBase === undefined) delete process.env.MYCEL_API_BASE;
    else process.env.MYCEL_API_BASE = prevBase;
    if (prevKey === undefined) delete process.env.MYCEL_16X9_API_KEY;
    else process.env.MYCEL_16X9_API_KEY = prevKey;
    if (prevPublisher === undefined) delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    else process.env.X9_LINKEDIN_PUBLISHER_ENABLED = prevPublisher;
  });

  it("lets only one drafted update win, and polls a Mycel run instead of reading the stream as JSON", async () => {
    resetDraftClaims();
    const prevBase = process.env.MYCEL_API_BASE;
    const prevKey = process.env.MYCEL_16X9_API_KEY;
    const prevPoll = process.env.X9_AGENT_POLL_MS;
    process.env.MYCEL_API_BASE = "https://mycel.test";
    process.env.MYCEL_16X9_API_KEY = "test-key";
    process.env.X9_AGENT_POLL_MS = "1";
    const urls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      const href = String(url);
      urls.push(`${init?.method || "GET"} ${href}`);
      if (href.includes("/run/stream")) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"run_id":"run-1"}\n\n'));
            controller.close();
          },
        });
        return new Response(stream, { status: 200 });
      }
      if (href.includes("/runs/run-1")) {
        return Response.json({
          status: "completed",
          output: { spec: { headline: "Hi" }, post_urn: "urn:li:share:9" },
        });
      }
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    try {
      const built = buildDecisionPlan({ id: ID, decision: "reject", actor: "a@16x9.ai", at: "t" });
      if (built.status !== "planned") throw new Error("expected a plan");
      const first = await submitLinkedInPostPlan(built.plan);
      const second = await submitLinkedInPostPlan(built.plan);
      expect(first.status).toBe("received");
      expect(second.status).toBe("conflict");
      const patches = urls.filter((line) => line.startsWith("PATCH"));
      expect(patches).toHaveLength(1);
      expect(patches[0]).toContain("only_if");
      expect(decodeURIComponent(patches[0])).toContain('"status":"drafted"');

      const run = await runAgent("x9_linkedin_page_publisher", { mode: "publish", post_id: ID });
      expect(run.status).toBe("ok");
      if (run.status === "ok") {
        expect(run.output.spec).toEqual({ headline: "Hi" });
        expect(run.output.post_urn).toBe("urn:li:share:9");
      }
      expect(urls.some((line) => line.includes("/runs/run-1"))).toBe(true);
    } finally {
      globalThis.fetch = original;
      resetDraftClaims();
      if (prevBase === undefined) delete process.env.MYCEL_API_BASE;
      else process.env.MYCEL_API_BASE = prevBase;
      if (prevKey === undefined) delete process.env.MYCEL_16X9_API_KEY;
      else process.env.MYCEL_16X9_API_KEY = prevKey;
      if (prevPoll === undefined) delete process.env.X9_AGENT_POLL_MS;
      else process.env.X9_AGENT_POLL_MS = prevPoll;
    }
  });
});
