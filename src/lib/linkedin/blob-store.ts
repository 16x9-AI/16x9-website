/**
 * Vercel Blob paths for page-post images.
 * Cloned from frontierdesk `src/app/_lib/page-post-visual-store.ts`.
 * Prefix is x9-page-posts/. Without BLOB_READ_WRITE_TOKEN every draft reads as pending
 * and a draw returns not configured. FD's token is not read.
 */

import { createHash } from "node:crypto";
import { COMPANY } from "./company";

export const BLOB_PREFIX = COMPANY.blobPrefix;

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const pngPath = (postId: string, v: string) => `${BLOB_PREFIX}${postId}-${v}.png`;
export const errorPath = (postId: string, v: string) => `${BLOB_PREFIX}${postId}-${v}.error.json`;
export const choicePath = (postId: string) => `${BLOB_PREFIX}${postId}.choice.json`;

export function visualVersion(noteId: string, spec: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify({ n: noteId, s: spec }))
    .digest("hex")
    .slice(0, 12);
}

export type VisualChoice = {
  v: string;
  base: string;
  spec: unknown;
  kinds: string[];
  at: string;
  by: string;
};

export type StoredVisual =
  { kind: "image"; url: string } | { kind: "failure"; reason: string } | null;

type BlobApi = {
  list: (opts: {
    prefix: string;
    limit: number;
  }) => Promise<{ blobs: { pathname: string; url: string }[] }>;
  put: (
    path: string,
    body: Buffer | string,
    opts: {
      access: "public";
      contentType: string;
      addRandomSuffix: boolean;
      allowOverwrite: boolean;
      cacheControlMaxAge?: number;
    },
  ) => Promise<{ url: string }>;
};

async function blob(): Promise<BlobApi> {
  return (await import("@vercel/blob")) as unknown as BlobApi;
}

export async function readChoice(postId: string): Promise<VisualChoice | null> {
  if (!blobConfigured()) return null;
  const { blobs } = await (await blob()).list({ prefix: choicePath(postId), limit: 1 });
  const found = blobs.find((item) => item.pathname === choicePath(postId));
  if (!found) return null;
  try {
    const c = (await (
      await fetch(found.url, { cache: "no-store" })
    ).json()) as Partial<VisualChoice>;
    if (
      typeof c.v !== "string" ||
      typeof c.base !== "string" ||
      !c.spec ||
      typeof c.spec !== "object"
    )
      return null;
    return {
      v: c.v,
      base: c.base,
      spec: c.spec,
      kinds: Array.isArray(c.kinds)
        ? c.kinds.filter((k): k is string => typeof k === "string")
        : [],
      at: typeof c.at === "string" ? c.at : "",
      by: typeof c.by === "string" ? c.by : "",
    };
  } catch {
    return null;
  }
}

export async function storeChoice(postId: string, choice: VisualChoice): Promise<void> {
  await (
    await blob()
  ).put(choicePath(postId), JSON.stringify(choice), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function findStored(postId: string, v: string): Promise<StoredVisual> {
  if (!blobConfigured()) return null;
  const stem = `${BLOB_PREFIX}${postId}-${v}.`;
  const { blobs } = await (await blob()).list({ prefix: stem, limit: 5 });
  const png = blobs.find((item) => item.pathname === pngPath(postId, v));
  if (png) return { kind: "image", url: png.url };
  const err = blobs.find((item) => item.pathname === errorPath(postId, v));
  if (!err) return null;
  try {
    const body = (await (await fetch(err.url, { cache: "no-store" })).json()) as {
      reason?: unknown;
    };
    return {
      kind: "failure",
      reason:
        typeof body.reason === "string" && body.reason
          ? body.reason
          : "the image could not be drawn",
    };
  } catch {
    return { kind: "failure", reason: "the image could not be drawn" };
  }
}

export async function storePng(postId: string, v: string, png: Buffer): Promise<string> {
  const saved = await (
    await blob()
  ).put(pngPath(postId, v), png, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 31_536_000,
  });
  return saved.url;
}

export async function storeFailure(postId: string, v: string, reason: string): Promise<void> {
  await (
    await blob()
  ).put(errorPath(postId, v), JSON.stringify({ reason, at: new Date().toISOString() }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
