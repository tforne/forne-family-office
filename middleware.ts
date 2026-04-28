import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/lib/config/env";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? normalized.padEnd(normalized.length + (4 - padding), "=") : normalized;
  return atob(padded);
}

function hasValidPortalSession(request: NextRequest) {
  const value = request.cookies.get("ffo_portal_session")?.value;
  if (!value) return false;

  try {
    const parsed = JSON.parse(decodeBase64Url(value)) as {
      provider?: unknown;
      email?: unknown;
      externalUserId?: unknown;
    };

    const provider = parsed.provider;
    if (provider !== "demo" && provider !== "entra") return false;
    if (provider === "demo" && !env.useDemoLogin) return false;

    return typeof parsed.email === "string" || typeof parsed.externalUserId === "string";
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const isPortalRoute = request.nextUrl.pathname.startsWith("/portal");
  const hasSession = hasValidPortalSession(request);

  if (isPortalRoute && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("ffo_portal_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
