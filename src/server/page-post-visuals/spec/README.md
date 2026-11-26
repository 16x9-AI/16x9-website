# Visual spec for /intel images (layouts F, F flexible, G)

Ported from Frontier Desk's `spec/README.md`. 16x9 adds the `16x9` token set next to `frontier-desk`; every rule below is unchanged.

One JSON spec drives one image. `schema.json` is the contract, `validate.mjs` is the guard, `engine.mjs` is the renderer entry point (`index.mjs` launches Chromium around it). Every published note gets an image.

```
node validate.mjs <spec.json> <note.txt> [--date YYYY-MM-DD] [--title "note title"]   # FD CLI form; not yet ported, use validateSpec() from validate.mjs
npx vitest run src/server/page-post-visuals
```

Exit codes in the FD CLI: `0` valid / rendered, `1` invalid, or the page cannot fit at the minimum sizes, `2` usage, `3` the agent returned `unsupported_type` / `unsupported_layout` (malformed input only, no image).

Not yet ported from FD (16X9-1672, later parts): `templates/`, fonts, the Chromium render and fit engine, `extract_prompt.md`, `--all` / `--stress` batch renders and the sha256 baselines. Sections below that describe them record the FD rules the port must keep.

## Spec shape

`spec_version` ("1.0" or "1.1"), `type` (`deal_breakdown` | `lender_watch` | `the_call` | `build_out_tracker` | `week_in_five` | `owner_explainer` | `explainer` | `field_report` | `other`), `brand` (`wordmark`, `tokenSet`, optional `footerUrl`; `tokenSet` is `frontier-desk` or `16x9`), `chrome` (`typeLabel`, `dateLabel`, `source`), `headline`, `subhead`, and one of:

- `visual` (drawn by `templates/F.html`; the same system as F-deal, F-credit, F-forecast): `kind` is one of `tiles`, `facility`, `chart` (the three approved layouts) or the flexible `amount`, `facilities`, `bars`, `callcard`, `statement`. Table variants also carry `rowsHeader` and `rows`.
- `g` (drawn by `G-buildout`, `G-explainer` or `G-week`, chosen by `type`; `field_report` uses the `G-week` ledger).

"F flexible" means the same header wordmark, loop asset and position, fonts, colours, hatching, footer and spacing rhythm, with the blocks arranged to the figures the note states. The approved F and G designs are untouched: the renderer reproduces F-deal, F-credit and G-* byte for byte (sha256 recorded in `out/baseline.sha`, checked by the FD test suite).

The variant is chosen from the data shape (table in `extract_prompt.md`). Judgement calls the audit left open: two parts or an unusual split use `amount` with the parts as `facts` (three named parts with a contingent third remain `tiles`); principal plus fee uses `facility` (fee in the hatched slot); sizes without a drawn amount use `facilities`; a sector study uses `bars`; a note with no figure that is the item's own measure uses `statement`.

Pipeline results that are not specs: `{"unsupported_type": "<type>"}` and `{"unsupported_layout": "<type>", "reason": "..."}`. They are now only for malformed input (empty body, missing title); a real note always gets a variant, ending at `statement`.

Token sets: `frontier-desk` and `16x9`, both registered in `TOKEN_SETS` in `engine.mjs`. Other firms: add a token set there, its css and loop asset, and extend the `tokenSet` enum in `schema.json`. A set missing from the enum fails the schema; a set in the enum but missing from `TOKEN_SETS` throws in `toNote`.

## It must always fit: the fit engine

`templates/common.js` runs `fitPage` after every template mounts. It measures the real page (`pageIssues`): text or boxes outside the canvas or the 80 px margins, scroll overflow, text spilling out of its parent box, text colliding with the footer or the loop, overlapping fuel labels, SVG text outside its viewport. While an issue exists it shrinks the font of the group that owns the offending element, two px (or one) at a time, never below the group's minimum. A page that already fits is not touched, which is why approved images stay pixel-identical. If an issue remains with every group at its minimum, the renderer refuses with `CANNOT FIT AT MIN SIZE` and the issue names, and no PNG is accepted. Nothing is clipped silently. The statement variant does the opposite: it grows from 24 up to 64 px to fill the box it is given, so the canvas is filled with type.

Minimum font sizes (px). Base sizes are what the approved designs use.

| text | base | minimum |
|---|---|---|
| F headline | 78 / 68 / 56 by length | 40 |
| F and G subhead | 27 (F), 24 (G) | 19 (F), 17 (G) |
| F total next to the label | 62 | 34 |
| tile value (tiles, facility, amount facts, facilities, call card) | 44 (112 / 80 for the single amount, 60 call card, 52 facilities) | 22 |
| tile name / detail | 18 to 22 | 14 / 12 |
| table row title / sub / value | 31 / 17 / 23 | 20 / 13 / 15 |
| chart and call card probability | 128 | 64 |
| bars: label / count | 30 / 21 | 18 / 14 |
| statement text / point text | up to 64 / 23 | 24 / 16 |
| G headline | 68 / 64 / 58 / 56 | 40 |
| G build-out: queue value / fuel value / fuel name | 46 / 30 / 18 | 30 / 18 / 12 |
| G explainer: bar value / tile big / question | 34 / 64 / 31 | 20 / 30 / 20 |
| G week: figure / company / document | 44 (40 two figures, 34 descriptor) / 36 / 23 | 22 / 22 / 15 |
| footer source | 16 | 12 |

