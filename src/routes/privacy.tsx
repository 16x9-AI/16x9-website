import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalH2, legalLink, legalP, legalUl } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy">
      <p className={legalP}>
        This Privacy Policy explains how 16x9 Inc. ("16x9," "we," "us," or "our"), operator of the
        Mycel platform, collects, uses, discloses, retains, and protects information when you
        visit 16x9.ai, contact us, or sign in to any product or service we operate (together, the
        "Services"). By using the Services you agree to this Policy.
      </p>

      <h2 className={legalH2}>Who we are</h2>
      <p className={legalP}>
        16x9 Inc. is the data controller for personal information processed through the Services.
        For privacy questions, contact us at{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        .
      </p>

      <h2 className={legalH2}>Information we collect</h2>
      <p className={legalP}>We collect the following categories of information:</p>
      <ul className={legalUl}>
        <li>
          <span className="font-semibold text-ink">Contact and form data.</span> Name, work email,
          company, role, phone (optional), and the message or context you submit through contact,
          audit, or newsletter forms.
        </li>
        <li>
          <span className="font-semibold text-ink">Google sign-in data.</span> If you sign in with
          Google, we receive your name, email address, Google account ID, profile picture URL, and
          language/locale from your Google profile. We do not receive your Google password. This
          applies to Mycel, 16x9's deal-making platform, which uses Google Sign-In for
          authentication.
        </li>
        <li>
          <span className="font-semibold text-ink">
            Google Workspace directory information (read-only).
          </span>{" "}
          For organizations that connect Google Workspace, Mycel may access read-only user and
          customer directory information (such as teammates' names and email addresses) to help
          administrators manage workspace membership. Mycel does not modify directory data and
          does not access Gmail, Google Calendar, Google Drive, or Google Chat.
        </li>
        <li>
          <span className="font-semibold text-ink">Connection data.</span> When you connect Google
          or other supported services, we store encrypted access and refresh tokens to maintain
          your connection.
        </li>
        <li>
          <span className="font-semibold text-ink">Usage data.</span> IP address, browser type,
          device type, operating system, referring URL, pages viewed, and timestamps, collected
          through cookies and server logs.
        </li>
        <li>
          <span className="font-semibold text-ink">Campaign data.</span> UTM parameters and
          referrer data captured when you arrive from a campaign.
        </li>
      </ul>

      <h2 className={legalH2}>How we use Google sign-in data</h2>
      <p className={legalP}>
        When you sign in with Google, we use the profile information Google returns solely to:
      </p>
      <ul className={legalUl}>
        <li>Display your name and profile picture inside the product interface.</li>
        <li>
          Send transactional communications related to your account (for example, security
          notices or requested audit materials).
        </li>
        <li>
          Read Google Workspace directory information (read-only) to help administrators manage
          workspace membership and suggest colleagues to invite.
        </li>
      </ul>
      <p className={legalP}>
        16x9.ai's use of information received from Google APIs adheres to the{" "}
        <a
          className={legalLink}
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We do not use Google user data to serve
        advertising, we do not sell it, we do not transfer it to third parties except as necessary
        to provide or improve the Services, to comply with applicable law, or as part of a merger,
        acquisition, or sale of assets with notice to affected users, and we do not allow humans to
        read it unless we have your affirmative agreement, it is required for security purposes,
        to comply with law, or the data is aggregated and used for internal operations in
        accordance with applicable rules.
      </p>

      <h2 className={legalH2}>General uses of information</h2>
      <p className={legalP}>We also use information to:</p>
      <ul className={legalUl}>
        <li>Provide, operate, secure, and improve the Services.</li>
        <li>Respond to inquiries and schedule audits or meetings.</li>
        <li>
          Send transactional messages and, with your consent, marketing communications you can
          unsubscribe from at any time.
        </li>
        <li>Measure site and campaign performance using analytics tools you have consented to.</li>
      </ul>

      <h2 className={legalH2}>Cookies</h2>
      <p className={legalP}>
        We use essential cookies to run the site and optional analytics, advertising-measurement,
        and personalization cookies that only load with your consent. You can change your choice
        at any time using the cookie preferences available on this site.
      </p>

      <h2 className={legalH2}>How we share information</h2>
      <p className={legalP}>We share information with:</p>
      <ul className={legalUl}>
        <li>
          <span className="font-semibold text-ink">Service providers</span> that host our
          infrastructure, send email, process forms, schedule meetings, and provide analytics,
          under contracts that restrict their use of the data.
        </li>
        <li>
          <span className="font-semibold text-ink">Identity providers</span> such as Google, to
          complete sign-in when you choose that option.
        </li>
        <li>
          <span className="font-semibold text-ink">Authorities</span> when we reasonably believe
          disclosure is required by law or necessary to protect rights, safety, or the integrity of
          the Services.
        </li>
        <li>
          <span className="font-semibold text-ink">Successors</span> in a merger, acquisition, or
          sale of assets, with notice to affected users.
        </li>
      </ul>
      <p className={legalP}>We do not sell personal data.</p>

      <h2 className={legalH2}>Data retention</h2>
      <p className={legalP}>
        We retain personal information only for as long as necessary to provide the Services, meet
        the purposes described in this Policy, and comply with our legal obligations.
        Contact-form submissions are retained for up to 24 months unless you request earlier
        deletion. Account data tied to Google sign-in is retained while your account is active and
        deleted within 30 days of account deletion, except where longer retention is required by
        law. Upon a deletion request emailed to{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        , we remove your account data, including stored OAuth tokens and cached third-party data,
        within 30 days, except where longer retention is required by law.
      </p>

      <h2 className={legalH2}>Security</h2>
      <p className={legalP}>
        We use administrative, technical, and physical safeguards designed to protect personal
        information, including encryption in transit, restricted access, and audit logging. No
        system is perfectly secure; we cannot guarantee absolute security.
      </p>

      <h2 className={legalH2}>Your rights</h2>
      <p className={legalP}>
        Depending on your location, you may have the right to access, correct, delete, port, or
        restrict processing of your personal information, and to object to processing or withdraw
        consent. To exercise any of these rights, including revoking access previously granted to
        Google sign-in, email{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        . You can also revoke 16x9.ai's access to your Google account at any time at{" "}
        <a
          className={legalLink}
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noreferrer"
        >
          myaccount.google.com/permissions
        </a>
        .
      </p>

      <h2 className={legalH2}>International transfers</h2>
      <p className={legalP}>
        We and our service providers may process personal information in countries other than your
        own. Where required, we use appropriate safeguards such as standard contractual clauses.
      </p>

      <h2 className={legalH2}>Children's privacy</h2>
      <p className={legalP}>
        The Services are not directed to children under 16, and we do not knowingly collect
        personal information from them.
      </p>

      <h2 className={legalH2}>Changes to this policy</h2>
      <p className={legalP}>
        We may update this Policy from time to time. Material changes will be posted on this page
        with a new effective date.
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        Questions about this policy or requests regarding your data can be sent to{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        .
      </p>
    </LegalPage>
  );
}
