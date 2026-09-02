// Contact: two doors, no form. Email is the primary door; LinkedIn is the
// secondary one. Both open in a way the reader controls (mailto, new tab).
//
// LINKEDIN_URL is unverified as of 2026-09-02: no canonical company-page URL
// exists anywhere in the 16x9 repos. Confirm with Colton/Manny before this
// ships. The link renders regardless so the layout can be reviewed.
export const CONTACT_EMAIL = "info@16x9.ai";
export const LINKEDIN_URL = "https://www.linkedin.com/company/16x9ai";

const reasons = [
  "A company that should be running on agents.",
  "A business worth building together.",
  "A builder who wants to work at this level.",
  "An audience that wants a product built for it.",
];

const doorClass =
  "group flex items-baseline justify-between gap-6 border-t border-ink/80 py-7 transition-colors hover:bg-ink hover:text-background md:py-9";

export function Contact() {
  return (
    <div className="grid grid-cols-1 gap-14 md:grid-cols-[0.42fr_0.58fr] md:gap-16">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          Reasons people write
        </p>
        <ul className="mt-6 space-y-4">
          {reasons.map((r) => (
            <li
              key={r}
              className="border-t border-ink/30 pt-4 font-mono text-[12.5px] leading-relaxed text-graphite"
            >
              {r}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <a href={`mailto:${CONTACT_EMAIL}`} className={doorClass}>
          <span className="px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite group-hover:text-background/70">
            Email
          </span>
          <span className="px-2 font-editorial text-[clamp(1.6rem,4vw,2.75rem)] leading-none tracking-tight">
            {CONTACT_EMAIL}
          </span>
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={doorClass}>
          <span className="px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite group-hover:text-background/70">
            LinkedIn
          </span>
          <span className="px-2 font-editorial text-[clamp(1.6rem,4vw,2.75rem)] leading-none tracking-tight">
            16x9 on LinkedIn
          </span>
        </a>
        <p className="mt-8 border-t border-ink/80 pt-5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-graphite">
          Every message is read by a person.
        </p>
      </div>
    </div>
  );
}
