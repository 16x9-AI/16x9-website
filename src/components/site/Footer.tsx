import { Link } from "@tanstack/react-router";
import footerHorizon from "@/assets/art/footer-horizon.svg";

const linkColumns = [
  { to: "/mycel" as const, label: "Mycel" },
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/80">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr] md:px-10 md:py-20">
        <div>
          <Link
            to="/"
            className="inline-block font-editorial text-[13vw] leading-[0.85] tracking-tight text-ink transition-colors hover:text-graphite sm:text-[9vw] md:text-[5.5vw]"
          >
            16X9
          </Link>
          <p className="mt-6 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-graphite">
            A collective of framers who would be building this anyway.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-10 md:items-end md:text-right">
          <ul className="flex flex-col gap-3 font-mono text-[12px] uppercase tracking-[0.1em] text-ink md:items-end">
            {linkColumns.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-graphite">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/30">
        <img
          src={footerHorizon}
          alt=""
          aria-hidden
          className="h-16 w-full object-cover opacity-70 md:h-20"
        />
      </div>
      <div className="border-t border-ink/80 px-6 py-4 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-graphite">
          © 2026 16X9. Still in the wide shot.
        </p>
      </div>
    </footer>
  );
}
