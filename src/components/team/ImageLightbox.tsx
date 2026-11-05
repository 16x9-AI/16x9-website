import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** A small thumbnail that opens the image full size in the page. */
export function ImageThumb({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View full size"
        className="block w-12 shrink-0 overflow-hidden border border-ink/20 hover:border-ink/40"
      >
        <img
          src={src}
          alt={alt}
          width={48}
          height={60}
          loading="lazy"
          className="block aspect-[4/5] h-auto w-full object-cover"
        />
      </button>
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        src={src}
        alt={alt}
        caption={caption}
      />
    </>
  );
}

/**
 * Full-size view inside the page: a native dialog, closed by the button, the backdrop, or Escape.
 */
export function ImageLightbox({
  open,
  onClose,
  src,
  alt,
  caption,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  caption?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={alt}
      className="m-auto w-auto max-w-[min(96vw,calc(88vh*0.8))] border border-ink/20 bg-snow p-0 text-ink shadow-2xl backdrop:bg-black/80"
    >
      {open && (
        <figure className="relative m-0">
          <img
            src={src}
            alt={alt}
            width={1080}
            height={1350}
            className="block h-auto max-h-[88vh] w-full"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-[13px] text-graphite">
            <span className="min-w-0 truncate">{caption ?? ""}</span>
            <a
              href={src}
              target="_blank"
              rel="noopener"
              className="shrink-0 underline underline-offset-4"
            >
              Open file
            </a>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}
