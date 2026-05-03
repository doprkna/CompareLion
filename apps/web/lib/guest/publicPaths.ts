/**
 * Routes unauthenticated users may access without soft-gate redirect.
 * Keep in sync with middleware guest guard + product expectations.
 */

export const GUEST_PUBLIC_PATH_EXACT = new Set<string>([
  "/",
  "/landing",
  "/login",
  "/signup",
  "/register",
  "/maintenance",
  "/faq",
  "/pricing",
  "/about",
  "/changelog",
  "/info/privacy",
  "/info/terms",
  "/info/faq",
  "/info/contact",
  "/waitlist",
]);

const STATIC_SUFFIX_RE =
  /\.(?:ico|png|jpg|jpeg|gif|webp|svg|txt|json|webmanifest|xml|js|map)$/i;

/** True when the pathname may be served without a session (Edge-safe). */
export function isGuestPublicPath(pathname: string): boolean {
  if (!pathname || pathname === "") return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (GUEST_PUBLIC_PATH_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/flow-demo")) return true;
  if (STATIC_SUFFIX_RE.test(pathname)) return true;
  return false;
}
