/**
 * Transactional mail. Cloned from frontierdesk `src/app/_lib/email.ts` (Amazon SES).
 * With SES_FROM_EMAIL unset the sender is inert and returns not_configured.
 * AWS credentials are the standard env names. They are never written into the repo.
 */

export type EmailResult =
  { status: "sent" } | { status: "not_configured" } | { status: "error"; detail: string };

export const sesConfigured = () => Boolean(process.env.SES_FROM_EMAIL);

type SesModule = {
  SESClient: new (config: { region: string }) => { send: (cmd: unknown) => Promise<unknown> };
  SendEmailCommand: new (input: unknown) => unknown;
};

async function send(to: string[], subject: string, text: string): Promise<EmailResult> {
  const from = process.env.SES_FROM_EMAIL;
  if (!from) return { status: "not_configured" };
  if (!to.length) return { status: "error", detail: "no recipients" };
  try {
    const ses = (await import("@aws-sdk/client-ses")) as unknown as SesModule;
    const client = new ses.SESClient({
      region: process.env.SES_REGION || process.env.AWS_REGION || "us-east-1",
    });
    await client.send(
      new ses.SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: to },
        Message: {
          Subject: { Data: subject.slice(0, 200), Charset: "UTF-8" },
          Body: { Text: { Charset: "UTF-8", Data: text } },
        },
      }),
    );
    return { status: "sent" };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message : "send failed" };
  }
}

export function sendOtpEmail(email: string, code: string): Promise<EmailResult> {
  return send(
    [email],
    "Your 16x9 sign-in code",
    `Your 16x9 sign-in code is ${code}.\n\nIt expires in 10 minutes. If you did not request it, ignore this email.`,
  );
}

export function sendTeamEmail(to: string[], subject: string, text: string): Promise<EmailResult> {
  return send(to, subject, text);
}
