import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalH2, legalLink, legalP, legalUl, toConfirm } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy">
      <p className={legalP}>
        This policy describes what information 16x9 collects through this website and through
        Mycel, 16x9's internal platform for agent memory, orchestration, and business data, how
        that information is used, and what choices you have. It applies to visitors of 16x9.ai and
        to users who sign in to Mycel with a Google account.
      </p>

      <h2 className={legalH2}>What data we access</h2>
      <p className={legalP}>
        When you sign in to Mycel with Google, we request the following OAuth scopes, and no
        others:
      </p>
      <ul className={legalUl}>
        <li>
          <span className="font-mono text-[13px] text-ink">openid</span>,{" "}
          <span className="font-mono text-[13px] text-ink">userinfo.email</span>,{" "}
          <span className="font-mono text-[13px] text-ink">userinfo.profile</span>: confirms who
          you are and gives us your name, email address, and profile photo so we can create your
          account and sign you in.
        </li>
        <li>
          <span className="font-mono text-[13px] text-ink">admin.directory.user.readonly</span>:
          read-only access to the basic user records in your Google Workspace directory, for
          example the names and email addresses of coworkers in your organization. This lets an
          agent reference who is on a team without you having to type it in manually.
        </li>
        <li>
          <span className="font-mono text-[13px] text-ink">
            admin.directory.customer.readonly
          </span>
          : read-only access to basic information about your Google Workspace customer account,
          such as your organization's primary domain.
        </li>
      </ul>
      <p className={legalP}>
        We do not request or use scopes for Gmail, Google Calendar, or Google Drive. We do not
        read, send, or delete email. We do not read or write calendar events. We do not read,
        upload, or modify files in Drive.
      </p>

      <h2 className={legalH2}>How it is accessed</h2>
      <p className={legalP}>
        Access happens through Google's standard OAuth sign-in flow. You are shown Google's own
        consent screen, listing the scopes above, before anything is granted. You can revoke this
        access at any time from your Google Account security settings.
      </p>

      <h2 className={legalH2}>How it is used</h2>
      <p className={legalP}>
        Identity data is used to authenticate you and associate your activity with the correct
        organization inside Mycel. Directory data, where granted, is used to let agents reference
        basic organizational facts, such as team membership, when a task calls for it.{" "}
        <span className={toConfirm}>[TO CONFIRM]</span> the exact list of internal Mycel features
        that consume directory data as the product evolves.
      </p>

      <h2 className={legalH2}>How it is stored</h2>
      <p className={legalP}>
        Data obtained through Google sign-in is stored in Mycel's own database, separate from
        Google's systems, behind access controls scoped to your organization.{" "}
        <span className={toConfirm}>[TO CONFIRM]</span> hosting region, encryption-at-rest detail,
        and backup policy for publication here.
      </p>

      <h2 className={legalH2}>How it is shared</h2>
      <p className={legalP}>
        We do not sell personal data. Data is visible to authorized members of your own
        organization inside Mycel and to the 16x9 team operating the platform.{" "}
        <span className={toConfirm}>[TO CONFIRM]</span> the full list of third-party
        infrastructure or processing vendors (for example hosting or logging providers) that may
        process this data on our behalf, to be named here by category and purpose.
      </p>

      <h2 className={legalH2}>Data retention</h2>
      <p className={legalP}>
        We retain identity and directory data for as long as your account is active. If you or
        your organization disconnect Google sign-in, or request deletion, we remove the associated
        data within a bounded period. <span className={toConfirm}>[TO CONFIRM]</span> the exact
        retention window and deletion timeline to publish here.
      </p>

      <h2 className={legalH2}>Your rights</h2>
      <p className={legalP}>
        You can ask us what data we hold about you, ask us to correct it, ask us to delete it, and
        revoke Google's access grant at any time from your Google Account settings. To make any of
        these requests, use the contact details below.{" "}
        <span className={toConfirm}>[TO CONFIRM]</span> jurisdiction-specific rights language
        (for example under applicable data protection law) once the operating region is finalized.
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        Questions about this policy or requests regarding your data can be sent to{" "}
        <a className={legalLink} href="mailto:info@16x9.ai">
          info@16x9.ai
        </a>
        .
      </p>

      <p className={legalP}>Last updated: placeholder date, pending final review.</p>
    </LegalPage>
  );
}
