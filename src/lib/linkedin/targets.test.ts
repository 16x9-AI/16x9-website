import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COMPANY } from "./company";
import { writeTarget, type Row } from "./mycel";
import { publishTargets } from "./publisher";
import { readExistingTargets } from "./queue";
import { guardTargetWrite, targetData, type TargetWrite } from "./write-guard";

const POST = "11111111-1111-4111-8111-111111111111";
const UUID = "0b6f3c1e-5d0a-4a52-9a53-3f1c2f6f9a11";

function row(target: "company" | "personal", over: Partial<TargetWrite> = {}): TargetWrite {
  return {
    id: COMPANY.targetId(POST, target),
    postId: POST,
    target,
    status: "published",
    finalText: "Hello there",
    imageVersion: "v1",
    postUrn: "urn:li:share:1",
    idempotencyKey: "hash-abc",
    ...over,
  };
}

function recorder(read: Row[] | null) {
  const calls = {
    read: [] as string[][],
    update: [] as { id: string; data: Record<string, string> }[],
    insert: [] as Record<string, string>[],
  };
  const io = {
    read: async (table: string, column: string, value: string, limit?: number) => {
      calls.read.push([table, column, value, String(limit)]);
      return read;
    },
    update: async (_table: string, id: string, data: Record<string, string>) => {
      calls.update.push({ id, data });
      return { status: "received" as const };
    },
    insert: async (_table: string, data: Record<string, string>) => {
      calls.insert.push(data);
      return { status: "received" as const };
    },
  };
  return { calls, io };
}

