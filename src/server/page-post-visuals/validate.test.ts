import { describe, expect, test } from "vitest";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkSpecSchema, extractDates, extractNumbers, validateSpec } from "./validate.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Spec = any;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const load = (f: string): Spec => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const note = (n: string) => fs.readFileSync(path.join(root, "test_notes", `sample-${n}.txt`), "utf8");
const spec = (n: string): Spec => load(`specs/samples/${n}.json`);
const DATES: Record<string, string> = { deal: "2026-10-06", credit: "2026-10-21", forecast: "2026-10-25" };

for (const n of ["deal", "credit", "forecast"]) {
  test(`sample ${n} passes (schema, figures, date label)`, () => {
    const r = validateSpec(spec(n), note(n), { date: DATES[n] });
    assert.equal(r.status, "valid", JSON.stringify(r));
  });
}

test("one altered number fails and is named", () => {
  const s = spec("deal");
  s.visual.total = "Up to $27,825,001";
  s.headline = s.headline.replace("$27,825,000", "$27,825,001");
  const r = validateSpec(s, note("deal"));
  assert.equal(r.status, "invalid");
  assert.deepEqual([...new Set(r.offending.map((o: { token: string }) => o.token))], ["$27825001"]);
});

test("an altered table figure in the credit spec fails", () => {
  const s = spec("credit");
  s.rows[2].value = "$85.5 million";
  const r = validateSpec(s, note("credit"));
  assert.equal(r.status, "invalid");
  assert.ok(r.offending.some((o: { token: string }) => o.token === "$85.5 million"));
});

test("an editorial word with no number passes (numbers only)", () => {
  const s = spec("deal");
  s.subhead = "Only a fraction of this staggering deal is cash. " + s.subhead;
  const r = validateSpec(s, note("deal"));
  assert.equal(r.status, "valid", JSON.stringify(r));
});

test("rounding is NOT allowed: $12.8M / $12.8 million against $12,825,000", () => {
  const body =
    "RadNet paid $12,825,000 in cash at closing. Total price is $27,825,000. Seller note $7,000,000. Earnout $8,000,000.\nSources\nX 8-K, 30 September 2026";
  for (const rounded of ["$12.8M", "$12.8 million", "$12.825 million"]) {
    const s = spec("deal");
    s.visual.tiles[0].value = rounded;
    s.visual.tiles[0].n = 12.825;
    const r = validateSpec(s, body);
    assert.equal(r.status, "invalid", rounded);
    assert.ok(
      r.offending.some((o: { path: string }) => o.path === "visual.tiles[0].value"),
      rounded,
    );
  }
});

test("thousands separators are normalised: $12,825,000 equals $12825000", () => {
  assert.deepEqual(extractNumbers("$12,825,000"), extractNumbers("$12825000"));
  assert.notDeepEqual(extractNumbers("$12.8 million"), extractNumbers("$12,825,000"));
});

test("unit words are part of the token: million is not billion", () => {
  const s = spec("credit");
  s.rows[2].value = "$85.0 billion";
  const r = validateSpec(s, note("credit"));
  assert.equal(r.status, "invalid");
});

test("dates: swapped month fails, reformatted day order passes", () => {
  assert.deepEqual(extractDates("30 September 2026").dates, extractDates("September 30, 2026").dates);
  const s = spec("deal");
  s.subhead = s.subhead.replace("September 30, 2026", "October 30, 2026");
  const r = validateSpec(s, note("deal"));
  assert.equal(r.status, "invalid");
  assert.ok(r.offending.some((o: { token: string }) => o.token === "2026-10-30"));
});

test("a number inside an identifier is not a token (CES6054000001, 8-K handled by the body)", () => {
  assert.deepEqual(extractNumbers("BLS series CES6054000001"), []);
});

test("dateLabel is checked against --date, not the body", () => {
  const r = validateSpec(spec("deal"), note("deal"), { date: "2026-10-07" });
  assert.equal(r.status, "invalid");
  assert.match(r.errors[0], /dateLabel/);
});

test("schema: missing field and wrong type value fail", () => {
  const s = spec("credit");
  delete s.visual.drawn;
  assert.equal(validateSpec(s, note("credit")).status, "invalid");
  const t = spec("credit");
  t.type = "the_call";
  assert.equal(validateSpec(t, note("credit")).status, "invalid");
});

test("the_call: threshold must equal last point and appear in the note", () => {
  const s = spec("forecast");
  s.visual.threshold = 10843.5;
  const r = validateSpec(s, note("forecast"));
  assert.equal(r.status, "invalid");
  assert.ok(r.errors.some((e: string) => e.includes("threshold")));
});

test("unsupported_type and unsupported_layout are recognised results, never specs", () => {
  assert.equal(validateSpec({ unsupported_type: "empty_body" }, "").status, "unsupported");
  assert.equal(
    validateSpec({ unsupported_layout: "deal_breakdown", reason: "no consideration stated" }, "").status,
    "unsupported",
  );
  assert.equal(validateSpec({ unsupported_type: "deal_breakdown" }, "").status, "invalid");
  assert.equal(validateSpec({ unsupported_layout: "deal_breakdown" }, "").status, "invalid");
});

describe("16x9 token set and the real schema", () => {
  test("the 16x9 deal variant is valid against the deal note", () => {
    const s = spec("deal-16x9");
    assert.equal(s.brand.tokenSet, "16x9");
    const r = validateSpec(s, note("deal"), { date: DATES.deal });
    assert.equal(r.status, "valid", JSON.stringify(r));
  });

  test("an unknown tokenSet is rejected by the schema", () => {
    const s = spec("deal");
    s.brand.tokenSet = "acme";
    const r = validateSpec(s, note("deal"));
    assert.equal(r.status, "invalid");
    assert.ok(r.errors.some((e: string) => e.includes("tokenSet")), JSON.stringify(r.errors));
    expect(checkSpecSchema(s).length).toBeGreaterThan(0);
  });

  test("the stand-in permissiveness is gone: a spec missing required fields is invalid", () => {
    for (const bad of [{}, { type: "deal_breakdown" }, { spec_version: "1.0", type: "deal_breakdown", brand: { wordmark: "16x9", tokenSet: "16x9" } }]) {
      const r = validateSpec(bad, note("deal"));
      assert.equal(r.status, "invalid", JSON.stringify(bad));
      assert.ok(r.errors.length > 0);
    }
  });

  test("geometry: a tile weight that disagrees with its displayed value fails", () => {
    const s = spec("deal-16x9");
    s.visual.tiles[0].n = 5;
    const r = validateSpec(s, note("deal"));
    assert.equal(r.status, "invalid");
    assert.ok(r.errors.some((e: string) => e.includes("visual.tiles[0].n")));
  });
});
