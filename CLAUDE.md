# 16x9 Website — Conventions

**Status: repositioned 2026-09-02 (branch `studio-repositioning`).** The site presents 16x9 as an AI studio that builds agentic companies. Copy rules live in `VOICE.md`; read it before touching any user-facing string. Brand tokens are live in `src/styles.css` (monochrome, radius 0, Instrument Serif display, Geist body, Geist Mono labels).

## Stack

- Vite + React 19 + TypeScript
- TanStack Router (file-based routing in `src/routes/`)
- TanStack Start (SSR) with the Nitro Vercel preset (see `vite.config.ts`); deployed on Vercel as project `16x9-website`
- Tailwind CSS v4 (single source: `src/styles.css`)
- shadcn/ui primitives in `src/components/ui/` (mostly unused on the public pages; kept as building blocks)
- Framer Motion for entry/scroll reveals (`Reveal`)
- Site-specific components live in `src/components/site/`

Build: `npm run build` · Dev: `npm run dev` · Preview: `npm run preview` · Lint: `npm run lint` · Format: `npm run format` · Typecheck: `npx tsc --noEmit -p tsconfig.json`

## Routes

- `/` — `routes/index.tsx`. Frames in order: front page (headline, lede + email, audience index, live proof card, horizon motif), marquee (computed status tally), the board (five industry columns with motifs and status rows), the studio + figures + Mycel plate with the studio-wide strip beneath, contact (two doors).
- `/privacy`, `/terms` — legal. Also verification-sensitive.
- `/intel` — NOT a router route. `vercel.json` rewrites `/intel` and `/intel/*` onto the daily AI intelligence report deployment (`16x9-ai-industry-daily-report.vercel.app`). Link to it with a plain `<a href="/intel">`, never `<Link to>`.
- `src/routeTree.gen.ts` — generated on dev/build. Never hand-edit.

## Content rules that are also code rules

- **No company names on the public site.** Work is described by industry (VOICE.md, decision 2026-09-02). If a card needs a name to make sense, rewrite the card.
- **Status tags are audited, not decorative.** `FrameCell` takes `status: "Running" | "Pilot" | "Building"`. Check Linear before changing one. The audit date is in the comment above the `work` array in `index.tsx`.
- **Mycel counts are dated.** The spec rows carry rounded-down counts pulled from the Mycel catalog; the exact numbers and date are in the comment above `mycelSpecs`. Update both together.
- **The Google sentence ships verbatim** on `/` (the standalone `/mycel` page was removed 2026-09-03 at the founders' request; the privacy policy still carries the scope detail): "Mycel connects to Google on your behalf for sign-in and basic Workspace directory information only, not Gmail, Calendar, or Drive content."

## Motion

All illustration on the homepage is generative and drawn live in `src/components/site/Motif.tsx` (kinds: dots, field, filmstrip, waves, contours, lines, horizon). A motif fills its parent box and paints in the parent's current text colour, so `text-ink` on the light page and `text-snow` on the dark plate are the only theming needed. Rules the family follows, and any new kind must too:

- Deterministic: every frame re-seeds the same generator; only the time term moves.
- Slow and quiet. If it reads as an animation, it is too fast.
- Cheap: ~30 fps cap, the loop pauses off-screen, a few hundred primitives at most.
- `prefers-reduced-motion` draws one still frame and stops (the global CSS override in `styles.css` also freezes the CSS keyframes: `animate-status-pulse`, `animate-marquee-drift`, `animate-mycel-pulse`).
- The server renders an empty canvas with identical attributes; never set `width`/`height` in JSX.

`CountUp` (the running-head tally) renders the final value on the server and animates once on first view. The Mycel brain canvas (`MycelBrain.tsx`) is the older sibling of this family and follows the same rules. The static SVGs the motifs replaced were removed 2026-09-03; `philosophy-diagram.svg` and `footer-horizon.svg` remain as static figures.

## Contact

`src/components/site/Contact.tsx` renders two doors: `mailto:info@16x9.ai` and the LinkedIn company page. There is no form and no server function. `LINKEDIN_URL` is a constant at the top of that file; confirm it before deploy (unverified as of 2026-09-02).

## Analytics & consent

`activateAnalytics()` in `src/lib/analytics.ts` loads GA4, Microsoft Clarity, and an Identify.id pixel, only after the user accepts cookies in `CookieBanner`. Consent is persisted under `localStorage["cookie_consent_v1"]`. IDs are blank and each loader no-ops when unset. **Never load analytics before consent.** Custom events: `trackEvent("event_name", {...})`.

## Token-name convention

Color tokens are defined in `src/styles.css` under `:root` and mapped into Tailwind via `@theme inline`. Change values, never names: `--ink`, `--graphite`, `--ash`, `--fog`, `--snow`, `--obsidian`, `--silver-mist`, `--slate-brand`, the shadcn semantic chain, and `--font-editorial` / `--font-sans` / `--font-mono`.

## Do / Don't

- **Don't** hard-code colors as hex in components. Use the token classes (`text-ink`, `bg-obsidian`, `text-snow/60`, ...).
- **Don't** add analytics calls that bypass `trackEvent` / consent.
- **Don't** add backwards-compat shims or feature flags. Change the code.
- **Don't** push or deploy without the commit author gate in mind: Vercel only builds commits authored by `info@16x9.ai` or the CI bot.
- **Do** run the typecheck and `npm run build` before committing anything that touches routes, types, or top-level deps.
