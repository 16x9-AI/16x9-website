import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalH2, legalLink, legalP, toConfirm } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of service">
      <p className={legalP}>
        These terms govern your use of 16x9.ai and Mycel, 16x9's internal platform for agent
        memory, orchestration, and business data. By using either, you agree to these terms.
        Placeholder wording throughout, pending legal review.
      </p>

      <h2 className={legalH2}>Acceptance of terms</h2>
      <p className={legalP}>
        By accessing this site or signing in to Mycel, you agree to be bound by these terms. If
        you do not agree, do not use the site or the platform.
      </p>

      <h2 className={legalH2}>Service description</h2>
      <p className={legalP}>
        16x9 builds and operates software, including Mycel, that supports agent memory,
        orchestration, and business data workflows. Features, availability, and scope may change
        as the product develops.
      </p>

      <h2 className={legalH2}>Acceptable use</h2>
      <p className={legalP}>
        You agree not to misuse the site or Mycel, including attempting to access data you are not
        authorized to see, interfering with normal operation, or using either to violate applicable
        law.
      </p>

      <h2 className={legalH2}>Intellectual property</h2>
      <p className={legalP}>
        All content, branding, and software associated with 16x9.ai and Mycel remain the property
        of 16x9 unless otherwise agreed in writing. You retain ownership of your own data.
      </p>

      <h2 className={legalH2}>Disclaimers</h2>
      <p className={legalP}>
        The site and Mycel are provided as is, without warranties of any kind, express or implied.
        We do not guarantee that the service will be uninterrupted, error-free, or fit for a
        particular purpose.
      </p>

      <h2 className={legalH2}>Limitation of liability</h2>
      <p className={legalP}>
        To the fullest extent permitted by law, 16x9 is not liable for indirect, incidental, or
        consequential damages arising from your use of the site or Mycel.
      </p>

      <h2 className={legalH2}>Governing law</h2>
      <p className={legalP}>
        These terms are governed by the laws of <span className={toConfirm}>[TO CONFIRM]</span>{" "}
        the governing jurisdiction, which has not yet been decided.
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        Questions about these terms can be sent to{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        .
      </p>

      <p className={legalP}>Last updated: placeholder date, pending final review.</p>
    </LegalPage>
  );
}
