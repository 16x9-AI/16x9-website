import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

type LegalPageProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

/**
 * LegalPage: shared layout for long-form compliance reading (Mycel
 * disclosure, privacy policy, terms of service). Reuses the same Nav and
 * Footer as the home page (FrameShell already wraps every route at the
 * root layout, so it is not repeated here). The content column is narrowed
 * to a comfortable reading measure and the type scale is tightened relative
 * to the marketing pages, while staying on the same B/W Geist system and
 * spacing tokens defined in src/styles.css.
 */
export function LegalPage({ eyebrow = "Legal", title, children }: LegalPageProps) {
  return (
    <>
      <Nav />
      <main className="px-6 pb-24 pt-20 md:px-10">
        <div className="mx-auto max-w-[1400px] border-b border-ink/30 pb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-editorial text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-tight text-ink text-balance">
            {title}
          </h1>
        </div>
        <div className="mx-auto max-w-[68ch]">
          <div className="mt-10 space-y-5 font-sans text-[15px] leading-[1.7] text-ink">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/** Section heading (h2) className for legal-page body content: a mono label, not serif display. */
export const legalH2 =
  "mt-10 font-mono text-[12px] uppercase tracking-[0.1em] text-ink";

/** Body paragraph className for legal-page body content. */
export const legalP = "text-[15px] leading-[1.7] text-graphite";

/** Bulleted list className for legal-page body content. */
export const legalUl = "list-disc space-y-2 pl-5 text-[15px] leading-[1.6] text-graphite";

/** Inline link className for legal-page body content. */
export const legalLink = "text-ink underline underline-offset-2 hover:text-graphite";

/** Visible marker for facts that still need confirmation before launch. */
export const toConfirm = "font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink";
