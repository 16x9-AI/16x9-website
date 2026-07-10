import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, legalH2, legalLink, legalP } from "@/components/site/LegalPage";

export const Route = createFileRoute("/mycel")({
  component: MycelPage,
});

function MycelPage() {
  return (
    <LegalPage eyebrow="Mycel" title="What Mycel is, and what it can see">
      <p className={legalP}>
        Mycel is the substrate the collective builds on: agent memory, orchestration, and
        structured data. It lets an agent remember what happened last time, coordinate with other
        agents, and read the structured data a task actually needs. Built by 16x9, it connects your
        business tools, automates workflows, and delivers intelligent insights across your
        organization.
      </p>

      <p className={legalP}>
        Framers get Mycel on day one. Here is exactly what it can and cannot see.
      </p>

      <h2 className={legalH2}>Does Mycel connect to Google on your behalf?</h2>
      <p className={legalP}>
        Yes, for a narrow purpose. When you sign in with Google, Mycel requests access to your
        identity and, if you are part of a Google Workspace organization, basic directory
        information about that organization. Specifically, Mycel requests the following scopes:
      </p>
      <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.6] text-graphite">
        <li>
          <span className="font-mono text-[13px] text-ink">userinfo.email</span> and{" "}
          <span className="font-mono text-[13px] text-ink">userinfo.profile</span>, plus{" "}
          <span className="font-mono text-[13px] text-ink">openid</span>: your email address,
          name, and profile photo, used to identify you and sign you in.
        </li>
        <li>
          <span className="font-mono text-[13px] text-ink">admin.directory.user.readonly</span>:
          read-only access to basic user records in your Google Workspace directory, such as
          names and email addresses of people in your organization.
        </li>
        <li>
          <span className="font-mono text-[13px] text-ink">
            admin.directory.customer.readonly
          </span>
          : read-only access to basic information about your Google Workspace customer account.
        </li>
      </ul>
      <p className={legalP}>
        Mycel does not access your Gmail, Google Calendar, Google Drive, or Google Chat, and never
        sends messages on your behalf. It does not read, send, or delete email, does not read or
        write calendar events, and does not read, upload, or modify files. If a future version of
        Mycel needs any of that, we will ask for a separate, explicit scope and update this page
        before it ships.
      </p>

      <h2 className={legalH2}>How the connection works</h2>
      <p className={legalP}>
        All connections use industry-standard OAuth 2.0 authentication. You are shown Google's own
        consent screen, listing the scopes above, before anything is granted. You can revoke
        Mycel's access to your Google account at any time at{" "}
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

      <h2 className={legalH2}>How data is used and stored</h2>
      <p className={legalP}>
        Identity and directory information obtained through Google sign-in is used to authenticate
        you, associate your activity with the correct organization inside Mycel, and let agents
        reference basic directory facts, such as who is on a team, when that is relevant to a
        task. This data is stored in Mycel's own database, separate from Google's systems, and is
        only visible to authorized members of your organization and to the 16x9 team operating
        Mycel on your behalf.
      </p>
      <p className={legalP}>
        Mycel's use and transfer of information received from Google APIs adheres to the{" "}
        <a
          className={legalLink}
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <p className={legalP}>
        For the full detail on retention, sharing, and your rights over this data, see the{" "}
        <Link to="/privacy" className={legalLink}>
          privacy policy
        </Link>
        .
      </p>
    </LegalPage>
  );
}