describe("per-target delivery rows", () => {
  const prevBase = process.env.MYCEL_API_BASE;
  const prevKey = process.env.MYCEL_16X9_API_KEY;
  beforeEach(() => {
    process.env.MYCEL_API_BASE = "https://mycel.test";
    process.env.MYCEL_16X9_API_KEY = "test-key";
  });
  afterEach(() => {
    if (prevBase === undefined) delete process.env.MYCEL_API_BASE;
    else process.env.MYCEL_API_BASE = prevBase;
    if (prevKey === undefined) delete process.env.MYCEL_16X9_API_KEY;
    else process.env.MYCEL_16X9_API_KEY = prevKey;
  });

  it("allows target_key and idempotency_key and keeps the guard", () => {
    expect(guardTargetWrite(row("company"))).toEqual({ ok: true });
    expect(Object.keys(targetData(row("company")))).toEqual(
      expect.arrayContaining(["target_key", "idempotency_key"]),
    );
    expect(guardTargetWrite(row("company", { id: `${POST}:personal` })).ok).toBe(false);
  });

  it("inserts without a client id when no row has the target_key", async () => {
    const { calls, io } = recorder([]);
    const res = await writeTarget(row("company"), io);
    expect(res).toEqual({ status: "received" });
    expect(calls.read[0]).toEqual([COMPANY.targetsTable, "target_key", `${POST}:company`, "2"]);
    expect(calls.update).toHaveLength(0);
    expect(calls.insert).toHaveLength(1);
    expect(calls.insert[0]).not.toHaveProperty("id");
    expect(calls.insert[0]).toMatchObject({
      target_key: `${POST}:company`,
      idempotency_key: "hash-abc",
      post_id: POST,
      target: "company",
      status: "published",
    });
  });

  it("falls back to the logical key only when the hash is empty", async () => {
    const { calls, io } = recorder([]);
    await writeTarget(row("company", { idempotencyKey: "" }), io);
    expect(calls.insert[0]).toMatchObject({
      target_key: `${POST}:company`,
      idempotency_key: `${POST}:company`,
    });
  });

  it("a freshly inserted published row keeps the hash so a re-approval of identical text skips", async () => {
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = "true";
    const original = globalThis.fetch;
    try {
      const first = await publishTargets({
        postId: POST,
        targets: ["company"],
        finalText: "Hello there",
        imageVersion: "v1",
        existing: [],
        dispatch: async () => ({ postUrn: "urn:li:share:1" }),
      });
      expect(first.outcomes[0].status).toBe("published");

      const { calls, io } = recorder([]);
      await writeTarget(first.writes[0], io);
      const inserted = calls.insert[0];
      expect(inserted.idempotency_key).toBe(first.writes[0].idempotencyKey);
      expect(inserted.idempotency_key).not.toBe(`${POST}:company`);

      globalThis.fetch = (async () =>
        Response.json({ [COMPANY.targetsTable]: [{ id: UUID, ...inserted }] })) as typeof fetch;
      const existing = await readExistingTargets(POST);

      let dispatched = 0;
      const again = await publishTargets({
        postId: POST,
        targets: ["company"],
        finalText: "Hello there",
        imageVersion: "v1",
        existing,
        dispatch: async () => {
          dispatched += 1;
          return { postUrn: "urn:li:share:2" };
        },
      });
      expect(again.outcomes[0].status).toBe("skipped");
      expect(dispatched).toBe(0);
    } finally {
      globalThis.fetch = original;
      delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    }
  });

  it("patches the existing row by its uuid", async () => {
    const { calls, io } = recorder([{ id: UUID, target_key: `${POST}:company` }]);
    const res = await writeTarget(row("company", { status: "failed", error: "boom" }), io);
    expect(res).toEqual({ status: "received" });
    expect(calls.insert).toHaveLength(0);
    expect(calls.update).toHaveLength(1);
    expect(calls.update[0].id).toBe(UUID);
    expect(calls.update[0].data).toMatchObject({ status: "failed", error: "boom" });
  });

  it("never inserts when the read fails", async () => {
    const { calls, io } = recorder(null);
    const res = await writeTarget(row("company"), io);
    expect(res.status).toBe("error");
    expect(calls.insert).toHaveLength(0);
    expect(calls.update).toHaveLength(0);
  });

  it("refuses a bad write before any read", async () => {
    const { calls, io } = recorder([]);
    const res = await writeTarget(row("company", { id: "wrong" }), io);
    expect(res.status).toBe("error");
    expect(calls.read).toHaveLength(0);
  });

  it("reads existing targets by target_key, not the uuid", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      Response.json({
        [COMPANY.targetsTable]: [
          {
            id: UUID,
            target_key: `${POST}:company`,
            post_id: POST,
            target: "company",
            status: "published",
            idempotency_key: "hash-abc",
            post_urn: "urn:li:share:1",
          },
          { id: "uuid-2", post_id: POST, target: "personal", status: "failed" },
        ],
      })) as typeof fetch;
    try {
      const rows = await readExistingTargets(POST);
      expect(rows.map((r) => r.id)).toEqual([`${POST}:company`, `${POST}:personal`]);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("publisher matches the prior row by target_key and skips a repeat", async () => {
    const dispatched: string[] = [];
    const res = await publishTargets({
      postId: POST,
      targets: ["company"],
      finalText: "Hello there",
      imageVersion: "v1",
      existing: [],
      dispatch: async (agent) => {
        dispatched.push(agent);
        return { postUrn: "urn:li:share:1" };
      },
    });
    const key = res.writes[0]?.idempotencyKey ?? "";
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = "true";
    try {
      const again = await publishTargets({
        postId: POST,
        targets: ["company"],
        finalText: "Hello there",
        imageVersion: "v1",
        existing: [
          { id: `${POST}:company`, status: "published", idempotencyKey: key, postUrn: "urn:li:share:1" },
        ],
        dispatch: async () => ({ postUrn: "urn:li:share:2" }),
      });
      expect(again.outcomes[0].status).toBe("skipped");
      const uuidKeyed = await publishTargets({
        postId: POST,
        targets: ["company"],
        finalText: "Hello there",
        imageVersion: "v1",
        existing: [{ id: UUID, status: "published", idempotencyKey: key, postUrn: "urn:li:share:1" }],
        dispatch: async () => ({ postUrn: "urn:li:share:2" }),
      });
      expect(uuidKeyed.outcomes[0].status).toBe("published");
    } finally {
      delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    }
  });

  it("one target failing writes only its own row", async () => {
    process.env.X9_LINKEDIN_PUBLISHER_ENABLED = "true";
    try {
      const res = await publishTargets({
        postId: POST,
        targets: ["company", "personal"],
        finalText: "Hello there",
        imageVersion: "v1",
        existing: [],
        dispatch: async (_agent, body) =>
          body.target === "company" ? { error: "linkedin said no" } : { postUrn: "urn:li:share:9" },
      });
      const byTarget = Object.fromEntries(res.writes.map((w) => [w.target, w]));
      expect(byTarget.company).toMatchObject({ id: `${POST}:company`, status: "failed" });
      expect(byTarget.personal).toMatchObject({ id: `${POST}:personal`, status: "published" });

      const { calls, io } = recorder([{ id: UUID, target_key: `${POST}:company` }]);
      await writeTarget(byTarget.company, io);
      expect(calls.read[0][2]).toBe(`${POST}:company`);
      expect(calls.update.map((u) => u.id)).toEqual([UUID]);
      expect(calls.update[0].data.target).toBe("company");
      expect(calls.update[0].data).not.toHaveProperty("post_urn");
    } finally {
      delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
    }
  });
});
