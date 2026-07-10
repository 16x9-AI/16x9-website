import { Link } from "@tanstack/react-router";

const links = [
  { href: "/#experiments", label: "Experiments" },
  { href: "/#the-frame", label: "The Frame" },
  { href: "/#join", label: "Join" },
];

/**
 * Nav: a hairline-bordered strip that sits flush inside the page frame
 * (FrameShell). No pill, no blur, no floating island - the nav is a row of
 * the same structural grid as everything else on the page.
 */
export function Nav() {
  return (
    <header className="relative z-40 mt-4 border-b border-ink/80 bg-background md:mt-6">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-stretch justify-between md:h-[72px]">
        <Link
          to="/"
          className="flex items-center px-6 font-editorial text-[22px] leading-none tracking-tight text-ink md:px-10"
        >
          16X9
        </Link>
        <ul className="flex items-stretch">
          {links.map((link) => (
            <li key={link.href} className="flex border-l border-ink/80">
              <a
                href={link.href}
                className="flex items-center px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-background md:px-7"
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
