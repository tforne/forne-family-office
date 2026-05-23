import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/lib/config/env";
import {
  defaultPublicLocale,
  getLocalizedPath,
  isPublicLocale,
  publicLocales,
  type PublicRouteKey
} from "@/lib/i18n/public";

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
  const pathname = request.nextUrl.pathname;
  const isPortalRoute = pathname.startsWith("/portal");
  const hasSession = hasValidPortalSession(request);

  if (isPortalRoute && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("ffo_portal_session");
    return response;
  }

  const legacyPublicRoutes: Record<string, PublicRouteKey> = {
    "/": "home",
    "/alquileres": "rentals",
    "/contacto": "contact",
    "/guias": "guides",
    "/guias/portal-privado": "guidesPortal",
    "/guias/incidencias-alquiler": "guidesIncidents",
    "/guias/facturas-y-vencimientos": "guidesInvoices",
    "/noticias": "news"
  };

  if (legacyPublicRoutes[pathname]) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getLocalizedPath(defaultPublicLocale, legacyPublicRoutes[pathname]);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0] || defaultPublicLocale;
  const locale = isPublicLocale(firstSegment) ? firstSegment : defaultPublicLocale;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ffo-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    "/",
    "/alquileres",
    "/contacto",
    "/guias/:path*",
    "/noticias",
    `/:locale(${publicLocales.join("|")})/:path*`,
    "/portal/:path*",
    "/login",
    "/offline"
  ],
};