## Approach for invented numbers: verbatim in the note (no `source_text`)

Every displayed figure is a string, and the validator requires its tokens to appear verbatim in the note body or its title. We chose this over storing a `source_text` per figure because the check needs no trust in the extractor: the extractor cannot attest to its own quotes. Limit: it proves a figure exists in the note, not that it sits in the right slot (two real figures swapped would pass). The geometry checks below and human review of the first renders cover that.

## What is checked

1. Schema (`schema.json`, JSON Schema 2020-12 via ajv).
2. Displayed strings: all strings except `brand`, `type`, `spec_version`, `kind`, `seriesId`, `chrome.dateLabel`.
3. Dates are pulled out first and compared as calendar dates: `2026-10-27`, `October 27, 2026`, `27 October 2026`, `Oct 27, 2026` all equal. Month and year only (`December 2026`) matches the same month-year in the note, or any full date in that month. A swapped month or day fails.
4. Number tokens in the rest: `$`?, digits, optional decimals, optional `%`, optional unit word (`thousand|million|billion|trillion`). Every token must be in the note's token set (the title counts as part of the note).
5. `chrome.dateLabel` must equal `--date` formatted `Mon D, YYYY` (the publication date is metadata, not in the body). Skipped if `--date` is absent.
6. Geometry that must agree with what is shown: `tiles[].n`, `facility.drawn.n`, `bars.items[].n` within 1 percent of the displayed value; `callcard.base.hit` and `total` are the two figures of the displayed rate; `chart` threshold equals the last point and is a number in the note and the axis covers the points; build-out `rows[].n`, `fuel[].n` and `total`, explainer `bars[].n` agree with their displayed values.

## Exactly what is normalised

- Whitespace (including no-break spaces) collapses to one space.
- Thousands separators are removed from numbers: `$12,825,000` equals `$12825000`.
- Unit words are lower-cased.
- Dates are canonicalised as above.

Nothing else. In particular `$` is part of the token, and the unit word is part of the token (`$85.0 million` is not `$85.0 billion` and not `$85.0`).

## Rounding: not allowed

`$12.8M`, `$12.8 million` and `$12.825 million` all fail against a note that says `$12,825,000`. Re-expressing a figure in another unit is rounding for this purpose. The validator reports the offending token and its path.

## Not covered (numbers only)

Editorial words that carry no number pass. Spelled-out numbers ("twelve", "fifty percent") are not tokens. Layout weights (`n`, `meter`, chart `points`, `hit`, `total`) are never displayed and are matched only by the geometry checks in item 6. Chart `points` come from the series feed, not the note: for BUSLOANS and TOTCI the feed is FRED, last point set to the figure the note states because FRED revises H.8 data after publication.

## Determinism

Chrome runs with default flags on purpose: any software-raster flag (`--disable-gpu`, `--disable-gpu-rasterization`) changes the approved text pixels (max channel difference 71 on F-deal), so the approved F and G images could no longer be reproduced.

Findings. Chrome's GPU raster is not repeatable for a few elements: (1) an SVG stroke on a fractional box, (2) glyphs of the 128 px call probability (differences of one grey level in about 100 pixels), (3) the 96 px amount figure, (4) the wide hatched bar of G-explainer. Fixes in the templates, not in the flags: the chart line, dashed threshold and end dot are painted by hand into a canvas from exact distances (`F.html`, `__afterFit`); the probability and amount figures are painted by a software canvas (`data-rt`, `rasterTexts` in `common.js`). F-forecast is stable (12 of 12 identical runs) and visually unchanged; its sha256 is the new reference. G-explainer's wide hatch is NOT fixed: it renders in one of two states (about 5 in 6 runs give the approved sha256 `05829fcd...`), so the sha check leaves it out and the batch render renders each image until two consecutive renders are byte-identical (up to 6 attempts). Under heavy CPU load (parallel Chrome runs) the flake rate rises.

## Test fixtures

`fixtures/test_notes/sample-*.txt` are reconstructed from the facts of the FD notes. `fixtures/specs/samples/` are the approved F specs with the `frontier-desk` token set, plus `deal-16x9.json`, the deal sample with the `16x9` token set; it validates against the same note. FD also keeps one spec per published note (`specs/all/`), the real note bodies, and `test_notes/stress/` (synthetic, never published; `stress/must_fail/` must be refused). Those are not ported yet.
