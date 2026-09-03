import { Link } from "@tanstack/react-router";

// Intel is the daily AI industry report. It is generated and deployed by its own
// repo (16x9ai/industry-daily-report) but SERVED HERE: vercel.json rewrites
// /intel and /intel/* onto that deployment, so it lives on the main domain and
// the reader never sees a vercel.app URL. The report emits its links with the
// /intel prefix, derived from REPORT_BASE_URL on its side — change one, change
// the other.
const links = [
  { href: "/#work", label: "Work" },
  { href: "/#mycel", label: "Mycel" },
  { href: "/intel", label: "Intel" },
  { href: "/#contact", label: "Contact" },
];

/**
 * Nav: a hairline-bordered strip that sits flush inside the page frame
 * (FrameShell). No pill, no blur, no floating island - the nav is a row of
 * the same structural grid as everything else on the page.
 */
export function Nav() {
  return (
    <header className="relative z-40 mx-4 mt-4 border-b border-ink/80 bg-background md:mx-6 md:mt-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1400px] items-stretch justify-between md:h-[72px]"
      >
        <Link
          to="/"
          className="flex items-center px-3 font-editorial text-[22px] leading-none tracking-tight text-ink focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:px-6 md:px-10"
        >
          16X9
        </Link>
        <ul className="flex items-stretch">
          {links.map((link) => (
            <li key={link.href} className="flex border-l border-ink/80">
              <a
                href={link.href}
                className="flex items-center px-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink sm:tracking-[0.12em] transition-colors hover:bg-ink hover:text-background focus-visible:bg-ink focus-visible:text-background focus-visible:outline-none sm:px-5 md:px-7"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
