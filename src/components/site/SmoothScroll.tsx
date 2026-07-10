import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import Lenis from "lenis";

/**
 * SmoothScroll: inertial smooth scrolling, tuned to match the glide feel on
 * hermes-agent.nousresearch.com (confirmed via their bundled JS: Lenis,
 * `new Lenis({ autoRaf: true, lerp: 0.09 })`).
 *
 * Notes on compatibility with the rest of this site:
 * - Lenis (in its default, non-`virtual`/non-`syncTouch` mode) drives the
 *   *native* scroll position via `window.scrollTo` under the hood. It does
 *   not switch scrolling to a `transform`-based fake-scroll container, so
 *   `position: sticky` (the Experiments rail in routes/index.tsx) keeps
 *   working untouched.
 * - IntersectionObserver-based logic (MycelBrain.tsx) also keeps working
 *   unmodified: it observes real viewport intersection, which still fires
 *   correctly because Lenis moves the real scroll position.
 * - `prefers-reduced-motion`: Lenis is never instantiated; the page falls
 *   back to plain native scrolling (see styles.css - no more
 *   `scroll-behavior: smooth` there, so this is a true instant/native
 *   scroll, consistent with the reduced-motion CSS block).
 * - Anchor links (`/#experiments` etc.) are intercepted here so in-page
 *   hash jumps use Lenis's eased `scrollTo` instead of the browser's
 *   instant hash jump.
 * - Route changes: TanStack Router's `scrollRestoration` still performs the
 *   actual `window.scrollTo` (top of page, or hash target, or restored
 *   position). Right after a navigation resolves, we resync Lenis's
 *   internal scroll state to whatever the router just set - otherwise
 *   Lenis would try to animate back to its stale pre-navigation position on
 *   the next wheel tick.
 * - Gotcha: TanStack Router reacts to *any* `history.pushState` call (not
 *   just its own `router.navigate`), including the manual `pushState` this
 *   file uses to keep the URL hash in sync after an in-page anchor click.
 *   That means our own hash update fires the router's `onResolved` event as
 *   if a real navigation happened, which would otherwise trigger the resync
 *   below mid-animation and immediately freeze the eased scroll wherever it
 *   happened to be. `isAnchorScrolling` suppresses that one false-positive
 *   resync for the duration of the anchor-triggered `scrollTo`.
 */
export function SmoothScroll() {
  const router = useRouter();
  const isAnchorScrolling = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
    });

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    const isSamePageHashLink = (anchor: HTMLAnchorElement) => {
      if (anchor.hasAttribute("data-lenis-prevent")) return false;
      const href = anchor.getAttribute("href");
      if (!href || !href.includes("#")) return false;
      const [path, hash] = href.split("#");
      if (!hash) return false;
      // "#foo" (no path) or "/current-path#foo" both count as same-page.
      return path === "" || path === window.location.pathname;
    };

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.("a[href*='#']");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!isSamePageHashLink(anchor)) return;

      const hash = anchor.getAttribute("href")?.split("#")[1];
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target) return;

      event.preventDefault();
      isAnchorScrolling.current = true;
      lenis.scrollTo(target, {
        offset: 0,
        onComplete: () => {
          isAnchorScrolling.current = false;
        },
      });
      // Keep the URL in sync without a hard navigation/scroll jump. Note:
      // this pushState is itself what triggers the onResolved handler below
      // (see file-header gotcha) - isAnchorScrolling is what keeps that
      // from cancelling the scroll we just started.
      window.history.pushState(null, "", `#${hash}`);
    };

    document.addEventListener("click", onClick);

    // Resync Lenis's internal scroll state right after each route
    // transition, once the router has finished restoring/positioning
    // scroll, so Lenis doesn't animate back to its stale prior position.
    // Skipped while an in-page anchor scroll (triggered by our own
    // pushState above) is still animating - see onClick.
    const unsubscribe = router.subscribe("onResolved", () => {
      if (isAnchorScrolling.current) return;
      requestAnimationFrame(() => {
        lenis.scrollTo(window.scrollY, { immediate: true });
      });
    });

    return () => {
      document.removeEventListener("click", onClick);
      unsubscribe();
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
