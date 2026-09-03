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

- `/` — `routes/index.tsx`. Sections in order: hero, marquee (industries), the studio (diagram + Build/Operate/Research), work (six status-tagged cards on the dark plate), Mycel (brain canvas + spec rows + the Google sentence), contact.
- `/privacy`, `/terms` — legal. Also verification-sensitive.
- `/intel` — NOT a router route. `vercel.json` rewrites `/intel` and `/intel/*` onto the daily AI intelligence report deployment (`16x9-ai-industry-daily-report.vercel.app`). Link to it with a plain `<a href="/intel">`, never `<Link to>`.
- `src/routeTree.gen.ts` — generated on dev/build. Never hand-edit.

## Content rules that are also code rules

- **No company names on the public site.** Work is described by industry (VOICE.md, decision 2026-09-02). If a card needs a name to make sense, rewrite the card.
- **Status tags are audited, not decorative.** `FrameCell` takes `status: "Running" | "Pilot" | "Building"`. Check Linear before changing one. The audit date is in the comment above the `work` array in `index.tsx`.
- **Mycel counts are dated.** The spec rows carry rounded-down counts pulled from the Mycel catalog; the exact numbers and date are in the comment above `mycelSpecs`. Update both together.
- **The Google sentence ships verbatim** on `/` (the standalone `/mycel` page was removed 2026-09-03 at the founders' request; the privacy policy still carries the scope detail): "Mycel connects to Google on your behalf for sign-in and basic Workspace directory information only, not Gmail, Calendar, or Drive content."

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
