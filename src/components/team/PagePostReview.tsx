import { Check, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { PostVisual } from "@/lib/linkedin/posts";
import {
  approveLabel,
  destinationFromChecks,
  POST_MAX,
  type Destination,
} from "@/lib/linkedin/posts";
import { ImageLightbox } from "./ImageLightbox";

type DrawState =
  | { s: "idle" }
  | { s: "drawing" }
  | { s: "drawn"; drew: "current" | "alternative" }
  | { s: "failed"; detail: string };

/**
 * The image beside the draft. Read from storage. This component never draws on mount.
 * "Different image" and "Draw image now" both POST /api/team/linkedin/visual.
 */
function PagePostFigure({
  id,
  visual: initial,
  title,
}: {
  id: string;
  visual: PostVisual;
  title: string;
}) {
  const [visual, setVisual] = useState(initial);
  const [draw, setDraw] = useState<DrawState>({ s: "idle" });
  const [open, setOpen] = useState(false);
  const frame = "mx-auto w-full max-w-[240px] md:col-start-2 md:row-start-1 md:max-w-none";

  const regenerate = async () => {
    setDraw({ s: "drawing" });
    try {
      const res = await fetch("/api/team/linkedin/visual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const body = (await res.json().catch(() => null)) as {
        status?: string;
        imageUrl?: string;
        drew?: "current" | "alternative";
        detail?: string;
      } | null;
      if (res.ok && body?.status === "ok" && body.imageUrl) {
        setVisual({ state: "ready", imageUrl: body.imageUrl });
        setDraw({ s: "drawn", drew: body.drew ?? "alternative" });
        return;
      }
      setDraw({ s: "failed", detail: body?.detail || "Didn't go through." });
    } catch {
      setDraw({ s: "failed", detail: "Didn't go through." });
    }
  };

  const drawing = draw.s === "drawing";
  const button = (
    <button
      type="button"
      onClick={regenerate}
      disabled={drawing}
      className="inline-flex h-8 items-center gap-1.5 border border-ink/20 px-3 text-[13px] font-medium text-ink/80 hover:text-ink disabled:opacity-60"
    >
      {drawing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {drawing ? "Drawing…" : visual.state === "ready" ? "Different image" : "Draw image now"}
    </button>
  );
  const status = (
    <p className="text-[13px] text-graphite" aria-live="polite">
      {draw.s === "drawing" && "Drawing a new image, about a minute."}
      {draw.s === "drawn" &&
        (draw.drew === "alternative"
          ? "New image stored; it posts with this text."
          : "Image drawn and stored.")}
      {draw.s === "failed" && <span className="text-destructive">{draw.detail}</span>}
    </p>
  );

  if (visual.state !== "ready") {
    return (
      <figure className={`${frame} grid gap-2`}>
        <div
          role="status"
          className="flex aspect-[4/5] items-center justify-center border border-dashed border-ink/20 px-3 text-center text-[13px] text-graphite"
        >
          {visual.state === "pending"
            ? "Image pending (generated at 08:15 UTC)"
            : `No image: ${visual.reason}`}
        </div>
        <div className="flex items-center justify-between gap-2">{button}</div>
        {status}
      </figure>
    );
  }

  const url = visual.imageUrl;
  const alt = "Image that posts with this draft";
  return (
    <figure className={`${frame} grid gap-2`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View full size"
        className={`block w-full overflow-hidden border border-ink/20 hover:border-ink/40 ${drawing ? "opacity-60" : ""}`}
      >
        <img src={url} alt={alt} width={1080} height={1350} className="block h-auto w-full" />
      </button>
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        src={url}
        alt={alt}
        caption={title}
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-graphite">
        <span>Posts with this text</span>
        {button}
      </figcaption>
      {status}
    </figure>
  );
}

/**
 * One drafted post. Text is editable. Approve records it exactly as left, for the
 * checked destinations. Reject records rejected and does not publish.
 */
export function PagePostReview({
  id,
  draft,
  visual,
  title,
}: {
  id: string;
  draft: string;
  visual?: PostVisual;
  title?: string;
}) {
  const [text, setText] = useState(draft);
  const [company, setCompany] = useState(false);
  const [personal, setPersonal] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "approved" | "rejected" | "failed">(
    "idle",
  );
  const [detail, setDetail] = useState("");
  const destination: Destination = destinationFromChecks(company, personal);

  const decide = async (decision: "approve" | "reject") => {
    setState("sending");
    setDetail("");
    try {
      const res = await fetch("/api/team/linkedin/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, decision, text, destination }),
      });
      const body = (await res.json().catch(() => null)) as {
        status?: string;
        detail?: string;
      } | null;
      if (res.ok && body?.status === "received") {
        setState(decision === "approve" ? "approved" : "rejected");
        return;
      }
      setDetail(body?.detail ?? "");
      setState("failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "approved" || state === "rejected") {
    return (
      <p className="inline-flex items-center gap-1.5 text-[13px] text-ink/80" aria-live="polite">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        {state === "approved" ? "Approved." : "Rejected."}
      </p>
    );
  }

  const over = text.length > POST_MAX;
  const review = (
    <div className="grid content-start gap-3 md:col-start-1 md:row-start-1">
      <label htmlFor={`post-${id}`} className="sr-only">
        Post text
      </label>
      <textarea
        id={`post-${id}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={Math.min(16, Math.max(6, text.split("\n").length + 1))}
        className="w-full border border-ink/20 bg-snow px-3 py-2.5 text-sm leading-6 text-ink hover:border-ink/40 focus:border-ink"
      />
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
        <legend className="sr-only">LinkedIn destination</legend>
        <label className="inline-flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={company} onChange={(e) => setCompany(e.target.checked)} />
          16x9 company page
        </label>
        <label className="inline-flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={personal}
            onChange={(e) => setPersonal(e.target.checked)}
          />
          Nelson personal
        </label>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={over ? "text-[13px] text-destructive" : "text-[13px] text-graphite"}>
          {text.length.toLocaleString()} / {POST_MAX.toLocaleString()} characters
        </span>
        <div className="inline-flex items-center gap-2">
          {state === "failed" && (
            <span className="text-[13px] text-destructive">{detail || "Didn't go through."}</span>
          )}
          <button
            type="button"
            onClick={() => decide("reject")}
            disabled={state === "sending"}
            className="inline-flex h-8 items-center border border-ink/20 px-3 text-[13px] font-medium text-ink/80 hover:text-ink"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => decide("approve")}
            disabled={state === "sending" || over || !text.trim()}
            className="inline-flex h-8 items-center gap-1.5 bg-ink px-3 text-[13px] font-medium text-snow hover:bg-ink/85 disabled:opacity-50"
          >
            {state === "sending" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            )}
            {approveLabel(destination)}
          </button>
        </div>
      </div>
    </div>
  );

  if (!visual) return review;
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px] md:gap-5">
      <PagePostFigure id={id} visual={visual} title={title ?? ""} />
      {review}
    </div>
  );
}
