/**
 * Sample rows for local review when Mycel is unset.
 * Used only when X9_TEAM_FIXTURES=1 or X9_INTEL_FIXTURES=1. Never a publish source.
 */

import type { ArticleRow } from "./articles";
import type { PagePost } from "./posts";

export const FIXTURE_DRAFT_ID = "11111111-1111-4111-8111-111111111111";
export const FIXTURE_READY_ID = "22222222-2222-4222-8222-222222222222";

const body = [
  "A research desk that publishes one sourced note a day has a different job from a headline wire. The note has to name the page it read, keep every figure as that page printed it, and leave the decision to publish anywhere else to a person.",
  "The daily briefing can stay a wire. An article is the one subject worth a full reading: what changed, where the number came from, and what the desk is not claiming. A short blurb with no source does not clear the gate.",
  "This sample is a fixture so the article pages can be read before the desk is connected. It is not a LinkedIn post, and it is not sent anywhere. The review screen still has to approve a draft one at a time, with the destination chosen on that draft.",
].join("\n\n");

export function fixturePosts(): PagePost[] {
  return [
    {
      id: FIXTURE_DRAFT_ID,
      noteId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      noteTitle: "What a sourced note has to carry",
      noteUrl: "/articles/what-a-sourced-note-has-to-carry",
      draftText:
        "A sourced note names the page it read and the figure it is willing to repeat. The rest stays off the post.",
      finalText: "",
      status: "drafted",
      destination: "neither",
      decidedBy: "",
      decidedAt: "",
      postUrn: "",
      error: "",
      createdAt: "2026-11-05T08:00:00.000Z",
      visual: { state: "pending" },
    },
    {
      id: FIXTURE_READY_ID,
      noteId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      noteTitle: "One image, checked against the note",
      noteUrl: "/articles/one-image-checked-against-the-note",
      draftText:
        "The image is drawn from the note. A different image keeps this text and asks for another layout.",
      finalText: "",
      status: "drafted",
      destination: "neither",
      decidedBy: "",
      decidedAt: "",
      postUrn: "",
      error: "",
      createdAt: "2026-11-04T08:00:00.000Z",
      visual: { state: "ready", imageUrl: "/team-fixture.svg" },
    },
  ];
}

export function fixtureDecided(): PagePost[] {
  return [
    {
      id: "33333333-3333-4333-8333-333333333333",
      noteId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      noteTitle: "A decided sample",
      noteUrl: "/articles/a-decided-sample",
      draftText: "Kept for the history list.",
      finalText: "Kept for the history list.",
      status: "rejected",
      destination: "neither",
      decidedBy: "nelson.sanmiguel@16x9.ai",
      decidedAt: "2026-11-03T15:00:00.000Z",
      postUrn: "",
      error: "",
      createdAt: "2026-11-03T08:00:00.000Z",
      thumbUrl: "/team-fixture.svg",
    },
  ];
}

export function fixtureArticles(): ArticleRow[] {
  return [
    {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      slug: "what-a-sourced-note-has-to-carry",
      title: "What a sourced note has to carry",
      dek: "One research episode, read at the source, written as a note a person can check.",
      body,
      sources: [{ name: "16x9 research desk", url: "https://16x9.ai/intel" }],
      status: "published",
      audience: "public",
      published_at: "2026-11-05",
    },
    {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      slug: "too-short-to-publish",
      title: "Too short to publish",
      dek: "",
      body: "This row fails the public gate.",
      sources: [],
      status: "published",
      audience: "public",
      published_at: "2026-11-04",
    },
  ];
}

export function teamFixturesEnabled(): boolean {
  return process.env.X9_TEAM_FIXTURES === "1";
}

export function articleFixturesEnabled(): boolean {
  return process.env.X9_INTEL_FIXTURES === "1";
}
