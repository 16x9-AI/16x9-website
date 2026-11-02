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
- `/services`, `/services/functions`, `/industries`, `/industries/$slug` (18 industries from `industries-data.ts`), `/partners`. Shared pieces in `src/components/site/Services.tsx`; offers in `services-data.ts`.
- `/privacy`, `/terms` — legal. Also verification-sensitive.
- `/intel` — NOT a router route. `vercel.json` rewrites `/intel` and `/intel/*` onto the daily AI intelligence report deployment (`16x9-ai-industry-daily-report.vercel.app`). Link to it with a plain `<a href="/intel">`, never `<Link to>`.
- `src/routeTree.gen.ts` — generated on dev/build. Never hand-edit.

## Content rules that are also code rules

- **No company names on the public site.** Work is described by industry (VOICE.md, decision 2026-09-02). If a card needs a name to make sense, rewrite the card.
- **Status tags are audited, not decorative.** `FrameCell` takes `status: "Running" | "Pilot" | "Building"`. Check Linear before changing one. The audit date is in the comment above the `work` array in `index.tsx`.
- **Mycel counts are dated.** The spec rows carry rounded-down counts pulled from the Mycel catalog; the exact numbers and date are in the comment above `mycelSpecs`. Update both together.
- **The Google scope disclosure lives on `/privacy` only.** Both the standalone `/mycel` page and the homepage scope sentence were removed on 2026-09-03 at Maxi's request. `/privacy` is the compliance surface for Google OAuth verification: do not edit its Google sections, and keep the footer link to it.

## Motion

All illustration on the homepage is generative and drawn live in `src/components/site/Motif.tsx` (kinds: dots, field, filmstrip, waves, contours, lines, horizon, wideshot). A motif fills its parent box and paints in the parent's current text colour, so `text-ink` on the light page and `text-snow` on the dark plate are the only theming needed. Rules the family follows, and any new kind must too:

- Deterministic: every frame re-seeds the same generator; only the time term moves.
- Slow and quiet. If it reads as an animation, it is too fast.
- Cheap: ~30 fps cap, the loop pauses off-screen, a few hundred primitives at most.
- `prefers-reduced-motion` draws one still frame and stops (the global CSS override in `styles.css` also freezes the CSS keyframes: `animate-status-pulse`, `animate-marquee-drift`, `animate-mycel-pulse`).
- The server renders an empty canvas with identical attributes; never set `width`/`height` in JSX.

`CountUp` (the running-head tally) renders the final value on the server and animates once on first view. The Mycel brain canvas (`MycelBrain.tsx`) is the older sibling of this family and follows the same rules. The static SVGs the motifs replaced were removed 2026-09-03 (the wide-shot figure is the `wideshot` motif); only `footer-horizon.svg` remains as static art.

## Contact

`src/components/site/Contact.tsx` renders two doors: `mailto:info@16x9.ai` and the LinkedIn company page. There is no form. The only server function is the industry-notes reader (`src/lib/industry-notes.ts`), inert until its Mycel env vars are set. `LINKEDIN_URL` is a constant at the top of that file; confirm it before deploy (unverified as of 2026-09-02).

## Analytics & consent

- **Cookieless, every visitor:** Vercel Web Analytics and Speed Insights (`<Analytics />`, `<SpeedInsights />` in `__root.tsx`). No cookies, no personal data. Both must be switched on in the Vercel project or their scripts 404 harmlessly.
- **After Accept only:** GA4 (`G-6YXCQ374JR`), Microsoft Clarity, and the Identify.id visitor-identification pixel, loaded by `activateAnalytics()` in `src/lib/analytics.ts`. The IDs are set in `ANALYTICS_CONFIG` (the old note saying they were blank was wrong).
- **Consent Mode v2:** `consentDefaults()` sets everything denied on every page; Accept sends an update (analytics granted, ad signals stay denied). Reject after an earlier Accept withdraws consent and reloads.
- **Global Privacy Control:** when `navigator.globalPrivacyControl` is true, the Identify.id pixel never loads, even after Accept (CPRA treats GPC as an opt-out of sale or sharing).
- **Cookie preferences:** the footer button reopens the banner (`openConsentPreferences()`); the privacy policy promises this control.
- **Events:** one delegated listener (`installEventTracking()`): `generate_lead` on any mailto (the subject line names the door), `click` on outbound links, `select_content` on the industry filter and the hours sentence. Use `trackEvent` for anything new; never load analytics before consent.

## SEO, answer engines and headers

- `src/lib/seo.ts` builds every route's head: title, description, canonical, Open Graph, Twitter, and JSON-LD. TanStack dedupes `title`/`meta` (deepest route wins) but not links or scripts, so canonical and JSON-LD live on each route, never in the root. The root carries only Organization and WebSite data.
- Structured data must describe what the page visibly says. FAQ answers come from `faqItems()` in `services-data.ts` and render on the page.
- `public/robots.txt` allows search engines, AI answer engines, user-triggered AI fetchers, and (deliberately) training crawlers. The file says how to opt out of training only.
- `public/llms.txt` is generated from `industries-data.ts`; regenerate it when industries or pages change. `public/sitemap.xml` lists every route with `lastmod`; add new routes there.
- `vercel.json` enforces HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy and COOP. The Content Security Policy is **report-only** until a week of reports shows nothing it would wrongly block; then rename the header to `Content-Security-Policy`.

## Token-name convention

Color tokens are defined in `src/styles.css` under `:root` and mapped into Tailwind via `@theme inline`. Change values, never names: `--ink`, `--graphite`, `--ash`, `--fog`, `--snow`, `--obsidian`, `--silver-mist`, `--slate-brand`, the shadcn semantic chain, and `--font-editorial` / `--font-sans` / `--font-mono`.

## Do / Don't

- **Don't** hard-code colors as hex in components. Use the token classes (`text-ink`, `bg-obsidian`, `text-snow/60`, ...).
- **Don't** add analytics calls that bypass `trackEvent` / consent.
- **Don't** add backwards-compat shims or feature flags. Change the code.
- **Don't** push or deploy without the commit author gate in mind: Vercel only builds commits authored by `info@16x9.ai` or the CI bot.
- **Do** run the typecheck and `npm run build` before committing anything that touches routes, types, or top-level deps.
