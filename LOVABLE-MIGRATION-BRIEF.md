# 16x9.ai — Lovable Migration Brief

This document contains everything Lovable needs to recreate the 16x9 website pixel-perfect.

**Reference URL (copy from this exactly)**: https://16x9.vercel.app

**GitHub repo with original source**: https://github.com/16x9ai/16x9-website

---

## INITIAL LOVABLE PROMPT (paste this into the New Project chat)

> Build a marketing website for 16x9, an AI-native venture studio. The reference site to recreate pixel-perfect is at https://16x9.vercel.app. The full source code with HTML/CSS/JS is at https://github.com/16x9ai/16x9-website — please read it and recreate every detail in React + Tailwind + Framer Motion.
>
> Brand identity: minimal Apple-style, light theme, near-achromatic palette (white, fog #f5f5f7, ink #1d1d1f, graphite #707070). The only accent color is pure black for CTAs (no Apple blue). Typography is SF Pro Display / Inter, with very large headlines (96px) and tight negative letter-spacing (-2.11px at display size).
>
> The hero concept: "16x9" refers to the cinematic aspect ratio. This brand idea is expressed visually through "BentoTile curtain reveal" — image tiles start as 1:1 squares and progressively expand to 16:9 (or 9:16) as the user scrolls them into view. This is implemented with a scroll-linked custom hook that interpolates aspect-ratio and max-width. Every gallery image, product card image, and advisor photo uses this effect.
>
> Sections to build (in this exact order):
> 1. Global navigation bar (sticky, frosted glass, 64px tall, with logo + 6 links + Get started CTA)
> 2. Hero (full viewport, centered eyebrow + headline + sub + CTA + a 16:9 frame with abstract neural network image overlaid by enormous "16 × 9" typography and floating frosted-glass tags like "AI Agents", "Co-found", "Capital", etc.)
> 3. Marquee (single thin strip with rotating text: "AI-native · Venture studio · Global talent · Shared infrastructure · Co-founding · Acquisitions · Enterprise grade")
> 4. Gallery wall ("From signal to systems" — 5 image tiles in a 3×2 grid, with one 9:16 portrait tile spanning the middle column 2 rows; all tiles use BentoTile curtain reveal)
> 5. Problem stats ("Most global talent never gets a shot" — 4 stat cards: ∞ Talent, 25% Capital, 48h Speed, 2026 Inflection — each card has a small accent line on top and inverts to dark on hover)
> 6. Engines section (3 sticky-stacked cards with full-bleed gradients: indigo for Studio/Venture, citrus for Services, blush for Acquisitions; each card has copy on left and a visual on right — orbit, ladder, or merge graphic; engine cards stick at top:80px and scale/fade as next card overlaps)
> 7. For Enterprises (3 cards: Enterprise Integration, Shared AI Infrastructure, Venture Participation — all start light, invert to dark on hover)
> 8. For Founders & Providers (4 cards in 2x2 grid: Executive Network, Accelerated Reach, Venture Co-founding, Shared AI Infrastructure)
> 9. For Trusted Advisors (split panel: long copy on left, photo + stat tiles 48h / 120+ / "Verticals covered" on right)
> 10. Three Products (Studio / Services / Platform — 3 cards with 16:9 image header + copy + footer with "Learn more" link and CTA)
> 11. FAQ (7 questions in a vertical accordion with chevron icons that rotate on open)
> 12. Contact form (centered card with name, email, role dropdown, message field, send button)
> 13. Footer (5 column grid: brand + tagline, Studio links, Services links, Platform links, Company links + bottom bar with email/LinkedIn/Privacy)
>
> Animations to preserve:
> - BentoTile curtain reveal (described above)
> - Hero gradient blob that follows cursor with smooth lerp + drifts in a slow circle when idle
> - Sticky-stack engine cards (each scales 1.0 → 0.94 and fades 1.0 → 0.6 as the next card overlaps)
> - Reveal-on-scroll for every text element (translate Y 28px → 0, opacity 0 → 1, with stagger by 90ms inside grids)
> - Animated number counters for "25%" and "48h" (count up from 0 over 1.4s when entering viewport)
> - Hero floating tags ("AI Agents", "Co-found", etc.) gently floating up/down 10px every 9s
> - Marquee scrolling at 60s linear infinite with mask-image fade on edges
> - Card hover-to-dark for cards in Enterprises grid + Products grid (background → black, text → white, with 0.4s ease)
> - On touch devices: same dark-card effect triggered when card crosses viewport center (scroll-driven via IntersectionObserver)
> - Engine visuals: orbit ring animates rotate 0deg→360deg over 38s; ladder rungs cascade in with stagger; merge graphic arrow pulses
> - Cookie consent banner appears 800ms after page load with frosted glass styling
>
> Analytics IDs (already provisioned, paste into the head):
> - Microsoft Clarity ID: wlugn8zkb4
> - Google Analytics 4 ID: G-6YXCQ374JR
> Both should only load AFTER the user accepts cookies in the banner.
>
> Logo: use the file `unnamed.png` from the repo (it's a stylized X mark with "16X9" text below).
>
> Domain target: https://16x9.ai (canonical URL for SEO).
>
> SEO: include full Open Graph + Twitter cards + JSON-LD structured data (Organization, Service, FAQ) — copy from the existing repo's index.html head.
>
> Privacy policy at /privacy (full GDPR-compliant text already written in privacy.html).
>
> Ship as a clean React + Vite + Tailwind project. Use Framer Motion for the heavy animations. Keep the BentoTile component as a reusable hook + component. Match the original 1:1 in copy, structure and visual hierarchy.

---

## DESIGN TOKENS

### Colors
```css
--color-ink: #1d1d1f;          /* Primary text, headlines */
--color-graphite: #707070;     /* Secondary body copy */
--color-slate: #474747;        /* Tertiary text */
--color-ash: #333333;          /* Hover state for dark CTAs */
--color-fog: #f5f5f7;          /* Page canvas background */
--color-snow: #ffffff;         /* Card surfaces */
--color-obsidian: #000000;     /* Dark card variant */
--color-silver-mist: #e8e8ed;  /* Borders, dividers */

/* Accent (replaces Apple blue) */
--color-accent: #1d1d1f;       /* Primary CTA fill = pure ink */

/* Engine gradients (full-bleed backdrops only) */
--gradient-citrus: linear-gradient(184deg, rgb(29,29,31) 0%, rgb(223,231,79) 33%, rgb(94,156,42) 66%, rgb(10,134,26) 95%);
--gradient-indigo: linear-gradient(184deg, rgb(29,29,31) 20%, rgb(168,211,251) 43%, rgb(0,18,249) 76%, rgb(37,53,224) 95%);
--gradient-blush:  linear-gradient(184deg, rgb(29,29,31) 20%, rgb(243,196,246) 43%, rgb(245,0,180) 76%, rgb(204,41,188) 95%);
```

### Typography
- **Font family**: SF Pro Display + SF Pro Text, fallback Inter, system-ui
- **Display headlines**: 96px / weight 700 / letter-spacing -2.11px / line-height 1.04
- **Heading-lg**: 56px / weight 700 / -0.9px
- **Heading**: 40px / weight 700 / -0.6px
- **Heading-sm**: 24px / weight 600 / -0.36px
- **Subheading**: 20px / weight 300 / -0.2px (for ledes under headlines)
- **Body**: 17px / weight 400 / -0.1px / line-height 1.47
- **Body-sm**: 14px / weight 400 / -0.04px
- **Caption**: 12px / weight 400 / -0.26px

### Spacing
4px base unit. Scale: 4, 8, 12, 16, 20, 24, 28, 32, 40, 44, 48, 52, 76, 80, 120, 144

### Border radius
- Cards: 28px
- Buttons (pill): 999px
- Small buttons: 10px

### Surfaces (no box-shadows anywhere — depth is value-only)
- Canvas: #f5f5f7
- Card: #ffffff
- Recessed: #f5f5f7
- Frosted control: rgba(210,210,215,0.64) + backdrop-blur(20px)
- Dark stage: #000000

---

## EXACT COPY (verbatim, do not paraphrase)

### Hero
- Eyebrow: `16x9 Studio`
- Headline (line 1): `Systematic venture creation,`
- Headline (line 2, muted): `not venture gambling.`
- Subtitle: `The infrastructure of startup creation is broken. We're fixing it.`
- Primary CTA: `Get started`
- Secondary link: `Learn more ›`
- Frame caption: `Aspect ratio of opportunity.`
- Floating tags: AI Agents · Co-found · Capital · Infrastructure · Distribution

### Marquee
`AI-native · Venture studio · Global talent · Shared infrastructure · Co-founding · Acquisitions · Enterprise grade` (repeat 2x for seamless loop)

### Gallery wall
- Eyebrow: `Where we operate`
- Headline (line 1): `From signal`
- Headline (line 2, muted): `to systems.`
- Tile captions: AI agents & automation · Vertical scale (this is the 9:16 portrait) · Engineering teams · Shared infrastructure · Builders, worldwide

### Problem stats
- Eyebrow: `The Problem`
- Headline: `Most global talent never gets a shot.`
- Lede: `The infrastructure of startup creation is geographically concentrated and structurally exclusionary. Capital access is uneven. Enterprise innovation is bottlenecked by fragmented vendor relationships. The best builders in the world are locked out, not because they lack skill, but because they lack proximity.`
- Stat 1 — kicker: `Talent`, value: `∞`, label: `Talent locked out by geography, not capability.`
- Stat 2 — kicker: `Capital`, value: `25%` (animated counter), label: `Founders globally with realistic capital access.`
- Stat 3 — kicker: `Speed`, value: `48h` (animated counter), label: `From enterprise need to a matched engineering team.`
- Stat 4 — kicker: `Inflection`, value: `2026`, label: `The year AI-native operating models become non-optional.`

### Engines

**Engines intro**:
- Eyebrow: `The System`
- Headline (line 1): `Two engines.`
- Headline (line 2): `One ecosystem.`
- Lede: `Services generate revenue and market intelligence. Ventures create long-term equity value. Each engine feeds the other.`

**Venture Engine card** (gradient-indigo, id="studio"):
- Eyebrow (light): `Venture Engine`
- Title (line 1): `Long-duration equity.`
- Title (line 2): `Compounding returns.`
- Lede: `We co-found companies with exceptional builders worldwide. Every portfolio company deploys on shared AI infrastructure: internal tooling, agent frameworks, and deployment pipelines that compound with each new venture.`
- Chips: Co-founding & Capital · Shared AI Infrastructure · Go-to-Market Support · Cross-portfolio Network
- CTA: `Apply as a Builder`
- Visual: ladder of 5 rungs (Co-found, Capital, Infrastructure, Distribution, Scale) with the last rung in white

**Services Engine card** (gradient-citrus, id="services"):
- Eyebrow (light): `Services Engine`
- Title (line 1): `Near-term delivery.`
- Title (line 2): `Immediate value.`
- Lede: `Web development, AI agent systems, automation pipelines, brand design, and strategic advisory, deployed for enterprise clients today. The services arm funds the venture arm's patience.`
- Chips: AI Agents & Automation · Software Engineering · Brand & Product Design · Strategic Advisory
- CTA: `Engage Services`
- Visual: orbit with 5 nodes (Agents, Pipelines, Brand, Software, Advisory) around a "Now" core

**Acquisitions Engine card** (gradient-blush, id="acquisitions"):
- Eyebrow (light): `Acquisitions Engine`
- Title (line 1): `We acquire companies`
- Title (line 2): `to apply the AI-native playbook.`
- Lede: `Strategic acquisitions compound our ecosystem. We identify companies with strong domain expertise, integrate them onto shared infrastructure, and unlock new growth through AI transformation.`
- Pipeline steps: 01 Identify · 02 Integrate · 03 Transform · 04 Compound
- CTA: `Discuss an acquisition`
- Visual: A + B → A·B merge graphic with pulsing arrow

### For Enterprises
- Eyebrow: `For Enterprises`
- Headline (line 1): `Your industry is being rebuilt.`
- Headline (line 2, muted): `We're the team that builds it.`
- Lede: `Integrating AI into your core business is no longer optional. Finding the right partners shouldn't be the bottleneck. Built for regulated industries: healthcare, finance, energy.`
- Card 1 — `Enterprise Integration`: `We embed specialized engineering teams into your operations: not generalists, but builders who've deployed AI agents and automation pipelines in your industry.`
- Card 2 — `Shared AI Infrastructure`: `Every engagement benefits from our internal tooling layer: agent frameworks, automation pipelines, and deployment systems battle-tested across our portfolio.`
- Card 3 — `Venture Participation`: `Our venture studio incubates AI startups designed for your vertical. Use the future before your competitors do, and own a piece of it.`

### For Founders
- Eyebrow: `For Founders & Providers`
- Headline (line 1): `You bring the vision.`
- Headline (line 2, muted): `We bring everything else.`
- Lede: `You have the technical expertise and the ambition. Scaling requires capital, clients, and infrastructure. 16x9 provides all three.`
- Card 1 — kicker `01`, title `Executive Network`: `Connect with established leaders who already hold the trust of your ideal clients. They manage the relationship. You focus on building.`
- Card 2 — kicker `02`, title `Accelerated Reach`: `We look for builders with deep technical expertise, relentless execution, and a bias toward shipping. If that's you, we eliminate the sales bottleneck.`
- Card 3 — kicker `03`, title `Venture Co-founding`: `We partner as equity co-founders, providing capital access, market entry, and operational support. Your vision, our infrastructure.`
- Card 4 — kicker `04`, title `Shared AI Infrastructure`: `Every portfolio company gets access to our internal tooling: agent frameworks, deployment pipelines, and automation systems that compound across the ecosystem.`

### For Trusted Advisors
- Eyebrow: `For Trusted Advisors`
- Headline (line 1): `Your clients need AI guidance.`
- Headline (line 2, muted): `You need the right team behind you.`
- Lede paragraph 1: `Your clients rely on you to see around corners. Right now, they're looking for a path forward with AI. They need someone they trust to guide the implementation. 16x9 equips you to be that guide, with a vetted network of specialized AI engineering and consulting firms behind you.`
- Lede paragraph 2: `You remain the primary point of contact. You manage the strategy. You deepen client relationships and create new avenues for growth. The intake is simple: tell us your focus area, and we'll match you with the right engineering partners within 48 hours.`
- CTA: `Become an advisor`
- Stat tile 1: `Average match time` / `48h`
- Stat tile 2: `Specialized partners` / `120+`
- Stat tile 3 (wide): `Verticals covered` / `Healthcare · Finance · Energy · Industrials · Retail`

### Three Products
- Eyebrow: `The Stack`
- Headline (line 1): `Three products.`
- Headline (line 2): `One integrated system.`
- Product 1 — name `16X9 STUDIO`, title `The full venture creation experience.`, body `Capital, infrastructure, co-founding. We partner with exceptional builders to systematically create AI-native companies from zero to scale.`, links: Learn more › / Apply
- Product 2 — name `16X9 SERVICES`, title `Enterprise-grade AI implementation.`, body `Engineering, automation, advisory. We deploy specialized teams to modernize enterprise operations with AI agents, custom software, and strategic guidance.`, links: Learn more › / Engage
- Product 3 — name `16X9 PLATFORM`, title `Shared AI infrastructure for the ecosystem.`, body `Internal tooling, agent frameworks, and deployment pipelines that power every company in our network. The compounding technical moat.`, links: Learn more › / Request access

### FAQ (7 questions, exactly verbatim — also used for FAQPage schema)
1. **What is 16x9?** — `16x9 is an AI-native venture studio. We co-found AI companies with exceptional builders worldwide, deploy enterprise AI implementation services for established companies, and run a shared AI infrastructure that compounds across every venture in our network.`
2. **How does the 16x9 venture studio model work?** — `We partner as equity co-founders with builders who have deep technical expertise. We provide capital access, market entry, operational support and shared infrastructure. The founder owns the vision; we provide everything else needed to scale from zero to product-market fit and beyond.`
3. **What services does 16x9 offer to enterprises?** — `Four core services: AI Agents & Automation (voice agents, chatbots, copilots, automation pipelines), Software Engineering (custom AI-native software), Brand & Product Design, and Strategic Advisory. We embed specialized engineering teams into your operations rather than sending generalists.`
4. **Which industries does 16x9 work with?** — `We are built for regulated industries (healthcare, finance and energy in particular) but operate worldwide and across all verticals. Our shared AI infrastructure is designed to meet enterprise compliance requirements out of the box.`
5. **How is a venture studio different from an accelerator or VC fund?** — `A venture studio co-founds companies from inception. We do not just write checks like a VC, and we do not run cohort programs like an accelerator. We provide capital, infrastructure and operational support as long-term equity partners, with shared AI tooling that compounds across every company we build.`
6. **How can I apply as a founder or builder?** — `Use the contact form below or email info@16x9.ai. We look for builders with deep technical expertise, relentless execution, and a bias toward shipping. If that is you, we typically match founders with infrastructure, capital and the right go-to-market support within a short window.`
7. **How fast does 16x9 match enterprises with engineering partners?** — `Our intake is built for speed. Tell us your focus area and we typically match enterprises with the right specialized engineering partners within 48 hours.`

### Contact
- Eyebrow: `Get in touch`
- Headline: `Build with us.`
- Lede: `Whether you're an enterprise, a founder, or an advisor, start the conversation. We respond within one business day.`
- Form fields: Name (text), Email (email), I'm here as (select: Enterprise / Founder / Builder / Advisor / Investor / Other), What are you exploring? (textarea)
- Submit: `Send message` (opens mailto: with pre-filled body to info@16x9.ai)
- Success message: `Thanks. We'll be in touch within one business day.`

### Footer
- Tagline: `Systematic venture creation, not venture gambling.`
- Studio col: Venture Engine, Acquisitions, For Founders
- Services col: AI Agents, Engineering, Advisory
- Platform col: Infrastructure, For Enterprises, For Advisors
- Company col: Contact, Careers, Press
- Bottom bar: `© 2026 16x9. All rights reserved.` + email + LinkedIn + Privacy + Cookies

### Cookie banner
- Title: `We use cookies`
- Body: `We use analytics tools (Microsoft Clarity, Google Analytics) to understand how visitors use this site and improve it. No personal data is sold. See our Privacy Policy.`
- Buttons: `Reject` (secondary, ghost) + `Accept all` (primary, dark)

---

## IMAGE ASSETS (from Unsplash — keep these exact URLs or replace with own)

- Hero frame: `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1800&q=80` (abstract neural network)
- Gallery 1 (AI agents): `https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&h=750&q=80`
- Gallery 2 (Vertical scale, 9:16): `https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=720&h=1280&q=80`
- Gallery 3 (Engineering teams): `https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=750&q=80`
- Gallery 4 (Shared infrastructure): `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=750&q=80`
- Gallery 5 (Builders worldwide): `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=750&q=80`
- Engine Services backdrop: `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80`
- Engine Venture backdrop: `https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80`
- Engine Acquisitions backdrop: `https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80`
- Advisor photo: `https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80`
- Product Studio: `https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80`
- Product Services: `https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=900&q=80`
- Product Platform: `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80`
- Logo: file `unnamed.png` (in repo root)
- OG image: file `og-image.svg` (in repo root) — 1200x630, dark gradient with "16 × 9" wordmark

---

## ITERATION CHECKLIST (compare Lovable output against original section by section)

After Lovable generates the first version, go through this checklist with the live original site (https://16x9.vercel.app) open side-by-side:

- [ ] Nav: 64px tall, frosted glass, links centered, CTA right, logo left
- [ ] Hero: typography `16` and `9` are gigantic, `×` is small and graphite-tinted (not blue)
- [ ] Hero floating tags: 5 of them at fixed positions, gentle vertical bob
- [ ] Hero CTA `Get started` is **black**, not blue
- [ ] Marquee: 18px text, weight 500, fades on edges, infinite scroll
- [ ] Gallery: 5 tiles, middle one is 9:16 vertical and spans 2 rows
- [ ] BentoTile reveal: as you scroll, tiles literally morph from square to widescreen
- [ ] Stat cards: have a kicker tag (Talent, Capital, Speed, Inflection), 64px values, accent line on top, all light by default, invert to dark on hover
- [ ] Engines: 3 cards with sticky positioning at top:80px, scaling down 0.94 + fading 0.6 as overlapped
- [ ] Engine gradients: indigo / citrus / blush full-bleed, NOT used as UI accents elsewhere
- [ ] Cards in Enterprises grid: all start light, hover or scroll-center inverts to dark
- [ ] Advisor card: 16:9 photo on top spanning full width, then 2 stat tiles + 1 wide tile below
- [ ] Product cards: 16:9 image header, name in caps, big title, body, footer with Learn more + CTA
- [ ] FAQ: clean accordion, chevron rotates on open, no other styling noise
- [ ] Contact form: clean inputs with rounded 14px radius, fog background, focus state with dark border
- [ ] Footer: 5 cols, bottom bar with email/LinkedIn/Privacy
- [ ] Cookie banner: appears 800ms after load, frosted glass, bottom-center pill
- [ ] No Apple blue ANYWHERE — all CTAs are pure black (#1d1d1f)
- [ ] No em dashes (—) anywhere — replaced with periods, commas, or interpuncts (·)
- [ ] Mobile: nav links collapse, all grids → 1 col, hero typography scales, engines lose sticky
- [ ] Cookie consent gates all analytics (Clarity + GA4 only load after Accept)
- [ ] Privacy page at /privacy with full GDPR copy (also in original repo)

---

## After migration

When Lovable generates a version you're happy with:
1. Connect it to a NEW GitHub repo (Lovable does this automatically — let it create one).
2. Connect that repo to a NEW Vercel project (or your existing Vercel project, replacing the connection).
3. Update the domain pointing (when you connect 16x9.ai) to the new Lovable Vercel deployment.
4. Re-paste the Microsoft Clarity (`wlugn8zkb4`) and Google Analytics 4 (`G-6YXCQ374JR`) IDs in the new project's analytics setup.
5. Keep the original repo (https://github.com/16x9ai/16x9-website) as the design reference / backup.
