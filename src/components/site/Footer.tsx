import { Link } from "@tanstack/react-router";
import footerHorizon from "@/assets/art/footer-horizon.svg";

const linkColumns = [
  { to: "/mycel" as const, label: "Mycel" },
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
];

export function Footer() {
  return (
    <footer className="bg-obsidian text-snow">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr] md:px-10 md:py-14">
        <div>
          <Link
            to="/"
            className="inline-block font-editorial text-[13vw] leading-[0.85] tracking-tight text-snow transition-colors hover:text-snow/70 sm:text-[9vw] md:text-[5.5vw]"
          >
            16X9
          </Link>
          <p className="mt-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-snow/60">
            <a
              href="mailto:info@16x9.ai"
              className="text-snow underline underline-offset-4 hover:text-snow/70"
            >
              info@16x9.ai
            </a>
          </p>
        </div>
        <div className="flex flex-col justify-between gap-10 md:items-end md:text-right">
          <ul className="flex flex-col gap-3 font-mono text-[12px] uppercase tracking-[0.1em] text-snow md:items-end">
            {/* /intel is a vercel.json rewrite onto the report deployment, not a router route. */}
            <li>
              <a href="/intel" className="transition-colors hover:text-snow/70">
                Intel
              </a>
            </li>
            {linkColumns.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-snow/70">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-snow/20">
        <img
          src={footerHorizon}
          alt=""
          aria-hidden
          className="h-14 w-full object-cover opacity-70 invert md:h-16"
        />
      </div>
      <div className="border-t border-snow/20 px-6 py-4 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-snow/60">
          © 2026 16x9 Inc.
        </p>
      </div>
    </footer>
  );
}
