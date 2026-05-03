import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isGuestPublicPath } from "@/lib/guest/publicPaths";

export async function middleware(request: NextRequest) {
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (maintenanceMode) {
    if (
      request.nextUrl.pathname === "/maintenance" ||
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/api/health")
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const { pathname } = request.nextUrl;
  if (!isGuestPublicPath(pathname)) {
    const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
    const token = secret
      ? await getToken({ req: request, secret })
      : null;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/landing";
      url.searchParams.set("blocked", "1");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
