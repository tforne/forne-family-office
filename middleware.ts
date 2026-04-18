import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isPortalRoute = request.nextUrl.pathname.startsWith("/portal");
  const session = request.cookies.get("forne_portal_session")?.value;

  if (isPortalRoute && session !== "demo-authenticated") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/portal/:path*"] };
