# 16x9 Website

Marketing site for **16x9** — AI-native venture studio.
Live at: [https://16x9.vercel.app](https://16x9.vercel.app)

---

## For non-technical editors (the team)

You can edit the website by chatting with Claude. No coding needed.

### One-time setup (3 minutes)

1. Open [claude.ai](https://claude.ai) (use your Claude Max account).
2. In the left sidebar, click **Projects** → **New Project**.
3. Name it `16x9 Website`.
4. Click **Connect GitHub** → authorize Claude to access the `16x9ai` GitHub organization → select the `16x9-website` repository.
5. Done. Now you can chat with Claude about any part of the site.

### How to make changes

Just describe what you want, like you're talking to a designer:

> *"Change the hero headline from 'Systematic venture creation' to 'Built for builders, worldwide'."*

> *"Add a new question to the FAQ: 'How much does it cost?' with this answer: ..."*

> *"Replace the image of Engineering teams with this new one [attach image]."*

> *"Make the Get started button slightly bigger."*

Claude will:
1. Read the files in this repo.
2. Propose the changes.
3. Open a Pull Request on GitHub.
4. Vercel will auto-deploy the new version within 30 seconds of approval.

### What you can edit

- All copy / text on the site (headlines, descriptions, FAQ, footer).
- Images (provide a URL or attach a file).
- Colors, spacing, and layout details.
- Add/remove sections.
- SEO metadata (title, description, social previews).

### What requires a developer

- New JavaScript animations.
- Connecting to backend services (forms, payments).
- Performance optimizations.
- Build/deploy infrastructure.

---

## For developers

### Local development

```bash
git clone https://github.com/16x9ai/16x9-website.git
cd 16x9-website
python -m http.server 8000
# open http://localhost:8000
```

No build step. Plain HTML / CSS / vanilla JavaScript.

### File structure

```
.
├── index.html           # main page (all sections)
├── privacy.html         # privacy policy
├── styles.css           # all styles
├── script.js            # all JavaScript (animations, analytics, cookie banner)
├── unnamed.png          # logo
├── og-image.svg         # social media preview image
├── sitemap.xml          # for Google
├── robots.txt           # for Google
├── vercel.json          # Vercel deploy config
└── README.md            # this file
```

### Deploy

Pushes to `main` auto-deploy to production via Vercel.

For preview deploys, push to a branch and open a PR — Vercel comments on the PR with a preview URL.

Manual deploy from local:
```bash
vercel --prod
```

### Stack

- **Hosting**: Vercel
- **Analytics**: Google Analytics 4 (`G-6YXCQ374JR`) + Microsoft Clarity (`wlugn8zkb4`)
- **Domain** (planned): `16x9.ai`
- **Repo**: [github.com/16x9ai/16x9-website](https://github.com/16x9ai/16x9-website)

### Animations of note

- **BentoTile curtain reveal** ([script.js](script.js)): images start as 1:1 squares and unfurl to 16:9 / 9:16 as scrolled into view. Driven by scroll position (not time). Implements the "16x9 = aspect ratio" brand concept.
- **Hero gradient orb**: a radial gradient that follows the cursor / touch and drifts when idle.
- **Sticky-stack engines**: the three engine cards (Studio / Services / Acquisitions) stack with sticky positioning, scaling and fading as they overlap.
- **Reveal-on-scroll**: most elements fade-and-translate in as they enter the viewport.
- **Card hover-to-dark**: cards in the Enterprises and Products grids invert to dark on hover (desktop) or as they cross the viewport center (mobile).

---

## Contact

- General: [info@16x9.ai](mailto:info@16x9.ai)
- LinkedIn: [linkedin.com/company/16x9ai](https://www.linkedin.com/company/16x9ai/)
