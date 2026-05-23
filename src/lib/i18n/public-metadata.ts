import "server-only";
import type { Metadata } from "next";
import { env } from "@/lib/config/env";
import { getLocalizedPath, getPublicCopy, getRouteAlternates, type PublicLocale, type PublicRouteKey } from "@/lib/i18n/public";

export function buildMetadata(locale: PublicLocale, routeKey: PublicRouteKey): Metadata {
  const localized = getPublicCopy(locale);
  const page =
    routeKey === "home"
      ? localized.home.metadata
      : localized.routes[routeKey as Exclude<PublicRouteKey, "home">].metadata;

  return {
    metadataBase: new URL(env.appBaseUrl),
    title: page.title,
    description: page.description,
    keywords: routeKey === "home" ? localized.home.metadata.keywords : undefined,
    alternates: {
      canonical: getLocalizedPath(locale, routeKey),
      languages: getRouteAlternates(routeKey)
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: getLocalizedPath(locale, routeKey),
      siteName: "Forné Family Office",
      locale: locale === "es" ? "es_ES" : locale === "ca" ? "ca_ES" : "en_GB",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description
    }
  };
}
