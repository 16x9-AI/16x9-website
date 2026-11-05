/**
 * POST /api/team/linkedin/decide
 * Team session, current row must still be drafted, one guarded update,
 * then per-target publication records. Reject never publishes.
 * The publisher runs only when X9_LINKEDIN_PUBLISHER_ENABLED=true.
 */

import { publisherEnabled } from "./company";
import { sendTeamEmail } from "./email";
import { publishTargets, type ExistingTarget, type PublishOutcome } from "./publisher";
import { buildDecisionPlan, parseDestination, targetsFor, type PagePost } from "./posts";
import { isTeamEmail, teamNotifyRecipients } from "./team";
import type { TargetWrite } from "./write-guard";

export type DecideDeps = {
  session: () => Promise<{ email: string } | null>;
  getPost: (id: string) => Promise<PagePost | null>;
  submit: (
    plan: ReturnType<typeof buildDecisionPlan> & { status: "planned" },
  ) => Promise<
    { status: "received" } | { status: "error" | "not_configured" | "conflict"; detail?: string }
  >;
  existingTargets: (postId: string) => Promise<ExistingTarget[]>;
  writeTarget: (row: TargetWrite) => Promise<{ status: string; detail?: string }>;
  publish: typeof publishTargets;
  notify: (to: string[], subject: string, text: string) => Promise<void>;
  now: () => string;
  imageVersion?: (postId: string) => Promise<string>;
  claimDraft?: (id: string) => boolean;
  releaseDraft?: (id: string) => void;
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function handleDecide(request: Request, deps: DecideDeps): Promise<Response> {
  const session = await deps.session().catch(() => null);
  if (!session || !isTeamEmail(session.email)) return json({ status: "forbidden" }, 403);

  let id = "";
  let decision = "";
  let text: string | undefined;
  let destinationRaw: unknown;
  try {
    const body = (await request.json()) as {
      id?: unknown;
      decision?: unknown;
      text?: unknown;
      destination?: unknown;
    };
    id = typeof body.id === "string" ? body.id : "";
    decision = typeof body.decision === "string" ? body.decision : "";
    text = typeof body.text === "string" ? body.text : undefined;
    destinationRaw = body.destination;
  } catch {
    return json({ status: "error", detail: "invalid JSON" }, 400);
  }
  if (decision !== "approve" && decision !== "reject") {
    return json({ status: "error", detail: "decision must be approve or reject" }, 400);
  }
  const destination =
    decision === "approve" ? parseDestination(destinationRaw ?? "neither") : "neither";
  if (decision === "approve" && !destination)
    return json({ status: "error", detail: "invalid destination" }, 400);

  const built = buildDecisionPlan({
    id,
    decision,
    text,
    actor: session.email,
    at: deps.now(),
    destination: destination ?? "neither",
  });
  if (built.status !== "planned") return json({ status: "error", detail: built.reason }, 400);

  const post = await deps.getPost(id);
  if (!post) return json({ status: "not_found", detail: "no such draft" }, 404);
  if (post.status !== "drafted")
    return json({ status: "conflict", detail: `already ${post.status}` }, 409);
  if (deps.claimDraft && !deps.claimDraft(id))
    return json({ status: "conflict", detail: "already decided" }, 409);

  const wrote = await deps.submit(built);
  if (wrote.status !== "received") {
    deps.releaseDraft?.(id);
    if (wrote.status === "conflict")
      return json({ status: "conflict", detail: wrote.detail || "already decided" }, 409);
    const detail = "detail" in wrote && wrote.detail ? wrote.detail : wrote.status;
    return json({ status: "error", detail }, wrote.status === "not_configured" ? 503 : 502);
  }

  let publishLine = "";
  if (decision === "approve") {
    const targets = targetsFor(destination ?? "neither");
    if (targets.length === 0) {
      publishLine = "\nLinkedIn: no destination selected, nothing sent.";
    } else {
      const existing = await deps.existingTargets(id);
      const imageVersion = deps.imageVersion ? await deps.imageVersion(id) : "";
      const published = await deps.publish({
        postId: id,
        targets,
        finalText: built.plan.ops[0].data.final_text,
        imageVersion,
        existing,
      });
      for (const row of published.writes) {
        const saved = await deps.writeTarget(row);
        if (saved.status !== "received" && saved.status !== "not_configured") {
          publishLine += `\n${row.target}: the delivery row was not saved (${saved.detail || saved.status}).`;
        }
      }
      publishLine += formatPublish(published.outcomes);
    }
  }

  const recipients = teamNotifyRecipients();
  if (recipients.length) {
    const verb = decision === "approve" ? "approved" : "rejected";
    await deps.notify(
      recipients,
      `LinkedIn post ${verb}: ${post.noteTitle}`,
      `${session.email} ${verb} the post for "${post.noteTitle}".\nRecord: written.${publishLine}\n\nTeam page: https://16x9.ai/team`,
    );
  }

  return json({
    status: "received",
    publisher: publisherEnabled() ? "enabled" : "disabled",
    destination: decision === "approve" ? destination : "rejected",
  });
}

function formatPublish(outcomes: PublishOutcome[]): string {
  if (!outcomes.length) return "";
  return (
    "\nLinkedIn: " +
    outcomes
      .map((item) => {
        if (item.status === "disabled")
          return `${item.target} not sent (publisher disabled; the row stays approved)`;
        if (item.status === "skipped") return `${item.target} already posted`;
        if (item.status === "published") return `${item.target} posted ${item.postUrn}`;
        return `${item.target} didn't post: ${item.detail}`;
      })
      .join("; ")
  );
}

export async function notifyTeam(to: string[], subject: string, text: string): Promise<void> {
  const sent = await sendTeamEmail(to, subject, text);
  if (sent.status !== "sent" && sent.status !== "not_configured")
    console.error(`team notice ${sent.status}`);
}
