// Page metadata and structured data, one place for every route.
//
// TanStack dedupes `title` and `meta` by name/property (the deepest route wins) but does NOT
// dedupe links or scripts, so canonical and JSON-LD are emitted per route here, never in the
// root. Structured data only describes what the page visibly says (Google's rule, and the right
// rule for answer engines too): no ratings, prices or claims that are not on the page.

export const SITE = "https://16x9.ai";
export const OG_IMAGE = `${SITE}/og-image.png`;
export const ORG_ID = `${SITE}/#organization`;
const LINKEDIN = "https://www.linkedin.com/company/16x9ai";

type Json = Record<string, unknown>;
type Head = {
  meta: Record<string, string>[];
  links: Record<string, string>[];
  scripts: { type: string; children: string }[];
};

export function pageHead(opts: {
  title: string;
  description: string;
  path: string;
  jsonLd?: Json[];
}): Head {
  const url = `${SITE}${opts.path === "/" ? "/" : opts.path}`;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:alt", content: "16x9" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: (opts.jsonLd ?? []).map((d) => ({
      type: "application/ld+json",
      children: JSON.stringify({ "@context": "https://schema.org", ...d }),
    })),
  };
}

/** The company, referenced by @id from every other node. Root route only. */
export const organization: Json = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "16x9",
  legalName: "16x9 Inc.",
  url: SITE,
  logo: `${SITE}/favicon-192.png`,
  email: "info@16x9.ai",
  sameAs: [LINKEDIN],
  description:
    "16x9 is an AI studio. We build and run companies with people who know their industry, putting AI to work on the routine back-office work behind every sale.",
};

export const website: Json = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "16x9",
  publisher: { "@id": ORG_ID },
};

export function breadcrumbs(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export function service(opts: {
  name: string;
  description: string;
  path: string;
  audience?: string;
  offers?: { name: string; description: string }[];
}): Json {
  return {
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: `${SITE}${opts.path}`,
    provider: { "@id": ORG_ID },
    serviceType: "AI back-office operations",
    ...(opts.audience
      ? { audience: { "@type": "BusinessAudience", audienceType: opts.audience } }
      : {}),
    ...(opts.offers
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Engagements",
            itemListElement: opts.offers.map((o) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: o.name, description: o.description },
            })),
          },
        }
      : {}),
  };
}

export function faq(items: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function itemList(items: { name: string; path: string }[]): Json {
  return {
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE}${it.path}`,
    })),
  };
}

/** Cut to about 155 characters at a word boundary, so search results do not truncate mid-word. */
export function clampDescription(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastStop = cut.lastIndexOf(". ");
  if (lastStop > 80) return cut.slice(0, lastStop + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,:;]$/, "") + "…";
}
