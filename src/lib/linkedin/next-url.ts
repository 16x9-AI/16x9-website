/** Same-origin path for the post-login redirect. Anything else becomes /team. */
export function safeNext(next: string, origin: string): string {
  const fallback = "/team";
  try {
    const url = new URL(next, origin);
    if (url.origin !== new URL(origin).origin) return fallback;
    if (url.username || url.password) return fallback;
    const path = `${url.pathname}${url.search}`;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}
