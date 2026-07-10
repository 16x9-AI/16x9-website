import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, legalH2, legalLink, legalP, legalUl } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of service">
      <p className={legalP}>
        These Terms of Service ("Terms") form a binding agreement between you and 16x9 Inc.
        ("16x9," "we," "us," or "our"), operator of the Mycel platform, and govern your access to
        and use of the 16x9.ai website and any product, feature, or service we make available
        (together, the "Services"). By using the Services you agree to these Terms and to our{" "}
        <Link to="/privacy" className={legalLink}>
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className={legalH2}>Service description</h2>
      <p className={legalP}>
        Mycel is an AI-powered integration and automation platform built by 16x9. It connects
        third-party services on your behalf and executes workflows you configure.
      </p>

      <h2 className={legalH2}>Eligibility</h2>
      <p className={legalP}>
        You must be at least 16 years old and able to form a binding contract to use the Services.
        If you use the Services on behalf of an organization, you represent that you have
        authority to bind that organization to these Terms.
      </p>

      <h2 className={legalH2}>Accounts</h2>
      <p className={legalP}>
        Some Services require an account. You may create an account using an email address or by
        signing in with a supported identity provider, such as Google. You are responsible for
        maintaining the confidentiality of your credentials and for all activity that occurs under
        your account. Notify us promptly at{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>{" "}
        of any unauthorized use of your account.
      </p>

      <h2 className={legalH2}>Acceptable use</h2>
      <p className={legalP}>You agree not to:</p>
      <ul className={legalUl}>
        <li>Use the Services in violation of any law or regulation.</li>
        <li>
          Attempt to gain unauthorized access to the Services or any related system, or interfere
          with their operation.
        </li>
        <li>Reverse engineer, scrape, or copy the Services except as permitted by law.</li>
        <li>
          Upload or transmit malware, harmful code, or content that is illegal, infringing,
          defamatory, or abusive.
        </li>
        <li>
          Use the Services to build a competing product or to train a machine-learning model
          without our prior written consent.
        </li>
      </ul>

      <h2 className={legalH2}>Intellectual property</h2>
      <p className={legalP}>
        The Services, including all text, graphics, logos, and software, are owned by 16x9 or its
        licensors and are protected by intellectual-property laws. We grant you a limited,
        revocable, non-exclusive, non-transferable license to access and use the Services for
        their intended purpose. All rights not expressly granted are reserved.
      </p>

      <h2 className={legalH2}>Your content</h2>
      <p className={legalP}>
        You retain ownership of any content you submit through the Services. You grant 16x9 a
        worldwide, non-exclusive, royalty-free license to host, store, reproduce, and process that
        content solely to operate and improve the Services and to communicate with you.
      </p>

      <h2 className={legalH2}>Third-party services</h2>
      <p className={legalP}>
        Mycel connects to third-party services — including Google, Slack, ClickUp, and similar
        services — via their official APIs. Your use of those services remains subject to their
        respective terms and privacy policies. We are not responsible for third-party service
        availability or changes.
      </p>

      <h2 className={legalH2}>Fees</h2>
      <p className={legalP}>
        Marketing pages on 16x9.ai are provided at no charge. Paid engagements and Services are
        governed by a separate written agreement between you and 16x9.
      </p>

      <h2 className={legalH2}>Termination</h2>
      <p className={legalP}>
        You may stop using the Services at any time by contacting{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        . We may suspend or terminate your access if you violate these Terms, if required by law,
        or if we discontinue the Services. On termination, sections that by their nature should
        survive will survive.
      </p>

      <h2 className={legalH2}>Disclaimers</h2>
      <p className={legalP}>
        The Services are provided on an "as is" and "as available" basis, without warranties of
        any kind, whether express, implied, or statutory, including implied warranties of
        merchantability, fitness for a particular purpose, and non-infringement. We do not warrant
        that the Services will be uninterrupted, timely, secure, or error-free.
      </p>

      <h2 className={legalH2}>Limitation of liability</h2>
      <p className={legalP}>
        To the maximum extent permitted by law, 16x9 and its affiliates, officers, employees, and
        agents will not be liable for any indirect, incidental, special, consequential, or
        punitive damages, or for any loss of profits, revenue, data, or goodwill, arising out of or
        related to your use of the Services. Our aggregate liability for any claim arising out of
        or related to the Services will not exceed one hundred U.S. dollars (US$100).
      </p>

      <h2 className={legalH2}>Indemnification</h2>
      <p className={legalP}>
        You agree to indemnify and hold harmless 16x9 and its affiliates from any claim, loss, or
        expense (including reasonable legal fees) arising out of your breach of these Terms or
        your misuse of the Services.
      </p>

      <h2 className={legalH2}>Governing law</h2>
      <p className={legalP}>
        These Terms are governed by the laws of the State of Delaware, United States, without
        regard to conflict-of-laws rules. The exclusive venue for any dispute is the state or
        federal courts located in Delaware, and you consent to personal jurisdiction there.
      </p>

      <h2 className={legalH2}>Changes to these terms</h2>
      <p className={legalP}>
        We may update these Terms from time to time. Material changes will be posted on this page
        with a new effective date. Continued use of the Services after changes take effect
        constitutes acceptance of the updated Terms.
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        Questions about these terms can be sent to{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        .
      </p>
    </LegalPage>
  );
}
