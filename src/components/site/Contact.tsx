// Contact: two doors, no form. Email is the primary door; LinkedIn the
// secondary. Both open in a way the reader controls (mailto, new tab).
//
// LINKEDIN_URL is unverified as of 2026-09-02: no canonical company-page URL
// exists anywhere in the 16x9 repos. Confirm with Colton/Manny before this
// ships. The link renders regardless so the layout can be reviewed.
export const CONTACT_EMAIL = "info@16x9.ai";
export const LINKEDIN_URL = "https://www.linkedin.com/company/16x9ai";

const doorClass =
  "group flex flex-col gap-2 border-t border-ink/80 py-6 transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:py-8";
const doorLabel =
  "px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-graphite group-hover:text-background/70 group-focus-visible:text-background/70";
const doorValue =
  "px-2 font-editorial text-[clamp(1.5rem,3.2vw,2.5rem)] leading-none tracking-tight";

export function Contact() {
  return (
    <div>
      <a href={`mailto:${CONTACT_EMAIL}`} className={doorClass}>
        <span className={doorLabel}>Email</span>
        <span className={doorValue}>{CONTACT_EMAIL}</span>
      </a>
      <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={doorClass}>
        <span className={doorLabel}>LinkedIn</span>
        <span className={doorValue}>
          16x9 on LinkedIn<span className="sr-only"> (opens in a new tab)</span>
        </span>
      </a>
      <p className="border-t border-ink/80 pt-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-graphite">
        Every message is read by a person.
      </p>
    </div>
  );
}
