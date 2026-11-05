/**
 * Publisher dispatch. Off unless X9_LINKEDIN_PUBLISHER_ENABLED=true.
 * The website sends { mode: "publish", post_id, target } only. It does not send the post text.
 * Each target is its own call, idempotent on post id + target + approved text + image version.
 * A failure on one target does not write the other target's row.
 */

import { createHash } from "node:crypto";
import { COMPANY, publisherEnabled } from "./company";
import { runAgent } from "./mycel";
import type { TargetName } from "./posts";
import type { TargetWrite } from "./write-guard";

export type PublishOutcome =
  | { target: TargetName; status: "disabled" }
  | { target: TargetName; status: "skipped"; detail: string }
  | { target: TargetName; status: "published"; postUrn: string }
  | { target: TargetName; status: "failed"; detail: string };

export function publicationKey(
  postId: string,
  target: TargetName,
  finalText: string,
  imageVersion: string,
): string {
  return createHash("sha256")
    .update(JSON.stringify({ postId, target, finalText, imageVersion }))
    .digest("hex")
    .slice(0, 24);
}

export type ExistingTarget = {
  id: string;
  status: string;
  idempotencyKey: string;
  postUrn: string;
};

const AGENT: Record<TargetName, string> = {
  company: COMPANY.publisherAgent,
  personal: COMPANY.personalPublisherAgent,
};

export async function publishTargets(input: {
  postId: string;
  targets: TargetName[];
  finalText: string;
  imageVersion: string;
  existing: ExistingTarget[];
  /** Injected so tests can prove a disabled publisher never calls out. */
  dispatch?: (
    agent: string,
    body: { mode: "publish"; post_id: string; target: TargetName },
  ) => Promise<{ postUrn?: string; error?: string }>;
}): Promise<{ outcomes: PublishOutcome[]; writes: TargetWrite[] }> {
  const outcomes: PublishOutcome[] = [];
  const writes: TargetWrite[] = [];
  const enabled = publisherEnabled();

  for (const target of input.targets) {
    const idempotencyKey = publicationKey(
      input.postId,
      target,
      input.finalText,
      input.imageVersion,
    );
    const prior = input.existing.find((row) => row.id === COMPANY.targetId(input.postId, target));
    if (
      prior &&
      prior.status === "published" &&
      prior.idempotencyKey === idempotencyKey &&
      prior.postUrn
    ) {
      outcomes.push({
        target,
        status: "skipped",
        detail: "already published for this text and image",
      });
      continue;
    }
    if (!enabled) {
      outcomes.push({ target, status: "disabled" });
      writes.push({
        id: COMPANY.targetId(input.postId, target),
        postId: input.postId,
        target,
        status: "approved",
        finalText: input.finalText,
        imageVersion: input.imageVersion,
        idempotencyKey,
      });
      continue;
    }
    try {
      const dispatch = input.dispatch ?? defaultDispatch;
      const result = await dispatch(AGENT[target], {
        mode: "publish",
        post_id: input.postId,
        target,
      });
      if (result.postUrn) {
        outcomes.push({ target, status: "published", postUrn: result.postUrn });
        writes.push({
          id: COMPANY.targetId(input.postId, target),
          postId: input.postId,
          target,
          status: "published",
          finalText: input.finalText,
          imageVersion: input.imageVersion,
          postUrn: result.postUrn,
          publishedAt: new Date().toISOString(),
          idempotencyKey,
        });
      } else {
        const detail = result.error || "the publisher did not record a post URN";
        outcomes.push({ target, status: "failed", detail });
        writes.push({
          id: COMPANY.targetId(input.postId, target),
          postId: input.postId,
          target,
          status: "failed",
          finalText: input.finalText,
          imageVersion: input.imageVersion,
          error: detail,
          idempotencyKey,
        });
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "publisher failed";
      outcomes.push({ target, status: "failed", detail });
      writes.push({
        id: COMPANY.targetId(input.postId, target),
        postId: input.postId,
        target,
        status: "failed",
        finalText: input.finalText,
        imageVersion: input.imageVersion,
        error: detail,
        idempotencyKey,
      });
    }
  }
  return { outcomes, writes };
}

async function defaultDispatch(
  agent: string,
  body: { mode: "publish"; post_id: string; target: TargetName },
): Promise<{ postUrn?: string; error?: string }> {
  const run = await runAgent(agent, body);
  if (run.status !== "ok")
    return { error: run.status === "error" ? run.detail : "Mycel is not configured" };
  const urn = run.output.post_urn;
  const error = run.output.error;
  return {
    postUrn: typeof urn === "string" ? urn : undefined,
    error: typeof error === "string" ? error : undefined,
  };
}
